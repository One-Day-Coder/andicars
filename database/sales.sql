-- AndiCars - ventas, reservas y senas
-- Copiar y ejecutar en Supabase > SQL Editor > New query.

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  customer_name text not null,
  phone text,
  email text,
  operation_status text not null default 'reservado'
    check (operation_status in ('reservado', 'senado', 'vendido', 'entregado', 'cancelado')),
  sale_price_usd numeric(12, 2) not null,
  deposit_usd numeric(12, 2) not null default 0,
  payment_method text,
  sale_date date not null default current_date,
  delivery_date date,
  notes text,
  created_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns text as $$
  select role
  from public.admin_users
  where admin_users.user_id = auth.uid()
  limit 1;
$$ language sql stable security definer;

create or replace function public.can_manage_sales()
returns boolean as $$
  select coalesce(public.current_user_role() in ('owner', 'manager', 'seller'), false);
$$ language sql stable security definer;

alter table public.sales enable row level security;

drop policy if exists "Internal users can manage sales" on public.sales;
create policy "Internal users can manage sales"
on public.sales for all
to authenticated
using (public.can_manage_sales())
with check (public.can_manage_sales());
