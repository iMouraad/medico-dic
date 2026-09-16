-- NEOSDOC — nombre completo en el registro + username autogenerado
--
-- Requiere haber corrido 0002_registro_simple_ruc.sql antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Qué hace:
-- 1. Agrega columna `username` (único) a doctors.
-- 2. Función generar_nickname(nombre): primera letra del primer nombre +
--    penúltima palabra (primer apellido) + primera letra de la última
--    palabra (segundo apellido). Ej: "ANGEL DANIEL ZAMBRANO YONG" -> "azambranoy".
-- 3. Función generar_username_unico(nombre): usa lo anterior y si ya existe
--    le agrega un número al final (azambranoy, azambranoy1, azambranoy2...).
-- 4. El trigger de alta de usuario ahora también guarda el nombre completo
--    (raw_user_meta_data ->> 'nombre_completo') y el username generado.

-- ============================================================
-- 1. Columna username
-- ============================================================

alter table public.doctors
  add column if not exists username text;

drop index if exists doctors_username_key;
create unique index doctors_username_key on public.doctors (username) where username is not null;

-- ============================================================
-- 2. generar_nickname(nombre_completo)
-- ============================================================

create or replace function public.generar_nickname(nombre_completo text)
returns text
language plpgsql
immutable
as $$
declare
  texto text;
  palabras text[];
  n int;
  base text;
begin
  texto := lower(trim(coalesce(nombre_completo, '')));
  texto := translate(texto, 'áéíóúñü', 'aeiounu');
  texto := regexp_replace(texto, '[^a-z ]', '', 'g');
  texto := regexp_replace(texto, '\s+', ' ', 'g');
  texto := trim(texto);

  if texto = '' then
    return 'usuario';
  end if;

  palabras := regexp_split_to_array(texto, '\s+');
  n := array_length(palabras, 1);

  if n = 1 then
    base := palabras[1];
  elsif n = 2 then
    base := substr(palabras[1], 1, 1) || palabras[2];
  else
    base := substr(palabras[1], 1, 1) || palabras[n - 1] || substr(palabras[n], 1, 1);
  end if;

  return base;
end;
$$;

-- ============================================================
-- 3. generar_username_unico(nombre_completo)
-- ============================================================

create or replace function public.generar_username_unico(nombre_completo text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidato text;
  contador int := 0;
begin
  base := public.generar_nickname(nombre_completo);
  candidato := base;

  while exists (select 1 from public.doctors where username = candidato) loop
    contador := contador + 1;
    candidato := base || contador;
  end loop;

  return candidato;
end;
$$;

-- ============================================================
-- 4. Trigger de alta: ahora también guarda nombre + username
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre text;
begin
  v_nombre := new.raw_user_meta_data ->> 'nombre_completo';

  insert into public.profiles (id, role)
  values (new.id, 'medico')
  on conflict (id) do nothing;

  insert into public.doctors (user_id, email, ruc, name, username, status)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'ruc',
    v_nombre,
    public.generar_username_unico(v_nombre),
    'pendiente'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;
