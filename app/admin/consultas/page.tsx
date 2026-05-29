import { AdminGuard } from "@/components/AdminGuard";
import { LeadsPanel } from "@/components/LeadsPanel";
import { RoleGuard } from "@/components/RoleGuard";
import { SiteHeader } from "@/components/SiteHeader";

export default function AdminLeadsPage() {
  return (
    <>
      <SiteHeader />
      <AdminGuard>
        <main className="admin-shell">
          <section className="admin-intro">
            <p className="eyebrow">CRM basico</p>
            <h1>Consultas de clientes</h1>
            <p>
              Aca vas a ver los interesados que consultan desde la ficha de cada
              auto. Por ahora es un seguimiento simple; despues podemos agregar
              notas, llamadas y recordatorios.
            </p>
          </section>
          <RoleGuard module="leads">
            <LeadsPanel />
          </RoleGuard>
        </main>
      </AdminGuard>
    </>
  );
}
