import type { SupabaseClient } from "@supabase/supabase-js";
import { vehicleCardSelect } from "@/modules/vehicles/queries";
import type { Vehicle } from "@/modules/vehicles/types";

type PublicVehicleResult = {
  vehicles: Vehicle[];
  errorMessage: string | null;
};

export async function getPublicVehicles(
  supabase: SupabaseClient | null,
  fallbackVehicles: Vehicle[] = []
): Promise<PublicVehicleResult> {
  if (!supabase) {
    return {
      vehicles: fallbackVehicles,
      errorMessage: "Supabase no esta configurado."
    };
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select(vehicleCardSelect)
    .eq("is_published", true)
    .in("status", ["disponible", "reservado"])
    .order("created_at", { ascending: false });

  if (error) {
    return { vehicles: [], errorMessage: error.message };
  }

  return { vehicles: (data || []) as Vehicle[], errorMessage: null };
}

export async function getFeaturedVehicles(
  supabase: SupabaseClient | null,
  fallbackVehicles: Vehicle[] = [],
  limit = 3
): Promise<Vehicle[]> {
  if (!supabase) {
    return fallbackVehicles;
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select(vehicleCardSelect)
    .eq("is_published", true)
    .in("status", ["disponible", "reservado"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return fallbackVehicles;
  }

  return (data || []) as Vehicle[];
}
