-- AndiCars - notas internas para consultas
-- Copiar y ejecutar en Supabase > SQL Editor > New query.

alter table public.leads
add column if not exists internal_notes text;
