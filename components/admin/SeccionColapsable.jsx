"use client";

import { useEffect, useState } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

export default function SeccionColapsable({
  titulo,
  descripcion,
  Icono,
  abiertaInicial = true,
  hayError = false,
  children,
}) {
  const [abierta, setAbierta] = useState(abiertaInicial);

  // Si aparece un error dentro, la sección se abre sola.
  useEffect(() => {
    if (hayError) setAbierta(true);
  }, [hayError]);

  return (
    <section className="bg-white rounded-2xl shadow-md overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-soft/60"
      >
        {Icono && (
          <span className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <Icono className="w-4 h-4 text-primary" />
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block font-display font-bold text-dark">{titulo}</span>
          {descripcion && (
            <span className="block text-xs text-gray-400">{descripcion}</span>
          )}
        </span>
        {hayError && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
        <ChevronDown
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
            abierta ? "rotate-180" : ""
          }`}
        />
      </button>
      {abierta && (
        <div className="px-5 pb-6 pt-1 border-t border-gray-100">{children}</div>
      )}
    </section>
  );
}
