-- ============================================================================
-- Heredabienes — Catálogo de propiedades
-- Esquema de base de datos (Supabase / Postgres)
-- ----------------------------------------------------------------------------
-- Cómo usarlo:
--   1. Crea un proyecto en https://supabase.com
--   2. SQL Editor → New query → pega TODO este archivo → Run
--   3. Corre después supabase/seed.sql (una sola vez)
--
-- Este archivo es IDEMPOTENTE: correrlo varias veces no rompe nada.
-- Ojo: `create table if not exists` no agrega columnas nuevas a una tabla
-- que ya existe. Si el modelo cambia, añade el `alter table ... add column
-- if not exists` correspondiente en la sección MIGRACIONES del final.
--
-- Modelo de permisos (RLS):
--   - El público (anon) solo LEE propiedades con publicado = true.
--   - El usuario autenticado (staff de Heredabienes) lee todo y escribe todo.
--   - No se usa service-role key en ningún lado.
-- ============================================================================

-- gen_random_uuid() viene de pgcrypto (ya disponible en Supabase).
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- TABLA: properties
-- ----------------------------------------------------------------------------
create table if not exists public.properties (
  -- Identidad y publicación -------------------------------------------------
  id                          uuid primary key default gen_random_uuid(),
  slug                        text unique not null,
  titulo                      text not null,
  gancho                      text,
  tipo_inmueble               text not null,
  operacion                   text not null,
  estatus                     text not null default 'disponible',
  publicado                   boolean not null default false,
  destacado                   boolean not null default false,
  orden                       integer default 0,

  -- Precio ------------------------------------------------------------------
  precio                      numeric,
  moneda                      text default 'MXN',
  mostrar_precio              boolean default true,
  precio_nota                 text,
  formas_pago                 text[],

  -- Ubicación ---------------------------------------------------------------
  calle                       text,
  numero_exterior             text,
  numero_interior             text,
  colonia                     text,
  municipio                   text,
  estado                      text,
  cp                          text,
  lat                         numeric,
  lng                         numeric,
  mostrar_direccion_exacta    boolean default true,

  -- Superficie y medidas ----------------------------------------------------
  -- Las medidas son text y no numeric a propósito: el lindero sur del terreno
  -- de Colonia Seattle es "36.00 m + quiebre de 10.00 m" y no cabe en un número.
  superficie_terreno_m2       numeric,
  superficie_construccion_m2  numeric,
  medida_norte                text,
  medida_sur                  text,
  medida_oriente              text,
  medida_poniente             text,
  medidas_nota                text,

  -- Específicos por tipo (opcionales) ---------------------------------------
  recamaras                   integer,
  banos                       integer,
  medios_banos                integer,
  estacionamientos            integer,
  niveles                     integer,
  antiguedad_anios            integer,

  -- Contenido ---------------------------------------------------------------
  descripcion                 text,
  ideal_para                  text[],
  ventajas                    text[],
  entorno                     text[],
  estatus_legal               text[],
  amenidades                  text[],
  -- highlights: arreglo de {icono, titulo, texto}, máximo 4.
  highlights                  jsonb not null default '[]'::jsonb,

  -- Medios, contacto y SEO --------------------------------------------------
  portada_url                 text,
  ficha_pdf_url               text,
  asesor_nombre               text,
  asesor_telefono             text,
  asesor_email                text,
  meta_title                  text,
  meta_description            text,

  -- Timestamps --------------------------------------------------------------
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CHECKs con nombre. Se agregan por separado (y se dropean antes) para que el
-- archivo siga siendo idempotente aunque la tabla ya exista.
-- Los valores replican TIPOS_INMUEBLE / OPERACIONES / ESTATUS de lib/format.js.
-- ----------------------------------------------------------------------------
alter table public.properties drop constraint if exists properties_tipo_inmueble_check;
alter table public.properties add  constraint properties_tipo_inmueble_check
  check (tipo_inmueble in ('terreno','casa','departamento','local','oficina','bodega','rancho'));

alter table public.properties drop constraint if exists properties_operacion_check;
alter table public.properties add  constraint properties_operacion_check
  check (operacion in ('venta','renta'));

alter table public.properties drop constraint if exists properties_estatus_check;
alter table public.properties add  constraint properties_estatus_check
  check (estatus in ('disponible','apartado','vendido','pausado'));

-- ----------------------------------------------------------------------------
-- TABLA: property_images
-- storage_path es obligatorio para poder borrar el archivo del bucket y no
-- dejar huérfanos cuando se elimina la imagen o la propiedad.
-- ----------------------------------------------------------------------------
create table if not exists public.property_images (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  url          text not null,
  storage_path text,
  alt          text,
  orden        integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ÍNDICES
-- slug ya tiene índice único por la constraint UNIQUE.
-- ----------------------------------------------------------------------------
create index if not exists properties_publicado_idx      on public.properties (publicado);
create index if not exists properties_municipio_idx      on public.properties (municipio);
create index if not exists properties_tipo_inmueble_idx  on public.properties (tipo_inmueble);
create index if not exists properties_destacado_idx      on public.properties (destacado);
create index if not exists properties_orden_idx          on public.properties (orden, created_at desc);

create index if not exists property_images_property_idx  on public.property_images (property_id, orden);

-- ----------------------------------------------------------------------------
-- updated_at automático
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_properties_updated on public.properties;
create trigger trg_properties_updated before update on public.properties
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.properties      enable row level security;
alter table public.property_images enable row level security;

-- ---- properties ------------------------------------------------------------
drop policy if exists "properties public read" on public.properties;
drop policy if exists "properties admin write" on public.properties;

create policy "properties public read" on public.properties
  for select using (publicado = true or auth.role() = 'authenticated');

create policy "properties admin write" on public.properties
  for all using (auth.role() = 'authenticated')
          with check (auth.role() = 'authenticated');

-- ---- property_images -------------------------------------------------------
-- Una imagen es visible si su propiedad es visible. El EXISTS se evalúa con
-- las políticas de `properties` activas para el rol que consulta, así que una
-- propiedad en borrador esconde automáticamente sus imágenes al público.
drop policy if exists "property_images public read" on public.property_images;
drop policy if exists "property_images admin write" on public.property_images;

create policy "property_images public read" on public.property_images
  for select using (
    exists (
      select 1 from public.properties p
      where p.id = property_images.property_id
    )
  );

create policy "property_images admin write" on public.property_images
  for all using (auth.role() = 'authenticated')
          with check (auth.role() = 'authenticated');

-- ============================================================================
-- STORAGE: bucket "propiedades" (fotos de galería, portadas y fichas PDF)
-- Público en lectura, autenticado en escritura.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('propiedades', 'propiedades', true)
on conflict (id) do update set public = true;

drop policy if exists "propiedades public read"  on storage.objects;
drop policy if exists "propiedades admin write"  on storage.objects;
drop policy if exists "propiedades admin update" on storage.objects;
drop policy if exists "propiedades admin delete" on storage.objects;

create policy "propiedades public read" on storage.objects
  for select using (bucket_id = 'propiedades');

create policy "propiedades admin write" on storage.objects
  for insert with check (bucket_id = 'propiedades' and auth.role() = 'authenticated');

create policy "propiedades admin update" on storage.objects
  for update using (bucket_id = 'propiedades' and auth.role() = 'authenticated');

create policy "propiedades admin delete" on storage.objects
  for delete using (bucket_id = 'propiedades' and auth.role() = 'authenticated');

-- ============================================================================
-- MIGRACIONES
-- Cuando el modelo evolucione, agrega aquí los ALTER idempotentes en vez de
-- tocar el CREATE TABLE de arriba. Ejemplo:
--   alter table public.properties add column if not exists tour_url text;
-- ============================================================================
