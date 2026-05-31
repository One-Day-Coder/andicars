import { SiteHeader } from "@/modules/core";
import { demoVehicles, getPublicVehicles, PublicVehicleCatalog } from "@/modules/vehicles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AutosPage() {
  const { vehicles, errorMessage } = await getPublicVehicles(createSupabaseServerClient(), demoVehicles);

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
