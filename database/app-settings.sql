-- AndiCars - configuracion general del sitio
-- Copiar y ejecutar en Supabase > SQL Editor > New query.

create table if not exists public.app_settings (
  id boolean primary key default true,
  agency_name text not null default 'AndiCars',
  whatsapp_number text not null default '5491112345678',
  whatsapp_message_template text not null default 'Hola AndiCars, quiero consultar por el {vehicle}.',
  contact_email text,
  area text,
  lead_spam_protection_enabled boolean not null default false,
  lead_spam_window_hours integer not null default 24,
  updated_at timestamptz not null default now(),
  constraint app_settings_single_row check (id = true)
);

insert into public.app_settings (id)
values (true)
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists app_settings_set_updated_at on public.app_settings;

create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

alter table public.app_settings enable row level security;

drop policy if exists "Public can read app settings" on public.app_settings;
create policy "Public can read app settings"
on public.app_settings for select
to anon, authenticated
using (true);

create or replace function public.can_manage_app_settings()
returns boolean as $$
  select coalesce(public.current_user_role() = 'owner', false);
$$ language sql stable security definer;

drop policy if exists "Admins can manage app settings" on public.app_settings;
drop policy if exists "Owners can manage app settings" on public.app_settings;
create policy "Owners can manage app settings"
on public.app_settings for all
to authenticated
using (public.can_manage_app_settings())
with check (public.can_manage_app_settings());

create or replace function public.submit_lead(
  p_vehicle_id uuid,
  p_customer_name text,
  p_phone text,
  p_email text,
  p_message text
)
returns uuid as $$
declare
  settings public.app_settings%rowtype;
  normalized_phone text;
  normalized_email text;
  duplicate_lead_id uuid;
  new_lead_id uuid;
begin
  select *
  into settings
  from public.app_settings
  where id = true;

  normalized_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  normalized_email := lower(nullif(trim(coalesce(p_email, '')), ''));

  if coalesce(settings.lead_spam_protection_enabled, false) then
    select leads.id
    into duplicate_lead_id
    from public.leads
    where leads.vehicle_id = p_vehicle_id
      and leads.created_at >= now() - make_interval(hours => coalesce(settings.lead_spam_window_hours, 24))
      and (
        regexp_replace(coalesce(leads.phone, ''), '[^0-9]', '', 'g') = normalized_phone
        or (
          normalized_email is not null
          and lower(coalesce(leads.email, '')) = normalized_email
        )
      )
    limit 1;

    if duplicate_lead_id is not null then
      raise exception 'Ya recibimos tu consulta por este vehiculo. Si queres consultar por otro auto, podes hacerlo sin problema.';
    end if;
  end if;

  insert into public.leads (
    vehicle_id,
    customer_name,
    phone,
    email,
    message,
    source,
    status
  )
  values (
    p_vehicle_id,
    p_customer_name,
    p_phone,
    nullif(trim(coalesce(p_email, '')), ''),
    nullif(trim(coalesce(p_message, '')), ''),
    'web',
    'nuevo'
  )
  returning id into new_lead_id;

  return new_lead_id;
end;
$$ language plpgsql security definer;

grant execute on function public.submit_lead(uuid, text, text, text, text) to anon, authenticated;
