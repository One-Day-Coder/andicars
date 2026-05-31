import type { Vehicle } from "@/modules/vehicles/types";

export function getStockReport(vehicles: Vehicle[]) {
  return {
    total: vehicles.length,
    published: vehicles.filter((vehicle) => vehicle.is_published).length,
    available: vehicles.filter((vehicle) => vehicle.status === "disponible").length
  };
}
