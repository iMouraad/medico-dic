-- NEOSDOC — RUC inmutable + reabrir revisión al cambiar especialidad
--
-- Requiere haber corrido 0001 a 0018 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Por qué: el perfil público dice "Verificamos la formación y especialidad
-- de cada médico". Si el médico pudiera cambiar su RUC o su especialidad
-- libremente después de que un admin ya aprobó el perfil, esa insignia de
-- verificado quedaría mintiendo sin que nadie se entere. Reglas:
--   1. El RUC es inmutable para el médico una vez guardado por primera vez
--      (solo un admin puede corregirlo).
--   2. Si el médico cambia su especialidad después de haber sido aprobado,
--      el perfil vuelve a "pendiente" para que un admin lo revise de
--      nuevo — el admin aprobó esa especialidad específica, no cualquiera.
-- Esto se hace a nivel de base de datos (no solo en el formulario) para que
-- no se pueda saltar editando la llamada a la API directamente.

create or replace function public.enforce_doctor_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    if old.ruc is not null then
      new.ruc := old.ruc;
    end if;

    if old.status = 'aprobado' and new.specialty is distinct from old.specialty then
      new.status := 'pendiente';
    else
      new.status := old.status;
    end if;
  end if;
  return new;
end;
$$;
