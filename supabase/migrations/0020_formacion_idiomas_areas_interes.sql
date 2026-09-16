-- NEOSDOC — formación académica, idiomas y áreas de interés en el perfil
--
-- Requiere haber corrido 0001 a 0019 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Campos que pide el diseño de referencia del perfil público (sección de
-- "Formación académica" / "Idiomas" / "Áreas de interés") y que todavía no
-- existían en el modelo de datos.

alter table public.doctors
  add column if not exists formacion_universidad text,
  add column if not exists formacion_titulo text,
  add column if not exists formacion_anio_inicio smallint,
  add column if not exists formacion_anio_fin smallint,
  add column if not exists idiomas text,
  add column if not exists idiomas_nivel text,
  add column if not exists areas_interes text[] not null default '{}';
