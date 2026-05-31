import Link from "next/link";
import type { CSSProperties } from "react";
import type { Vehicle } from "@/modules/vehicles/types";
import { formatKm, formatUsd } from "@/lib/format";

type VehicleCardProps = {
  vehicle: Vehicle;
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const title = `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""}`;

  return (
    <article className="car-card">
      {vehicle.main_photo_url ? (
        <div className="car-photo">
          <img src={vehicle.main_photo_url} alt={title} />
        </div>
      ) : (
        <div className="car-visual" style={{ "--card-color": vehicle.color || "#637083" } as CSSProperties}>
          <div className="car-wheels" aria-hidden="true">
            <span />
            <span />
          </div>
        </div>
      )}

      <div className="car-body">
        <div className="car-title">
          <h3>{title}</h3>
          <span className="price">{formatUsd(vehicle.price_usd)}</span>
        </div>
        <div className="car-meta">
          <span className="pill">{vehicle.year}</span>
          <span className="pill">{formatKm(vehicle.mileage)}</span>
          <span className="pill">{vehicle.vehicle_type}</span>
          <span className="pill">{vehicle.transmission}</span>
        </div>
        <p>{vehicle.description || "Unidad seleccionada por AndiCars."}</p>
        <Link className="button light" href={`/autos/${vehicle.id}`}>
          Ver ficha
        </Link>
      </div>
    </article>
  );
}
