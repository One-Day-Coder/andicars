import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateExpenseInput } from "@/modules/expenses/services/createExpense";

export function updateExpense(supabase: SupabaseClient, expenseId: string, input: Partial<CreateExpenseInput>) {
  return supabase.from("vehicle_expenses").update(input).eq("id", expenseId);
}
