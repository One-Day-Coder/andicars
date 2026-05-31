"use client";

import { useEffect, useState } from "react";
import { getRoleLabel } from "@/modules/core/permissions";
import { supabase } from "@/lib/supabase/client";
import type { AdminRole } from "@/modules/core";
import type { AdminUser } from "@/modules/users/types";

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
  const [newNickname, setNewNickname] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("seller");
  const [editingUserId, setEditingUserId] = useState("");
  const [editDraft, setEditDraft] = useState<{ nickname: string; email: string; role: AdminRole }>({
    nickname: "",
    email: "",
    role: "seller"
  });
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
      nickname: newNickname.trim() || null,
      email: newEmail.trim() || null,
      role: newRole
    });

    if (error) {
      setMessage(`No se pudo agregar: ${error.message}`);
      setLoading(false);
      return;
    }

    setNewUserId("");
    setNewNickname("");
    setNewEmail("");
    setNewRole("seller");
    setMessage("Usuario guardado.");
    setLoading(false);
    await loadUsers();
  }

  function startEdit(user: AdminUser) {
    setEditingUserId(user.user_id);
    setEditDraft({
      nickname: user.nickname || "",
      email: user.email || "",
      role: user.role
    });
    setMessage("");
  }

  function cancelEdit() {
    setEditingUserId("");
    setEditDraft({ nickname: "", email: "", role: "seller" });
  }

  async function updateUser(user: AdminUser) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const { error } = await supabase
      .from("admin_users")
      .update({
        nickname: editDraft.nickname.trim() || null,
        email: editDraft.email.trim() || null,
        role: editDraft.role
      })
      .eq("user_id", user.user_id);

    if (error) {
      setMessage(`No se pudo actualizar: ${error.message}`);
      return;
    }

    setMessage("Usuario actualizado.");
    cancelEdit();
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
          Apodo visible
          <input value={newNickname} onChange={(event) => setNewNickname(event.target.value)} placeholder="Ej: Victor" />
        </label>

        <label>
          Email de referencia
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
                  <h3>{user.nickname || user.email || "Sin apodo cargado"}</h3>
                  <p>{user.user_id}</p>
                  {user.user_id === currentUserId ? <span className="status-badge published">Tu usuario</span> : null}
                </div>
                <label>
                  Apodo visible
                  <input
                    value={editingUserId === user.user_id ? editDraft.nickname : user.nickname || ""}
                    onChange={(event) => setEditDraft((current) => ({ ...current, nickname: event.target.value }))}
                    disabled={editingUserId !== user.user_id}
                    placeholder="Ej: Victor"
                  />
                </label>
                <label>
                  Email de referencia
                  <input
                    type="email"
                    value={editingUserId === user.user_id ? editDraft.email : user.email || ""}
                    onChange={(event) => setEditDraft((current) => ({ ...current, email: event.target.value }))}
                    disabled={editingUserId !== user.user_id}
                  />
                </label>
                <label>
                  Rol
                  <select
                    value={editingUserId === user.user_id ? editDraft.role : user.role}
                    onChange={(event) => setEditDraft((current) => ({ ...current, role: event.target.value as AdminRole }))}
                    disabled={editingUserId !== user.user_id}
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {getRoleLabel(role.value)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="user-actions">
                  {editingUserId === user.user_id ? (
                    <>
                      <button className="button primary" type="button" onClick={() => updateUser(user)}>
                        Guardar
                      </button>
                      <button className="button light" type="button" onClick={cancelEdit}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button className="button light" type="button" onClick={() => startEdit(user)}>
                      Editar
                    </button>
                  )}
                  <button className="button danger" type="button" onClick={() => removeUser(user)} disabled={user.user_id === currentUserId}>
                    Quitar acceso
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
