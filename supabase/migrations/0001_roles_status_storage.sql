-- NEOSDOC — roles (medico/admin), aprobación de perfiles, storage
--
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase (Project > SQL Editor > New query). Es seguro volver a correrlo
-- (usa IF NOT EXISTS / DROP ... IF EXISTS en todo lo que puede repetirse).
--
-- IMPORTANTE — revisar antes de correr:
-- Si la tabla `doctors` ya tiene políticas RLS previas que permiten lectura
-- pública sin filtro (ej. "select true" para anon), esa política vieja se
-- combina en OR con la nueva y seguiría exponiendo médicos pendientes.
-- Verificar con:
--   select policyname, cmd, qual from pg_policies where tablename = 'doctors';
-- y borrar cualquier política de SELECT anterior que no filtre por status.
--
-- Después de correr esto, para crear el primer admin (no hay alta de admin
-- desde la app a propósito, es un paso manual único):
--   update public.profiles set role = 'admin' where id = '<uuid del usuario>';
-- (el uuid se obtiene de auth.users luego de que esa persona se registre
-- una vez como médico normal)

-- ============================================================
-- 1. Tabla profiles (rol de cada usuario autenticado)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'medico' check (role in ('medico', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ============================================================
-- 2. is_admin(uid) — security definer para evitar recursión de RLS
-- ============================================================

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

-- Sin políticas de insert/update/delete para profiles: la fila se crea solo
-- vía el trigger de abajo (que corre como security definer) y el rol se
-- cambia solo a mano por SQL. Así un médico no puede autopromoverse a admin.

-- ============================================================
-- 3. Trigger: crear profile automáticamente al registrarse
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'medico')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4. Columnas nuevas en doctors
-- ============================================================

alter table public.doctors
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists status text not null default 'pendiente',
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists certificado_url text,
  add column if not exists bio text,
  add column if not exists ofrece_descuento boolean not null default false,
  add column if not exists descuento_porcentaje smallint;

do $$
begin
  alter table public.doctors
    add constraint doctors_status_check check (status in ('pendiente', 'aprobado', 'rechazado'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.doctors
    add constraint doctors_descuento_porcentaje_check
    check (descuento_porcentaje is null or (descuento_porcentaje between 0 and 100));
exception
  when duplicate_object then null;
end $$;

-- ============================================================
-- 5. Trigger: un médico no puede cambiar su propio status
-- ============================================================

create or replace function public.enforce_doctor_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    new.status := old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists doctors_enforce_status on public.doctors;
create trigger doctors_enforce_status
  before update on public.doctors
  for each row execute function public.enforce_doctor_status();

-- ============================================================
-- 6. RLS en doctors
-- ============================================================

alter table public.doctors enable row level security;

drop policy if exists "doctors_select_public_approved" on public.doctors;
create policy "doctors_select_public_approved"
  on public.doctors for select
  using (
    status = 'aprobado'
    or user_id = auth.uid()
    or public.is_admin(auth.uid())
  );

drop policy if exists "doctors_insert_own" on public.doctors;
create policy "doctors_insert_own"
  on public.doctors for insert
  with check (user_id = auth.uid());

drop policy if exists "doctors_update_own_or_admin" on public.doctors;
create policy "doctors_update_own_or_admin"
  on public.doctors for update
  using (user_id = auth.uid() or public.is_admin(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "doctors_delete_admin_only" on public.doctors;
create policy "doctors_delete_admin_only"
  on public.doctors for delete
  using (public.is_admin(auth.uid()));

-- ============================================================
-- 7. Storage: buckets + políticas
--    Convención de path: "<uid-del-medico>/archivo.ext"
-- ============================================================

insert into storage.buckets (id, name, public)
values ('fotos-perfil', 'fotos-perfil', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('certificados-medicos', 'certificados-medicos', false)
on conflict (id) do nothing;

-- fotos-perfil: lectura pública, escritura solo del dueño
drop policy if exists "fotos_perfil_public_read" on storage.objects;
create policy "fotos_perfil_public_read"
  on storage.objects for select
  using (bucket_id = 'fotos-perfil');

drop policy if exists "fotos_perfil_owner_insert" on storage.objects;
create policy "fotos_perfil_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'fotos-perfil'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "fotos_perfil_owner_update" on storage.objects;
create policy "fotos_perfil_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'fotos-perfil'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "fotos_perfil_owner_delete" on storage.objects;
create policy "fotos_perfil_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'fotos-perfil'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- certificados-medicos: privado, solo dueño y admin pueden leer/escribir
drop policy if exists "certificados_owner_or_admin_read" on storage.objects;
create policy "certificados_owner_or_admin_read"
  on storage.objects for select
  using (
    bucket_id = 'certificados-medicos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin(auth.uid())
    )
  );

drop policy if exists "certificados_owner_insert" on storage.objects;
create policy "certificados_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'certificados-medicos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "certificados_owner_update" on storage.objects;
create policy "certificados_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'certificados-medicos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "certificados_owner_delete" on storage.objects;
create policy "certificados_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'certificados-medicos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
