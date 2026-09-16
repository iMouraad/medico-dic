-- NEOSDOC — catálogo de especialidades médicas
--
-- Requiere haber corrido 0001 a 0012 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo (el insert de datos usa
-- "on conflict do nothing", así que no duplica si ya existen).
--
-- `doctors.specialty` sigue siendo texto libre (no se convierte en llave
-- foránea) para no romper los datos ya guardados ni la lógica de filtros
-- de la home, que compara por el texto tal cual. Esta tabla solo alimenta
-- el <select> de especialidades en el formulario de perfil del médico y en
-- el panel de admin, para que el médico elija de una lista en vez de
-- escribir libremente. El admin puede agregar/quitar especialidades desde
-- /admin/especialidades.

create table if not exists public.specialties (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists specialties_name_key on public.specialties (lower(name));

alter table public.specialties enable row level security;

-- Cualquiera puede leer el catálogo (se usa en el formulario público de
-- registro/perfil del médico).
drop policy if exists "specialties_select_all" on public.specialties;
create policy "specialties_select_all"
  on public.specialties for select
  using (true);

drop policy if exists "specialties_insert_admin_only" on public.specialties;
create policy "specialties_insert_admin_only"
  on public.specialties for insert
  with check (public.is_admin(auth.uid()));

drop policy if exists "specialties_delete_admin_only" on public.specialties;
create policy "specialties_delete_admin_only"
  on public.specialties for delete
  using (public.is_admin(auth.uid()));

insert into public.specialties (name) values
  ('Medicina General'),
  ('Medicina Familiar'),
  ('Medicina Interna'),
  ('Pediatría'),
  ('Ginecología y Obstetricia'),
  ('Cardiología'),
  ('Dermatología'),
  ('Endocrinología'),
  ('Gastroenterología'),
  ('Neurología'),
  ('Neumología'),
  ('Nefrología'),
  ('Reumatología'),
  ('Hematología'),
  ('Oncología'),
  ('Infectología'),
  ('Geriatría'),
  ('Psiquiatría'),
  ('Psicología Clínica'),
  ('Cirugía General'),
  ('Cirugía Plástica y Reconstructiva'),
  ('Cirugía Pediátrica'),
  ('Cirugía Vascular'),
  ('Cirugía Cardiovascular'),
  ('Cirugía Maxilofacial'),
  ('Neurocirugía'),
  ('Traumatología y Ortopedia'),
  ('Urología'),
  ('Oftalmología'),
  ('Otorrinolaringología'),
  ('Anestesiología'),
  ('Medicina de Emergencias'),
  ('Medicina Física y Rehabilitación'),
  ('Fisioterapia'),
  ('Nutrición y Dietética'),
  ('Odontología General'),
  ('Ortodoncia'),
  ('Endodoncia'),
  ('Periodoncia'),
  ('Radiología e Imagen'),
  ('Patología'),
  ('Medicina del Deporte'),
  ('Alergología e Inmunología'),
  ('Medicina Ocupacional'),
  ('Medicina Estética'),
  ('Terapia Ocupacional'),
  ('Fonoaudiología'),
  ('Optometría'),
  ('Podología'),
  ('Genética Médica'),
  ('Medicina Paliativa')
on conflict do nothing;
