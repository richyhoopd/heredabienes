export const WHATSAPP_FALLBACK = '5213313013253';
export const EMAIL_FALLBACK = 'heredabienes@outlook.com';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heredabienes.com.mx').replace(/\/$/, '');

export function urlPublicaPropiedad(slug) {
  return `${SITE_URL}/propiedades/${slug}`;
}

/** Deja solo dígitos y antepone lada de México si el número viene local. */
export function telefonoAWhatsApp(telefono) {
  const digitos = String(telefono ?? '').replace(/\D/g, '');
  if (!digitos) return WHATSAPP_FALLBACK;
  if (digitos.startsWith('52')) return digitos;
  if (digitos.length === 10) return `521${digitos}`;
  return digitos;
}

export function urlWhatsAppPropiedad(property, urlPublica) {
  const numero = telefonoAWhatsApp(property?.asesorTelefono);
  const ubicacion = [property?.colonia, property?.municipio].filter(Boolean).join(', ');
  const link = urlPublica || urlPublicaPropiedad(property?.slug);
  const mensaje = [
    `Hola, vi la propiedad "${property?.titulo ?? ''}"`,
    ubicacion ? ` en ${ubicacion}` : '',
    ' y me interesa recibir más información.',
    `\n${link}`,
  ].join('');
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
