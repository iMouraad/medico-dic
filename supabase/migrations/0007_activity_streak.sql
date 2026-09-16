-- NEOSDOC — racha semanal de actividad del médico
--
-- Requiere haber corrido 0001 a 0006 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Regla de negocio (reunión con cliente): la racha NO es diaria. El médico
-- mantiene/sube su racha si estuvo activo (entró a su dashboard) al menos 3
-- días distintos dentro de la semana (lunes a domingo), no necesariamente
-- consecutivos. Si en una semana no llega a 3 días activos, la racha se
-- resetea a 0 en cuanto empieza la semana siguiente.

-- ============================================================
-- 1. Tabla activity_streak
-- ============================================================

create table if not exists public.activity_streak (
  doctor_id bigint primary key references public.doctors(id) on delete cascade,
  semana_actual date not null default date_trunc('week', current_date)::date,
  dias_activos jsonb not null default '[]'::jsonb,
  dias_activos_esta_semana smallint not null default 0,
  racha_actual smallint not null default 0,
  mejor_racha smallint not null default 0,
  ultima_actividad date,
  updated_at timestamptz not null default now()
);

alter table public.activity_streak enable row level security;

drop policy if exists "activity_streak_select_own_or_admin" on public.activity_streak;
create policy "activity_streak_select_own_or_admin"
  on public.activity_streak for select
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.user_id = auth.uid()
    )
  );

-- Sin policies de insert/update: solo escribe mark_doctor_active (security
-- definer), nunca el cliente directo.

-- ============================================================
-- 2. mark_doctor_active — registra un día de actividad para el médico
-- dueño de la sesión actual. Idempotente: si hoy ya estaba marcado, no
-- hace nada. Al cruzar de semana, evalúa si la semana anterior cumplió
-- (>= 3 días activos) para subir o resetear la racha.
-- ============================================================

create or replace function public.mark_doctor_active(target_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  fila public.activity_streak;
  semana_de_hoy date := date_trunc('week', current_date)::date;
  hoy date := current_date;
  cumplio_semana_previa boolean;
  nueva_racha smallint;
begin
  if not exists (
    select 1 from public.doctors d
    where d.id = target_id and d.user_id = auth.uid()
  ) then
    return;
  end if;

  select * into fila from public.activity_streak where doctor_id = target_id;

  if fila is null then
    insert into public.activity_streak (
      doctor_id, semana_actual, dias_activos, dias_activos_esta_semana,
      racha_actual, mejor_racha, ultima_actividad
    )
    values (target_id, semana_de_hoy, jsonb_build_array(hoy::text), 1, 1, 1, hoy);
    return;
  end if;

  if fila.semana_actual < semana_de_hoy then
    -- Solo cuenta como "semana cumplida" si la fila venía de la semana
    -- inmediatamente anterior y llegó a 3 días activos; cualquier brecha
    -- mayor implica semanas intermedias sin actividad, así que resetea.
    cumplio_semana_previa := fila.dias_activos_esta_semana >= 3
      and (semana_de_hoy - fila.semana_actual) <= 7;
    nueva_racha := case when cumplio_semana_previa then fila.racha_actual + 1 else 0 end;

    update public.activity_streak
    set
      racha_actual = nueva_racha,
      mejor_racha = greatest(fila.mejor_racha, nueva_racha),
      semana_actual = semana_de_hoy,
      dias_activos = jsonb_build_array(hoy::text),
      dias_activos_esta_semana = 1,
      ultima_actividad = hoy,
      updated_at = now()
    where doctor_id = target_id;
    return;
  end if;

  if fila.dias_activos ? (hoy::text) then
    return;
  end if;

  update public.activity_streak
  set
    dias_activos = fila.dias_activos || to_jsonb(hoy::text),
    dias_activos_esta_semana = fila.dias_activos_esta_semana + 1,
    ultima_actividad = hoy,
    updated_at = now()
  where doctor_id = target_id;
end;
$$;

grant execute on function public.mark_doctor_active(bigint) to authenticated;
