import type { SupabaseClient } from "@supabase/supabase-js";
import type { VehiclePhoto } from "@/modules/vehicles/types";

export async function getVehiclePhotos(
  supabase: SupabaseClient | null,
  vehicleId: string
): Promise<VehiclePhoto[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("vehicle_photos")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as VehiclePhoto[];
}
