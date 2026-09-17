-- NEOSDOC — auditoría de acciones de admin + gestión de roles de usuarios
--
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Qué hace:
-- 1. Tabla audit_log: historial de acciones de administración (aprobar,
--    rechazar, editar médico, cambiar rol). Solo lectura para admins desde
--    el cliente; los inserts los hacen triggers (security definer), nunca
--    el cliente directamente, para que no se pueda falsificar el historial.
-- 2. Trigger en doctors: registra cuando un admin aprueba/rechaza o edita
--    los datos de un médico (compara old vs new).
-- 3. Política RLS en profiles para que un admin pueda promover/degradar el
--    rol de otra cuenta desde el panel (antes solo se podía por SQL manual).
-- 4. Trigger en profiles: registra cambios de rol hechos por un admin.

-- ============================================================
-- 1. Tabla audit_log
-- ============================================================

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  target_type text not null,
  target_id text not null,
  detalle text,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_select_admin_only" on public.audit_log;
create policy "audit_log_select_admin_only"
  on public.audit_log for select
  using (public.is_admin(auth.uid()));

-- Sin políticas de insert/update/delete: solo entran filas vía los
-- triggers de abajo (security definer), nunca directo desde el cliente.

-- ============================================================
-- 2. Trigger en doctors: aprobar / rechazar / editar
-- ============================================================

create or replace function public.log_doctor_admin_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_email text;
  v_nombre_medico text;
begin
  -- Solo nos interesa cuando quien hace el cambio es un admin (no el propio
  -- médico editando su perfil) y algo realmente cambió.
  if v_actor is null or not public.is_admin(v_actor) then
    return new;
  end if;

  select email into v_actor_email from auth.users where id = v_actor;
  v_nombre_medico := coalesce(new.name, new.email, 'médico #' || new.id);

  if new.status is distinct from old.status then
    insert into public.audit_log (actor_id, actor_email, action, target_type, target_id, detalle)
    values (
      v_actor, v_actor_email,
      case new.status
        when 'aprobado' then 'aprobar_medico'
        when 'rechazado' then 'rechazar_medico'
        else 'cambiar_status_medico'
      end,
      'doctors', new.id::text,
      v_nombre_medico || ': ' || old.status || ' → ' || new.status
    );
  elsif (new.name, new.specialty, new.city, new.whatsapp, new.consultation_price, new.verified_senescyt)
        is distinct from
        (old.name, old.specialty, old.city, old.whatsapp, old.consultation_price, old.verified_senescyt) then
    insert into public.audit_log (actor_id, actor_email, action, target_type, target_id, detalle)
    values (v_actor, v_actor_email, 'editar_medico', 'doctors', new.id::text, 'Editó datos de ' || v_nombre_medico);
  end if;

  return new;
end;
$$;

drop trigger if exists doctors_log_admin_change on public.doctors;
create trigger doctors_log_admin_change
  after update on public.doctors
  for each row execute function public.log_doctor_admin_change();

-- ============================================================
-- 3. RLS en profiles: un admin puede cambiar el rol de otra cuenta
-- ============================================================

drop policy if exists "profiles_update_admin_only" on public.profiles;
create policy "profiles_update_admin_only"
  on public.profiles for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ============================================================
-- 4. Trigger en profiles: registrar cambios de rol
-- ============================================================

create or replace function public.log_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_email text;
  v_target_email text;
begin
  if new.role is distinct from old.role and v_actor is not null and public.is_admin(v_actor) then
    select email into v_actor_email from auth.users where id = v_actor;
    select email into v_target_email from auth.users where id = new.id;

    insert into public.audit_log (actor_id, actor_email, action, target_type, target_id, detalle)
    values (
      v_actor, v_actor_email, 'cambiar_rol', 'profiles', new.id::text,
      coalesce(v_target_email, new.id::text) || ': ' || old.role || ' → ' || new.role
    );
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_log_role_change on public.profiles;
create trigger profiles_log_role_change
  after update on public.profiles
  for each row execute function public.log_profile_role_change();
