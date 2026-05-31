import type { SupabaseClient } from "@supabase/supabase-js";

export async function uploadVehiclePhoto(
  supabase: SupabaseClient,
  filePath: string,
  file: File
) {
  const { error } = await supabase.storage.from("vehicle-photos").upload(filePath, file);

  if (error) {
    throw error;
  }

  return supabase.storage.from("vehicle-photos").getPublicUrl(filePath).data.publicUrl;
}
