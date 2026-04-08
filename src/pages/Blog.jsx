import { ArrowRight, Calendar, Clock } from "lucide-react";

const articles = [
  {
    title: "¿Qué es una sucesión intestamentaria y cómo tramitarla en Jalisco?",
    excerpt:
      "Descubre qué sucede cuando una persona fallece sin testamento y cómo puedes iniciar el proceso de sucesión intestamentaria en el estado de Jalisco.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
    category: "Sucesiones",
    date: "15 Mar 2025",
    readTime: "8 min",
  },
  {
    title: "Guía completa: Impuestos al heredar una propiedad en México 2025",
    excerpt:
      "Todo lo que necesitas saber sobre los impuestos que debes pagar al recibir una herencia inmobiliaria, incluyendo exenciones y beneficios fiscales.",
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&q=80",
    category: "Impuestos",
    date: "28 Feb 2025",
    readTime: "10 min",
  },
  {
    title: "Regularización de propiedades ejidales: todo lo que debes saber",
    excerpt:
      "Las propiedades ejidales tienen reglas especiales. Aprende cómo regularizar un terreno ejidal y convertirlo en propiedad privada legalmente.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    category: "Regularización",
    date: "14 Feb 2025",
    readTime: "7 min",
  },
  {
    title: "¿Cuánto cuesta escriturar una casa heredada en Guadalajara?",
    excerpt:
      "Desglosamos todos los costos involucrados en el proceso de escrituración de una propiedad heredada: notario, impuestos, registro y más.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
    category: "Escrituración",
    date: "3 Feb 2025",
    readTime: "6 min",
  },
  {
    title: "Cómo poner a tu nombre una propiedad sin escrituras en Jalisco",
    excerpt:
      "¿Tienes una propiedad que nunca fue escriturada? Conoce las opciones legales disponibles para formalizar tu derecho de propiedad.",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f28f96da?w=600&q=80",
    category: "Regularización",
    date: "20 Ene 2025",
    readTime: "9 min",
  },
  {
    title: "Testamento vs. intestado: diferencias y consecuencias para tus herederos",
    excerpt:
      "Conoce las diferencias fundamentales entre una sucesión testamentaria y una intestamentaria, y por qué es crucial tener un testamento actualizado.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
    category: "Legal",
    date: "8 Ene 2025",
    readTime: "7 min",
  },
];

const categoryColors = {
  Sucesiones: "bg-blue-100 text-blue-700",
  Impuestos: "bg-amber-100 text-amber-700",
  Regularización: "bg-green-100 text-green-700",
  Escrituración: "bg-purple-100 text-purple-700",
  Legal: "bg-red-100 text-red-700",
};

export default function Blog() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1600&q=80"
          alt="Blog HeredaBienes"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display mb-4">
            Blog
          </h1>
          <p className="text-lg text-gray-300 font-body max-w-2xl mx-auto">
            Artículos y guías para que entiendas tus derechos patrimoniales y tomes mejores decisiones.
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <article
                key={index}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold font-display ${
                        categoryColors[article.category] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 font-body">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 font-display leading-tight group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-body leading-relaxed mb-4">
                    {article.excerpt}
                  </p>
                  <button className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold hover:gap-3 transition-all duration-200 font-display">
                    Leer más
                    <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gray-soft">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3 font-display">
            Recibe nuestras guías por correo
          </h3>
          <p className="text-gray-500 mb-6 font-body">
            Suscríbete para recibir artículos sobre herencias, regularización y
            protección patrimonial.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-5 py-3 rounded-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body"
            />
            <button
              type="button"
              className="btn-primary whitespace-nowrap"
            >
              Suscribirme
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
