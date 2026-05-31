-- Fase 2: company_id nullable + backfill hacia AndiCars
-- Este script agrega company_id como nullable a tablas existentes.
-- Este script asocia los datos actuales a la empresa default AndiCars.
-- No aplica NOT NULL todavia.
-- No modifica RLS.
-- No modifica policies.
-- No debe ejecutarse sin revision previa.

-- ============================================================
-- 1. Validacion previa
-- ============================================================
-- Antes de ejecutar, confirmar que la empresa default existe:
-- select id from public.companies where slug = 'andicars';

do $$
begin
  if not exists (
    select 1
    from public.companies
    where slug = 'andicars'
  ) then
    raise exception 'No existe public.companies con slug = andicars. Ejecutar y validar Fase 1 antes de Fase 2.';
  end if;
end;
$$;

-- ============================================================
-- 2. Agregar company_id nullable
-- ============================================================
-- Se agrega solo si la tabla existe.
-- No se aplica NOT NULL en esta fase.

do $$
begin
  if to_regclass('public.admin_users') is not null then
    alter table public.admin_users
    add column if not exists company_id uuid;
  end if;

  if to_regclass('public.vehicles') is not null then
    alter table public.vehicles
    add column if not exists company_id uuid;
  end if;

  if to_regclass('public.vehicle_photos') is not null then
    alter table public.vehicle_photos
    add column if not exists company_id uuid;
  end if;

  if to_regclass('public.vehicle_expenses') is not null then
    alter table public.vehicle_expenses
    add column if not exists company_id uuid;
  end if;

  if to_regclass('public.sales') is not null then
    alter table public.sales
    add column if not exists company_id uuid;
  end if;

  if to_regclass('public.leads') is not null then
    alter table public.leads
    add column if not exists company_id uuid;
  end if;

  if to_regclass('public.lead_notes') is not null then
    alter table public.lead_notes
    add column if not exists company_id uuid;
  end if;

  if to_regclass('public.app_settings') is not null then
    alter table public.app_settings
    add column if not exists company_id uuid;
  end if;
end;
$$;

-- ============================================================
-- 3. Backfill hacia empresa default AndiCars
-- ============================================================

do $$
begin
  if to_regclass('public.admin_users') is not null then
    update public.admin_users
    set company_id = (select id from public.companies where slug = 'andicars')
    where company_id is null;
  end if;

  if to_regclass('public.vehicles') is not null then
    update public.vehicles
    set company_id = (select id from public.companies where slug = 'andicars')
    where company_id is null;
  end if;

  if to_regclass('public.vehicle_photos') is not null then
    update public.vehicle_photos p
    set company_id = v.company_id
    from public.vehicles v
    where p.vehicle_id = v.id
      and p.company_id is null
      and v.company_id is not null;
  end if;

  if to_regclass('public.vehicle_expenses') is not null then
    update public.vehicle_expenses e
    set company_id = v.company_id
    from public.vehicles v
    where e.vehicle_id = v.id
      and e.company_id is null
      and v.company_id is not null;
  end if;

  if to_regclass('public.sales') is not null then
    update public.sales s
    set company_id = v.company_id
    from public.vehicles v
    where s.vehicle_id = v.id
      and s.company_id is null
      and v.company_id is not null;
  end if;

  if to_regclass('public.leads') is not null then
    update public.leads l
    set company_id = v.company_id
    from public.vehicles v
    where l.vehicle_id = v.id
      and l.company_id is null
      and v.company_id is not null;

    update public.leads
    set company_id = (select id from public.companies where slug = 'andicars')
    where company_id is null;
  end if;

  if to_regclass('public.lead_notes') is not null then
    update public.lead_notes n
    set company_id = l.company_id
    from public.leads l
    where n.lead_id = l.id
      and n.company_id is null
      and l.company_id is not null;
  end if;

  if to_regclass('public.app_settings') is not null then
    update public.app_settings
    set company_id = (select id from public.companies where slug = 'andicars')
    where company_id is null;
  end if;
end;
$$;

-- ============================================================
-- 4. Indices
-- ============================================================
-- Se crean indices basicos para futuros filtros por empresa.

do $$
begin
  if to_regclass('public.admin_users') is not null then
    create index if not exists admin_users_company_id_idx
    on public.admin_users(company_id);
  end if;

  if to_regclass('public.vehicles') is not null then
    create index if not exists vehicles_company_id_idx
    on public.vehicles(company_id);

    create index if not exists vehicles_company_public_idx
    on public.vehicles(company_id, status, is_published);
  end if;

  if to_regclass('public.vehicle_photos') is not null then
    create index if not exists vehicle_photos_company_vehicle_idx
    on public.vehicle_photos(company_id, vehicle_id);
  end if;

  if to_regclass('public.vehicle_expenses') is not null then
    create index if not exists vehicle_expenses_company_vehicle_idx
    on public.vehicle_expenses(company_id, vehicle_id);
  end if;

  if to_regclass('public.sales') is not null then
    create index if not exists sales_company_vehicle_idx
    on public.sales(company_id, vehicle_id);
  end if;

  if to_regclass('public.leads') is not null then
    create index if not exists leads_company_id_idx
    on public.leads(company_id);

    create index if not exists leads_company_status_idx
    on public.leads(company_id, status);
  end if;

  if to_regclass('public.lead_notes') is not null then
    create index if not exists lead_notes_company_lead_idx
    on public.lead_notes(company_id, lead_id);
  end if;

  if to_regclass('public.app_settings') is not null then
    create index if not exists app_settings_company_id_idx
    on public.app_settings(company_id);
  end if;
end;
$$;

-- ============================================================
-- 5. Foreign keys
-- ============================================================
-- Esta fase no agrega foreign keys todavia.
-- Motivo: primero conviene validar que no queden company_id null ni cruces inconsistentes.
-- Las FK se deben agregar en Fase 3, junto con validaciones finales y antes de NOT NULL.

-- ============================================================
-- 6. No tocar RLS ni policies en esta fase
-- ============================================================
-- No se habilita ni modifica RLS de tablas existentes.
-- No se crean, eliminan ni modifican policies.
-- No se modifican funciones como submit_lead, is_admin o current_user_role.

-- ============================================================
-- 7. Validaciones manuales
-- ============================================================

-- Empresa default:
-- select * from public.companies where slug = 'andicars';

-- Validaciones de company_id null:
-- select count(*) from public.admin_users where company_id is null;
-- select count(*) from public.vehicles where company_id is null;
-- select count(*) from public.vehicle_photos where company_id is null;
-- select count(*) from public.vehicle_expenses where company_id is null;
-- select count(*) from public.sales where company_id is null;
-- select count(*) from public.leads where company_id is null;
-- select count(*) from public.lead_notes where company_id is null;
-- select count(*) from public.app_settings where company_id is null;

-- Validaciones cruzadas:
-- select count(*)
-- from public.vehicle_photos p
-- join public.vehicles v on v.id = p.vehicle_id
-- where p.company_id <> v.company_id;

-- select count(*)
-- from public.vehicle_expenses e
-- join public.vehicles v on v.id = e.vehicle_id
-- where e.company_id <> v.company_id;

-- select count(*)
-- from public.sales s
-- join public.vehicles v on v.id = s.vehicle_id
-- where s.company_id <> v.company_id;

-- select count(*)
-- from public.lead_notes n
-- join public.leads l on l.id = n.lead_id
-- where n.company_id <> l.company_id;

-- Registros relacionados que no recibieron company_id por falta de relacion:
-- select *
-- from public.vehicle_photos
-- where company_id is null;

-- select *
-- from public.vehicle_expenses
-- where company_id is null;

-- select *
-- from public.sales
-- where company_id is null;

-- select *
-- from public.lead_notes
-- where company_id is null;
