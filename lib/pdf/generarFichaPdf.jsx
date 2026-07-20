// ----------------------------------------------------------------------------
// Genera, en el navegador, el PDF de la ficha comercial de una propiedad
// cuando no hay un `fichaPdfUrl` subido a mano. Se importa siempre con
// import() dinámico desde el botón: arrastra @react-pdf/renderer, que es
// pesado y no debe ir en el bundle de la página de detalle.
// ----------------------------------------------------------------------------

import { pdf } from '@react-pdf/renderer';
import FichaDocument from './FichaDocument';
import { fetchImagesAsBase64 } from './pdfImages';
import { slugify } from '../format';

// Portada + hasta 2 fotos más de la galería, igual que pide la ficha impresa.
function urlsAEmbebeber(property) {
  const urls = [];
  if (property.portadaUrl) urls.push(property.portadaUrl);
  const secundarias = (Array.isArray(property.imagenes) ? property.imagenes : [])
    .filter((img) => img?.url && img.url !== property.portadaUrl)
    .slice(0, 2)
    .map((img) => img.url);
  return [...urls, ...secundarias];
}

export function nombreArchivoFicha(property) {
  const base = property?.slug || slugify(property?.titulo) || 'ficha-propiedad';
  return `${base}.pdf`;
}

// Devuelve el Blob del PDF ya armado. Quien llama decide qué hacer con él
// (descargarlo, previsualizarlo, etc.).
export async function generarFichaPdfBlob(property, urlPublica) {
  const imagenesBase64 = await fetchImagesAsBase64(urlsAEmbebeber(property));
  const documento = (
    <FichaDocument property={property} urlPublica={urlPublica} imagenesBase64={imagenesBase64} />
  );
  return pdf(documento).toBlob();
}

// Genera el PDF y dispara la descarga en el navegador con el nombre de
// archivo esperado (el slug de la propiedad).
export async function descargarFichaPdf(property, urlPublica) {
  const blob = await generarFichaPdfBlob(property, urlPublica);
  const nombreArchivo = nombreArchivoFicha(property);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
