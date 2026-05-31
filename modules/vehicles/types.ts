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

