import type { SupabaseClient } from "@supabase/supabase-js";

export function deleteExpense(supabase: SupabaseClient, expenseId: string) {
  return supabase.from("vehicle_expenses").delete().eq("id", expenseId);
}
