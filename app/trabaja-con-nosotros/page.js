import FormularioAsesores from '@/components/trabaja/FormularioAsesores';

export const metadata = {
  title: 'Trabaja con nosotros | HeredaBienes',
  description:
    'Únete al equipo de asesores de HeredaBienes. Envía tu solicitud y te contactamos para platicar.',
  alternates: { canonical: '/trabaja-con-nosotros' },
  openGraph: {
    title: 'Trabaja con nosotros | HeredaBienes',
    description: 'Únete al equipo de asesores de HeredaBienes.',
    type: 'website',
    url: '/trabaja-con-nosotros',
  },
};

export default function TrabajaConNosotrosPage() {
  return (
    <main className="min-h-screen bg-gray-soft pb-20">
      {/* Encabezado */}
      <section className="bg-dark px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary font-display">
            Únete al equipo
          </span>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight text-white font-display sm:text-4xl lg:text-5xl">
            Trabaja con nosotros
          </h1>
          <p className="mx-auto max-w-xl text-base text-gray-300 font-body sm:text-lg">
            Buscamos asesores inmobiliarios con hambre de crecer. Si te interesa trabajar con un
            portafolio serio de propiedades y terrenos en Jalisco, cuéntanos de ti.
          </p>
        </div>
      </section>

      {/* Formulario */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-8 rounded-2xl bg-white p-6 shadow-xl shadow-dark/5 sm:p-10">
          <FormularioAsesores />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 font-body">
          ¿Prefieres escribirnos directo?{' '}
          <a
            href="https://wa.me/5213313013253?text=Hola%2C%20soy%20asesor%20inmobiliario%20y%20me%20interesa%20trabajar%20con%20HeredaBienes."
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary-dark"
          >
            Mándanos un WhatsApp
          </a>
        </p>
      </div>
    </main>
  );
}
