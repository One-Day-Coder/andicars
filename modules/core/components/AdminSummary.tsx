"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { AdminRole } from "@/modules/core/types";

type SummaryVehicleRow = {
  status: string;
  is_published: boolean;
  purchase_price_usd: number | null;
};

type SummaryLeadRow = {
  status: string;
};

type Summary = {
  totalVehicles: number;
  publishedVehicles: number;
  hiddenVehicles: number;
  visibleCatalogVehicles: number;
  publishedButNotVisibleVehicles: number;
  availableVehicles: number;
  reservedVehicles: number;
  missingPurchasePriceVehicles: number;
  totalLeads: number;
  newLeads: number;
  activeLeads: number;
};

const initialSummary: Summary = {
  totalVehicles: 0,
  publishedVehicles: 0,
  hiddenVehicles: 0,
  visibleCatalogVehicles: 0,
  publishedButNotVisibleVehicles: 0,
  availableVehicles: 0,
  reservedVehicles: 0,
  missingPurchasePriceVehicles: 0,
  totalLeads: 0,
  newLeads: 0,
  activeLeads: 0
};

export function AdminSummary() {
  const [summary, setSummary] = useState<Summary>(initialSummary);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadSummary() {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const sessionResult = await supabase.auth.getSession();
    const userId = sessionResult.data.session?.user.id;

    const [vehiclesResult, leadsResult, roleResult] = await Promise.all([
      supabase.from("vehicles").select("status, is_published, purchase_price_usd"),
      supabase.from("leads").select("status"),
      userId
        ? supabase.from("admin_users").select("role").eq("user_id", userId).single()
        : Promise.resolve({ data: null, error: null })
    ]);

    if (vehiclesResult.error) {
      setMessage(`No pude cargar vehiculos: ${vehiclesResult.error.message}`);
      setLoading(false);
      return;
    }

    if (leadsResult.error) {
      setMessage(`No pude cargar consultas: ${leadsResult.error.message}`);
      setLoading(false);
      return;
    }

    if (roleResult.error) {
      setMessage(`No pude cargar tu rol: ${roleResult.error.message}`);
      setLoading(false);
      return;
    }

    setRole((roleResult.data?.role as AdminRole | undefined) || null);

    const vehicles = (vehiclesResult.data || []) as SummaryVehicleRow[];
    const leads = (leadsResult.data || []) as SummaryLeadRow[];

    setSummary({
      totalVehicles: vehicles.length,
      publishedVehicles: vehicles.filter((vehicle) => vehicle.is_published).length,
      hiddenVehicles: vehicles.filter((vehicle) => !vehicle.is_published).length,
      visibleCatalogVehicles: vehicles.filter((vehicle) => vehicle.is_published && ["disponible", "reservado"].includes(vehicle.status)).length,
      publishedButNotVisibleVehicles: vehicles.filter((vehicle) => vehicle.is_published && !["disponible", "reservado"].includes(vehicle.status)).length,
      availableVehicles: vehicles.filter((vehicle) => vehicle.status === "disponible").length,
      reservedVehicles: vehicles.filter((vehicle) => vehicle.status === "reservado").length,
      missingPurchasePriceVehicles: vehicles.filter((vehicle) => !vehicle.purchase_price_usd || Number(vehicle.purchase_price_usd) <= 0).length,
      totalLeads: leads.length,
      newLeads: leads.filter((lead) => lead.status === "nuevo").length,
      activeLeads: leads.filter((lead) => ["contactado", "interesado", "no_responde", "negociando", "reservo"].includes(lead.status)).length
    });
    setMessage("");
    setLoading(false);
  }

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <section className="summary-section">
      <div className="stock-header">
        <div>
          <h2>Resumen rapido</h2>
          <p>Vista general del stock y consultas.</p>
        </div>
        <button className="button light" type="button" onClick={loadSummary}>
          Actualizar
        </button>
      </div>

      {message ? <p className="form-message">{message}</p> : null}
      {loading ? <p className="empty-state">Cargando resumen...</p> : null}

      <div className="summary-grid">
        <article className="summary-card summary-card-vehicles">
          <span>Vehiculos</span>
          <strong>{summary.totalVehicles}</strong>
          <p>{summary.publishedVehicles} publicados / {summary.hiddenVehicles} ocultos</p>
        </article>
        <article className="summary-card summary-card-catalog">
          <span>Catalogo publico</span>
          <strong>{summary.visibleCatalogVehicles}</strong>
          <p>{summary.publishedButNotVisibleVehicles} publicados no visibles por estado</p>
        </article>
        <article className="summary-card summary-card-stock">
          <span>Disponibles</span>
          <strong>{summary.availableVehicles}</strong>
          <p>{summary.reservedVehicles} reservados</p>
        </article>
        <article className="summary-card summary-card-leads">
          <span>Consultas</span>
          <strong>{summary.totalLeads}</strong>
          <p>{summary.newLeads} nuevas</p>
        </article>
        <article className="summary-card summary-card-followup">
          <span>En seguimiento</span>
          <strong>{summary.activeLeads}</strong>
          <p>Contactados o negociando</p>
        </article>
        {role === "owner" ? (
          <article className="summary-card summary-card-warning">
            <span>Falta costo interno</span>
            <strong>{summary.missingPurchasePriceVehicles}</strong>
            <p>Autos sin precio de compra</p>
          </article>
        ) : null}
      </div>
    </section>
  );
}
