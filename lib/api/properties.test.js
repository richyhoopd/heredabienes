import { describe, it, expect } from 'vitest';
import { fromRow, toRow } from './properties';

const ROW_COMPLETA = {
  id: '11111111-1111-1111-1111-111111111111',
  slug: 'terreno-con-alta-plusvalia-en-colonia-seattle',
  titulo: 'Terreno con Alta Plusvalía en Colonia Seattle',
  gancho: 'Terreno urbano premium',
  tipo_inmueble: 'terreno',
  operacion: 'venta',
  estatus: 'disponible',
  publicado: true,
  destacado: true,
  orden: 1,
  precio: '38000000',
  moneda: 'MXN',
  mostrar_precio: true,
  precio_nota: 'Por debajo de lo valuado',
  formas_pago: ['Contado', 'Aportación'],
  calle: 'Calle 10',
  numero_exterior: '66',
  numero_interior: null,
  colonia: 'Seattle',
  municipio: 'Zapopan',
  estado: 'Jalisco',
  cp: null,
  lat: null,
  lng: null,
  mostrar_direccion_exacta: true,
  superficie_terreno_m2: '1610',
  superficie_construccion_m2: null,
  medida_norte: '46.00 m',
  medida_sur: '36.00 m + quiebre de 10.00 m',
  medida_oriente: '35.00 m',
  medida_poniente: '33.00 m',
  medidas_nota: 'El lindero sur presenta un quiebre.',
  recamaras: null,
  banos: null,
  medios_banos: null,
  estacionamientos: null,
  niveles: null,
  antiguedad_anios: null,
  descripcion: 'Terreno urbano de 1,610 m².',
  ideal_para: ['Desarrollo habitacional'],
  ventajas: ['Alta plusvalía'],
  entorno: ['Corporativos'],
  estatus_legal: ['Escritura pública'],
  amenidades: ['Agua', 'Luz'],
  highlights: [{ icono: 'crown', titulo: 'Zona Premium', texto: '...' }],
  portada_url: 'https://cdn/portada.jpg',
  ficha_pdf_url: 'https://cdn/ficha.pdf',
  asesor_nombre: 'Heredabienes',
  asesor_telefono: '+52 33 1301 3253',
  asesor_email: 'heredabienes@outlook.com',
  meta_title: 'Terreno en venta en Colonia Seattle',
  meta_description: 'Terreno urbano de 1,610 m².',
  created_at: '2026-07-20T00:00:00.000Z',
  updated_at: '2026-07-20T00:00:00.000Z',
};

describe('fromRow', () => {
  it('convierte snake_case a camelCase en todos los campos', () => {
    const p = fromRow(ROW_COMPLETA);

    expect(p.tipoInmueble).toBe('terreno');
    expect(p.mostrarPrecio).toBe(true);
    expect(p.precioNota).toBe('Por debajo de lo valuado');
    expect(p.formasPago).toEqual(['Contado', 'Aportación']);
    expect(p.numeroExterior).toBe('66');
    expect(p.mostrarDireccionExacta).toBe(true);
    expect(p.superficieTerrenoM2).toBe('1610');
    expect(p.superficieConstruccionM2).toBeNull();
    expect(p.medidaNorte).toBe('46.00 m');
    expect(p.medidaSur).toBe('36.00 m + quiebre de 10.00 m');
    expect(p.medidaOriente).toBe('35.00 m');
    expect(p.medidaPoniente).toBe('33.00 m');
    expect(p.medidasNota).toBe('El lindero sur presenta un quiebre.');
    expect(p.mediosBanos).toBeNull();
    expect(p.antiguedadAnios).toBeNull();
    expect(p.idealPara).toEqual(['Desarrollo habitacional']);
    expect(p.estatusLegal).toEqual(['Escritura pública']);
    expect(p.portadaUrl).toBe('https://cdn/portada.jpg');
    expect(p.fichaPdfUrl).toBe('https://cdn/ficha.pdf');
    expect(p.asesorNombre).toBe('Heredabienes');
    expect(p.asesorTelefono).toBe('+52 33 1301 3253');
    expect(p.asesorEmail).toBe('heredabienes@outlook.com');
    expect(p.metaTitle).toBe('Terreno en venta en Colonia Seattle');
    expect(p.metaDescription).toBe('Terreno urbano de 1,610 m².');
    expect(p.createdAt).toBe('2026-07-20T00:00:00.000Z');
    expect(p.updatedAt).toBe('2026-07-20T00:00:00.000Z');
  });

  it('expone exactamente las claves del contrato Property', () => {
    expect(Object.keys(fromRow(ROW_COMPLETA)).sort()).toEqual(
      [
        'id', 'slug', 'titulo', 'gancho', 'tipoInmueble', 'operacion', 'estatus',
        'publicado', 'destacado', 'orden', 'precio', 'moneda', 'mostrarPrecio',
        'precioNota', 'formasPago', 'calle', 'numeroExterior', 'numeroInterior',
        'colonia', 'municipio', 'estado', 'cp', 'lat', 'lng',
        'mostrarDireccionExacta', 'superficieTerrenoM2', 'superficieConstruccionM2',
        'medidaNorte', 'medidaSur', 'medidaOriente', 'medidaPoniente', 'medidasNota',
        'recamaras', 'banos', 'mediosBanos', 'estacionamientos', 'niveles',
        'antiguedadAnios', 'descripcion', 'idealPara', 'ventajas', 'entorno',
        'estatusLegal', 'amenidades', 'highlights', 'portadaUrl', 'fichaPdfUrl',
        'asesorNombre', 'asesorTelefono', 'asesorEmail', 'metaTitle',
        'metaDescription', 'createdAt', 'updatedAt', 'imagenes',
      ].sort()
    );
  });

  it('normaliza los arreglos ausentes a []', () => {
    const p = fromRow({ id: 'x', slug: 's', titulo: 't' });
    expect(p.formasPago).toEqual([]);
    expect(p.idealPara).toEqual([]);
    expect(p.ventajas).toEqual([]);
    expect(p.entorno).toEqual([]);
    expect(p.estatusLegal).toEqual([]);
    expect(p.amenidades).toEqual([]);
    expect(p.highlights).toEqual([]);
    expect(p.imagenes).toEqual([]);
  });

  it('mapea las imágenes anidadas y las ordena por orden', () => {
    const p = fromRow({
      ...ROW_COMPLETA,
      property_images: [
        { id: 'b', property_id: 'x', url: 'u2', storage_path: 'p2', alt: 'dos', orden: 2, created_at: 'c' },
        { id: 'a', property_id: 'x', url: 'u1', storage_path: 'p1', alt: 'uno', orden: 1, created_at: 'c' },
      ],
    });
    expect(p.imagenes.map((i) => i.id)).toEqual(['a', 'b']);
    expect(p.imagenes[0].storagePath).toBe('p1');
  });

  it('devuelve null si la fila es null', () => {
    expect(fromRow(null)).toBeNull();
  });
});

describe('toRow', () => {
  it('convierte camelCase a snake_case', () => {
    expect(
      toRow({
        titulo: 'Casa nueva',
        tipoInmueble: 'casa',
        mostrarPrecio: false,
        numeroExterior: '10',
        superficieTerrenoM2: 300,
        medidaSur: '20 m',
        mediosBanos: 1,
        antiguedadAnios: 5,
        idealPara: ['Familia'],
        estatusLegal: ['Escritura pública'],
        portadaUrl: 'https://cdn/a.jpg',
        fichaPdfUrl: 'https://cdn/a.pdf',
        asesorTelefono: '33',
        metaDescription: 'desc',
        mostrarDireccionExacta: false,
      })
    ).toEqual({
      titulo: 'Casa nueva',
      tipo_inmueble: 'casa',
      mostrar_precio: false,
      numero_exterior: '10',
      superficie_terreno_m2: 300,
      medida_sur: '20 m',
      medios_banos: 1,
      antiguedad_anios: 5,
      ideal_para: ['Familia'],
      estatus_legal: ['Escritura pública'],
      portada_url: 'https://cdn/a.jpg',
      ficha_pdf_url: 'https://cdn/a.pdf',
      asesor_telefono: '33',
      meta_description: 'desc',
      mostrar_direccion_exacta: false,
    });
  });

  it('omite las claves ausentes: permite updates parciales', () => {
    expect(toRow({ publicado: true })).toEqual({ publicado: true });
    expect(toRow({})).toEqual({});
  });

  it('ignora undefined pero conserva null (para poder limpiar un campo)', () => {
    expect(toRow({ precio: undefined })).toEqual({});
    expect(toRow({ precio: null })).toEqual({ precio: null });
  });

  it('ignora las claves que no son columnas', () => {
    expect(toRow({ id: 'x', createdAt: 'y', updatedAt: 'z', imagenes: [], loQueSea: 1 })).toEqual({});
  });

  it('es el inverso de fromRow para las columnas escribibles', () => {
    const row = toRow(fromRow(ROW_COMPLETA));
    expect(row.tipo_inmueble).toBe('terreno');
    expect(row.medida_sur).toBe('36.00 m + quiebre de 10.00 m');
    expect(row.formas_pago).toEqual(['Contado', 'Aportación']);
    expect(row.id).toBeUndefined();
    expect(row.created_at).toBeUndefined();
  });
});
