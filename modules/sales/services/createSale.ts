import type { SupabaseClient } from "@supabase/supabase-js";
import type { Sale } from "@/modules/sales/types";

export type CreateSaleInput = Omit<Sale, "id" | "created_at" | "vehicles">;

export function createSale(supabase: SupabaseClient, input: CreateSaleInput) {
  return supabase.from("sales").insert(input);
}
