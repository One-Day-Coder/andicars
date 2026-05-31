import type { SupabaseClient } from "@supabase/supabase-js";
import type { SaleStatus } from "@/modules/sales/types";

export function updateSaleStatus(supabase: SupabaseClient, saleId: string, operationStatus: SaleStatus) {
  return supabase.from("sales").update({ operation_status: operationStatus }).eq("id", saleId);
}
