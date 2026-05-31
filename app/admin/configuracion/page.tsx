import { AdminGuard, RoleGuard, SiteHeader } from "@/modules/core";
import { SettingsPanel } from "@/modules/settings";

export default function AdminSettingsPage() {
  return (
    <>
      <SiteHeader />
      <AdminGuard>
        <main className="admin-shell">
          <section className="admin-intro">
            <p className="eyebrow">Configuracion</p>
            <h1>Configuracion del panel</h1>
            <p>
              Cambia datos generales de la web, el WhatsApp de contacto y la
              proteccion anti-spam para consultas.
            </p>
          </section>
          <RoleGuard module="settings">
            <SettingsPanel />
          </RoleGuard>
        </main>
      </AdminGuard>
    </>
  );
}
