import { describe, it, expect } from 'vitest';
import {
  slugify,
  formatPrecio,
  formatSuperficie,
  TIPOS_INMUEBLE,
  OPERACIONES,
  ESTATUS,
  FORMAS_PAGO,
  PRESETS,
} from './format';

describe('slugify', () => {
  it('pasa a minúsculas y une con guiones', () => {
    expect(slugify('Terreno Urbano Premium')).toBe('terreno-urbano-premium');
  });

  it('quita acentos y la ñ se degrada a n', () => {
    expect(slugify('Terreno con Alta Plusvalía en Colonia Seattle')).toBe(
      'terreno-con-alta-plusvalia-en-colonia-seattle'
    );
    expect(slugify('Cabaña del Niño')).toBe('cabana-del-nino');
  });

  it('colapsa signos y espacios repetidos en un solo guion', () => {
    expect(slugify('Casa  ---  ¡en   venta!')).toBe('casa-en-venta');
  });

  it('recorta guiones al inicio y al final', () => {
    expect(slugify('  ¿Local comercial?  ')).toBe('local-comercial');
  });

  it('trunca a 80 caracteres sin dejar guion colgando', () => {
    const largo = slugify('a'.repeat(78) + ' bcdefgh');
    expect(largo.length).toBeLessThanOrEqual(80);
    expect(largo.endsWith('-')).toBe(false);
  });

  it('tolera entradas vacías o nulas', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
  });
});

describe('formatPrecio', () => {
  it('formatea con separador de miles, símbolo y moneda', () => {
    expect(formatPrecio(38000000, 'MXN', true)).toBe('$38,000,000 MXN');
  });

  it('respeta otras monedas', () => {
    expect(formatPrecio(1250000, 'USD', true)).toBe('$1,250,000 USD');
  });

  it('usa MXN y mostrarPrecio=true por defecto', () => {
    expect(formatPrecio(950000)).toBe('$950,000 MXN');
  });

  it('redondea a pesos enteros', () => {
    expect(formatPrecio(38000000.49, 'MXN', true)).toBe('$38,000,000 MXN');
  });

  it('devuelve "Precio a consultar" cuando mostrarPrecio es false', () => {
    expect(formatPrecio(38000000, 'MXN', false)).toBe('Precio a consultar');
  });

  it('devuelve "Precio a consultar" cuando no hay precio válido', () => {
    expect(formatPrecio(null, 'MXN', true)).toBe('Precio a consultar');
    expect(formatPrecio(undefined)).toBe('Precio a consultar');
    expect(formatPrecio(0, 'MXN', true)).toBe('Precio a consultar');
    expect(formatPrecio('no soy un número')).toBe('Precio a consultar');
  });

  it('acepta el precio como string numérico (numeric de Postgres)', () => {
    expect(formatPrecio('38000000', 'MXN', true)).toBe('$38,000,000 MXN');
  });
});

describe('formatSuperficie', () => {
  it('formatea con separador de miles y unidad', () => {
    expect(formatSuperficie(1610)).toBe('1,610 m²');
  });

  it('conserva hasta dos decimales', () => {
    expect(formatSuperficie(240.5)).toBe('240.5 m²');
    expect(formatSuperficie(240.567)).toBe('240.57 m²');
  });

  it('acepta strings numéricos', () => {
    expect(formatSuperficie('1610.00')).toBe('1,610 m²');
  });

  it('devuelve cadena vacía cuando no hay superficie', () => {
    expect(formatSuperficie(null)).toBe('');
    expect(formatSuperficie(undefined)).toBe('');
    expect(formatSuperficie(0)).toBe('');
    expect(formatSuperficie('')).toBe('');
    expect(formatSuperficie('abc')).toBe('');
  });
});

describe('constantes de dominio', () => {
  it('TIPOS_INMUEBLE cubre exactamente los valores del CHECK', () => {
    expect(TIPOS_INMUEBLE.map((t) => t.value)).toEqual([
      'terreno',
      'casa',
      'departamento',
      'local',
      'oficina',
      'bodega',
      'rancho',
    ]);
  });

  it('OPERACIONES y ESTATUS cubren los valores del CHECK', () => {
    expect(OPERACIONES.map((o) => o.value)).toEqual(['venta', 'renta']);
    expect(ESTATUS.map((e) => e.value)).toEqual([
      'disponible',
      'apartado',
      'vendido',
      'pausado',
    ]);
  });

  it('todas las constantes traen label legible', () => {
    [...TIPOS_INMUEBLE, ...OPERACIONES, ...ESTATUS].forEach((c) => {
      expect(typeof c.label).toBe('string');
      expect(c.label.length).toBeGreaterThan(0);
    });
  });

  it('FORMAS_PAGO incluye los valores usados en el seed', () => {
    expect(FORMAS_PAGO).toContain('Contado');
    expect(FORMAS_PAGO).toContain('Aportación');
  });

  it('PRESETS expone las seis listas', () => {
    expect(Object.keys(PRESETS).sort()).toEqual([
      'amenidades',
      'entorno',
      'estatusLegal',
      'highlights',
      'idealPara',
      'ventajas',
    ]);
    expect(PRESETS.idealPara).toContain('Desarrollo habitacional');
    expect(PRESETS.estatusLegal).toContain('Escritura pública');
    expect(PRESETS.entorno).toContain('Centros comerciales');
  });

  it('PRESETS.highlights trae los 4 badges de la infografía', () => {
    expect(PRESETS.highlights).toHaveLength(4);
    expect(PRESETS.highlights.map((h) => h.titulo)).toEqual([
      'Zona Premium',
      'Ubicación Estratégica',
      'Servicios a la Mano',
      'Gran Oportunidad',
    ]);
    PRESETS.highlights.forEach((h) => {
      expect(h).toHaveProperty('icono');
      expect(h).toHaveProperty('titulo');
      expect(h).toHaveProperty('texto');
    });
  });
});
