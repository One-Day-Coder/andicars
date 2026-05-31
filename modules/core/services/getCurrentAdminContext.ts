import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminContext, AdminRole } from "@/modules/core/types";

type AdminUserContextRow = {
  role: AdminRole | null;
  email: string | null;
  company_id: string | null;
};

type AdminContextResult = {
  context: AdminContext | null;
  errorMessage: string | null;
};

export async function getCurrentAdminContext(
  supabase: SupabaseClient | null
): Promise<AdminContextResult> {
  if (!supabase) {
    return {
      context: null,
      errorMessage: "Falta configurar Supabase."
    };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    return {
      context: null,
      errorMessage: `No se pudo verificar la sesion: ${sessionError.message}`
    };
  }

  const sessionUser = sessionData.session?.user;

  if (!sessionUser) {
    return {
      context: null,
      errorMessage: "No hay un usuario autenticado."
    };
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("role, email, company_id")
    .eq("user_id", sessionUser.id)
    .single<AdminUserContextRow>();

  if (error) {
    return {
      context: null,
      errorMessage: `No se pudo cargar el usuario interno: ${error.message}`
    };
  }

  if (!data) {
    return {
      context: null,
      errorMessage: "El usuario autenticado no tiene registro en admin_users."
    };
  }

  if (!data.role) {
    return {
      context: null,
      errorMessage: "El usuario interno no tiene rol asignado."
    };
  }

  if (!data.company_id) {
    return {
      context: null,
      errorMessage: "El usuario interno no tiene empresa asignada."
    };
  }

  return {
    context: {
      userId: sessionUser.id,
      email: sessionUser.email || data.email || null,
      role: data.role,
      companyId: data.company_id
    },
    errorMessage: null
  };
}
