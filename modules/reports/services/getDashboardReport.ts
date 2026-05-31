import type { Vehicle } from "@/modules/vehicles/types";
import type { VehicleExpense } from "@/modules/expenses/types";
import type { Sale } from "@/modules/sales/types";

export function getDashboardReport(vehicles: Vehicle[], expenses: VehicleExpense[], sales: Sale[]) {
  return {
    vehicleCount: vehicles.length,
    expenseCount: expenses.length,
    saleCount: sales.length
  };
}
