import { SiteHeader } from "@/modules/core";
import { demoVehicles, PublicVehicleCatalog, vehicleCardSelect } from "@/modules/vehicles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/modules/vehicles";

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
        <PublicVehicleCatalog initialVehicles={vehicles} initialError={errorMessage} />
      </main>
    </>
  );
}
