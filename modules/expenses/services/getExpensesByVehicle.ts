import type { SupabaseClient } from "@supabase/supabase-js";
import type { VehicleExpense } from "@/modules/expenses/types";

export async function getExpensesByVehicle(supabase: SupabaseClient, vehicleId: string) {
  const { data, error } = await supabase
    .from("vehicle_expenses")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("expense_date", { ascending: false });

  return { expenses: (data || []) as VehicleExpense[], error };
}
