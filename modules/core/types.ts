export type AdminRole = "owner" | "manager" | "seller" | "operator";

export type AdminContext = {
  userId: string;
  email: string | null;
  role: AdminRole;
  companyId: string;
};
