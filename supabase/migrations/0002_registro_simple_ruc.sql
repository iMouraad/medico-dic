-- NEOSDOC — registro simplificado del médico (solo correo + RUC + contraseña)
--
-- Requiere haber corrido 0001_roles_status_storage.sql antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.

-- ============================================================
-- 1. Columna RUC + único entre los no nulos
-- ============================================================

alter table public.doctors
  add column if not exists ruc text;

drop index if exists doctors_ruc_key;
create unique index doctors_ruc_key on public.doctors (ruc) where ruc is not null;

-- ============================================================
-- 2. Un solo perfil de doctors por usuario autenticado
-- ============================================================

do $$
begin
  alter table public.doctors
    add constraint doctors_user_id_key unique (user_id);
exception
  when duplicate_object then null;
end $$;

-- ============================================================
-- 3. El registro ahora solo pide correo + RUC + contraseña; el resto
-- (nombre, especialidad, ciudad, whatsapp, etc.) se llena después en
-- /dashboard, así que esas columnas ya no pueden ser NOT NULL.
-- ============================================================

alter table public.doctors
  alter column name drop not null,
  alter column specialty drop not null,
  alter column city drop not null,
  alter column whatsapp drop not null,
  alter column plan drop not null,
  alter column profile_photo_url drop not null,
  alter column modalities drop not null,
  alter column verified_senescyt drop not null,
  alter column consultation_price drop not null;

-- ============================================================
-- 4. El trigger de alta de usuario ahora también crea la fila inicial
-- en doctors (con solo email + ruc + status pendiente), para que exista
-- sin importar si el proyecto tiene "Confirm email" activo en
-- Supabase Auth (si está activo, no hay sesión activa justo después del
-- signUp, así que una inserción hecha desde el cliente fallaría por RLS;
-- este trigger corre en el servidor y no depende de la sesión).
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

  insert into public.doctors (user_id, email, ruc, status)
  values (new.id, new.email, new.raw_user_meta_data ->> 'ruc', 'pendiente')
  on conflict (user_id) do nothing;

  return new;
end;
$$;
