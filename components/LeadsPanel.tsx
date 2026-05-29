"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { AdminRole, Lead, LeadNote, LeadStatus } from "@/types/vehicle";

const statusOptions: Array<{ value: LeadStatus; label: string }> = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "interesado", label: "Interesado" },
  { value: "no_responde", label: "No responde" },
  { value: "negociando", label: "Negociando" },
  { value: "reservo", label: "Reservo" },
  { value: "compro", label: "Compro" },
  { value: "cerrado", label: "Cerrado" },
  { value: "descartado", label: "Descartado" },
  { value: "perdido", label: "Perdido" }
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function vehicleLabel(lead: Lead) {
  if (!lead.vehicles) {
    return "Sin vehiculo asociado";
  }

  return `${lead.vehicles.brand} ${lead.vehicles.model}${lead.vehicles.version ? ` ${lead.vehicles.version}` : ""} ${lead.vehicles.year}`;
}

function statusLabel(status: LeadStatus) {
  return statusOptions.find((option) => option.value === status)?.label || status;
}

function whatsappLink(lead: Lead) {
  const phone = lead.phone.replace(/\D/g, "");
  const message = `Hola ${lead.customer_name}, soy de AndiCars. Te escribo por tu consulta sobre ${vehicleLabel(lead)}.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function isLeadClosed(status: LeadStatus) {
  return status === "no_responde" || status === "perdido";
}

export function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [currentRole, setCurrentRole] = useState<AdminRole | null>(null);
  const [editingNoteId, setEditingNoteId] = useState("");
  const [editingNoteText, setEditingNoteText] = useState("");
  const [expandedLeadIds, setExpandedLeadIds] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "todos">("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadLeads() {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (userId) {
      const roleResult = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (!roleResult.error && roleResult.data?.role) {
        setCurrentRole(roleResult.data.role as AdminRole);
      }
    }

    const { data, error } = await supabase
      .from("leads")
      .select("*, vehicles(brand, model, version, year)")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`No pude cargar consultas: ${error.message}`);
      setLoading(false);
      return;
    }

    const leadIds = (data || []).map((lead) => lead.id);
    let notesByLead: Record<string, LeadNote[]> = {};
    let authorNames: Record<string, string> = {};

    if (leadIds.length > 0) {
      const notesResult = await supabase
        .from("lead_notes")
        .select("id, lead_id, note, created_by, created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: false });

      const notes = notesResult.data || [];
      const authorIds = Array.from(new Set(notes.map((note) => note.created_by).filter(Boolean))) as string[];

      if (authorIds.length > 0) {
        const authorsResult = await supabase
          .from("admin_users")
          .select("user_id, nickname, email")
          .in("user_id", authorIds);

        if (!authorsResult.error) {
          authorNames = (authorsResult.data || []).reduce<Record<string, string>>((names, user) => {
            names[user.user_id] = user.nickname || user.email || "Usuario";
            return names;
          }, {});
        }
      }

      if (!notesResult.error) {
        notesByLead = notes.reduce<Record<string, LeadNote[]>>((grouped, note) => {
          const nextNote = {
            ...note,
            author_name: note.created_by ? authorNames[note.created_by] || "Usuario" : "Sistema"
          };
          grouped[note.lead_id] = [...(grouped[note.lead_id] || []), nextNote];
          return grouped;
        }, {});
      }
    }

    const nextLeads = (data || []).map((lead) => ({
      ...lead,
      lead_notes: notesByLead[lead.id] || []
    }));
    setLeads(nextLeads);
    setNotesDraft(
      nextLeads.reduce<Record<string, string>>((draft, lead) => {
        draft[lead.id] = lead.internal_notes || "";
        return draft;
      }, {})
    );
    setLoading(false);
  }

  async function addSystemNote(id: string, note: string) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return false;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const { error } = await supabase.from("lead_notes").insert({
      lead_id: id,
      note,
      created_by: sessionData.session?.user.id || null
    });

    if (error) {
      setMessage(`No se pudo guardar el historial: ${error.message}`);
      return false;
    }

    return true;
  }

  async function updateLeadStatus(id: string, status: LeadStatus, historyNote?: string) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const { error } = await supabase.from("leads").update({ status }).eq("id", id);

    if (error) {
      setMessage(`No se pudo actualizar: ${error.message}`);
      return;
    }

    if (historyNote) {
      await addSystemNote(id, historyNote);
    }

    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    setMessage("Estado actualizado.");
    await loadLeads();
  }

  async function addLeadNote(id: string) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const note = (notesDraft[id] || "").trim();
    const lead = leads.find((item) => item.id === id);

    if (lead && isLeadClosed(lead.status)) {
      setMessage("Esta consulta esta cerrada. Para agregar notas, primero toca Reactivar.");
      return;
    }

    if (!note) {
      setMessage("Escribi una nota antes de guardar.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const { error } = await supabase.from("lead_notes").insert({
      lead_id: id,
      note,
      created_by: sessionData.session?.user.id || null
    });

    if (error) {
      setMessage(`No se pudo guardar la nota: ${error.message}`);
      return;
    }

    setNotesDraft((current) => ({ ...current, [id]: "" }));
    setMessage("Nota agregada.");
    await loadLeads();
  }

  function startEditNote(note: LeadNote) {
    setEditingNoteId(note.id);
    setEditingNoteText(note.note);
    setMessage("");
  }

  function cancelEditNote() {
    setEditingNoteId("");
    setEditingNoteText("");
  }

  async function updateNote(noteId: string) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const note = editingNoteText.trim();

    if (!note) {
      setMessage("La nota no puede quedar vacia.");
      return;
    }

    const { error } = await supabase.from("lead_notes").update({ note }).eq("id", noteId);

    if (error) {
      setMessage(`No se pudo editar la nota: ${error.message}`);
      return;
    }

    cancelEditNote();
    setMessage("Nota actualizada.");
    await loadLeads();
  }

  async function deleteNote(noteId: string) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const confirmed = window.confirm("Eliminar esta nota del historial?");

    if (!confirmed) {
      return;
    }

    const { error } = await supabase.from("lead_notes").delete().eq("id", noteId);

    if (error) {
      setMessage(`No se pudo eliminar la nota: ${error.message}`);
      return;
    }

    setMessage("Nota eliminada.");
    await loadLeads();
  }

  async function closeLead(id: string, status: Extract<LeadStatus, "no_responde" | "perdido">) {
    const reason = status === "no_responde" ? "Marcado como No responde." : "Marcado como Perdido.";
    await updateLeadStatus(id, status, reason);
  }

  async function reactivateLead(id: string) {
    await updateLeadStatus(id, "contactado", "Consulta reactivada para seguimiento.");
  }

  function updateDraft(id: string, value: string) {
    setNotesDraft((current) => ({ ...current, [id]: value }));
  }

  function toggleLead(id: string) {
    setExpandedLeadIds((current) => ({ ...current, [id]: !current[id] }));
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesStatus = statusFilter === "todos" || lead.status === statusFilter;
    const searchableText = [
      lead.customer_name,
      lead.phone,
      lead.email,
      lead.message,
      lead.internal_notes,
      ...(lead.lead_notes || []).map((note) => note.note),
      vehicleLabel(lead)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });

  return (
    <section className="admin-stock">
      <div className="stock-header">
        <div>
          <h2>Consultas recibidas</h2>
          <p>Seguimiento basico de interesados que llegan desde la web.</p>
        </div>
        <button className="button light" type="button" onClick={loadLeads}>
          Actualizar
        </button>
      </div>

      <div className="lead-filters">
        <label>
          Buscar
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nombre, telefono, auto o nota"
          />
        </label>
        <label>
          Estado
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as LeadStatus | "todos")}>
            <option value="todos">Todos</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message ? <p className="form-message">{message}</p> : null}
      {loading ? <p className="empty-state">Cargando consultas...</p> : null}

      {!loading && leads.length === 0 ? (
        <p className="empty-state">Todavia no hay consultas recibidas.</p>
      ) : null}

      {!loading && leads.length > 0 && filteredLeads.length === 0 ? (
        <p className="empty-state">No hay consultas con esos filtros.</p>
      ) : null}

      <div className="lead-list">
        {filteredLeads.map((lead) => {
          const isExpanded = expandedLeadIds[lead.id] || false;
          const closed = isLeadClosed(lead.status);

          return (
            <article className="lead-card" key={lead.id}>
              <button className="lead-summary-button" type="button" onClick={() => toggleLead(lead.id)}>
                <div>
                  <span className="status-badge published">{statusLabel(lead.status)}</span>
                  <h3>{lead.customer_name}</h3>
                  <p>{vehicleLabel(lead)}</p>
                </div>
                <div>
                  <strong>{lead.phone}</strong>
                  <span>{formatDate(lead.created_at)}</span>
                </div>
                <span>{isExpanded ? "Ocultar" : "Ver detalle"}</span>
              </button>

              {isExpanded ? (
                <>
                  <div className="lead-contact">
                    <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                    {lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : null}
                    <a href={whatsappLink(lead)} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  </div>
                  {lead.message ? <p className="lead-message">{lead.message}</p> : null}
                  <div className="lead-quick-actions">
                    <button className="button light" type="button" onClick={() => closeLead(lead.id, "no_responde")} disabled={closed}>
                      No responde
                    </button>
                    <button className="button light" type="button" onClick={() => closeLead(lead.id, "perdido")} disabled={closed}>
                      Perdido
                    </button>
                    {closed ? (
                      <button className="button primary" type="button" onClick={() => reactivateLead(lead.id)}>
                        Reactivar
                      </button>
                    ) : null}
                  </div>
                  <div className="lead-notes">
                    <label>
                      Agregar nota interna
                      <textarea
                        rows={3}
                        value={notesDraft[lead.id] || ""}
                        onChange={(event) => updateDraft(lead.id, event.target.value)}
                        placeholder={closed ? "Consulta cerrada. Reactivala para agregar notas." : "Ej: Lo llame, pregunta por permuta, volver a contactar el lunes."}
                        disabled={closed}
                      />
                    </label>
                    <button className="button light" type="button" onClick={() => addLeadNote(lead.id)} disabled={closed}>
                      Agregar nota
                    </button>
                    {closed ? <p className="admin-note">Consulta cerrada: no se pueden agregar notas hasta reactivarla.</p> : null}
                    {lead.internal_notes ? (
                      <div className="note-history-item">
                        <strong>Nota anterior</strong>
                        <p>{lead.internal_notes}</p>
                      </div>
                    ) : null}
                    {(lead.lead_notes || []).length > 0 ? (
                      <div className="note-history">
                        {(lead.lead_notes || [])
                          .slice()
                          .sort((a: LeadNote, b: LeadNote) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map((note) => (
                            <div className="note-history-item" key={note.id}>
                              <strong>
                                {formatDate(note.created_at)} - {note.author_name || "Usuario"}
                              </strong>
                              {editingNoteId === note.id ? (
                                <>
                                  <textarea
                                    rows={2}
                                    value={editingNoteText}
                                    onChange={(event) => setEditingNoteText(event.target.value)}
                                  />
                                  <div className="note-actions">
                                    <button className="button primary" type="button" onClick={() => updateNote(note.id)}>
                                      Guardar
                                    </button>
                                    <button className="button light" type="button" onClick={cancelEditNote}>
                                      Cancelar
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p>{note.note}</p>
                                  <div className="note-actions">
                                    <button className="button light" type="button" onClick={() => startEditNote(note)}>
                                      Editar
                                    </button>
                                    {currentRole === "owner" ? (
                                      <button className="button danger" type="button" onClick={() => deleteNote(note.id)}>
                                        Eliminar
                                      </button>
                                    ) : null}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="lead-footer">
                    <span>{formatDate(lead.created_at)}</span>
                    <label>
                      Estado
                      <select value={lead.status} onChange={(event) => updateLeadStatus(lead.id, event.target.value as LeadStatus, `Estado cambiado a ${statusLabel(event.target.value as LeadStatus)}.`)}>
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
