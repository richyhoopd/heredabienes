'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { signIn, getSession } from '@/lib/auth';

const CONFIGURADO =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LoginAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(CONFIGURADO);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!CONFIGURADO) return;
    let vivo = true;
    (async () => {
      try {
        const sesion = await getSession();
        if (vivo && sesion) {
          router.replace('/admin-hb/dashboard');
          return;
        }
      } catch {
        // sin sesión: se queda en el login
      }
      if (vivo) setVerificando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [router]);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setCargando(true);
    try {
      const res = await signIn(email.trim(), password);
      if (res?.error) throw res.error;
      router.replace('/admin-hb/dashboard');
      router.refresh();
    } catch (err) {
      const msg = String(err?.message || '');
      if (/invalid login credentials/i.test(msg)) {
        setError('Correo o contraseña incorrectos.');
      } else if (/email not confirmed/i.test(msg)) {
        setError('La cuenta existe pero el correo no está confirmado.');
      } else if (/fetch|network/i.test(msg)) {
        setError('No se pudo contactar a Supabase. Revisa tu conexión.');
      } else {
        setError(msg || 'No se pudo iniciar sesión.');
      }
      setCargando(false);
    }
  };

  if (!CONFIGURADO) {
    return (
      <main className="min-h-screen bg-gray-soft flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-8 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold font-display text-dark mb-2">
            Supabase no está configurado
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            Faltan las variables de entorno. Crea un archivo{' '}
            <code className="bg-gray-100 px-1 rounded">.env.local</code> con:
          </p>
          <pre className="bg-dark text-left text-xs text-gray-soft rounded-xl p-4 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...`}
          </pre>
          <p className="text-gray-500 text-xs mt-4">
            Reinicia el servidor de desarrollo después de crearlo.
          </p>
        </div>
      </main>
    );
  }

  if (verificando) {
    return (
      <main className="min-h-screen bg-gray-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-soft flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-display text-dark">
            Panel Heredabienes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Acceso exclusivo para el equipo
          </p>
        </div>

        <form onSubmit={enviar} noValidate>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Correo
          </label>
          <div className="relative mb-4">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="correo@heredabienes.com"
            />
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Contraseña
          </label>
          <div className="relative mb-6">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
