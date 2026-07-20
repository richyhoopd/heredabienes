// ----------------------------------------------------------------------------
// Documento @react-pdf/renderer de la ficha comercial de una propiedad.
// Sigue la misma regla de renderizado condicional que el resto de la UI:
// cada bloque aparece SOLO si su arreglo tiene elementos o su campo tiene
// valor. Nunca se pinta un encabezado vacío.
// ----------------------------------------------------------------------------

import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { formatPrecio, formatSuperficie, TIPOS_INMUEBLE, OPERACIONES } from '../format';
import { etiqueta } from '../opciones';
import { WHATSAPP_FALLBACK, EMAIL_FALLBACK } from '../whatsapp';

const COLORS = {
  primary: '#0098FF',
  primaryDark: '#007ACC',
  primaryLight: '#E6F4FF',
  dark: '#0A1628',
  graySoft: '#F4F8FF',
  gray700: '#374151',
  gray600: '#4B5563',
  gray400: '#9CA3AF',
  border: '#E5EAF2',
  green: '#16A34A',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 56,
    paddingHorizontal: 34,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: COLORS.dark,
  },

  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primaryDark,
    letterSpacing: 1.2,
  },
  brandSub: { fontSize: 7, color: COLORS.gray400, marginTop: 2 },
  badge: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    textTransform: 'uppercase',
  },

  titulo: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.dark, marginBottom: 3 },
  gancho: { fontSize: 9.5, color: COLORS.gray600, marginBottom: 5 },
  direccionRow: { fontSize: 9, color: COLORS.gray600, marginBottom: 10 },

  precioBox: { marginBottom: 14 },
  precio: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: COLORS.primary },
  precioNota: { fontSize: 8.5, color: COLORS.green, fontFamily: 'Helvetica-Bold', marginTop: 2 },

  portada: {
    width: '100%',
    height: 190,
    objectFit: 'cover',
    borderRadius: 6,
    marginBottom: 6,
  },
  galeriaRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  galeriaImg: { flex: 1, height: 90, objectFit: 'cover', borderRadius: 5 },

  sectionTitle: {
    fontSize: 11.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
    marginBottom: 7,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 6,
  },

  datosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  datoCard: {
    width: '31%',
    backgroundColor: COLORS.graySoft,
    borderRadius: 5,
    padding: 7,
  },
  datoLabel: { fontSize: 6.5, color: COLORS.gray400, textTransform: 'uppercase', marginBottom: 2 },
  datoValor: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: COLORS.dark },

  medidasBox: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 5, marginBottom: 4 },
  medidaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  medidaLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORS.gray600 },
  medidaValor: { fontSize: 9, color: COLORS.dark, textAlign: 'right', maxWidth: '65%' },
  medidasNota: { fontSize: 8, fontStyle: 'italic', color: COLORS.gray600, marginTop: 4 },

  parrafo: { fontSize: 9.5, lineHeight: 1.5, color: COLORS.gray700, marginBottom: 6 },

  highlightsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  highlightCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 8,
  },
  highlightDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginBottom: 4,
  },
  highlightTitulo: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: COLORS.dark, marginBottom: 2 },
  highlightTexto: { fontSize: 8, color: COLORS.gray600, lineHeight: 1.4 },

  listasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  listaBox: { width: '48%', marginBottom: 8 },
  listaTitulo: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: COLORS.dark, marginBottom: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: {
    fontSize: 8,
    color: COLORS.gray700,
    backgroundColor: COLORS.graySoft,
    borderRadius: 8,
    paddingVertical: 2.5,
    paddingHorizontal: 7,
  },
  listaItem: { fontSize: 8.5, color: COLORS.gray700, marginBottom: 2 },

  footer: {
    position: 'absolute',
    bottom: 16,
    left: 34,
    right: 34,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  footerTexto: { fontSize: 7.5, color: COLORS.gray400 },
  footerMarca: { fontSize: 7.5, color: COLORS.primaryDark, fontFamily: 'Helvetica-Bold' },
  footerUrl: { fontSize: 7.5, color: COLORS.primary },
});

function SeccionTexto({ titulo, children }) {
  return (
    <View style={{ marginBottom: 10 }}>
      {/* minPresenceAhead evita que el título quede solo al fondo de una
          página con todo su contenido empujado a la siguiente. */}
      <Text style={styles.sectionTitle} minPresenceAhead={30}>
        {titulo}
      </Text>
      {children}
    </View>
  );
}

export function direccionTexto(property) {
  const partes = property.mostrarDireccionExacta
    ? [
        [property.calle, property.numeroExterior].filter(Boolean).join(' '),
        property.numeroInterior ? `Int. ${property.numeroInterior}` : '',
        property.colonia,
        property.municipio,
        property.estado,
      ]
    : [property.colonia, property.municipio, property.estado];
  return partes.filter(Boolean).join(', ');
}

export function datosGenerales(property) {
  const datos = [];
  if (property.tipoInmueble) {
    datos.push({ label: 'Tipo de inmueble', valor: etiqueta(TIPOS_INMUEBLE, property.tipoInmueble) });
  }
  if (property.operacion) {
    datos.push({ label: 'Operación', valor: etiqueta(OPERACIONES, property.operacion) });
  }
  const ubicacion = [property.colonia, property.municipio, property.estado].filter(Boolean).join(', ');
  if (ubicacion) datos.push({ label: 'Ubicación', valor: ubicacion });
  if (property.superficieTerrenoM2) {
    datos.push({ label: 'Superficie de terreno', valor: formatSuperficie(property.superficieTerrenoM2) });
  }
  if (property.superficieConstruccionM2) {
    datos.push({ label: 'Superficie de construcción', valor: formatSuperficie(property.superficieConstruccionM2) });
  }
  return datos;
}

export function especificos(property) {
  const datos = [];
  if (property.recamaras) datos.push({ label: 'Recámaras', valor: String(property.recamaras) });
  if (property.banos || property.mediosBanos) {
    const partes = [];
    if (property.banos) partes.push(`${property.banos} completo${property.banos > 1 ? 's' : ''}`);
    if (property.mediosBanos) partes.push(`${property.mediosBanos} medio${property.mediosBanos > 1 ? 's' : ''}`);
    datos.push({ label: 'Baños', valor: partes.join(' · ') });
  }
  if (property.estacionamientos) {
    datos.push({ label: 'Estacionamientos', valor: String(property.estacionamientos) });
  }
  return datos;
}

export function medidasOrientacion(property) {
  return [
    { label: 'Norte', valor: property.medidaNorte },
    { label: 'Sur', valor: property.medidaSur },
    { label: 'Oriente', valor: property.medidaOriente },
    { label: 'Poniente', valor: property.medidaPoniente },
  ].filter((m) => m.valor && String(m.valor).trim());
}

export function parrafosDescripcion(texto) {
  const contenido = typeof texto === 'string' ? texto.trim() : '';
  if (!contenido) return [];
  return contenido
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// Devuelve solo las listas con contenido, en el mismo orden que la página web.
export function listasConContenido(property) {
  return [
    { titulo: 'Ideal para', items: property.idealPara, variante: 'chips' },
    { titulo: 'Ventajas', items: property.ventajas, variante: 'lista' },
    { titulo: 'Entorno', items: property.entorno, variante: 'chips' },
    { titulo: 'Estatus legal', items: property.estatusLegal, variante: 'lista' },
    { titulo: 'Amenidades y servicios', items: property.amenidades, variante: 'chips' },
    { titulo: 'Formas de pago', items: property.formasPago, variante: 'chips' },
  ]
    .map((b) => ({ ...b, items: (Array.isArray(b.items) ? b.items : []).filter((i) => i && String(i).trim()) }))
    .filter((b) => b.items.length > 0);
}

// `imagenesBase64` es un Map<url, dataUri> ya resuelto por generarFichaPdf().
// Las imágenes que fallaron al descargarse simplemente no están en el mapa.
export default function FichaDocument({ property, urlPublica, imagenesBase64 }) {
  const mapa = imagenesBase64 instanceof Map ? imagenesBase64 : new Map();

  const portadaSrc = property.portadaUrl ? mapa.get(property.portadaUrl) : null;
  const secundarias = (Array.isArray(property.imagenes) ? property.imagenes : [])
    .filter((img) => img?.url && img.url !== property.portadaUrl)
    .slice(0, 2)
    .map((img) => mapa.get(img.url))
    .filter(Boolean);

  const direccion = direccionTexto(property);
  const precioTexto = formatPrecio(property.precio, property.moneda, property.mostrarPrecio);
  const datos = datosGenerales(property);
  const specs = especificos(property);
  const medidas = medidasOrientacion(property);
  const nota = property.medidasNota && String(property.medidasNota).trim();
  const parrafos = parrafosDescripcion(property.descripcion);
  const highlights = (Array.isArray(property.highlights) ? property.highlights : []).filter((h) => h && h.titulo).slice(0, 4);
  const listas = listasConContenido(property);

  return (
    <Document title={`Ficha — ${property.titulo}`}>
      <Page size="LETTER" style={styles.page} wrap>
        {/* 1. Encabezado */}
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brand}>HEREDABIENES</Text>
            <Text style={styles.brandSub}>Grupo Inmobiliario</Text>
          </View>
          {property.operacion ? (
            <Text style={styles.badge}>{etiqueta(OPERACIONES, property.operacion)}</Text>
          ) : null}
        </View>

        <Text style={styles.titulo}>{property.titulo}</Text>
        {property.gancho ? <Text style={styles.gancho}>{property.gancho}</Text> : null}
        {direccion ? <Text style={styles.direccionRow}>{direccion}</Text> : null}

        <View style={styles.precioBox}>
          <Text style={styles.precio}>{precioTexto}</Text>
          {property.precioNota ? <Text style={styles.precioNota}>{property.precioNota}</Text> : null}
        </View>

        {/* 2. Fotos */}
        {portadaSrc ? <Image src={portadaSrc} style={styles.portada} /> : null}
        {secundarias.length > 0 ? (
          <View style={styles.galeriaRow}>
            {secundarias.map((src, i) => (
              <Image key={i} src={src} style={styles.galeriaImg} />
            ))}
          </View>
        ) : null}

        {/* 3. Datos generales */}
        {datos.length > 0 ? (
          <SeccionTexto titulo="Datos generales">
            <View style={styles.datosGrid} wrap={false}>
              {datos.map((d) => (
                <View key={d.label} style={styles.datoCard} wrap={false}>
                  <Text style={styles.datoLabel}>{d.label}</Text>
                  <Text style={styles.datoValor}>{d.valor}</Text>
                </View>
              ))}
            </View>
          </SeccionTexto>
        ) : null}

        {/* 4. Medidas (texto libre: no son números, se muestran tal cual) */}
        {medidas.length > 0 || nota ? (
          <SeccionTexto titulo="Medidas">
            {medidas.length > 0 ? (
              <View style={styles.medidasBox} wrap={false}>
                {medidas.map((m, i) => (
                  <View
                    key={m.label}
                    style={i === medidas.length - 1 ? { ...styles.medidaRow, borderBottomWidth: 0 } : styles.medidaRow}
                  >
                    <Text style={styles.medidaLabel}>{m.label}</Text>
                    <Text style={styles.medidaValor}>{m.valor}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {nota ? <Text style={styles.medidasNota}>{nota}</Text> : null}
          </SeccionTexto>
        ) : null}

        {/* 5. Específicos */}
        {specs.length > 0 ? (
          <SeccionTexto titulo="Específicos">
            <View style={styles.datosGrid} wrap={false}>
              {specs.map((d) => (
                <View key={d.label} style={styles.datoCard} wrap={false}>
                  <Text style={styles.datoLabel}>{d.label}</Text>
                  <Text style={styles.datoValor}>{d.valor}</Text>
                </View>
              ))}
            </View>
          </SeccionTexto>
        ) : null}

        {/* 6. Descripción */}
        {parrafos.length > 0 ? (
          <SeccionTexto titulo="Descripción">
            {parrafos.map((p, i) => (
              <Text key={i} style={styles.parrafo}>
                {p}
              </Text>
            ))}
          </SeccionTexto>
        ) : null}

        {/* 7. Highlights (máximo 4, igual que en la web) */}
        {highlights.length > 0 ? (
          <SeccionTexto titulo="Por qué esta propiedad">
            <View style={styles.highlightsGrid}>
              {highlights.map((h, i) => (
                <View key={`${h.titulo}-${i}`} style={styles.highlightCard} wrap={false}>
                  <View style={styles.highlightDot} />
                  <Text style={styles.highlightTitulo}>{h.titulo}</Text>
                  {h.texto ? <Text style={styles.highlightTexto}>{h.texto}</Text> : null}
                </View>
              ))}
            </View>
          </SeccionTexto>
        ) : null}

        {/* 8. Listas de contenido */}
        {listas.length > 0 ? (
          <SeccionTexto titulo="Características">
            <View style={styles.listasGrid}>
              {listas.map((bloque) => (
                <View key={bloque.titulo} style={styles.listaBox} wrap={false}>
                  <Text style={styles.listaTitulo}>{bloque.titulo}</Text>
                  {bloque.variante === 'lista' ? (
                    bloque.items.map((item) => (
                      <Text key={item} style={styles.listaItem}>
                        · {item}
                      </Text>
                    ))
                  ) : (
                    <View style={styles.chipsRow}>
                      {bloque.items.map((item) => (
                        <Text key={item} style={styles.chip}>
                          {item}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </SeccionTexto>
        ) : null}

        {/* 9. Pie con contacto, fijo en cada página */}
        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <Text style={styles.footerMarca}>HEREDABIENES · Grupo Inmobiliario</Text>
            <Text style={styles.footerTexto}>
              WhatsApp +{WHATSAPP_FALLBACK} · {EMAIL_FALLBACK}
            </Text>
          </View>
          <Text style={styles.footerUrl}>{urlPublica}</Text>
        </View>
      </Page>
    </Document>
  );
}
