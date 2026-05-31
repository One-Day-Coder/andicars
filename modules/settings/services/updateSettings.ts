import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultSettings } from "@/modules/settings/services/getSettings";
import type { AppSettings } from "@/modules/settings/types";

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

export async function updateSettings(supabase: SupabaseClient, settings: AppSettings) {
  return supabase.from("app_settings").upsert({
    id: true,
    agency_name: settings.agency_name || "AndiCars",
    whatsapp_number: onlyNumbers(settings.whatsapp_number),
    whatsapp_message_template: settings.whatsapp_message_template || defaultSettings.whatsapp_message_template,
    contact_email: settings.contact_email || null,
    area: settings.area || null,
    lead_spam_protection_enabled: settings.lead_spam_protection_enabled,
    lead_spam_window_hours: Number(settings.lead_spam_window_hours || 24)
  });
}
