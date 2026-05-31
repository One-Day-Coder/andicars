import type { SupabaseClient } from "@supabase/supabase-js";
import type { Vehicle } from "@/modules/vehicles/types";

export type CreateVehicleInput = Omit<Vehicle, "id" | "created_at" | "main_photo_url"> & {
  main_photo_url?: string | null;
};

export function createVehicle(supabase: SupabaseClient, input: CreateVehicleInput) {
  return supabase.from("vehicles").insert(input).select("id").single();
}
