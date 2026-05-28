import { AdminGuard } from "@/components/AdminGuard";
import { ReportsPanel } from "@/components/ReportsPanel";
import { SiteHeader } from "@/components/SiteHeader";

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
          <ReportsPanel />
        </main>
      </AdminGuard>
    </>
  );
}
