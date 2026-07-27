'use client';

import { createBrowserSupabase, isSupabaseConfigured } from '../supabase/client';

export const OPCIONES_EXPERIENCIA = [
  { valor: 'menos-1', etiqueta: 'Menos de 1 año' },
  { valor: '1-3', etiqueta: '1 a 3 años' },
  { valor: '3-5', etiqueta: '3 a 5 años' },
  { valor: '5-mas', etiqueta: 'Más de 5 años' },
];

export const ETIQUETAS_EXPERIENCIA = Object.fromEntries(
  OPCIONES_EXPERIENCIA.map(({ valor, etiqueta }) => [valor, etiqueta]),
);

// Inserta una solicitud de "Trabaja con nosotros". Lanza si Supabase no está
// configurado o la inserción falla, para que el formulario muestre el error.
export async function enviarSolicitud({ nombre, telefono, email, ciudad, experiencia, mensaje }) {
  if (!isSupabaseConfigured()) {
    throw new Error('El sitio no está conectado todavía. Escríbenos por WhatsApp.');
  }

  const supabase = createBrowserSupabase();
  const { error } = await supabase.from('solicitudes_asesores').insert({
    nombre: nombre?.trim(),
    telefono: telefono?.trim(),
    email: email?.trim() || null,
    ciudad: ciudad?.trim() || null,
    experiencia: experiencia || null,
    mensaje: mensaje?.trim() || null,
  });

  if (error) throw new Error('No se pudo enviar la solicitud. Intenta de nuevo.');
}

export async function listSolicitudes(client) {
  const supabase = client || createBrowserSupabase();
  const { data, error } = await supabase
    .from('solicitudes_asesores')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteSolicitud(id, client) {
  const supabase = client || createBrowserSupabase();
  const { error } = await supabase.from('solicitudes_asesores').delete().eq('id', id);
  if (error) throw error;
}
