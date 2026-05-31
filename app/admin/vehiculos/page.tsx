import { AdminGuard, RoleGuard, SiteHeader } from "@/modules/core";
import { VehicleForm } from "@/modules/vehicles";

export default function AdminVehiclesPage() {
  return (
    <>
      <SiteHeader />
      <AdminGuard>
        <main className="admin-shell">
          <section className="admin-intro">
            <p className="eyebrow">Stock</p>
            <h1>Carga de vehiculos</h1>
            <p>
              Los autos guardados aca se registran en Supabase. Si marcas
              &quot;Publicar en la web&quot; y el estado es disponible o reservado, aparecen
              en el catalogo publico.
            </p>
          </section>
          <RoleGuard module="vehicles">
            <VehicleForm />
          </RoleGuard>
        </main>
      </AdminGuard>
    </>
  );
}
