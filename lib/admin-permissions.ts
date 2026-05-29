import type { AdminRole } from "@/types/vehicle";

export type AdminModule =
  | "dashboard"
  | "vehicles"
  | "leads"
  | "expenses"
  | "sales"
  | "reports"
  | "settings"
  | "users";

export const roleLabels: Record<AdminRole, string> = {
  owner: "Dueno",
  manager: "Encargado",
  seller: "Vendedor",
  operator: "Operador"
};

export const moduleLabels: Record<AdminModule, string> = {
  dashboard: "Panel",
  vehicles: "Vehiculos",
  leads: "Consultas",
  expenses: "Gastos",
  sales: "Ventas",
  reports: "Reportes",
  settings: "Configuracion",
  users: "Usuarios"
};

const permissions: Record<AdminRole, AdminModule[]> = {
  owner: ["dashboard", "vehicles", "leads", "expenses", "sales", "reports", "settings", "users"],
  manager: ["dashboard", "vehicles", "leads", "expenses", "sales", "reports"],
  seller: ["dashboard", "vehicles", "leads", "sales"],
  operator: ["dashboard", "vehicles", "leads"]
};

export function canAccessModule(role: AdminRole | string | null | undefined, module: AdminModule) {
  if (!role || !(role in permissions)) {
    return false;
  }

  return permissions[role as AdminRole].includes(module);
}

export function getRoleLabel(role: AdminRole | string | null | undefined) {
  if (!role || !(role in roleLabels)) {
    return "Sin rol";
  }

  return roleLabels[role as AdminRole];
}
