import { describe, it, expect } from 'vitest';
import {
  direccionTexto,
  datosGenerales,
  especificos,
  medidasOrientacion,
  parrafosDescripcion,
  listasConContenido,
} from './FichaDocument';

// Terreno de Colonia Seattle, Zapopan: el caso "con todo lleno".
const terrenoSeattle = {
  titulo: 'Terreno con Alta Plusvalía en Colonia Seattle',
  tipoInmueble: 'terreno',
  operacion: 'venta',
  mostrarDireccionExacta: true,
  calle: 'Calle 10',
  numeroExterior: '66',
  colonia: 'Seattle',
  municipio: 'Zapopan',
  estado: 'Jalisco',
  superficieTerrenoM2: 1610,
  medidaNorte: '46.00 m',
  medidaSur: '36.00 m + quiebre de 10.00 m',
  medidaOriente: '35.00 m',
  medidaPoniente: '33.00 m',
  medidasNota: 'Medidas y colindancias sujetas a levantamiento topográfico.',
  descripcion: 'Excelente terreno.\n\nIdeal para desarrollo vertical.',
  idealPara: ['Desarrollo habitacional', 'Torre de departamentos'],
  ventajas: ['Ubicación premium'],
  entorno: [],
  estatusLegal: ['Escritura pública'],
  amenidades: ['Agua', 'Luz'],
  formasPago: ['Contado', 'Crédito bancario'],
};

// Departamento en Tonalá: el caso "con poco lleno", para la regla de
// renderizado condicional (ningún encabezado vacío).
const departamentoTonala = {
  titulo: 'Departamento en Tonalá',
  tipoInmueble: 'departamento',
  operacion: 'venta',
  mostrarDireccionExacta: false,
  colonia: 'Centro',
  municipio: 'Tonalá',
  estado: 'Jalisco',
  descripcion: 'Departamento en zona céntrica.',
  idealPara: [],
  ventajas: [],
  entorno: [],
  estatusLegal: [],
  amenidades: [],
  formasPago: [],
};

describe('direccionTexto', () => {
  it('arma la dirección completa cuando mostrarDireccionExacta es true', () => {
    expect(direccionTexto(terrenoSeattle)).toBe('Calle 10 66, Seattle, Zapopan, Jalisco');
  });

  it('oculta calle y número cuando mostrarDireccionExacta es false', () => {
    expect(direccionTexto(departamentoTonala)).toBe('Centro, Tonalá, Jalisco');
  });
});

describe('datosGenerales', () => {
  it('incluye superficie de terreno cuando existe', () => {
    const datos = datosGenerales(terrenoSeattle);
    const labels = datos.map((d) => d.label);
    expect(labels).toContain('Superficie de terreno');
    expect(labels).not.toContain('Superficie de construcción');
  });

  it('omite superficie y datos ausentes en la propiedad con menos campos', () => {
    const datos = datosGenerales(departamentoTonala);
    const labels = datos.map((d) => d.label);
    expect(labels).not.toContain('Superficie de terreno');
    expect(labels).not.toContain('Superficie de construcción');
    expect(labels).toContain('Tipo de inmueble');
    expect(labels).toContain('Ubicación');
  });
});

describe('especificos', () => {
  it('no agrega recámaras/baños/estacionamientos si no existen', () => {
    expect(especificos(terrenoSeattle)).toEqual([]);
    expect(especificos(departamentoTonala)).toEqual([]);
  });

  it('arma el texto de baños combinando completos y medios', () => {
    const datos = especificos({ banos: 2, mediosBanos: 1 });
    expect(datos.find((d) => d.label === 'Baños').valor).toBe('2 completos · 1 medio');
  });
});

describe('medidasOrientacion', () => {
  it('conserva el texto libre de las medidas tal cual, sin intentar parsear números', () => {
    const medidas = medidasOrientacion(terrenoSeattle);
    expect(medidas).toEqual([
      { label: 'Norte', valor: '46.00 m' },
      { label: 'Sur', valor: '36.00 m + quiebre de 10.00 m' },
      { label: 'Oriente', valor: '35.00 m' },
      { label: 'Poniente', valor: '33.00 m' },
    ]);
  });

  it('devuelve arreglo vacío cuando no hay medidas', () => {
    expect(medidasOrientacion(departamentoTonala)).toEqual([]);
  });
});

describe('parrafosDescripcion', () => {
  it('separa párrafos por línea en blanco', () => {
    expect(parrafosDescripcion(terrenoSeattle.descripcion)).toEqual([
      'Excelente terreno.',
      'Ideal para desarrollo vertical.',
    ]);
  });

  it('devuelve arreglo vacío para texto vacío o nulo', () => {
    expect(parrafosDescripcion('')).toEqual([]);
    expect(parrafosDescripcion(null)).toEqual([]);
    expect(parrafosDescripcion(undefined)).toEqual([]);
  });
});

describe('listasConContenido', () => {
  it('solo incluye las listas que tienen elementos', () => {
    const listas = listasConContenido(terrenoSeattle);
    const titulos = listas.map((l) => l.titulo);
    expect(titulos).toEqual([
      'Ideal para',
      'Ventajas',
      'Estatus legal',
      'Amenidades y servicios',
      'Formas de pago',
    ]);
    expect(titulos).not.toContain('Entorno');
  });

  it('devuelve arreglo vacío cuando ninguna lista tiene contenido (caso Tonalá)', () => {
    expect(listasConContenido(departamentoTonala)).toEqual([]);
  });
});
