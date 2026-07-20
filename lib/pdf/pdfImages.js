// ----------------------------------------------------------------------------
// Descarga una imagen pública (Supabase Storage) y la convierte a data URI
// base64 para poder embeberla en el PDF generado en el navegador.
// react-pdf no puede pintar una <img src="https://..."> igual que el DOM:
// necesita el buffer ya resuelto. Si la descarga falla, se devuelve null y
// quien llama debe omitir esa imagen sin romper el resto del documento.
// ----------------------------------------------------------------------------

export async function fetchImageAsBase64(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return null;
  }
}

// Resuelve varias imágenes en paralelo. Cada entrada fallida se descarta en
// vez de tumbar la generación completa del PDF.
export async function fetchImagesAsBase64(urls = []) {
  const unicas = [...new Set(urls.filter(Boolean))];
  const resueltas = await Promise.all(unicas.map((url) => fetchImageAsBase64(url)));
  const mapa = new Map();
  unicas.forEach((url, i) => {
    if (resueltas[i]) mapa.set(url, resueltas[i]);
  });
  return mapa;
}
