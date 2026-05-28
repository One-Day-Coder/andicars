-- AndiCars - gastos por vehiculo
-- Copiar y ejecutar en Supabase > SQL Editor > New query.

create table if not exists public.vehicle_expenses (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  category text not null,
  description text,
  amount numeric(12, 2) not null,
  currency text not null default 'ARS' check (currency in ('ARS', 'USD')),
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.vehicle_expenses enable row level security;

drop policy if exists "Admins can manage vehicle expenses" on public.vehicle_expenses;
create policy "Admins can manage vehicle expenses"
on public.vehicle_expenses for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
