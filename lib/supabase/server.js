import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

// Cliente para Server Components, Server Actions y Route Handlers.
// En Next 15 cookies() es async, por eso esta función es async: hay que
// await-earla en cada uso.
//
//   const supabase = await createServerSupabase();
//
// NO memoizar: cada request tiene su propio cookie store.
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(url || PLACEHOLDER_URL, anonKey || PLACEHOLDER_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Llamado desde un Server Component, que no puede escribir cookies.
          // Se ignora: el refresh de la sesión lo hace el middleware.
        }
      },
    },
  });
}
