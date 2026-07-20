import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Página no encontrada | HEREDABIENES. Grupo Inmobiliario",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-gray-soft py-20 sm:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-7xl sm:text-8xl font-extrabold font-display text-primary mb-4">
          404
        </p>
        <h1 className="section-title">Esta página no existe</h1>
        <div className="section-divider" />
        <p className="section-subtitle mb-8">
          Puede que el enlace esté roto o que la página se haya movido. Volvamos
          a terreno conocido.
        </p>
        <Link href="/" className="btn-primary">
          Ir al inicio
          <ArrowRight size={20} />
        </Link>
      </div>
    </main>
  );
}
