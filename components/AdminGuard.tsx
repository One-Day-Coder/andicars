"use client";

import { useEffect, useState } from "react";
import { getRoleLabel } from "@/lib/admin-permissions";
import { supabase } from "@/lib/supabase/client";

type AdminGuardProps = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("admin");

  useEffect(() => {
    async function checkSession() {
      if (!supabase) {
        setStatus("blocked");
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.href = "/login";
        return;
      }

      const roleResult = await supabase
        .from("admin_users")
        .select("role, nickname, email")
        .eq("user_id", data.session.user.id)
        .single();

      if (!roleResult.error && roleResult.data?.role) {
        setRole(roleResult.data.role);
      }

      setDisplayName(
        roleResult.data?.nickname ||
          roleResult.data?.email ||
          data.session.user.email ||
          "Usuario"
      );

      setStatus("allowed");
    }

    checkSession();
  }, []);

  async function signOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (status === "checking") {
    return (
      <main className="admin-shell">
        <p className="empty-state">Verificando acceso...</p>
      </main>
    );
  }

  if (status === "blocked") {
    return (
      <main className="admin-shell">
        <p className="empty-state">No se pudo verificar el acceso. Revisa Supabase.</p>
      </main>
    );
  }

  return (
    <>
      <div className="admin-session-bar">
        <span>{displayName}</span>
        <span className="status-badge published">{getRoleLabel(role)}</span>
        <button className="button light" type="button" onClick={signOut}>
          Cerrar sesion
        </button>
      </div>
      {children}
    </>
  );
}
