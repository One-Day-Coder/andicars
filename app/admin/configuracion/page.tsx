import { AdminGuard } from "@/components/AdminGuard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SiteHeader } from "@/components/SiteHeader";

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
          <SettingsPanel />
        </main>
      </AdminGuard>
    </>
  );
}
