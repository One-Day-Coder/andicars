export type AppSettings = {
  id: boolean;
  agency_name: string;
  whatsapp_number: string;
  whatsapp_message_template: string;
  contact_email: string | null;
  area: string | null;
  lead_spam_protection_enabled: boolean;
  lead_spam_window_hours: number;
  updated_at: string;
};

