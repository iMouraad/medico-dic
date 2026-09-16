-- NEOSDOC — sector/tipo de establecimiento del médico, para el filtro de
-- búsqueda "Sector" (ver NeosDoc_Especificacion_Menu_Filtros_Tarjeta).
--
-- Requiere haber corrido 0001 a 0014 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Es texto libre (no un enum) porque el filtro permite "Otro" con
-- redacción propia del médico, tal como el resto de filtros de la
-- especificación (regla de "escritura libre").

alter table public.doctors
  add column if not exists sector text;
