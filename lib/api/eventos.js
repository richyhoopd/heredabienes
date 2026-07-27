'use client';

// Registro de eventos de interacción (vistas, clicks, shares) en
// public.property_events. Todo es fire-and-forget: la analítica JAMÁS debe
// romper la UI, así que cada llamada va envuelta en try/catch y no se awaitea
// desde los componentes.

import { createBrowserSupabase, isSupabaseConfigured } from '../supabase/client';

export const EVENTOS = [
  'vista',
  'click_card',
  'whatsapp',
  'llamada',
  'email',
  'compartir',
  'descarga_ficha',
];

export const ETIQUETAS_EVENTO = {
  vista: 'Vistas',
  click_card: 'Clicks en tarjeta',
  whatsapp: 'WhatsApp',
  llamada: 'Llamadas',
  email: 'Emails',
  compartir: 'Compartidos',
  descarga_ficha: 'Fichas descargadas',
};

function visitanteId() {
  try {
    let id = window.localStorage.getItem('visitante_id');
    if (!id) {
      id = window.crypto?.randomUUID?.() || `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem('visitante_id', id);
    }
    return id;
  } catch {
    return null;
  }
}

export function registrarEvento(evento, { propertyId = null, detalle = null } = {}) {
  try {
    if (typeof window === 'undefined' || !isSupabaseConfigured()) return;
    const supabase = createBrowserSupabase();
    supabase
      .from('property_events')
      .insert({
        property_id: propertyId,
        evento,
        detalle,
        pagina: window.location.pathname.slice(0, 300),
        visitante: visitanteId(),
      })
      // PostgrestBuilder es lazy: sin then() la petición no se dispara.
      .then(
        () => {},
        () => {},
      );
  } catch {
    // Nunca romper la UI por analítica.
  }
}

// Conteos agregados por propiedad/evento (vista SQL property_event_counts).
// Solo devuelve filas para sesiones autenticadas (RLS): uso exclusivo del admin.
export async function listEventCounts(client) {
  const supabase = client || createBrowserSupabase();
  const { data, error } = await supabase.from('property_event_counts').select('*');
  if (error) throw error;
  return data || [];
}

// Una vista por propiedad por sesión de navegación (pestaña).
export function registrarVistaUnaVez(propertyId) {
  try {
    const clave = `vista_registrada_${propertyId}`;
    if (window.sessionStorage.getItem(clave)) return;
    window.sessionStorage.setItem(clave, '1');
  } catch {
    // Sin sessionStorage (modo privado estricto): registramos igual.
  }
  registrarEvento('vista', { propertyId });
}
