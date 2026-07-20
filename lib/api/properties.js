import { createBrowserSupabase } from '../supabase/client';
import { slugify } from '../format';
import { imageFromRow } from './images';

// La UI trabaja con objetos camelCase; la DB usa snake_case. Todo el mapeo
// vive aquí para que ningún componente sepa la forma de la tabla.

// Se pide la propiedad con sus imágenes anidadas en una sola consulta.
const SELECT = '*, property_images(*)';

// Resuelve el cliente a usar. Por defecto el de navegador; los Server
// Components pasan el suyo (creado con createServerSupabase()) porque este
// módulo NO puede importar next/headers sin romper el bundle de cliente.
function resolveClient(client) {
  return client || createBrowserSupabase();
}

export function fromRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    titulo: r.titulo,
    gancho: r.gancho ?? null,
    tipoInmueble: r.tipo_inmueble ?? null,
    operacion: r.operacion ?? null,
    estatus: r.estatus ?? null,
    publicado: r.publicado ?? false,
    destacado: r.destacado ?? false,
    orden: r.orden ?? 0,

    precio: r.precio ?? null,
    moneda: r.moneda ?? 'MXN',
    mostrarPrecio: r.mostrar_precio ?? true,
    precioNota: r.precio_nota ?? null,
    formasPago: r.formas_pago ?? [],

    calle: r.calle ?? null,
    numeroExterior: r.numero_exterior ?? null,
    numeroInterior: r.numero_interior ?? null,
    colonia: r.colonia ?? null,
    municipio: r.municipio ?? null,
    estado: r.estado ?? null,
    cp: r.cp ?? null,
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    mostrarDireccionExacta: r.mostrar_direccion_exacta ?? true,

    superficieTerrenoM2: r.superficie_terreno_m2 ?? null,
    superficieConstruccionM2: r.superficie_construccion_m2 ?? null,
    medidaNorte: r.medida_norte ?? null,
    medidaSur: r.medida_sur ?? null,
    medidaOriente: r.medida_oriente ?? null,
    medidaPoniente: r.medida_poniente ?? null,
    medidasNota: r.medidas_nota ?? null,

    recamaras: r.recamaras ?? null,
    banos: r.banos ?? null,
    mediosBanos: r.medios_banos ?? null,
    estacionamientos: r.estacionamientos ?? null,
    niveles: r.niveles ?? null,
    antiguedadAnios: r.antiguedad_anios ?? null,

    descripcion: r.descripcion ?? null,
    idealPara: r.ideal_para ?? [],
    ventajas: r.ventajas ?? [],
    entorno: r.entorno ?? [],
    estatusLegal: r.estatus_legal ?? [],
    amenidades: r.amenidades ?? [],
    highlights: r.highlights ?? [],

    portadaUrl: r.portada_url ?? null,
    fichaPdfUrl: r.ficha_pdf_url ?? null,
    asesorNombre: r.asesor_nombre ?? null,
    asesorTelefono: r.asesor_telefono ?? null,
    asesorEmail: r.asesor_email ?? null,
    metaTitle: r.meta_title ?? null,
    metaDescription: r.meta_description ?? null,

    createdAt: r.created_at ?? null,
    updatedAt: r.updated_at ?? null,

    // Postgrest no garantiza el orden de las relaciones anidadas: se ordena aquí.
    imagenes: Array.isArray(r.property_images)
      ? [...r.property_images]
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          .map(imageFromRow)
      : [],
  };
}

// Spread condicional: solo entran al row las claves presentes en el objeto,
// lo que permite updates parciales sin borrar columnas por accidente.
// `undefined` se ignora; `null` sí se escribe (sirve para limpiar un campo).
export function toRow(p = {}) {
  return {
    ...(p.slug !== undefined && { slug: p.slug }),
    ...(p.titulo !== undefined && { titulo: p.titulo }),
    ...(p.gancho !== undefined && { gancho: p.gancho }),
    ...(p.tipoInmueble !== undefined && { tipo_inmueble: p.tipoInmueble }),
    ...(p.operacion !== undefined && { operacion: p.operacion }),
    ...(p.estatus !== undefined && { estatus: p.estatus }),
    ...(p.publicado !== undefined && { publicado: p.publicado }),
    ...(p.destacado !== undefined && { destacado: p.destacado }),
    ...(p.orden !== undefined && { orden: p.orden }),

    ...(p.precio !== undefined && { precio: p.precio }),
    ...(p.moneda !== undefined && { moneda: p.moneda }),
    ...(p.mostrarPrecio !== undefined && { mostrar_precio: p.mostrarPrecio }),
    ...(p.precioNota !== undefined && { precio_nota: p.precioNota }),
    ...(p.formasPago !== undefined && { formas_pago: p.formasPago }),

    ...(p.calle !== undefined && { calle: p.calle }),
    ...(p.numeroExterior !== undefined && { numero_exterior: p.numeroExterior }),
    ...(p.numeroInterior !== undefined && { numero_interior: p.numeroInterior }),
    ...(p.colonia !== undefined && { colonia: p.colonia }),
    ...(p.municipio !== undefined && { municipio: p.municipio }),
    ...(p.estado !== undefined && { estado: p.estado }),
    ...(p.cp !== undefined && { cp: p.cp }),
    ...(p.lat !== undefined && { lat: p.lat }),
    ...(p.lng !== undefined && { lng: p.lng }),
    ...(p.mostrarDireccionExacta !== undefined && {
      mostrar_direccion_exacta: p.mostrarDireccionExacta,
    }),

    ...(p.superficieTerrenoM2 !== undefined && {
      superficie_terreno_m2: p.superficieTerrenoM2,
    }),
    ...(p.superficieConstruccionM2 !== undefined && {
      superficie_construccion_m2: p.superficieConstruccionM2,
    }),
    ...(p.medidaNorte !== undefined && { medida_norte: p.medidaNorte }),
    ...(p.medidaSur !== undefined && { medida_sur: p.medidaSur }),
    ...(p.medidaOriente !== undefined && { medida_oriente: p.medidaOriente }),
    ...(p.medidaPoniente !== undefined && { medida_poniente: p.medidaPoniente }),
    ...(p.medidasNota !== undefined && { medidas_nota: p.medidasNota }),

    ...(p.recamaras !== undefined && { recamaras: p.recamaras }),
    ...(p.banos !== undefined && { banos: p.banos }),
    ...(p.mediosBanos !== undefined && { medios_banos: p.mediosBanos }),
    ...(p.estacionamientos !== undefined && { estacionamientos: p.estacionamientos }),
    ...(p.niveles !== undefined && { niveles: p.niveles }),
    ...(p.antiguedadAnios !== undefined && { antiguedad_anios: p.antiguedadAnios }),

    ...(p.descripcion !== undefined && { descripcion: p.descripcion }),
    ...(p.idealPara !== undefined && { ideal_para: p.idealPara }),
    ...(p.ventajas !== undefined && { ventajas: p.ventajas }),
    ...(p.entorno !== undefined && { entorno: p.entorno }),
    ...(p.estatusLegal !== undefined && { estatus_legal: p.estatusLegal }),
    ...(p.amenidades !== undefined && { amenidades: p.amenidades }),
    ...(p.highlights !== undefined && { highlights: p.highlights }),

    ...(p.portadaUrl !== undefined && { portada_url: p.portadaUrl }),
    ...(p.fichaPdfUrl !== undefined && { ficha_pdf_url: p.fichaPdfUrl }),
    ...(p.asesorNombre !== undefined && { asesor_nombre: p.asesorNombre }),
    ...(p.asesorTelefono !== undefined && { asesor_telefono: p.asesorTelefono }),
    ...(p.asesorEmail !== undefined && { asesor_email: p.asesorEmail }),
    ...(p.metaTitle !== undefined && { meta_title: p.metaTitle }),
    ...(p.metaDescription !== undefined && { meta_description: p.metaDescription }),
  };
}

// Aplica el criterio de ordenamiento del listado público.
function aplicarOrden(query, orden) {
  switch (orden) {
    case 'precio-asc':
      return query.order('precio', { ascending: true, nullsFirst: false });
    case 'precio-desc':
      return query.order('precio', { ascending: false, nullsFirst: false });
    case 'recientes':
      return query.order('created_at', { ascending: false });
    default:
      // Por defecto manda el orden manual del admin y, a igualdad, lo reciente.
      return query
        .order('orden', { ascending: true })
        .order('created_at', { ascending: false });
  }
}

// ----------------------------------------------------------------------------
// LECTURA
// ----------------------------------------------------------------------------

export async function listProperties({
  tipo,
  operacion,
  municipio,
  precioMin,
  precioMax,
  orden,
  includeUnpublished = false,
  client,
} = {}) {
  const supabase = resolveClient(client);
  let query = supabase.from('properties').select(SELECT);

  if (!includeUnpublished) query = query.eq('publicado', true);
  if (tipo) query = query.eq('tipo_inmueble', tipo);
  if (operacion) query = query.eq('operacion', operacion);
  // ilike sin comodines = igualdad sin distinguir mayúsculas: permite ?municipio=zapopan
  if (municipio) query = query.ilike('municipio', municipio);
  if (precioMin !== undefined && precioMin !== null && precioMin !== '') {
    query = query.gte('precio', precioMin);
  }
  if (precioMax !== undefined && precioMax !== null && precioMax !== '') {
    query = query.lte('precio', precioMax);
  }

  query = aplicarOrden(query, orden);

  const { data, error } = await query;
  if (error) throw error;
  return data.map(fromRow);
}

// Devuelve null (no lanza) cuando el slug no existe: la página llama a
// notFound() en ese caso.
export async function getPropertyBySlug(slug, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('properties')
    .select(SELECT)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

// Para el admin: el id siempre debe existir, así que aquí sí lanza.
export async function getPropertyById(id, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('properties')
    .select(SELECT)
    .eq('id', id)
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function listFeaturedProperties(limit = 3, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('properties')
    .select(SELECT)
    .eq('publicado', true)
    .eq('destacado', true)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(fromRow);
}

// "Otras propiedades" del detalle: mismas por municipio O por tipo, nunca ella misma.
export async function listRelatedProperties({
  id,
  municipio,
  tipoInmueble,
  limit = 3,
  client,
} = {}) {
  const supabase = resolveClient(client);
  let query = supabase
    .from('properties')
    .select(SELECT)
    .eq('publicado', true)
    .order('destacado', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (id) query = query.neq('id', id);

  // Los valores van entre comillas dobles porque un municipio puede traer
  // espacios y PostgREST usa la coma como separador de condiciones.
  const condiciones = [];
  if (municipio) condiciones.push(`municipio.eq."${municipio}"`);
  if (tipoInmueble) condiciones.push(`tipo_inmueble.eq."${tipoInmueble}"`);
  if (condiciones.length) query = query.or(condiciones.join(','));

  const { data, error } = await query;
  if (error) throw error;
  return data.map(fromRow);
}

// Alimenta el filtro de municipio del listado. Se deduplica en JS porque
// PostgREST no expone SELECT DISTINCT.
export async function listMunicipios(client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('properties')
    .select('municipio')
    .eq('publicado', true)
    .not('municipio', 'is', null);
  if (error) throw error;

  const unicos = [...new Set(data.map((r) => r.municipio).filter(Boolean))];
  return unicos.sort((a, b) => a.localeCompare(b, 'es'));
}

// ----------------------------------------------------------------------------
// ESCRITURA (solo autenticado; lo impone RLS, no este código)
// ----------------------------------------------------------------------------

// 23505 = unique_violation de Postgres.
const UNIQUE_VIOLATION = '23505';

function sufijoCorto() {
  return Math.random().toString(36).slice(2, 6);
}

export async function createProperty(fields, client) {
  const supabase = resolveClient(client);
  const base = { ...fields };
  if (!base.slug) base.slug = slugify(base.titulo);

  const { data, error } = await supabase
    .from('properties')
    .insert(toRow(base))
    .select(SELECT)
    .single();

  // Slug repetido: se reintenta una vez con sufijo en vez de reventar el form.
  if (error && error.code === UNIQUE_VIOLATION) {
    const conSufijo = { ...base, slug: `${base.slug}-${sufijoCorto()}` };
    const retry = await supabase
      .from('properties')
      .insert(toRow(conSufijo))
      .select(SELECT)
      .single();
    if (retry.error) throw retry.error;
    return fromRow(retry.data);
  }

  if (error) throw error;
  return fromRow(data);
}

export async function updateProperty(id, fields, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('properties')
    .update(toRow(fields))
    .eq('id', id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return fromRow(data);
}

// Las imágenes caen solas por el ON DELETE CASCADE. Los archivos del bucket
// los borra el admin antes de llamar aquí (usa storagePath de cada imagen).
export async function deleteProperty(id, client) {
  const supabase = resolveClient(client);
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw error;
}

// Clona una propiedad como borrador. No copia las imágenes: los archivos del
// bucket son compartidos y borrar el duplicado no debe romper el original.
export async function duplicateProperty(id, client) {
  const original = await getPropertyById(id, client);

  const titulo = `${original.titulo} (copia)`;
  const copia = {
    ...original,
    titulo,
    slug: `${slugify(titulo)}-${sufijoCorto()}`,
    publicado: false,
    destacado: false,
  };

  delete copia.id;
  delete copia.createdAt;
  delete copia.updatedAt;
  delete copia.imagenes;

  return createProperty(copia, client);
}
