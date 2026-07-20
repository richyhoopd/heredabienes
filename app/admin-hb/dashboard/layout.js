'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Building2, ExternalLink } from 'lucide-react';
import { signOut } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const salir = async () => {
    try {
      await signOut();
    } catch {
      // aunque falle, mandamos al login
    }
    router.replace('/admin-hb');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-soft">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/admin-hb/dashboard"
            className="flex items-center gap-2 font-display font-bold text-dark"
          >
            <Building2 className="w-5 h-5 text-primary" />
            Propiedades
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/propiedades"
              target="_blank"
              className="text-sm text-gray-500 hover:text-primary inline-flex items-center gap-1"
            >
              Ver sitio <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={salir}
              className="text-sm text-gray-500 hover:text-red-600 inline-flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
