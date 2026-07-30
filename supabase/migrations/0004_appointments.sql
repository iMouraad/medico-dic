-- NEOSDOC — citas de paciente invitado (sin necesidad de cuenta)
--
-- Requiere haber corrido 0001, 0002 y 0003 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Diseño: el paciente NO se registra ni inicia sesión. Agenda dejando su
-- nombre/correo/teléfono directamente en el formulario público del perfil
-- del médico. El médico gestiona el ciclo de vida de la cita desde su
-- dashboard (confirmar, rechazar, marcar como completada, reprogramar).

-- ============================================================
-- 1. Tabla appointments
-- ============================================================

create table if not exists public.appointments (
  id bigint generated always as identity primary key,
  doctor_id bigint not null references public.doctors(id) on delete cascade,
  patient_name text not null,
  patient_email text not null,
  patient_phone text not null,
  reason text,
  preferred_at timestamptz not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'confirmada', 'completada', 'cancelada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_doctor_id_idx on public.appointments (doctor_id);
create index if not exists appointments_status_idx on public.appointments (status);

-- ============================================================
-- 2. updated_at automático
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. RLS
-- ============================================================

alter table public.appointments enable row level security;

-- Cualquier visitante (anon o autenticado) puede solicitar una cita, pero
-- solo para un médico ya aprobado y publicado (misma condición que ya usa
-- la policy pública de doctors, así no se pueden crear citas "fantasma"
-- contra perfiles pendientes/rechazados).
drop policy if exists "appointments_insert_public" on public.appointments;
create policy "appointments_insert_public"
  on public.appointments for insert
  with check (
    exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.status = 'aprobado'
    )
  );

-- Solo el médico dueño de la cita o un admin pueden verla o listarla. El
-- paciente invitado no tiene manera de consultar su solicitud de vuelta
-- (no hay cuenta): se le contacta directamente por correo/teléfono.
drop policy if exists "appointments_select_own_doctor_or_admin" on public.appointments;
create policy "appointments_select_own_doctor_or_admin"
  on public.appointments for select
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.user_id = auth.uid()
    )
  );

drop policy if exists "appointments_update_own_doctor_or_admin" on public.appointments;
create policy "appointments_update_own_doctor_or_admin"
  on public.appointments for update
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.user_id = auth.uid()
    )
  );

drop policy if exists "appointments_delete_admin_only" on public.appointments;
create policy "appointments_delete_admin_only"
  on public.appointments for delete
  using (public.is_admin(auth.uid()));
