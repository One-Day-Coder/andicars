-- AndiCars - gestion de usuarios internos desde el panel
-- Copiar y ejecutar en Supabase > SQL Editor > New query.

alter table public.admin_users
add column if not exists email text;

alter table public.admin_users
add column if not exists nickname text;

create or replace function public.can_manage_admin_users()
returns boolean as $$
  select coalesce(public.current_user_role() = 'owner', false);
$$ language sql stable security definer;

drop policy if exists "Owners can manage admin users" on public.admin_users;
create policy "Owners can manage admin users"
on public.admin_users for all
to authenticated
using (public.can_manage_admin_users())
with check (public.can_manage_admin_users());
