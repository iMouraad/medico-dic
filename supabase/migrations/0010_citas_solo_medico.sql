-- NEOSDOC — se retira el autoagendamiento del paciente
--
-- Requiere haber corrido 0001 a 0009 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Flujo confirmado con el cliente: el paciente contacta por WhatsApp o por
-- el formulario de mensaje; el médico responde, pide los datos que le
-- falten y agenda él mismo la cita desde su calendario. Ya no existe un
-- formulario público donde el paciente elige fecha/hora, así que:
--   1. correo y teléfono del paciente pasan a ser opcionales (puede que el
--      médico solo tenga uno de los dos, o ninguno todavía).
--   2. se agrega cédula para identificar al paciente.
--   3. el insert público (anon) se retira: solo el médico dueño o un
--      admin pueden crear una cita.

alter table public.appointments
  alter column patient_email drop not null,
  alter column patient_phone drop not null,
  add column if not exists patient_cedula text;

drop policy if exists "appointments_insert_public" on public.appointments;
drop policy if exists "appointments_insert_own_doctor_or_admin" on public.appointments;
create policy "appointments_insert_own_doctor_or_admin"
  on public.appointments for insert
  with check (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.user_id = auth.uid()
    )
  );
