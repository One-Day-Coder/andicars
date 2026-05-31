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

