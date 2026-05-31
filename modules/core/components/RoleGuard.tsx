"use client";

import { useEffect, useState } from "react";
import { canAccessModule, type AdminModule } from "@/modules/core/permissions";
import { supabase } from "@/lib/supabase/client";
import type { AdminRole } from "@/modules/core/types";

type RoleGuardProps = {
  module: AdminModule;
  children: React.ReactNode;
};

export function RoleGuard({ module, children }: RoleGuardProps) {
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");

  useEffect(() => {
    async function checkRole() {
      if (!supabase) {
        setStatus("blocked");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error || !canAccessModule(data?.role as AdminRole | undefined, module)) {
        setStatus("blocked");
        return;
      }

      setStatus("allowed");
    }

    checkRole();
  }, [module]);

  if (status === "checking") {
    return <p className="empty-state">Verificando permisos...</p>;
  }

  if (status === "blocked") {
    return (
      <section className="admin-stock">
        <h2>Sin permiso</h2>
        <p className="admin-note">Tu rol no tiene acceso a esta seccion.</p>
      </section>
    );
  }

  return <>{children}</>;
}
