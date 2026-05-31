import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateVehicleInput } from "@/modules/vehicles/services/createVehicle";

export function updateVehicle(supabase: SupabaseClient, vehicleId: string, input: Partial<CreateVehicleInput>) {
  return supabase.from("vehicles").update(input).eq("id", vehicleId);
}
