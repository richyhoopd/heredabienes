-- ============================================================================
-- Heredabienes — Seed inicial del catálogo
-- ----------------------------------------------------------------------------
-- Corre esto UNA VEZ, después de schema.sql.
-- Es idempotente: el ON CONFLICT (slug) actualiza la fila en vez de duplicarla,
-- así que puedes volver a correrlo si corriges algún dato.
--
-- Contenido: la ficha real del terreno en Colonia Seattle, Zapopan.
-- Las fotos NO se siembran aquí: se suben desde el admin (/admin-hb) al bucket
-- `propiedades`, que es quien llena portada_url y property_images.
-- ============================================================================

insert into public.properties (
  slug,
  titulo,
  gancho,
  tipo_inmueble,
  operacion,
  estatus,
  publicado,
  destacado,
  orden,
  precio,
  moneda,
  mostrar_precio,
  precio_nota,
  formas_pago,
  calle,
  numero_exterior,
  colonia,
  municipio,
  estado,
  mostrar_direccion_exacta,
  superficie_terreno_m2,
  medida_norte,
  medida_sur,
  medida_oriente,
  medida_poniente,
  medidas_nota,
  descripcion,
  ideal_para,
  ventajas,
  entorno,
  estatus_legal,
  amenidades,
  highlights,
  asesor_nombre,
  asesor_telefono,
  asesor_email,
  meta_title,
  meta_description
) values (
  'terreno-con-alta-plusvalia-en-colonia-seattle',
  'Terreno con Alta Plusvalía en Colonia Seattle',
  'Terreno urbano premium en una de las zonas mejor conectadas de Zapopan',
  'terreno',
  'venta',
  'disponible',
  true,
  true,
  1,

  -- Precio
  38000000,
  'MXN',
  true,
  'Por debajo de lo valuado',
  array['Contado','Aportación'],

  -- Ubicación
  'Calle 10',
  '66',
  'Seattle',
  'Zapopan',
  'Jalisco',
  true,

  -- Superficie y medidas
  1610,
  '46.00 m',
  '36.00 m + quiebre de 10.00 m',
  '35.00 m',
  '33.00 m',
  'El lindero sur presenta un quiebre de 10.00 m. Consulta el plano en la ficha técnica para el detalle exacto de los linderos.',

  -- Descripción
  'Terreno urbano de 1,610 m² en Colonia Seattle, Zapopan, una de las zonas de mayor plusvalía del área metropolitana de Guadalajara. Predio en esquina con frente amplio, totalmente urbanizado y con factibilidad de servicios, listo para desarrollar. Su ubicación lo coloca a minutos de corporativos, centros comerciales, escuelas y las principales vialidades de la zona, lo que lo hace ideal tanto para un proyecto vertical residencial como para un desarrollo de uso mixto. Se ofrece por debajo del valor comercial de la zona: una oportunidad patrimonial poco frecuente en un predio de este tamaño y ubicación.',

  -- Listas de contenido
  array[
    'Desarrollo habitacional',
    'Residencias de lujo',
    'Torre de departamentos',
    'Proyecto vertical',
    'Desarrollo comercial',
    'Oficinas corporativas',
    'Inversión patrimonial'
  ],
  array[
    'Ubicación premium',
    'Alta plusvalía',
    'Excelente conectividad',
    'Zona consolidada',
    'Ideal para desarrolladores'
  ],
  array[
    'Centros comerciales',
    'Corporativos',
    'Escuelas y universidades',
    'Restaurantes',
    'Servicios médicos',
    'Vialidades principales',
    'Zonas residenciales premium'
  ],
  array[
    'Propiedad privada',
    'Escritura pública',
    'Zona urbanizada',
    'Factibilidad de servicios'
  ],
  array['Agua','Luz','Drenaje','Alumbrado'],

  -- Highlights (los 4 badges de la infografía)
  '[
    {
      "icono": "crown",
      "titulo": "Zona Premium",
      "texto": "Colonia Seattle es una zona consolidada de Zapopan, con desarrollos residenciales de primer nivel y plusvalía sostenida."
    },
    {
      "icono": "map-pin",
      "titulo": "Ubicación Estratégica",
      "texto": "Conectividad inmediata con las principales vialidades de la ciudad y con los corredores corporativos de la zona."
    },
    {
      "icono": "plug",
      "titulo": "Servicios a la Mano",
      "texto": "Agua, luz, drenaje y alumbrado público disponibles, con factibilidad de servicios para desarrollar."
    },
    {
      "icono": "trending-up",
      "titulo": "Gran Oportunidad",
      "texto": "Precio por debajo del valor comercial de la zona: rendimiento patrimonial desde la adquisición."
    }
  ]'::jsonb,

  -- Contacto
  'Heredabienes',
  '+52 33 1301 3253',
  'heredabienes@outlook.com',

  -- SEO
  'Terreno en venta en Colonia Seattle, Zapopan — 1,610 m² | Heredabienes',
  'Terreno urbano de 1,610 m² en Colonia Seattle, Zapopan. $38,000,000 MXN, por debajo de lo valuado. Escritura pública, zona urbanizada y factibilidad de servicios. Ideal para proyecto vertical o desarrollo comercial.'
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
  calle                    = excluded.calle,
  numero_exterior          = excluded.numero_exterior,
  colonia                  = excluded.colonia,
  municipio                = excluded.municipio,
  estado                   = excluded.estado,
  mostrar_direccion_exacta = excluded.mostrar_direccion_exacta,
  superficie_terreno_m2    = excluded.superficie_terreno_m2,
  medida_norte             = excluded.medida_norte,
  medida_sur               = excluded.medida_sur,
  medida_oriente           = excluded.medida_oriente,
  medida_poniente          = excluded.medida_poniente,
  medidas_nota             = excluded.medidas_nota,
  descripcion              = excluded.descripcion,
  ideal_para               = excluded.ideal_para,
  ventajas                 = excluded.ventajas,
  entorno                  = excluded.entorno,
  estatus_legal            = excluded.estatus_legal,
  amenidades               = excluded.amenidades,
  highlights               = excluded.highlights,
  asesor_nombre            = excluded.asesor_nombre,
  asesor_telefono          = excluded.asesor_telefono,
  asesor_email             = excluded.asesor_email,
  meta_title               = excluded.meta_title,
  meta_description         = excluded.meta_description;

-- PENDIENTE: lat / lng quedan en NULL a propósito. En cuanto se confirmen las
-- coordenadas exactas del predio, córrelas con:
--   update public.properties
--      set lat = <lat>, lng = <lng>
--    where slug = 'terreno-con-alta-plusvalia-en-colonia-seattle';
-- El bloque de mapa de la ficha (fase 3) no se renderiza mientras sean NULL.
