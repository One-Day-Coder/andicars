import type { SupabaseClient } from "@supabase/supabase-js";
import type { Sale } from "@/modules/sales/types";

export async function getSales(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("sales")
    .select("*, vehicles(brand, model, version, year)")
    .order("sale_date", { ascending: false });

  return { sales: (data || []) as Sale[], error };
}
