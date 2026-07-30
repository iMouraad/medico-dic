-- NEOSDOC — historial diario de estadísticas por médico (para gráfica de tendencia)
--
-- Requiere haber corrido 0001, 0002, 0003 y 0004 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- `doctors.profile_views/appointment_clicks/whatsapp_clicks` son contadores
-- acumulados sin fecha; esta tabla guarda el desglose por día para poder
-- graficar la tendencia en el dashboard del médico. Solo empieza a llenarse
-- a partir de que se corre esta migración (no hay forma de reconstruir el
-- historial de los contadores ya acumulados).

-- ============================================================
-- 1. Tabla doctor_daily_stats
-- ============================================================

create table if not exists public.doctor_daily_stats (
  doctor_id bigint not null references public.doctors(id) on delete cascade,
  day date not null default current_date,
  profile_views integer not null default 0,
  appointment_clicks integer not null default 0,
  whatsapp_clicks integer not null default 0,
  primary key (doctor_id, day)
);

-- ============================================================
-- 2. RLS: solo el médico dueño o un admin pueden leer su historial.
-- No hay policies de insert/update: solo escribe la función
-- increment_doctor_stat (security definer), nunca el cliente directo.
-- ============================================================

alter table public.doctor_daily_stats enable row level security;

drop policy if exists "doctor_daily_stats_select_own_or_admin" on public.doctor_daily_stats;
create policy "doctor_daily_stats_select_own_or_admin"
  on public.doctor_daily_stats for select
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.user_id = auth.uid()
    )
  );

-- ============================================================
-- 3. increment_doctor_stat ahora también acumula el desglose diario
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
  else
    return;
  end if;

  insert into public.doctor_daily_stats (doctor_id, day, profile_views, appointment_clicks, whatsapp_clicks)
  values (
    target_id,
    current_date,
    case when stat_name = 'profile_views' then 1 else 0 end,
    case when stat_name = 'appointment_clicks' then 1 else 0 end,
    case when stat_name = 'whatsapp_clicks' then 1 else 0 end
  )
  on conflict (doctor_id, day) do update set
    profile_views = public.doctor_daily_stats.profile_views + excluded.profile_views,
    appointment_clicks = public.doctor_daily_stats.appointment_clicks + excluded.appointment_clicks,
    whatsapp_clicks = public.doctor_daily_stats.whatsapp_clicks + excluded.whatsapp_clicks;
end;
$$;

grant execute on function public.increment_doctor_stat(bigint, text) to anon, authenticated;
