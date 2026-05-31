import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateSaleInput } from "@/modules/sales/services/createSale";

export function updateSale(supabase: SupabaseClient, saleId: string, input: Partial<CreateSaleInput>) {
  return supabase.from("sales").update(input).eq("id", saleId);
}
