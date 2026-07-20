export default function Descripcion({ texto }) {
  const contenido = typeof texto === 'string' ? texto.trim() : '';
  if (!contenido) return null;

  const parrafos = contenido.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean);
  if (parrafos.length === 0) return null;

  return (
    <section aria-labelledby="descripcion" className="py-8">
      <h2 id="descripcion" className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        Descripción
      </h2>
      <div className="space-y-4">
        {parrafos.map((parrafo, i) => (
          <p key={i} className="text-base leading-relaxed text-gray-600 font-body">
            {parrafo}
          </p>
        ))}
      </div>
    </section>
  );
}
