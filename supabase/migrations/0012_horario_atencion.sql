-- NEOSDOC — horario de atención semanal + días bloqueados por médico
--
-- Requiere haber corrido 0001 a 0011 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- `doctors.horario_atencion` guarda el horario semanal típico del médico
-- (por día: activo/inactivo + hora de inicio/fin). Se usa en el calendario
-- para avisar si se registra una cita fuera de su horario, igual que ya
-- se avisa por choques entre citas — no bloquea a nivel de base de datos,
-- solo informa en la app.
--
-- `doctor_dias_bloqueados` guarda fechas puntuales no disponibles
-- (vacaciones, feriados propios, etc.), independientes del horario
-- semanal.

-- ============================================================
-- 1. Horario semanal (jsonb en doctors)
-- ============================================================

alter table public.doctors
  add column if not exists horario_atencion jsonb not null default '{
    "lunes": {"activo": true, "inicio": "08:00", "fin": "17:00"},
    "martes": {"activo": true, "inicio": "08:00", "fin": "17:00"},
    "miercoles": {"activo": true, "inicio": "08:00", "fin": "17:00"},
    "jueves": {"activo": true, "inicio": "08:00", "fin": "17:00"},
    "viernes": {"activo": true, "inicio": "08:00", "fin": "17:00"},
    "sabado": {"activo": false, "inicio": "08:00", "fin": "13:00"},
    "domingo": {"activo": false, "inicio": "08:00", "fin": "13:00"}
  }'::jsonb;

-- ============================================================
-- 2. Días bloqueados (tabla propia: fechas puntuales por médico)
-- ============================================================

create table if not exists public.doctor_dias_bloqueados (
  id bigint generated always as identity primary key,
  doctor_id bigint not null references public.doctors(id) on delete cascade,
  fecha date not null,
  motivo text,
  created_at timestamptz not null default now(),
  unique (doctor_id, fecha)
);

create index if not exists doctor_dias_bloqueados_doctor_id_idx on public.doctor_dias_bloqueados (doctor_id);

alter table public.doctor_dias_bloqueados enable row level security;

drop policy if exists "doctor_dias_bloqueados_select_own_or_admin" on public.doctor_dias_bloqueados;
create policy "doctor_dias_bloqueados_select_own_or_admin"
  on public.doctor_dias_bloqueados for select
  using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.doctors d where d.id = doctor_id and d.user_id = auth.uid())
  );

drop policy if exists "doctor_dias_bloqueados_insert_own_or_admin" on public.doctor_dias_bloqueados;
create policy "doctor_dias_bloqueados_insert_own_or_admin"
  on public.doctor_dias_bloqueados for insert
  with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.doctors d where d.id = doctor_id and d.user_id = auth.uid())
  );

drop policy if exists "doctor_dias_bloqueados_delete_own_or_admin" on public.doctor_dias_bloqueados;
create policy "doctor_dias_bloqueados_delete_own_or_admin"
  on public.doctor_dias_bloqueados for delete
  using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.doctors d where d.id = doctor_id and d.user_id = auth.uid())
  );
