-- AndiCars - notas internas para consultas
-- Copiar y ejecutar en Supabase > SQL Editor > New query.

alter table public.leads
add column if not exists internal_notes text;

alter table public.leads
drop constraint if exists leads_status_check;

alter table public.leads
add constraint leads_status_check
check (status in ('nuevo', 'contactado', 'interesado', 'no_responde', 'negociando', 'reservo', 'compro', 'descartado', 'cerrado', 'perdido'));

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.lead_notes enable row level security;

drop policy if exists "Admins can manage lead notes" on public.lead_notes;
create policy "Admins can manage lead notes"
on public.lead_notes for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
