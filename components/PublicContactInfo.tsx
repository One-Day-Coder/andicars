"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type PublicSettings = {
  agency_name: string;
  whatsapp_number: string;
  contact_email: string | null;
  area: string | null;
};

export function PublicContactInfo() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      if (!supabase) {
        return;
      }

      const { data } = await supabase
        .from("app_settings")
        .select("agency_name, whatsapp_number, contact_email, area")
        .eq("id", true)
        .maybeSingle();

      if (data) {
        setSettings(data);
      }
    }

    loadSettings();
  }, []);

  if (!settings) {
    return null;
  }

  return (
    <section className="section contact-section" id="contacto">
      <div className="section-heading">
        <p className="eyebrow">Contacto</p>
        <h2>{settings.agency_name}</h2>
      </div>
      <div className="contact-grid">
        <article>
          <span>WhatsApp</span>
          <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer">
            +{settings.whatsapp_number}
          </a>
        </article>
        {settings.contact_email ? (
          <article>
            <span>Email</span>
            <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
          </article>
        ) : null}
        {settings.area ? (
          <article>
            <span>Zona</span>
            <strong>{settings.area}</strong>
          </article>
        ) : null}
      </div>
    </section>
  );
}
