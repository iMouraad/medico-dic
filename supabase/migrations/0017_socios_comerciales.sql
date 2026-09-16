-- NEOSDOC — modelo de datos de socios comerciales (Fase 2 del documento
-- técnico, sección "Roadmap"): SOLO la tabla, sin panel ni formularios
-- todavía. El objetivo es dejar la base lista para cuando se necesite,
-- sin tener que rediseñar el esquema más adelante.
--
-- Requiere haber corrido 0001 a 0016 antes.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.
--
-- Recordatorio de la "regla de oro" (sección 1 del documento técnico): esta
-- tabla NUNCA debe tener una columna con el contacto directo de un médico
-- expuesta a nivel de fila visible por un socio. Toda comunicación hacia el
-- médico en nombre de un socio la gestiona la propia plataforma.

create table if not exists public.socios_comerciales (
  id bigint generated always as identity primary key,
  nombre text not null,
  tipo_producto text,
  -- Ver sección 3 del documento técnico: el mecanismo de cobro varía según
  -- el tipo de socio (alto ticket = tarifa fija, bajo ticket/alta
  -- frecuencia = comisión o pago por lead).
  mecanismo_cobro text not null default 'tarifa_fija'
    check (mecanismo_cobro in ('tarifa_fija', 'comision_venta', 'pay_per_lead')),
  -- Código único usado en el mensaje de WhatsApp pre-rellenado que el
  -- médico/paciente envía al socio; es la única herramienta de atribución
  -- del MVP (manual, sin integración con sistemas del socio).
  codigo_referido text not null unique,
  contacto_nombre text,
  contacto_email text,
  activo boolean not null default true,
  notas text,
  created_at timestamptz not null default now()
);

alter table public.socios_comerciales enable row level security;

-- Solo el equipo de NEOSDOC (admin) puede ver o modificar socios
-- comerciales: no hay ningún flujo público ni de médico que los toque.
drop policy if exists "socios_comerciales_admin_only" on public.socios_comerciales;
create policy "socios_comerciales_admin_only"
  on public.socios_comerciales for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Fase 2 (no se activa todavía): vínculo entre un socio y un médico cuando
-- el médico llega referido por ese socio o recibe un beneficio cruzado de
-- otro socio. Se crea la tabla desde ya para no tener que rediseñar el
-- esquema cuando se active esa fase, tal como pide el documento técnico.
create table if not exists public.socio_medico_beneficios (
  id bigint generated always as identity primary key,
  socio_id bigint not null references public.socios_comerciales(id) on delete cascade,
  doctor_id bigint not null references public.doctors(id) on delete cascade,
  descripcion text,
  created_at timestamptz not null default now()
);

alter table public.socio_medico_beneficios enable row level security;

drop policy if exists "socio_medico_beneficios_admin_only" on public.socio_medico_beneficios;
create policy "socio_medico_beneficios_admin_only"
  on public.socio_medico_beneficios for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
