-- NEOSDOC — sistema de anuncios/publicidad (abierto a cualquier negocio)
--
-- Requiere haber corrido 0001 a 0007 antes.
-- El negocio anunciante entrega su material fuera de la plataforma; el
-- admin lo sube y gestiona manualmente. Visible tanto para médicos como
-- para pacientes mientras esté "activo" y dentro del rango de fechas.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.

-- ============================================================
-- 1. Tabla ads
-- ============================================================

create table if not exists public.ads (
  id bigint generated always as identity primary key,
  title text not null,
  image_url text,
  link_url text,
  tipo text not null default 'imagen' check (tipo in ('imagen', 'banner', 'texto')),
  fecha_inicio date not null default current_date,
  fecha_fin date,
  estado text not null default 'activo' check (estado in ('activo', 'pausado', 'finalizado')),
  creado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.ads enable row level security;

-- Público (médicos y pacientes) solo ve anuncios activos y vigentes; el
-- admin ve todos para poder gestionarlos.
drop policy if exists "ads_select_public_active" on public.ads;
create policy "ads_select_public_active"
  on public.ads for select
  using (
    (
      estado = 'activo'
      and fecha_inicio <= current_date
      and (fecha_fin is null or fecha_fin >= current_date)
    )
    or public.is_admin(auth.uid())
  );

drop policy if exists "ads_insert_admin_only" on public.ads;
create policy "ads_insert_admin_only"
  on public.ads for insert
  with check (public.is_admin(auth.uid()));

drop policy if exists "ads_update_admin_only" on public.ads;
create policy "ads_update_admin_only"
  on public.ads for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "ads_delete_admin_only" on public.ads;
create policy "ads_delete_admin_only"
  on public.ads for delete
  using (public.is_admin(auth.uid()));

-- ============================================================
-- 2. Storage: bucket público para las imágenes de anuncios, solo el
-- admin puede escribir.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('anuncios', 'anuncios', true)
on conflict (id) do nothing;

drop policy if exists "anuncios_public_read" on storage.objects;
create policy "anuncios_public_read"
  on storage.objects for select
  using (bucket_id = 'anuncios');

drop policy if exists "anuncios_admin_insert" on storage.objects;
create policy "anuncios_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'anuncios' and public.is_admin(auth.uid()));

drop policy if exists "anuncios_admin_update" on storage.objects;
create policy "anuncios_admin_update"
  on storage.objects for update
  using (bucket_id = 'anuncios' and public.is_admin(auth.uid()));

drop policy if exists "anuncios_admin_delete" on storage.objects;
create policy "anuncios_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'anuncios' and public.is_admin(auth.uid()));
