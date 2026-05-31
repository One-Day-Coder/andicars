import type { SupabaseClient } from "@supabase/supabase-js";
import type { VehicleExpense } from "@/modules/expenses/types";

export async function getExpenses(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("vehicle_expenses")
    .select("*, vehicles(brand, model, version, year)")
    .order("expense_date", { ascending: false });

  return { expenses: (data || []) as VehicleExpense[], error };
}
