"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminSummary } from "@/components/AdminSummary";
import { SiteHeader } from "@/components/SiteHeader";
import { canAccessModule, type AdminModule } from "@/lib/admin-permissions";
import { supabase } from "@/lib/supabase/client";
import type { AdminRole } from "@/types/vehicle";

type PanelLink = {
  module: AdminModule;
  title: string;
  description: string;
  href: string;
  button: string;
};

const panelLinks: PanelLink[] = [
  {
    module: "vehicles",
    title: "Vehiculos",
    description: "Carga autos, estado, precio y publicacion.",
    href: "/admin/vehiculos",
    button: "Abrir vehiculos"
  },
  {
    module: "leads",
    title: "Clientes",
    description: "Consultas y seguimiento comercial basico.",
    href: "/admin/consultas",
    button: "Abrir consultas"
  },
  {
    module: "expenses",
    title: "Gastos",
    description: "Carga gastos asociados a cada unidad.",
    href: "/admin/gastos",
    button: "Abrir gastos"
  },
  {
    module: "sales",
    title: "Ventas",
    description: "Registra reservas, senas, ventas y entregas.",
    href: "/admin/ventas",
    button: "Abrir ventas"
  },
  {
    module: "reports",
    title: "Reportes",
    description: "Resumen general de inversion, gastos y rentabilidad.",
    href: "/admin/reportes",
    button: "Abrir reportes"
  },
  {
    module: "settings",
    title: "Configuracion",
    description: "WhatsApp, datos generales y anti-spam.",
    href: "/admin/configuracion",
    button: "Abrir configuracion"
  },
  {
    module: "users",
    title: "Usuarios",
    description: "Roles y accesos internos para el panel.",
    href: "/admin/usuarios",
    button: "Abrir usuarios"
  }
];

export default function AdminPage() {
  const [role, setRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    async function loadRole() {
      if (!supabase) {
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        return;
      }

      const { data } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", userId)
        .single();

      setRole((data?.role as AdminRole | undefined) || null);
    }

    loadRole();
  }, []);

  const visibleLinks = role ? panelLinks.filter((link) => canAccessModule(role, link.module)) : [];

  return (
    <>
      <SiteHeader />
      <AdminGuard>
        <main className="admin-shell">
          <section className="admin-intro">
            <p className="eyebrow">Panel interno</p>
            <h1>Administracion AndiCars</h1>
            <p>
              Desde aca vas a cargar vehiculos, publicar autos en la web y luego
              sumar clientes, gastos, ventas y reportes.
            </p>
          </section>
          <AdminSummary />
          <section className="service-grid">
            {role ? (
              visibleLinks.map((link) => (
                <article key={link.href}>
                  <h3>{link.title}</h3>
                  <p>{link.description}</p>
                  <Link className="button light" href={link.href}>
                    {link.button}
                  </Link>
                </article>
              ))
            ) : (
              <p className="empty-state">Cargando accesos...</p>
            )}
          </section>
        </main>
      </AdminGuard>
    </>
  );
}
