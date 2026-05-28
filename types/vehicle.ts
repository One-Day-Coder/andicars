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
  | "negociando"
  | "reservo"
  | "compro"
  | "perdido";

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
  created_at: string;
  vehicles?: {
    brand: string;
    model: string;
    version: string | null;
    year: number;
  } | null;
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
