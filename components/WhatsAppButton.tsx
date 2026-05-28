"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type WhatsAppButtonProps = {
  vehicleTitle: string;
};

const fallbackNumber = "5491112345678";
const fallbackMessage = "Hola AndiCars, quiero consultar por el {vehicle}.";

export function WhatsAppButton({ vehicleTitle }: WhatsAppButtonProps) {
  const [number, setNumber] = useState(fallbackNumber);
  const [messageTemplate, setMessageTemplate] = useState(fallbackMessage);

  useEffect(() => {
    async function loadSettings() {
      if (!supabase) {
        return;
      }

      const { data } = await supabase
        .from("app_settings")
        .select("whatsapp_number, whatsapp_message_template")
        .eq("id", true)
        .maybeSingle();

      if (data?.whatsapp_number) {
        setNumber(data.whatsapp_number);
      }

      if (data?.whatsapp_message_template) {
        setMessageTemplate(data.whatsapp_message_template);
      }
    }

    loadSettings();
  }, []);

  const href = useMemo(() => {
    const message = messageTemplate.includes("{vehicle}")
      ? messageTemplate.replace("{vehicle}", vehicleTitle)
      : `${messageTemplate} ${vehicleTitle}`;

    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }, [messageTemplate, number, vehicleTitle]);

  return (
    <a className="button primary" href={href} target="_blank" rel="noreferrer">
      Consultar por WhatsApp
    </a>
  );
}
