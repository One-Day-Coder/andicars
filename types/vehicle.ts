export type VehicleStatus =
  | "en_preparacion"
  | "disponible"
  | "reservado"
  | "senado"
  | "vendido"
  | "entregado";

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  mileage: number;
  vehicle_type: string;
  transmission: string;
  fuel: string | null;
  current_location?: string | null;
  price_usd: number;
  purchase_price_usd: number | null;
  color: string | null;
  description: string | null;
  status: VehicleStatus;
  is_published: boolean;
  created_at: string;
  main_photo_url?: string | null;
};

export type VehiclePhoto = {
  id: string;
  vehicle_id: string;
  url: string;
  sort_order: number;
  created_at: string;
};

export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "interesado"
  | "no_responde"
  | "negociando"
  | "reservo"
  | "compro"
  | "descartado"
  | "cerrado"
  | "perdido";

export type LeadPriority = "baja" | "media" | "alta";

export type Lead = {
  id: string;
  vehicle_id: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  message: string | null;
  internal_notes: string | null;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  next_contact_at: string | null;
  loss_reason: string | null;
  created_at: string;
  vehicles?: {
    brand: string;
    model: string;
    version: string | null;
    year: number;
  } | null;
  lead_notes?: LeadNote[];
};

export type LeadNote = {
  id: string;
  lead_id: string;
  note: string;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  is_system: boolean;
  author_name?: string;
  editor_name?: string;
};

export type VehicleExpense = {
  id: string;
  vehicle_id: string;
  category: string;
  description: string | null;
  amount: number;
  currency: "ARS" | "USD";
  expense_date: string;
  created_at: string;
  vehicles?: {
    brand: string;
    model: string;
    version: string | null;
    year: number;
  } | null;
};

export type SaleStatus = "reservado" | "senado" | "vendido" | "entregado" | "cancelado";

export type Sale = {
  id: string;
  vehicle_id: string;
  customer_name: string;
  phone: string | null;
  email: string | null;
  operation_status: SaleStatus;
  sale_price_usd: number;
  deposit_usd: number;
  payment_method: string | null;
  sale_date: string;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
  vehicles?: {
    brand: string;
    model: string;
    version: string | null;
    year: number;
  } | null;
};

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

export type AdminRole = "owner" | "manager" | "seller" | "operator";

export type AdminUser = {
  user_id: string;
  nickname: string | null;
  email: string | null;
  role: AdminRole;
  created_at: string;
};
