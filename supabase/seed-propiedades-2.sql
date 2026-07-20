-- ============================================================================
-- seed-propiedades-2.sql
-- Dos propiedades del catálogo de Heredabienes & Grupo Hefzibá Inmobiliario:
--   1. Departamento en Misión del Acueducto, Tonalá   — $700,000 MXN
--   2. Propiedad multifuncional en Hogares de Nuevo México, Zapopan — $9,000,000 MXN
--
-- Cómo correrlo:
--   Supabase → SQL Editor → New query → pega TODO este archivo → Run
--
-- Es idempotente: usa `on conflict (slug) do update`, así que puede correrse
-- varias veces sin duplicar filas.
--
-- Notas de modelado:
--   - La propiedad multifuncional se registra como `casa` porque el CHECK de
--     `tipo_inmueble` no admite un tipo "multifuncional", y `casa` es el que
--     hace que la ficha muestre recámaras y baños. Su naturaleza mixta queda
--     en el gancho, la descripción y las amenidades.
--   - Sus medidas son frente/fondo, no orientaciones cardinales, así que van
--     en `medidas_nota` y los campos medida_norte/sur/oriente/poniente quedan
--     nulos.
--   - `formas_pago` y `estatus_legal` quedan vacíos: las fichas comerciales no
--     los especifican y no se inventan.
--   - Los datos del asesor quedan nulos: la ficha los trae en blanco, y la UI
--     cae a los datos globales de Heredabienes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Departamento en Misión del Acueducto — Tonalá, Jalisco
-- ----------------------------------------------------------------------------
insert into public.properties (
  slug, titulo, gancho, tipo_inmueble, operacion, estatus, publicado, destacado, orden,
  precio, moneda, mostrar_precio, precio_nota, formas_pago,
  colonia, municipio, estado, mostrar_direccion_exacta,
  superficie_construccion_m2,
  recamaras, banos, estacionamientos,
  descripcion, ideal_para, ventajas, entorno, estatus_legal, amenidades, highlights,
  meta_title, meta_description
) values (
  'departamento-en-mision-del-acueducto-tonala',
  'Departamento en Misión del Acueducto',
  'Departamento habitacional en segundo nivel, dentro de una zona urbanizada y en crecimiento de Tonalá',
  'departamento',
  'venta',
  'disponible',
  true,
  false,
  20,
  700000,
  'MXN',
  true,
  'Excelente oportunidad para adquirir patrimonio en una zona urbanizada con crecimiento constante',
  array[]::text[],
  'Misión del Acueducto',
  'Tonalá',
  'Jalisco',
  false,
  49.05,
  2,
  1,
  1,
  'Departamento habitacional ubicado en el segundo nivel del fraccionamiento Misión del Acueducto, en Tonalá, Jalisco. Con 49.05 m² aprovechados de forma eficiente, distribuye dos recámaras, un baño completo, sala amplia, comedor, cocina y área de estacionamiento, con excelente iluminación natural.

Tonalá se ha consolidado como una de las zonas de crecimiento habitacional constante dentro de la Zona Metropolitana de Guadalajara, lo que sostiene la demanda de vivienda y el incremento del valor patrimonial. Es una opción funcional tanto para habitar como para generar renta, con bajo mantenimiento y una entrada accesible al mercado inmobiliario.',
  array[
    'Vivienda familiar',
    'Inversión patrimonial',
    'Primera propiedad',
    'Generación de renta',
    'Inversión de bajo mantenimiento'
  ],
  array[
    'Excelente ubicación urbana',
    'Zona totalmente urbanizada',
    'Departamento funcional',
    'Espacios cómodos y bien distribuidos',
    'Área de estacionamiento',
    'Alta demanda habitacional',
    'Excelente opción para renta',
    'Bajo mantenimiento',
    'Gran potencial de plusvalía'
  ],
  array[
    'Comercios y servicios',
    'Vialidades principales',
    'Zona habitacional consolidada',
    'Entorno urbano en crecimiento'
  ],
  array[]::text[],
  array[
    'Sala amplia',
    'Comedor',
    'Cocina',
    'Estacionamiento',
    'Excelente iluminación natural'
  ],
  '[
    {"icono":"map-pin","titulo":"Ubicación Conectada","texto":"Acceso rápido a vialidades principales, comercios y servicios"},
    {"icono":"building","titulo":"Zona Urbanizada","texto":"Fraccionamiento consolidado con servicios completos"},
    {"icono":"trending-up","titulo":"Plusvalía Sostenida","texto":"Tonalá crece de forma constante dentro de la zona metropolitana"},
    {"icono":"landmark","titulo":"Entrada Accesible","texto":"Precio ideal para primera propiedad o inversión de renta"}
  ]'::jsonb,
  'Departamento en Misión del Acueducto, Tonalá | $700,000 MXN | HEREDABIENES',
  'Departamento de 2 recámaras y 49.05 m² en Misión del Acueducto, Tonalá, Jalisco. Zona urbanizada con alta demanda habitacional. $700,000 MXN.'
)
on conflict (slug) do update set
  titulo                     = excluded.titulo,
  gancho                     = excluded.gancho,
  tipo_inmueble              = excluded.tipo_inmueble,
  operacion                  = excluded.operacion,
  estatus                    = excluded.estatus,
  publicado                  = excluded.publicado,
  destacado                  = excluded.destacado,
  orden                      = excluded.orden,
  precio                     = excluded.precio,
  moneda                     = excluded.moneda,
  mostrar_precio             = excluded.mostrar_precio,
  precio_nota                = excluded.precio_nota,
  formas_pago                = excluded.formas_pago,
  colonia                    = excluded.colonia,
  municipio                  = excluded.municipio,
  estado                     = excluded.estado,
  mostrar_direccion_exacta   = excluded.mostrar_direccion_exacta,
  superficie_construccion_m2 = excluded.superficie_construccion_m2,
  recamaras                  = excluded.recamaras,
  banos                      = excluded.banos,
  estacionamientos           = excluded.estacionamientos,
  descripcion                = excluded.descripcion,
  ideal_para                 = excluded.ideal_para,
  ventajas                   = excluded.ventajas,
  entorno                    = excluded.entorno,
  estatus_legal              = excluded.estatus_legal,
  amenidades                 = excluded.amenidades,
  highlights                 = excluded.highlights,
  meta_title                 = excluded.meta_title,
  meta_description           = excluded.meta_description;

-- ----------------------------------------------------------------------------
-- 2. Propiedad multifuncional en Hogares de Nuevo México — Zapopan, Jalisco
-- ----------------------------------------------------------------------------
insert into public.properties (
  slug, titulo, gancho, tipo_inmueble, operacion, estatus, publicado, destacado, orden,
  precio, moneda, mostrar_precio, precio_nota, formas_pago,
  colonia, municipio, estado, mostrar_direccion_exacta,
  superficie_terreno_m2, medidas_nota,
  recamaras, banos, estacionamientos,
  descripcion, ideal_para, ventajas, entorno, estatus_legal, amenidades, highlights,
  meta_title, meta_description
) values (
  'propiedad-multifuncional-en-hogares-de-nuevo-mexico',
  'Propiedad Multifuncional en Hogares de Nuevo México',
  'Vivienda, terraza de eventos con piscina y locales comerciales en un mismo inmueble',
  'casa',
  'venta',
  'disponible',
  true,
  true,
  10,
  9000000,
  'MXN',
  true,
  'Excelente relación entre ubicación, superficie, potencial comercial y rentabilidad',
  array[]::text[],
  'Hogares de Nuevo México',
  'Zapopan',
  'Jalisco',
  false,
  523.13,
  'Frente: 13.50 m · Fondo: 38.75 m aproximados',
  4,
  2,
  1,
  'Propiedad multifuncional de 523.13 m² en Hogares de Nuevo México, Zapopan, dividida estratégicamente en tres sectores independientes que pueden operar y generar ingresos al mismo tiempo.

El primer sector es una amplia vivienda con cuatro recámaras, dos baños completos, sala, comedor y cocina integral equipada, con excelente iluminación natural. El segundo es una terraza de eventos con capacidad aproximada para 100 personas, piscina, área de convivencia, dos baños independientes, vestidor y estacionamiento, lista para operar como negocio de renta para celebraciones. El tercero son locales comerciales independientes con exposición urbana directa, aptos para tiendas, servicios, oficinas o comercios de barrio.

Esa combinación permite diversificar ingresos dentro de un mismo inmueble: vivienda, renta de eventos y renta comercial. La zona es urbana consolidada, rodeada de plazas comerciales, escuelas, hospitales y avenidas principales, con conectividad inmediata hacia distintos puntos de Zapopan y Guadalajara.',
  array[
    'Vivienda residencial',
    'Terraza para eventos',
    'Locales comerciales independientes',
    'Generación de rentas mensuales',
    'Negocio familiar o empresarial',
    'Inversión patrimonial de alta plusvalía'
  ],
  array[
    'Propiedad multifuncional',
    'Excelente ubicación urbana',
    'Alta plusvalía',
    'Diversificación de ingresos',
    'Terraza con piscina',
    'Locales comerciales incluidos',
    'Amplia superficie',
    'Potencial comercial y habitacional',
    'Excelente conectividad'
  ],
  array[
    'Plazas comerciales',
    'Comercios',
    'Escuelas',
    'Hospitales y servicios',
    'Avenidas principales',
    'Zonas habitacionales de alta demanda'
  ],
  array[]::text[],
  array[
    'Piscina',
    'Terraza para eventos con capacidad para 100 personas',
    'Cocina integral equipada',
    'Dos baños independientes en la terraza',
    'Vestidor',
    'Estacionamiento',
    'Locales comerciales independientes'
  ],
  '[
    {"icono":"landmark","titulo":"Tres Fuentes de Ingreso","texto":"Vivienda, terraza de eventos y locales comerciales operando a la vez"},
    {"icono":"ruler","titulo":"523.13 m²","texto":"Amplia superficie dividida en tres sectores independientes"},
    {"icono":"route","titulo":"Conectividad Inmediata","texto":"Acceso directo a avenidas principales de Zapopan y Guadalajara"},
    {"icono":"trending-up","titulo":"Alta Plusvalía","texto":"Zona urbana consolidada con flujo comercial constante"}
  ]'::jsonb,
  'Propiedad Multifuncional en Hogares de Nuevo México, Zapopan | $9,000,000 MXN | HEREDABIENES',
  'Propiedad multifuncional de 523.13 m² en Zapopan: vivienda de 4 recámaras, terraza de eventos con piscina y locales comerciales. $9,000,000 MXN.'
)
on conflict (slug) do update set
  titulo                   = excluded.titulo,
  gancho                   = excluded.gancho,
  tipo_inmueble            = excluded.tipo_inmueble,
  operacion                = excluded.operacion,
  estatus                  = excluded.estatus,
  publicado                = excluded.publicado,
  destacado                = excluded.destacado,
  orden                    = excluded.orden,
  precio                   = excluded.precio,
  moneda                   = excluded.moneda,
  mostrar_precio           = excluded.mostrar_precio,
  precio_nota              = excluded.precio_nota,
  formas_pago              = excluded.formas_pago,
  colonia                  = excluded.colonia,
  municipio                = excluded.municipio,
  estado                   = excluded.estado,
  mostrar_direccion_exacta = excluded.mostrar_direccion_exacta,
  superficie_terreno_m2    = excluded.superficie_terreno_m2,
  medidas_nota             = excluded.medidas_nota,
  recamaras                = excluded.recamaras,
  banos                    = excluded.banos,
  estacionamientos         = excluded.estacionamientos,
  descripcion              = excluded.descripcion,
  ideal_para               = excluded.ideal_para,
  ventajas                 = excluded.ventajas,
  entorno                  = excluded.entorno,
  estatus_legal            = excluded.estatus_legal,
  amenidades               = excluded.amenidades,
  highlights               = excluded.highlights,
  meta_title               = excluded.meta_title,
  meta_description         = excluded.meta_description;

-- ----------------------------------------------------------------------------
-- Verificación
-- ----------------------------------------------------------------------------
select
  slug,
  tipo_inmueble,
  municipio,
  precio,
  jsonb_array_length(highlights) as n_highlights,
  array_length(ideal_para, 1)    as n_ideal_para,
  array_length(amenidades, 1)    as n_amenidades
from public.properties
order by orden, created_at;
