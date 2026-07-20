// ----------------------------------------------------------------------------
// Helpers de formato y constantes de dominio del catálogo de propiedades.
// Módulo puro: sin React, sin Supabase, sin acceso a red. Se importa igual
// desde Server Components, Client Components y tests.
// ----------------------------------------------------------------------------

// Se usa el locale 'en-US' a propósito y no 'es-MX': ambos agrupan con coma,
// pero 'en-US' está garantizado en cualquier build de ICU (incluido el ICU
// reducido de algunos runtimes), así que el output es determinista.
const LOCALE = 'en-US';

const nfPrecio = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 0,
});

const nfSuperficie = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 2,
});

// Convierte un texto en un slug url-safe.
// "Terreno con Alta Plusvalía en Colonia Seattle"
//   → "terreno-con-alta-plusvalia-en-colonia-seattle"
export function slugify(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita los diacríticos separados por NFD
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, ''); // el slice pudo dejar un guion colgando
}

// Postgres devuelve numeric como string; toNumber normaliza ambos casos.
function toNumber(value) {
  if (value === null || value === undefined || value === '') return NaN;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
}

// "$38,000,000 MXN"  |  "Precio a consultar"
export function formatPrecio(precio, moneda = 'MXN', mostrarPrecio = true) {
  if (!mostrarPrecio) return 'Precio a consultar';
  const n = toNumber(precio);
  if (!Number.isFinite(n) || n <= 0) return 'Precio a consultar';
  return `$${nfPrecio.format(n)} ${moneda || 'MXN'}`;
}

// "1,610 m²"  |  ""  (cadena vacía: el bloque no se renderiza)
export function formatSuperficie(m2) {
  const n = toNumber(m2);
  if (!Number.isFinite(n) || n <= 0) return '';
  return `${nfSuperficie.format(n)} m²`;
}

// ----------------------------------------------------------------------------
// Constantes de dominio. Los `value` replican EXACTAMENTE los CHECK de
// supabase/schema.sql: si se agrega uno aquí, hay que agregarlo también allá.
// ----------------------------------------------------------------------------

export const TIPOS_INMUEBLE = [
  { value: 'terreno', label: 'Terreno' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'local', label: 'Local comercial' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'bodega', label: 'Bodega' },
  { value: 'rancho', label: 'Rancho' },
];

export const OPERACIONES = [
  { value: 'venta', label: 'Venta' },
  { value: 'renta', label: 'Renta' },
];

export const ESTATUS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'apartado', label: 'Apartado' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'pausado', label: 'Pausado' },
];

// Se guardan tal cual en la columna formas_pago (text[]).
export const FORMAS_PAGO = [
  'Contado',
  'Aportación',
  'Crédito bancario',
  'Permuta',
];

// Sugerencias precargadas para los chips del formulario del admin.
// Salen de la ficha del terreno de Colonia Seattle, Zapopan.
export const PRESETS = {
  idealPara: [
    'Desarrollo habitacional',
    'Residencias de lujo',
    'Torre de departamentos',
    'Proyecto vertical',
    'Desarrollo comercial',
    'Oficinas corporativas',
    'Inversión patrimonial',
  ],
  ventajas: [
    'Ubicación premium',
    'Alta plusvalía',
    'Excelente conectividad',
    'Zona consolidada',
    'Ideal para desarrolladores',
  ],
  entorno: [
    'Centros comerciales',
    'Corporativos',
    'Escuelas y universidades',
    'Restaurantes',
    'Servicios médicos',
    'Vialidades principales',
    'Zonas residenciales premium',
  ],
  estatusLegal: [
    'Propiedad privada',
    'Escritura pública',
    'Zona urbanizada',
    'Factibilidad de servicios',
  ],
  amenidades: [
    'Agua',
    'Luz',
    'Drenaje',
    'Alumbrado',
    'Alberca',
    'Jardín',
    'Seguridad',
  ],
  // Máximo 4. `icono` es un nombre de ícono de lucide-react en kebab-case;
  // el componente de la fase 3 lo resuelve contra su propio mapa.
  highlights: [
    {
      icono: 'crown',
      titulo: 'Zona Premium',
      texto: 'Colonia consolidada con alta plusvalía y desarrollos residenciales de primer nivel.',
    },
    {
      icono: 'map-pin',
      titulo: 'Ubicación Estratégica',
      texto: 'Conectividad inmediata con las principales vialidades y corporativos de la zona.',
    },
    {
      icono: 'plug',
      titulo: 'Servicios a la Mano',
      texto: 'Agua, luz, drenaje y alumbrado público disponibles con factibilidad de servicios.',
    },
    {
      icono: 'trending-up',
      titulo: 'Gran Oportunidad',
      texto: 'Precio por debajo del valor comercial de la zona: rendimiento desde el día uno.',
    },
  ],
};
