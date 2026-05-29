"use client";

import { useEffect, useState } from "react";
import { getRoleLabel } from "@/lib/admin-permissions";
import { supabase } from "@/lib/supabase/client";
import type { AdminRole, AdminUser } from "@/types/vehicle";

const roleOptions: Array<{ value: AdminRole; label: string; description: string }> = [
  { value: "owner", label: "Dueno", description: "Acceso completo." },
  { value: "manager", label: "Encargado", description: "Puede ver finanzas." },
  { value: "seller", label: "Vendedor", description: "Ventas y consultas." },
  { value: "operator", label: "Operador", description: "Carga operativa." }
];

export function UsersPanel() {
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentRole, setCurrentRole] = useState<AdminRole | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [newUserId, setNewUserId] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("seller");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user;

    if (!sessionUser) {
      window.location.href = "/login";
      return;
    }

    setCurrentUserId(sessionUser.id);

    const roleResult = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", sessionUser.id)
      .single();

    const role = roleResult.data?.role as AdminRole | undefined;
    setCurrentRole(role || null);

    if (role !== "owner") {
      setMessage("Solo un usuario Dueno puede administrar usuarios.");
      return;
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      setMessage(`No pude cargar usuarios: ${error.message}`);
      return;
    }

    setUsers(data || []);
    setMessage("");
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function addUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("admin_users").upsert({
      user_id: newUserId.trim(),
      email: newEmail.trim() || null,
      role: newRole
    });

    if (error) {
      setMessage(`No se pudo agregar: ${error.message}`);
      setLoading(false);
      return;
    }

    setNewUserId("");
    setNewEmail("");
    setNewRole("seller");
    setMessage("Usuario guardado.");
    setLoading(false);
    await loadUsers();
  }

  async function updateUser(user: AdminUser, role: AdminRole, email: string | null = user.email) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const { error } = await supabase
      .from("admin_users")
      .update({ role, email: email || null })
      .eq("user_id", user.user_id);

    if (error) {
      setMessage(`No se pudo actualizar: ${error.message}`);
      return;
    }

    setMessage("Usuario actualizado.");
    await loadUsers();
  }

  async function removeUser(user: AdminUser) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    if (user.user_id === currentUserId) {
      setMessage("No podes quitarte el acceso a vos mismo desde esta pantalla.");
      return;
    }

    const confirmed = window.confirm("Quitar acceso al panel para este usuario?");

    if (!confirmed) {
      return;
    }

    const { error } = await supabase.from("admin_users").delete().eq("user_id", user.user_id);

    if (error) {
      setMessage(`No se pudo quitar acceso: ${error.message}`);
      return;
    }

    setMessage("Acceso quitado.");
    await loadUsers();
  }

  if (currentRole && currentRole !== "owner") {
    return (
      <section className="admin-stock">
        <h2>Acceso restringido</h2>
        <p className="admin-note">Solo un usuario Dueno puede administrar usuarios internos.</p>
      </section>
    );
  }

  return (
    <div className="users-layout">
      <form className="vehicle-form" onSubmit={addUser}>
        <div className="wide-field form-title-row">
          <div>
            <h2>Agregar usuario interno</h2>
            <p>Primero crea el usuario en Supabase Authentication y pega aca su User UID.</p>
          </div>
        </div>

        <label className="wide-field">
          User UID de Supabase
          <input value={newUserId} onChange={(event) => setNewUserId(event.target.value)} required />
        </label>

        <label>
          Email visible
          <input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} />
        </label>

        <label>
          Rol
          <select value={newRole} onChange={(event) => setNewRole(event.target.value as AdminRole)}>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>

        <div className="form-actions wide-field">
          <button className="button primary" type="submit" disabled={loading || currentRole !== "owner"}>
            {loading ? "Guardando..." : "Guardar usuario"}
          </button>
        </div>

        {message ? <p className="form-message wide-field">{message}</p> : null}
      </form>

      <aside className="admin-tools">
        <h2>Roles</h2>
        <div className="role-help-list">
          {roleOptions.map((role) => (
            <article key={role.value}>
              <strong>{role.label}</strong>
              <p>{role.description}</p>
            </article>
          ))}
        </div>
      </aside>

      <section className="admin-stock wide-admin-section">
        <div className="stock-header">
          <div>
            <h2>Usuarios con acceso</h2>
            <p>Cambia roles o quita accesos sin entrar a la tabla manualmente.</p>
          </div>
          <button className="button light" type="button" onClick={loadUsers}>
            Actualizar
          </button>
        </div>

        {users.length === 0 ? (
          <p className="empty-state">Todavia no hay usuarios cargados.</p>
        ) : (
          <div className="user-list">
            {users.map((user) => (
              <article className="user-row" key={user.user_id}>
                <div>
                  <h3>{user.email || "Sin email cargado"}</h3>
                  <p>{user.user_id}</p>
                  {user.user_id === currentUserId ? <span className="status-badge published">Tu usuario</span> : null}
                </div>
                <label>
                  Email visible
                  <input
                    defaultValue={user.email || ""}
                    onBlur={(event) => {
                      const nextEmail = event.target.value.trim();
                      if (nextEmail !== (user.email || "")) {
                        updateUser(user, user.role, nextEmail || null);
                      }
                    }}
                  />
                </label>
                <label>
                  Rol
                  <select value={user.role} onChange={(event) => updateUser(user, event.target.value as AdminRole)}>
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {getRoleLabel(role.value)}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="button danger" type="button" onClick={() => removeUser(user)} disabled={user.user_id === currentUserId}>
                  Quitar acceso
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
