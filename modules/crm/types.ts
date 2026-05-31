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

