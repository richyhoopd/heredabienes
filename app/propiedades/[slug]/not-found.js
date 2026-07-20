import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-soft px-4 py-20">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light">
          <SearchX size={34} className="text-primary" aria-hidden="true" />
        </div>
        <h1 className="mb-3 text-2xl font-extrabold text-gray-900 font-display sm:text-3xl">
          Esta propiedad ya no está disponible
        </h1>
        <p className="mb-8 text-base leading-relaxed text-gray-500 font-body">
          Puede que se haya vendido o que el link esté incompleto. Revisa el catálogo, seguro
          tenemos algo parecido.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/propiedades" className="btn-primary justify-center">
            Ver propiedades
          </Link>
          <Link href="/" className="btn-outline inline-flex items-center justify-center gap-2">
            <Home size={18} aria-hidden="true" />
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
