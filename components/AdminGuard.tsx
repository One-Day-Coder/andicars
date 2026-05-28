"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type AdminGuardProps = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");
  const [email, setEmail] = useState("");
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

      setEmail(data.session.user.email || "");
      const roleResult = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", data.session.user.id)
        .single();

      if (!roleResult.error && roleResult.data?.role) {
        setRole(roleResult.data.role);
      }

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
        <span>{email}</span>
        <span className="status-badge published">{role}</span>
        <button className="button light" type="button" onClick={signOut}>
          Cerrar sesion
        </button>
      </div>
      {children}
    </>
  );
}
