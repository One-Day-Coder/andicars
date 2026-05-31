-- AndiCars - ubicacion actual del vehiculo
-- Ejecutar una sola vez en Supabase > SQL Editor > New query.

alter table public.vehicles
add column if not exists current_location text;
