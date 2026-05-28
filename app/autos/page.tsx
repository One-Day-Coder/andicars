import { SiteHeader } from "@/components/SiteHeader";
import { VehicleCard } from "@/components/VehicleCard";
import { demoVehicles } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { vehicleCardSelect } from "@/lib/vehicle-queries";
import type { Vehicle } from "@/types/vehicle";

export const dynamic = "force-dynamic";

async function getVehicles(): Promise<{ vehicles: Vehicle[]; errorMessage: string | null }> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { vehicles: demoVehicles, errorMessage: "Supabase no esta configurado en .env.local." };
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select(vehicleCardSelect)
    .eq("is_published", true)
    .in("status", ["disponible", "reservado"])
    .order("created_at", { ascending: false });

  if (error) {
    return { vehicles: [], errorMessage: error.message };
  }

  return { vehicles: data || [], errorMessage: null };
}

export default async function AutosPage() {
  const { vehicles, errorMessage } = await getVehicles();

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <section className="section-heading">
          <p className="eyebrow">Catalogo</p>
          <h1>Autos en venta</h1>
          <p>Vehiculos publicados desde el panel interno de AndiCars.</p>
        </section>
        <section className="car-grid">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </section>
        {errorMessage ? <p className="empty-state">Error de Supabase: {errorMessage}</p> : null}
        {vehicles.length === 0 ? (
          <p className="empty-state">
            Todavia no hay vehiculos publicados. En el panel, cada auto debe tener
            "Publicar en la web" activado y estado "Disponible" o "Reservado".
          </p>
        ) : null}
      </main>
    </>
  );
}
