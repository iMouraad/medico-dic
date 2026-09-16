-- NEOSDOC — formulario de contacto genérico paciente–médico
--
-- Requiere haber corrido 0001 a 0008 antes.
-- Distinto de `appointments`: aquí el paciente solo deja un mensaje breve
-- (no una fecha/hora propuesta) y el médico decide cómo responder, por
-- correo o WhatsApp.
-- Cómo aplicar: pegar y correr este archivo completo en el SQL Editor de
-- Supabase. Es seguro volver a correrlo.

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  doctor_id bigint not null references public.doctors(id) on delete cascade,
  email text not null,
  whatsapp_paciente text,
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_doctor_id_idx on public.contact_messages (doctor_id);

alter table public.contact_messages enable row level security;

-- Cualquier visitante puede dejar un mensaje, pero solo para un médico ya
-- aprobado y publicado (misma condición que appointments).
drop policy if exists "contact_messages_insert_public" on public.contact_messages;
create policy "contact_messages_insert_public"
  on public.contact_messages for insert
  with check (
    exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.status = 'aprobado'
    )
  );

drop policy if exists "contact_messages_select_own_doctor_or_admin" on public.contact_messages;
create policy "contact_messages_select_own_doctor_or_admin"
  on public.contact_messages for select
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.user_id = auth.uid()
    )
  );

drop policy if exists "contact_messages_update_own_doctor_or_admin" on public.contact_messages;
create policy "contact_messages_update_own_doctor_or_admin"
  on public.contact_messages for update
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.doctors d
      where d.id = doctor_id and d.user_id = auth.uid()
    )
  );

drop policy if exists "contact_messages_delete_admin_only" on public.contact_messages;
create policy "contact_messages_delete_admin_only"
  on public.contact_messages for delete
  using (public.is_admin(auth.uid()));
