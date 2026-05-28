import { AdminGuard } from "@/components/AdminGuard";
import { SiteHeader } from "@/components/SiteHeader";
import { VehicleForm } from "@/components/VehicleForm";

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
              "Publicar en la web" y el estado es disponible o reservado, aparecen
              en el catalogo publico.
            </p>
          </section>
          <VehicleForm />
        </main>
      </AdminGuard>
    </>
  );
}
