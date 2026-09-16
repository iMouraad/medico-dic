-- NEOSDOC — galería de fotos del consultorio en el perfil público
--
-- Requiere haber corrido 0001 a 0015 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Se guardan como un array de URLs públicas (igual de simple que
-- profile_photo_url, pero múltiple) en vez de una tabla aparte: no hay
-- metadata por foto (orden, caption, etc.) en el MVP, así que una tabla
-- separada sería complejidad sin beneficio real todavía.

alter table public.doctors
  add column if not exists galeria_urls text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('galeria-consultorio', 'galeria-consultorio', true)
on conflict (id) do nothing;

-- Misma convención de path que fotos-perfil: "<uid-del-medico>/archivo.ext"
drop policy if exists "galeria_consultorio_public_read" on storage.objects;
create policy "galeria_consultorio_public_read"
  on storage.objects for select
  using (bucket_id = 'galeria-consultorio');

drop policy if exists "galeria_consultorio_owner_insert" on storage.objects;
create policy "galeria_consultorio_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'galeria-consultorio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "galeria_consultorio_owner_update" on storage.objects;
create policy "galeria_consultorio_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'galeria-consultorio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "galeria_consultorio_owner_delete" on storage.objects;
create policy "galeria_consultorio_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'galeria-consultorio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
