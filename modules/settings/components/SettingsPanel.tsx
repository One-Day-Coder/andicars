"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { defaultSettings, getSettings } from "@/modules/settings/services/getSettings";
import { updateSettings } from "@/modules/settings/services/updateSettings";
import type { AppSettings } from "@/modules/settings/types";

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSettings() {
    const { settings: nextSettings, errorMessage } = await getSettings(supabase);

    if (errorMessage) {
      setMessage(`No pude cargar configuracion: ${errorMessage}`);
      return;
    }

    setSettings(nextSettings);
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

    const { error } = await updateSettings(supabase, settings);

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
