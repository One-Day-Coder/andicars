import type { LeadPriority, LeadStatus } from "./types";

export const leadStatuses: LeadStatus[] = [
  "nuevo",
  "contactado",
  "interesado",
  "no_responde",
  "negociando",
  "reservo",
  "compro",
  "descartado",
  "cerrado",
  "perdido"
];

export const leadPriorities: LeadPriority[] = ["baja", "media", "alta"];

