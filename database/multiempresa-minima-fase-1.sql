-- Fase 1: Multiempresa minima
-- Este script crea companies, company_modules y la empresa default AndiCars.
-- No agrega company_id a tablas existentes.
-- Activa RLS en companies y company_modules para evitar exposicion publica accidental.
-- No modifica policies.
-- No debe ejecutarse sin revision previa.

-- ============================================================
-- 1. Extension necesaria para gen_random_uuid()
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 2. Tabla de empresas
-- ============================================================

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  phone text,
  email text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. Tabla de modulos activos por empresa
-- ============================================================

create table if not exists public.company_modules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  module_key text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint company_modules_company_module_unique unique (company_id, module_key)
);

create index if not exists company_modules_company_id_idx
on public.company_modules(company_id);

create index if not exists company_modules_module_key_idx
on public.company_modules(module_key);

create index if not exists company_modules_company_enabled_idx
on public.company_modules(company_id, enabled);

-- ============================================================
-- 4. updated_at
-- ============================================================
-- El proyecto ya usa public.set_updated_at().
-- Este bloque solo la crea si no existe, para no pisar una funcion existente.

do $$
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_updated_at'
      and p.pronargs = 0
  ) then
    create function public.set_updated_at()
    returns trigger as $function$
    begin
      new.updated_at = now();
      return new;
    end;
    $function$ language plpgsql;
  end if;
end;
$$;

drop trigger if exists set_companies_updated_at on public.companies;

create trigger set_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists set_company_modules_updated_at on public.company_modules;

create trigger set_company_modules_updated_at
before update on public.company_modules
for each row execute function public.set_updated_at();

-- ============================================================
-- 5. Empresa default AndiCars
-- ============================================================
-- El upsert mantiene name, slug e is_active.
-- No pisa manualmente logo_url, phone, email ni address si ya existieran.

insert into public.companies (name, slug, is_active)
values ('AndiCars', 'andicars', true)
on conflict (slug) do update
set
  name = excluded.name,
  is_active = true,
  updated_at = now();

-- ============================================================
-- 6. Modulos default para AndiCars
-- ============================================================
-- El upsert evita duplicados y deja activos los modulos base actuales.

with andicars_company as (
  select id
  from public.companies
  where slug = 'andicars'
),
default_modules(module_key) as (
  values
    ('core'),
    ('vehicles'),
    ('crm'),
    ('expenses'),
    ('sales'),
    ('reports'),
    ('settings'),
    ('users'),
    ('public_site'),
    ('documents'),
    ('trade_ins')
)
insert into public.company_modules (company_id, module_key, enabled)
select andicars_company.id, default_modules.module_key, true
from andicars_company
cross join default_modules
on conflict (company_id, module_key) do update
set
  enabled = true,
  updated_at = now();

-- ============================================================
-- 7. RLS y fases futuras
-- ============================================================
-- Esta fase activa RLS en companies y company_modules para evitar exposicion publica accidental.
-- Esta fase no crea policies.
-- Esta fase no agrega company_id a tablas existentes.
-- RLS con policies queda para fases futuras.

alter table public.companies enable row level security;
alter table public.company_modules enable row level security;

-- ============================================================
-- 8. Validacion manual
-- ============================================================
-- Ejecutar estas consultas manualmente despues de revisar y ejecutar el script.

-- select *
-- from public.companies
-- where slug = 'andicars';

-- select module_key, enabled
-- from public.company_modules
-- where company_id = (select id from public.companies where slug = 'andicars')
-- order by module_key;

-- select company_id, module_key, count(*)
-- from public.company_modules
-- group by company_id, module_key
-- having count(*) > 1;
