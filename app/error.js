'use client';

import { RefreshCw } from "lucide-react";

export default function Error({ error, reset }) {
  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-gray-soft py-20 sm:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="section-title">Algo salió mal</h1>
        <div className="section-divider" />
        <p className="section-subtitle mb-8">
          Ocurrió un error inesperado. Intenta de nuevo o escríbenos por
          WhatsApp y lo resolvemos contigo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => reset()} className="btn-primary">
            <RefreshCw size={20} />
            Reintentar
          </button>
          <a
            href="https://wa.me/5213313013253?text=Hola%2C%20tuve%20un%20error%20en%20el%20sitio"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
