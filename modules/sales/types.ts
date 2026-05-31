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

