import { NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

const RUTA_LOGIN = '/admin-hb';
const RUTA_PROTEGIDA = '/admin-hb/dashboard';

// La seguridad real la imponen las políticas RLS de Postgres (autenticadas
// por la cookie de sesión), no este middleware. Esto solo esconde la UI del
// dashboard a quien no tenga sesión y evita el parpadeo de contenido privado;
// nunca debe tratarse como el único control de acceso.
export async function middleware(request) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  if (!user && path.startsWith(RUTA_PROTEGIDA)) {
    const destino = request.nextUrl.clone();
    destino.pathname = RUTA_LOGIN;
    destino.search = '';
    return NextResponse.redirect(destino);
  }

  // El panel admin nunca debe cachearse en un CDN.
  if (path.startsWith(RUTA_LOGIN)) {
    response.headers.set('Cache-Control', 'private, no-store');
  }

  return response;
}

export const config = {
  matcher: ['/admin-hb/:path*'],
};
