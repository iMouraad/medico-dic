-- NEOSDOC — consentimiento específico LOPDP para ofertas comerciales de terceros
--
-- Requiere haber corrido 0001 a 0005 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Sección 5 del documento técnico: el consentimiento del médico debe ser
-- específico para "recibir ofertas comerciales de terceros a través de
-- NEOSDOC" — no una casilla genérica de aceptar términos y condiciones.
-- Por eso es un campo aparte, opt-in (default false), editable luego desde
-- el perfil, no un requisito bloqueante para completar el registro.

alter table public.doctors
  add column if not exists acepta_ofertas_comerciales boolean not null default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'medico')
  on conflict (id) do nothing;

  insert into public.doctors (user_id, email, ruc, status, acepta_ofertas_comerciales)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'ruc',
    'pendiente',
    coalesce((new.raw_user_meta_data ->> 'acepta_ofertas_comerciales')::boolean, false)
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;
