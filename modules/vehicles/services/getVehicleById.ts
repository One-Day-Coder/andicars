import type { SupabaseClient } from "@supabase/supabase-js";
import { vehicleCardSelect } from "@/modules/vehicles/queries";
import type { Vehicle, VehiclePhoto } from "@/modules/vehicles/types";

export async function getPublicVehicleById(
  supabase: SupabaseClient | null,
  id: string,
  fallbackVehicle: Vehicle | null = null
): Promise<Vehicle | null> {
  if (!supabase) {
    return fallbackVehicle;
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select(vehicleCardSelect)
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return fallbackVehicle;
  }

  return data as Vehicle;
}

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
