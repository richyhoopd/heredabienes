import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight, MessageCircle, Heart } from "lucide-react";

const serviceLinks = [
  { label: "Sucesiones y Herencias", href: "/servicios" },
  { label: "Regularización de Propiedades", href: "/servicios" },
  { label: "Escrituración", href: "/servicios" },
  { label: "Compra y Venta", href: "/servicios" },
  { label: "Asesoría Patrimonial", href: "/servicios" },
  { label: "Trámites Registrales", href: "/servicios" },
];

const companyLinks = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Proceso de trabajo", href: "/#proceso" },
  { label: "Testimonios", href: "/#testimonios" },
  { label: "Preguntas frecuentes", href: "/#faq" },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Col 1 - Logo */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-extrabold font-display text-white">
                HeredaBienes.
              </span>
              <br />
              <span className="text-sm text-primary font-display">
                Grupo Inmobiliario
              </span>
            </Link>
            <p className="text-gray-400 text-sm font-body leading-relaxed mb-6">
              Especialistas en regularización de propiedades, sucesiones y
              escrituración en Jalisco. Tu patrimonio en manos confiables.
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/5213313013253"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2.5 rounded-xl hover:bg-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2.5 rounded-xl hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-all"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 - Servicios */}
          <div>
            <h4 className="text-sm font-bold font-display text-white mb-5 uppercase tracking-wider">
              Servicios
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary text-sm font-body transition-colors inline-flex items-center gap-1 group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 - Empresa */}
          <div>
            <h4 className="text-sm font-bold font-display text-white mb-5 uppercase tracking-wider">
              Empresa
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary text-sm font-body transition-colors inline-flex items-center gap-1 group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 - Contacto */}
          <div>
            <h4 className="text-sm font-bold font-display text-white mb-5 uppercase tracking-wider">
              Contacto
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-white text-sm font-body transition-colors"
                >
                  <MapPin size={16} className="flex-shrink-0 mt-0.5 text-primary" />
                  Guadalajara, Jalisco
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5213313013253"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-white text-sm font-body transition-colors"
                >
                  <Phone size={16} className="flex-shrink-0 text-primary" />
                  +52 33 1301 3253
                </a>
              </li>
              <li>
                <a
                  href="mailto:heredabienes@outlook.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-white text-sm font-body transition-colors"
                >
                  <Mail size={16} className="flex-shrink-0 text-primary" />
                  heredabienes@outlook.com
                </a>
              </li>
            </ul>
            <Link
              href="/contacto"
              className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-all font-display"
            >
              Agenda consulta gratis
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs font-body text-center sm:text-left">
              © 2025 HeredaBienes. Grupo Inmobiliario. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/aviso-de-privacidad"
                className="text-gray-500 hover:text-gray-300 text-xs font-body transition-colors"
              >
                Aviso de Privacidad
              </a>
              <span className="text-gray-700 text-xs">|</span>
              <span className="text-gray-500 text-xs font-body inline-flex items-center gap-1">
                Hecho con <Heart size={12} className="text-red-500 fill-red-500" /> en Jalisco
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
