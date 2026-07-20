'use client';

import { createBrowserClient } from '@supabase/ssr';

// Next expone al navegador solo las variables con prefijo NEXT_PUBLIC_.
// Se definen en .env.local (ver .env.example).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Placeholders válidos para que createBrowserClient NO lance cuando faltan las
// claves (lanzaría "supabaseUrl is required."). Así el sitio sigue vivo aunque
// no haya .env.local; cualquier llamada real falla y la UI muestra el aviso de
// "no configurado".
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

let cached = null;

// Memoizado: createBrowserClient ya devuelve un singleton por credenciales,
// pero cachearlo evita recrear el wrapper en cada render.
export function createBrowserSupabase() {
  if (cached) return cached;

  if (!isSupabaseConfigured()) {
    // eslint-disable-next-line no-console
    console.warn(
      '[supabase] Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Copia .env.example a .env.local y reinicia el dev server.'
    );
  }

  cached = createBrowserClient(url || PLACEHOLDER_URL, anonKey || PLACEHOLDER_KEY);
  return cached;
}
