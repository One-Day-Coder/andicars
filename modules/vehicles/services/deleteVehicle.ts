import type { SupabaseClient } from "@supabase/supabase-js";

export function deleteVehicle(supabase: SupabaseClient, vehicleId: string) {
  return supabase.from("vehicles").delete().eq("id", vehicleId);
}
