-- AndiCars - esquema inicial Supabase
-- Copiar y ejecutar en Supabase > SQL Editor > New query.

create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner'
    check (role in ('owner', 'manager', 'seller', 'operator')),
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  version text,
  year integer not null,
  mileage integer not null default 0,
  vehicle_type text not null,
  transmission text not null,
  fuel text,
  price_usd numeric(12, 2) not null,
  purchase_price_usd numeric(12, 2),
  color text default '#0f766e',
  description text,
  status text not null default 'en_preparacion'
    check (status in ('en_preparacion', 'disponible', 'reservado', 'senado', 'vendido', 'entregado')),
  is_published boolean not null default false,
  main_photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

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

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  message text,
  internal_notes text,
  source text not null default 'web',
  status text not null default 'nuevo'
    check (status in ('nuevo', 'contactado', 'interesado', 'negociando', 'reservo', 'compro', 'perdido')),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists vehicles_set_updated_at on public.vehicles;

create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  );
$$ language sql stable security definer;

create or replace function public.current_user_role()
returns text as $$
  select role
  from public.admin_users
  where admin_users.user_id = auth.uid()
  limit 1;
$$ language sql stable security definer;

create or replace function public.can_manage_financials()
returns boolean as $$
  select coalesce(public.current_user_role() in ('owner', 'manager'), false);
$$ language sql stable security definer;

create or replace function public.can_manage_sales()
returns boolean as $$
  select coalesce(public.current_user_role() in ('owner', 'manager', 'seller'), false);
$$ language sql stable security definer;

alter table public.admin_users enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_photos enable row level security;
alter table public.vehicle_expenses enable row level security;
alter table public.sales enable row level security;
alter table public.leads enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users for select
to authenticated
using (public.is_admin());

drop policy if exists "Public can read published vehicles" on public.vehicles;
create policy "Public can read published vehicles"
on public.vehicles for select
to anon, authenticated
using (
  is_published = true
  and status in ('disponible', 'reservado')
);

drop policy if exists "Admins can manage vehicles" on public.vehicles;
create policy "Admins can manage vehicles"
on public.vehicles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published vehicle photos" on public.vehicle_photos;
create policy "Public can read published vehicle photos"
on public.vehicle_photos for select
to anon, authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = vehicle_photos.vehicle_id
      and vehicles.is_published = true
      and vehicles.status in ('disponible', 'reservado')
  )
);

drop policy if exists "Admins can manage vehicle photos" on public.vehicle_photos;
create policy "Admins can manage vehicle photos"
on public.vehicle_photos for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage vehicle expenses" on public.vehicle_expenses;
drop policy if exists "Owners and managers can manage vehicle expenses" on public.vehicle_expenses;
create policy "Owners and managers can manage vehicle expenses"
on public.vehicle_expenses for all
to authenticated
using (public.can_manage_financials())
with check (public.can_manage_financials());

drop policy if exists "Internal users can manage sales" on public.sales;
create policy "Internal users can manage sales"
on public.sales for all
to authenticated
using (public.can_manage_sales())
with check (public.can_manage_sales());

drop policy if exists "Anyone can create leads" on public.leads;
create policy "Anyone can create leads"
on public.leads for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can manage leads" on public.leads;
create policy "Admins can manage leads"
on public.leads for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
