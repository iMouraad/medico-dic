-- NEOSDOC — evitar que un RUC duplicado rompa el registro completo
--
-- Requiere haber corrido 0021_nombre_y_username_registro.sql antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Bug encontrado: si alguien intentaba registrarse dos veces con el mismo
-- RUC (ej. reintentando tras un error), el trigger handle_new_user fallaba
-- con "duplicate key value violates unique constraint doctors_ruc_key" y
-- eso abortaba la creación del usuario en auth.users por completo (error
-- 500 genérico en el front). Ahora:
-- 1. El insert en doctors ya no truena si el RUC está repetido (solo omite
--    esa fila, la cuenta de auth se crea igual).
-- 2. Se agrega ruc_disponible(ruc) para poder avisar ANTES de enviar el
--    enlace de confirmación si el RUC ya está en uso por otra cuenta.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre text;
  v_ruc text;
begin
  v_nombre := new.raw_user_meta_data ->> 'nombre_completo';
  v_ruc := new.raw_user_meta_data ->> 'ruc';

  insert into public.profiles (id, role)
  values (new.id, 'medico')
  on conflict (id) do nothing;

  begin
    insert into public.doctors (user_id, email, ruc, name, username, status)
    values (
      new.id,
      new.email,
      v_ruc,
      v_nombre,
      public.generar_username_unico(v_nombre),
      'pendiente'
    )
    on conflict (user_id) do nothing;
  exception
    when unique_violation then
      -- El RUC (u otro campo único) ya existía; no dejamos que esto
      -- tumbe la creación de la cuenta de auth. El médico deberá
      -- corregir su RUC luego desde el dashboard o contactar soporte.
      insert into public.doctors (user_id, email, name, username, status)
      values (
        new.id,
        new.email,
        v_nombre,
        public.generar_username_unico(v_nombre),
        'pendiente'
      )
      on conflict (user_id) do nothing;
  end;

  return new;
end;
$$;

create or replace function public.ruc_disponible(p_ruc text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (select 1 from public.doctors where ruc = p_ruc);
$$;

grant execute on function public.ruc_disponible(text) to anon, authenticated;
