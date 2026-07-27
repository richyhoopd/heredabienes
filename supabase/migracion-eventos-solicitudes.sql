-- ============================================================================
-- MIGRACIÓN: métricas de clicks + solicitudes de asesores
-- Idempotente: se puede correr varias veces sin romper nada.
-- Pegar completo en Supabase → SQL Editor → Run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) property_events — cada interacción del público con una propiedad.
--    El rol anónimo SOLO puede insertar (nunca leer): las métricas se
--    consultan autenticado desde el admin.
-- ----------------------------------------------------------------------------
create table if not exists public.property_events (
  id          bigint generated always as identity primary key,
  property_id uuid references public.properties (id) on delete cascade,
  evento      text not null,
  detalle     text,          -- p.ej. red del share: whatsapp | facebook | x | copiar | nativo
  pagina      text,          -- ruta donde ocurrió el evento
  visitante   text,          -- id anónimo por navegador (para contar únicos)
  created_at  timestamptz not null default now(),

  constraint property_events_evento_chk check (
    evento in ('vista', 'click_card', 'whatsapp', 'llamada', 'email', 'compartir', 'descarga_ficha')
  ),
  -- límites defensivos: la tabla la escribe el público
  constraint property_events_detalle_len check (char_length(coalesce(detalle, '')) <= 100),
  constraint property_events_pagina_len  check (char_length(coalesce(pagina, '')) <= 300),
  constraint property_events_visitante_len check (char_length(coalesce(visitante, '')) <= 64)
);

create index if not exists property_events_property_idx on public.property_events (property_id, evento);
create index if not exists property_events_created_idx  on public.property_events (created_at desc);

alter table public.property_events enable row level security;

drop policy if exists "events public insert" on public.property_events;
create policy "events public insert" on public.property_events
  for insert to anon, authenticated with check (true);

drop policy if exists "events admin read" on public.property_events;
create policy "events admin read" on public.property_events
  for select to authenticated using (true);

drop policy if exists "events admin delete" on public.property_events;
create policy "events admin delete" on public.property_events
  for delete to authenticated using (true);

-- Vista agregada para el panel de métricas (respeta el RLS de la tabla base:
-- solo usuarios autenticados obtienen filas).
create or replace view public.property_event_counts
with (security_invoker = true) as
select
  property_id,
  evento,
  count(*)::bigint                 as total,
  count(distinct visitante)::bigint as unicos,
  max(created_at)                  as ultimo
from public.property_events
group by property_id, evento;

-- ----------------------------------------------------------------------------
-- 2) solicitudes_asesores — formulario público "Trabaja con nosotros".
--    Igual: el público solo inserta; se leen/gestionan desde el admin.
-- ----------------------------------------------------------------------------
create table if not exists public.solicitudes_asesores (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  telefono    text not null,
  email       text,
  ciudad      text,
  experiencia text,   -- rango: menos-1 | 1-3 | 3-5 | 5-mas
  mensaje     text,
  created_at  timestamptz not null default now(),

  constraint solicitudes_nombre_len   check (char_length(nombre) between 2 and 120),
  constraint solicitudes_telefono_len check (char_length(telefono) between 7 and 20),
  constraint solicitudes_email_len    check (char_length(coalesce(email, '')) <= 160),
  constraint solicitudes_ciudad_len   check (char_length(coalesce(ciudad, '')) <= 120),
  constraint solicitudes_exp_chk      check (
    experiencia is null or experiencia in ('menos-1', '1-3', '3-5', '5-mas')
  ),
  constraint solicitudes_mensaje_len  check (char_length(coalesce(mensaje, '')) <= 2000)
);

create index if not exists solicitudes_created_idx on public.solicitudes_asesores (created_at desc);

alter table public.solicitudes_asesores enable row level security;

drop policy if exists "solicitudes public insert" on public.solicitudes_asesores;
create policy "solicitudes public insert" on public.solicitudes_asesores
  for insert to anon, authenticated with check (true);

drop policy if exists "solicitudes admin read" on public.solicitudes_asesores;
create policy "solicitudes admin read" on public.solicitudes_asesores
  for select to authenticated using (true);

drop policy if exists "solicitudes admin delete" on public.solicitudes_asesores;
create policy "solicitudes admin delete" on public.solicitudes_asesores
  for delete to authenticated using (true);
