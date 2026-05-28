-- AndiCars - roles de usuarios internos
-- Copiar y ejecutar en Supabase > SQL Editor > New query.

alter table public.admin_users
add column if not exists role text not null default 'owner'
check (role in ('owner', 'manager', 'seller', 'operator'));

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

drop policy if exists "Admins can manage vehicle expenses" on public.vehicle_expenses;
create policy "Owners and managers can manage vehicle expenses"
on public.vehicle_expenses for all
to authenticated
using (public.can_manage_financials())
with check (public.can_manage_financials());
