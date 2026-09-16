-- NEOSDOC — duración de consulta por médico y por cita (para detectar
-- choques de horario en el calendario)
--
-- Requiere haber corrido 0001 a 0010 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- `doctors.duracion_consulta_minutos` es la duración típica que el médico
-- configura en su perfil según su especialidad (ej. psicología 50 min,
-- medicina general 20 min); se usa como valor por defecto al registrar una
-- cita nueva. `appointments.duration_minutes` es la duración real de esa
-- cita puntual (puede diferir del default del médico). La detección de
-- choques se hace en la aplicación comparando [inicio, inicio+duración)
-- entre citas del mismo médico, no con una restricción a nivel de base de
-- datos.

alter table public.doctors
  add column if not exists duracion_consulta_minutos smallint not null default 30;

do $$
begin
  alter table public.doctors
    add constraint doctors_duracion_consulta_check
    check (duracion_consulta_minutos between 5 and 480);
exception
  when duplicate_object then null;
end $$;

alter table public.appointments
  add column if not exists duration_minutes smallint not null default 30;

do $$
begin
  alter table public.appointments
    add constraint appointments_duration_minutes_check
    check (duration_minutes between 5 and 480);
exception
  when duplicate_object then null;
end $$;
