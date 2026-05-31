import type { SupabaseClient } from "@supabase/supabase-js";
import { appSettingsSelect } from "@/modules/settings/queries";
import type { AppSettings } from "@/modules/settings/types";

export const defaultSettings: AppSettings = {
  id: true,
  agency_name: "AndiCars",
  whatsapp_number: "5491112345678",
  whatsapp_message_template: "Hola AndiCars, quiero consultar por el {vehicle}.",
  contact_email: "",
  area: "",
  lead_spam_protection_enabled: false,
  lead_spam_window_hours: 24,
  updated_at: ""
};

export async function getSettings(supabase: SupabaseClient | null) {
  if (!supabase) {
    return {
      settings: defaultSettings,
      errorMessage: "Falta configurar Supabase."
    };
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select(appSettingsSelect)
    .eq("id", true)
    .single();

  if (error) {
    return {
      settings: defaultSettings,
      errorMessage: error.message
    };
  }

  return {
    settings: (data || defaultSettings) as AppSettings,
    errorMessage: null
  };
}
