-- AndiCars - storage para fotos de vehiculos
-- Copiar y ejecutar en Supabase > SQL Editor > New query.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-photos',
  'vehicle-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read vehicle photo files" on storage.objects;
create policy "Public can read vehicle photo files"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'vehicle-photos');

drop policy if exists "Admins can upload vehicle photo files" on storage.objects;
create policy "Admins can upload vehicle photo files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'vehicle-photos'
  and public.is_admin()
);

drop policy if exists "Admins can update vehicle photo files" on storage.objects;
create policy "Admins can update vehicle photo files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'vehicle-photos'
  and public.is_admin()
)
with check (
  bucket_id = 'vehicle-photos'
  and public.is_admin()
);

drop policy if exists "Admins can delete vehicle photo files" on storage.objects;
create policy "Admins can delete vehicle photo files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'vehicle-photos'
  and public.is_admin()
);
