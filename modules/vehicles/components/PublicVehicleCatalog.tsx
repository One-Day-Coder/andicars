"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getPublicVehicles } from "@/modules/vehicles/services/getPublicVehicles";
import type { Vehicle } from "@/modules/vehicles/types";
import { VehicleCard } from "./VehicleCard";

type PublicVehicleCatalogProps = {
  initialVehicles: Vehicle[];
  initialError: string | null;
};

export function PublicVehicleCatalog({ initialVehicles, initialError }: PublicVehicleCatalogProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [errorMessage, setErrorMessage] = useState(initialError);
  const [loading, setLoading] = useState(false);

  async function loadVehicles() {
    setLoading(true);

    const { vehicles: nextVehicles, errorMessage } = await getPublicVehicles(supabase, initialVehicles);

    if (errorMessage) {
      setErrorMessage(errorMessage);
      setLoading(false);
      return;
    }

    setVehicles(nextVehicles);
    setErrorMessage(null);
    setLoading(false);
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <>
      <div className="catalog-status-row">
        <p>{loading ? "Actualizando catalogo..." : `${vehicles.length} vehiculo${vehicles.length === 1 ? "" : "s"} visible${vehicles.length === 1 ? "" : "s"} en catalogo.`}</p>
        <button className="button light" type="button" onClick={loadVehicles}>
          Actualizar catalogo
        </button>
      </div>

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
    </>
  );
}
