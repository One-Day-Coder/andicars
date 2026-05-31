import { AdminGuard, RoleGuard, SiteHeader } from "@/modules/core";
import { ReportsPanel } from "@/modules/reports";

export default function AdminReportsPage() {
  return (
    <>
      <SiteHeader />
      <AdminGuard>
        <main className="admin-shell">
          <section className="admin-intro">
            <p className="eyebrow">Reportes</p>
            <h1>Reportes del negocio</h1>
            <p>
              Mira stock, inversion, gastos, operaciones, senas, saldos y
              rentabilidad en una sola pantalla.
            </p>
          </section>
          <RoleGuard module="reports">
            <ReportsPanel />
          </RoleGuard>
        </main>
      </AdminGuard>
    </>
  );
}
