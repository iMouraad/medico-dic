-- NEOSDOC — estadísticas por médico (visitas, solicitudes de cita, contactos)
--
-- Requiere haber corrido 0001 y 0002 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.

-- ============================================================
-- 1. Columnas de contadores
-- ============================================================

alter table public.doctors
  add column if not exists profile_views integer not null default 0,
  add column if not exists appointment_clicks integer not null default 0,
  add column if not exists whatsapp_clicks integer not null default 0;

-- ============================================================
-- 2. RPC para incrementar un contador de forma segura desde el cliente
-- público (anon). No se expone una política de UPDATE genérica sobre
-- doctors para esto: la función solo puede tocar estas 3 columnas, y
-- solo en perfiles ya aprobados, evitando que se use para inflar
-- estadísticas de perfiles pendientes/ajenos o para modificar otros
-- campos.
-- ============================================================

create or replace function public.increment_doctor_stat(target_id bigint, stat_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if stat_name = 'profile_views' then
    update public.doctors set profile_views = profile_views + 1
    where id = target_id and status = 'aprobado';
  elsif stat_name = 'appointment_clicks' then
    update public.doctors set appointment_clicks = appointment_clicks + 1
    where id = target_id and status = 'aprobado';
  elsif stat_name = 'whatsapp_clicks' then
    update public.doctors set whatsapp_clicks = whatsapp_clicks + 1
    where id = target_id and status = 'aprobado';
  end if;
end;
$$;

grant execute on function public.increment_doctor_stat(bigint, text) to anon, authenticated;
