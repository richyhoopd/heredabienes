'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from './supabase/client';

// ----------------------------------------------------------------------------
// Auth con Supabase (email + password) para el admin de Heredabienes.
// No hay registro público: los usuarios se crean a mano en el dashboard de
// Supabase (Authentication → Users → Add user). Ver SETUP_SUPABASE.md.
//
// Este módulo solo maneja la sesión del navegador. La autorización real la
// imponen las políticas RLS de Postgres, no este código.
// ----------------------------------------------------------------------------

export async function signIn(email, password) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const supabase = createBrowserSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const supabase = createBrowserSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Hook para la UI del admin. Devuelve { user, loading }.
//   const { user, loading } = useAuth();
//   if (loading) return null;
//   if (!user) router.replace('/admin-hb');
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;
    const supabase = createBrowserSupabase();

    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
