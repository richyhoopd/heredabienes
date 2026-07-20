import { createBrowserSupabase } from '../supabase/client';

const BUCKET = 'propiedades';

// Solo letras, números, punto y guion: Supabase Storage rechaza rutas con
// espacios, acentos o caracteres raros.
function limpiarNombre(nombre) {
  return String(nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Sube un File (del <input type="file"> o del drag & drop) al bucket
// "propiedades" y devuelve { path, url }.
//   path → se guarda en property_images.storage_path, sirve para borrarlo luego
//   url  → URL pública, se guarda en property_images.url o en portada_url
// folder agrupa por tipo: 'galeria', 'portadas', 'fichas'.
export async function uploadFile(file, folder = 'misc') {
  if (!file) throw new Error('uploadFile: no se recibió ningún archivo');

  const supabase = createBrowserSupabase();
  const limpio = limpiarNombre(file.name);
  const ext = (limpio.split('.').pop() || 'bin').slice(0, 8);
  const unico = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${folder}/${unico}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

// Borra un archivo por el path que devolvió uploadFile.
// Es tolerante a path vacío para poder llamarla sin condicionales en el admin.
export async function deleteFile(path) {
  if (!path) return;
  const supabase = createBrowserSupabase();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
