import { AdminGuard } from "@/components/AdminGuard";
import { SalesPanel } from "@/components/SalesPanel";
import { SiteHeader } from "@/components/SiteHeader";

export default function AdminSalesPage() {
  return (
    <>
      <SiteHeader />
      <AdminGuard>
        <main className="admin-shell">
          <section className="admin-intro">
            <p className="eyebrow">Ventas</p>
            <h1>Ventas y reservas</h1>
            <p>
              Registra reservas, senas, ventas y entregas. Al cargar una
              operacion, tambien se actualiza el estado del vehiculo.
            </p>
          </section>
          <SalesPanel />
        </main>
      </AdminGuard>
    </>
  );
}
