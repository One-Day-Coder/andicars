"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

type LeadFormProps = {
  vehicleId: string;
  vehicleTitle: string;
};

export function LeadForm({ vehicleId, vehicleTitle }: LeadFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback("");

    if (!supabase) {
      setFeedback("No se pudo conectar con Supabase.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("leads").insert({
      vehicle_id: vehicleId,
      customer_name: customerName,
      phone,
      email: email || null,
      message: message || `Consulta por ${vehicleTitle}`,
      source: "web",
      status: "nuevo"
    });

    if (error) {
      setFeedback(`No se pudo enviar la consulta: ${error.message}`);
      setLoading(false);
      return;
    }

    setCustomerName("");
    setPhone("");
    setEmail("");
    setMessage("");
    setFeedback("Consulta enviada. Te vamos a contactar a la brevedad.");
    setLoading(false);
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <h2>Consultar por este auto</h2>
      <label>
        Nombre
        <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
      </label>
      <label>
        Telefono
        <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        Mensaje
        <textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={`Hola, me interesa el ${vehicleTitle}.`} />
      </label>
      <button className="button primary full" type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar consulta"}
      </button>
      {feedback ? <p className="form-message">{feedback}</p> : null}
    </form>
  );
}
