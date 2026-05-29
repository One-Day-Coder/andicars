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
drop policy if exists "Admins can read lead notes" on public.lead_notes;
drop policy if exists "Admins can create lead notes" on public.lead_notes;
drop policy if exists "Admins can edit lead notes" on public.lead_notes;
drop policy if exists "Owners can delete lead notes" on public.lead_notes;

create policy "Admins can read lead notes"
on public.lead_notes for select
to authenticated
using (public.is_admin());

create policy "Admins can create lead notes"
on public.lead_notes for insert
to authenticated
with check (public.is_admin());

create policy "Admins can edit lead notes"
on public.lead_notes for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Owners can delete lead notes"
on public.lead_notes for delete
to authenticated
using (public.current_user_role() = 'owner');
