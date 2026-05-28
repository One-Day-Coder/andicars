"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Cargando recuperacion de contrasena...");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function prepareSession() {
      if (!supabase) {
        setMessage("Falta configurar Supabase.");
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setReady(true);
        setMessage("");
        return;
      }

      setMessage("Abri esta pantalla desde el link de recuperacion que llego por email.");
    }

    prepareSession();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    if (password.length < 6) {
      setMessage("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contrasenas no coinciden.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Contrasena actualizada. Ya podes entrar al panel con la nueva contrasena.");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  }

  return (
    <main className="login-shell">
      <form className="contact-form login-form" onSubmit={handleSubmit}>
        <Link className="brand dark-brand" href="/">
          <span className="brand-mark">A</span>
          <span>AndiCars</span>
        </Link>
        <h1>Cambiar contrasena</h1>
        <p className="admin-note">
          Escribi una nueva contrasena para tu usuario administrador.
        </p>
        <label>
          Nueva contrasena
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={!ready || loading}
            required
          />
        </label>
        <label>
          Repetir contrasena
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={!ready || loading}
            required
          />
        </label>
        <button className="button primary full" type="submit" disabled={!ready || loading}>
          {loading ? "Guardando..." : "Guardar nueva contrasena"}
        </button>
        <Link className="button light full" href="/login">
          Volver al login
        </Link>
        {message ? <p className="form-message">{message}</p> : null}
      </form>
    </main>
  );
}
