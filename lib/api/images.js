import { createBrowserSupabase } from '../supabase/client';

function resolveClient(client) {
  return client || createBrowserSupabase();
}

export function imageFromRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    propertyId: r.property_id,
    url: r.url,
    storagePath: r.storage_path ?? null,
    alt: r.alt ?? null,
    orden: r.orden ?? 0,
    createdAt: r.created_at ?? null,
  };
}

export function imageToRow(i = {}) {
  return {
    ...(i.propertyId !== undefined && { property_id: i.propertyId }),
    ...(i.url !== undefined && { url: i.url }),
    ...(i.storagePath !== undefined && { storage_path: i.storagePath }),
    ...(i.alt !== undefined && { alt: i.alt }),
    ...(i.orden !== undefined && { orden: i.orden }),
  };
}

export async function listImagesByProperty(propertyId, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', propertyId)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(imageFromRow);
}

export async function addImage({ propertyId, url, storagePath, alt, orden } = {}, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('property_images')
    .insert(imageToRow({ propertyId, url, storagePath, alt, orden }))
    .select('*')
    .single();
  if (error) throw error;
  return imageFromRow(data);
}

// Recibe los ids en el orden final del drag & drop y persiste el índice.
// Son updates independientes: si uno falla, se lanza el primer error.
export async function reorderImages(orderedIds = [], client) {
  const supabase = resolveClient(client);
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('property_images').update({ orden: index }).eq('id', id)
    )
  );
  const fallo = results.find((r) => r.error);
  if (fallo) throw fallo.error;
}

// Borra solo el registro. El archivo del bucket lo borra el llamador con
// deleteFile(storagePath) de lib/api/storage.js, antes o después de esto.
export async function deleteImage(id, client) {
  const supabase = resolveClient(client);
  const { error } = await supabase.from('property_images').delete().eq('id', id);
  if (error) throw error;
}
