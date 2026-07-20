import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function EmptyState({ onClearHref = '/propiedades' }) {
  return (
    <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-md">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
        <SearchX size={28} className="text-primary" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-xl font-bold font-display text-gray-900">
        No encontramos propiedades con esos filtros
      </h3>
      <p className="mx-auto mb-6 max-w-md text-sm text-gray-500 font-body">
        Prueba ampliando el rango de precio o quitando el municipio. También podemos buscarte algo a
        la medida por WhatsApp.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href={onClearHref} className="btn-primary justify-center">
          Ver todas las propiedades
        </Link>
        <a
          href="https://wa.me/5213313013253?text=Hola%2C%20busco%20una%20propiedad%20y%20no%20la%20encontr%C3%A9%20en%20su%20cat%C3%A1logo"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline text-center"
        >
          Cuéntanos qué buscas
        </a>
      </div>
    </div>
  );
}
