"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!supabase) {
      setMessage("Falta configurar Supabase. Primero crea .env.local con tus claves.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="login-shell">
      <form className="contact-form login-form" onSubmit={handleLogin}>
        <Link className="brand dark-brand" href="/">
          <span className="brand-mark">A</span>
          <span>AndiCars</span>
        </Link>
        <h1>Entrar al panel</h1>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Contrasena
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="button primary full" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {message ? <p className="form-message">{message}</p> : null}
      </form>
    </main>
  );
}
