-- NEOSDOC — índices para las foreign keys de socio_medico_beneficios
--
-- Requiere haber corrido 0001 a 0017 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- El advisor de performance de Supabase señaló estas dos FK sin índice
-- (mismo patrón que ya se usa en doctor_dias_bloqueados y contact_messages).

create index if not exists socio_medico_beneficios_socio_id_idx
  on public.socio_medico_beneficios (socio_id);

create index if not exists socio_medico_beneficios_doctor_id_idx
  on public.socio_medico_beneficios (doctor_id);
