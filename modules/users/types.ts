import type { AdminRole } from "@/modules/core/types";

export type AdminUser = {
  user_id: string;
  nickname: string | null;
  email: string | null;
  role: AdminRole;
  created_at: string;
};

