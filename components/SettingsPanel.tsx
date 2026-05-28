"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { AppSettings } from "@/types/vehicle";

const defaultSettings: AppSettings = {
  id: true,
  agency_name: "AndiCars",
  whatsapp_number: "5491112345678",
  whatsapp_message_template: "Hola AndiCars, quiero consultar por el {vehicle}.",
  contact_email: "",
  area: "",
  lead_spam_protection_enabled: false,
  lead_spam_window_hours: 24,
  updated_at: ""
};

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSettings() {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", true)
      .single();

    if (error) {
      setMessage(`No pude cargar configuracion: ${error.message}`);
      return;
    }

    setSettings(data || defaultSettings);
    setMessage("");
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updateField<Key extends keyof AppSettings>(key: Key, value: AppSettings[Key]) {
    setSettings((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("app_settings").upsert({
      id: true,
      agency_name: settings.agency_name || "AndiCars",
      whatsapp_number: onlyNumbers(settings.whatsapp_number),
      whatsapp_message_template: settings.whatsapp_message_template || defaultSettings.whatsapp_message_template,
      contact_email: settings.contact_email || null,
      area: settings.area || null,
      lead_spam_protection_enabled: settings.lead_spam_protection_enabled,
      lead_spam_window_hours: Number(settings.lead_spam_window_hours || 24)
    });

    if (error) {
      setMessage(`No se pudo guardar: ${error.message}`);
      setLoading(false);
      return;
    }

    setMessage("Configuracion guardada.");
    setLoading(false);
    await loadSettings();
  }

  return (
    <form className="vehicle-form settings-form" onSubmit={handleSubmit}>
      <div className="wide-field form-title-row">
        <div>
          <h2>Datos generales</h2>
          <p>Estos datos se usan en la web publica y en las consultas.</p>
        </div>
        <button className="button light" type="button" onClick={loadSettings}>
          Actualizar
        </button>
      </div>

      <label>
        Nombre visible
        <input value={settings.agency_name} onChange={(event) => updateField("agency_name", event.target.value)} />
      </label>

      <label>
        Email de contacto
        <input
          type="email"
          value={settings.contact_email || ""}
          onChange={(event) => updateField("contact_email", event.target.value)}
        />
      </label>

      <label>
        WhatsApp
        <input
          value={settings.whatsapp_number}
          onChange={(event) => updateField("whatsapp_number", onlyNumbers(event.target.value))}
          placeholder="Ej: 5491123456789"
          required
        />
      </label>

      <label>
        Zona / direccion
        <input value={settings.area || ""} onChange={(event) => updateField("area", event.target.value)} />
      </label>

      <label className="wide-field">
        Mensaje automatico de WhatsApp
        <textarea
          rows={3}
          value={settings.whatsapp_message_template}
          onChange={(event) => updateField("whatsapp_message_template", event.target.value)}
        />
        <span className="field-help">Usa {"{vehicle}"} para insertar el auto automaticamente.</span>
      </label>

      <section className="settings-box wide-field">
        <div>
          <h3>Proteccion anti-spam en consultas</h3>
          <p>
            Si esta activa, la misma persona no puede enviar otra consulta por el mismo auto durante el tiempo elegido.
            Puede consultar por otros autos sin problema.
          </p>
        </div>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={settings.lead_spam_protection_enabled}
            onChange={(event) => updateField("lead_spam_protection_enabled", event.target.checked)}
          />
          Activar proteccion anti-spam
        </label>
        <label>
          Horas de bloqueo por mismo auto
          <input
            type="number"
            min="1"
            max="720"
            value={settings.lead_spam_window_hours}
            onChange={(event) => updateField("lead_spam_window_hours", Number(event.target.value))}
          />
        </label>
      </section>

      <div className="form-actions wide-field">
        <button className="button primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar configuracion"}
        </button>
      </div>

      {message ? <p className="form-message wide-field">{message}</p> : null}
    </form>
  );
}
