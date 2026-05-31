import type { SupabaseClient } from "@supabase/supabase-js";
import type { VehicleExpense } from "@/modules/expenses/types";

export type CreateExpenseInput = Omit<VehicleExpense, "id" | "created_at" | "vehicles">;

export function createExpense(supabase: SupabaseClient, input: CreateExpenseInput) {
  return supabase.from("vehicle_expenses").insert(input);
}
