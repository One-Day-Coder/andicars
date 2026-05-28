"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Lead, LeadStatus } from "@/types/vehicle";

const statusOptions: Array<{ value: LeadStatus; label: string }> = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "interesado", label: "Interesado" },
  { value: "negociando", label: "Negociando" },
  { value: "reservo", label: "Reservo" },
  { value: "compro", label: "Compro" },
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

    const nextLeads = data || [];
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

  async function updateLeadNotes(id: string) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const internal_notes = notesDraft[id] || "";
    const { error } = await supabase.from("leads").update({ internal_notes }).eq("id", id);

    if (error) {
      setMessage(`No se pudo guardar la nota: ${error.message}`);
      return;
    }

    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, internal_notes } : lead)));
    setMessage("Nota guardada.");
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
              <span className="status-badge published">{lead.status}</span>
              <h3>{lead.customer_name}</h3>
              <p>{vehicleLabel(lead)}</p>
            </div>
            <div className="lead-contact">
              <a href={`tel:${lead.phone}`}>{lead.phone}</a>
              {lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : null}
            </div>
            {lead.message ? <p className="lead-message">{lead.message}</p> : null}
            <div className="lead-notes">
              <label>
                Notas internas
                <textarea
                  rows={3}
                  value={notesDraft[lead.id] || ""}
                  onChange={(event) => updateDraft(lead.id, event.target.value)}
                  placeholder="Ej: Lo llame, pregunta por permuta, volver a contactar el lunes."
                />
              </label>
              <button className="button light" type="button" onClick={() => updateLeadNotes(lead.id)}>
                Guardar nota
              </button>
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
