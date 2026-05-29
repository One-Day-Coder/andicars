"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Lead, LeadNote, LeadStatus } from "@/types/vehicle";

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

export function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
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

    if (leadIds.length > 0) {
      const notesResult = await supabase
        .from("lead_notes")
        .select("id, lead_id, note, created_by, created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: false });

      if (!notesResult.error) {
        notesByLead = (notesResult.data || []).reduce<Record<string, LeadNote[]>>((grouped, note) => {
          grouped[note.lead_id] = [...(grouped[note.lead_id] || []), note];
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

  async function updateLeadStatus(id: string, status: LeadStatus) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const { error } = await supabase.from("leads").update({ status }).eq("id", id);

    if (error) {
      setMessage(`No se pudo actualizar: ${error.message}`);
      return;
    }

    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    setMessage("Estado actualizado.");
  }

  async function addLeadNote(id: string) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const note = (notesDraft[id] || "").trim();

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

  function updateDraft(id: string, value: string) {
    setNotesDraft((current) => ({ ...current, [id]: value }));
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
        {filteredLeads.map((lead) => (
          <article className="lead-card" key={lead.id}>
            <div>
              <span className="status-badge published">{statusLabel(lead.status)}</span>
              <h3>{lead.customer_name}</h3>
              <p>{vehicleLabel(lead)}</p>
            </div>
            <div className="lead-contact">
              <a href={`tel:${lead.phone}`}>{lead.phone}</a>
              {lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : null}
              <a href={whatsappLink(lead)} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
            {lead.message ? <p className="lead-message">{lead.message}</p> : null}
            <div className="lead-notes">
              <label>
                Agregar nota interna
                <textarea
                  rows={3}
                  value={notesDraft[lead.id] || ""}
                  onChange={(event) => updateDraft(lead.id, event.target.value)}
                  placeholder="Ej: Lo llame, pregunta por permuta, volver a contactar el lunes."
                />
              </label>
              <button className="button light" type="button" onClick={() => addLeadNote(lead.id)}>
                Agregar nota
              </button>
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
                        <strong>{formatDate(note.created_at)}</strong>
                        <p>{note.note}</p>
                      </div>
                    ))}
                </div>
              ) : null}
            </div>
            <div className="lead-footer">
              <span>{formatDate(lead.created_at)}</span>
              <label>
                Estado
                <select value={lead.status} onChange={(event) => updateLeadStatus(lead.id, event.target.value as LeadStatus)}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
