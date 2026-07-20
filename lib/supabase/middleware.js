import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

// Refresca el token de la sesión y lo reescribe en las cookies de la respuesta.
// Devuelve { response, user }: el middleware raíz (fase 4) decide con `user`
// si redirige a /admin-hb, y debe devolver `response` tal cual para no perder
// las cookies actualizadas.
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    url || PLACEHOLDER_URL,
    anonKey || PLACEHOLDER_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANTE: esta llamada va inmediatamente después de crear el cliente.
  // Es la que dispara el refresh del token; si se mete código entre medias,
  // las sesiones se cierran solas de forma aleatoria y es imposible de depurar.
  // getClaims() verifica el JWT y cae a una llamada de red solo si hace falta;
  // nunca confiar en getSession() del lado del servidor.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  return { response: supabaseResponse, user };
}
