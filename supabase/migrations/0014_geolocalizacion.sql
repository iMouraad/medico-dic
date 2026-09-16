-- NEOSDOC — coordenadas del consultorio para el mapa real de la home
--
-- Requiere haber corrido 0001 a 0013 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Se llenan automáticamente geocodificando dirección + ciudad cuando el
-- médico guarda su perfil (ver app/api/geocode/route.ts). Quedan null si
-- la geocodificación falla o el médico no tiene dirección/ciudad todavía;
-- en ese caso simplemente no aparece en el mapa.

alter table public.doctors
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;
