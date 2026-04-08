import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  MessageCircle,
} from "lucide-react";

const serviceOptions = [
  "Sucesión / Herencia",
  "Regularización de Propiedad",
  "Escrituración",
  "Compra / Venta de Inmueble",
  "Asesoría Patrimonial",
  "Trámites Registrales",
  "Otro",
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    servicio: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es requerido";
    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un correo válido";
    }
    if (!formData.servicio) newErrors.servicio = "Selecciona un servicio";
    if (!formData.mensaje.trim()) newErrors.mensaje = "Describe tu caso brevemente";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (submitted) {
    return (
      <section className="py-20 sm:py-24 bg-white" id="contacto">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="bg-green-50 rounded-3xl p-12 border border-green-100">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 font-display">
              ¡Gracias por contactarnos!
            </h3>
            <p className="text-gray-500 font-body text-lg">
              Te contactaremos en menos de 24 horas para revisar tu caso.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  nombre: "",
                  telefono: "",
                  email: "",
                  servicio: "",
                  mensaje: "",
                });
              }}
              className="mt-6 text-primary font-semibold hover:underline font-display"
            >
              Enviar otra consulta
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-24 bg-white" id="contacto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 font-display">
            Contacto
          </span>
          <h2 className="section-title">
            Contáctanos.{" "}
            <span className="text-primary">Tu consulta es gratuita.</span>
          </h2>
          <div className="section-divider mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-display">
                Información de contacto
              </h3>
              <div className="space-y-5">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="bg-primary-light p-2.5 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 font-display text-sm">Ubicación</p>
                    <p className="text-gray-500 font-body text-sm">Guadalajara, Jalisco</p>
                  </div>
                </a>
                <a
                  href="https://wa.me/5213313013253"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="bg-primary-light p-2.5 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Phone size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 font-display text-sm">Teléfono</p>
                    <p className="text-gray-500 font-body text-sm">+52 33 1301 3253</p>
                  </div>
                </a>
                <a
                  href="mailto:contacto@heredum.mx"
                  className="flex items-start gap-4 group"
                >
                  <div className="bg-primary-light p-2.5 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Mail size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 font-display text-sm">Correo</p>
                    <p className="text-gray-500 font-body text-sm">contacto@heredum.mx</p>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="bg-primary-light p-2.5 rounded-xl">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 font-display text-sm">Horario</p>
                    <p className="text-gray-500 font-body text-sm">Lunes a Viernes 9am – 6pm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social icons */}
            <div>
              <p className="font-semibold text-gray-900 font-display text-sm mb-3">
                Síguenos
              </p>
              <div className="flex gap-3">
                <a
                  href="https://wa.me/5213313013253"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 p-2.5 rounded-xl text-white hover:bg-green-600 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={20} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 p-2.5 rounded-xl text-white hover:bg-blue-700 transition-colors"
                  aria-label="Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-purple-600 to-pink-500 p-2.5 rounded-xl text-white hover:opacity-90 transition-opacity"
                  aria-label="Instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/5213313013253?text=Hola%2C%20quiero%20una%20consulta%20gratuita"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 hover:bg-green-100 transition-colors group"
            >
              <div className="bg-green-500 p-2.5 rounded-xl text-white">
                <MessageCircle size={24} />
              </div>
              <div>
                <p className="font-semibold text-green-800 font-display text-sm">
                  Escríbenos por WhatsApp
                </p>
                <p className="text-green-600 font-body text-xs">
                  Respuesta inmediata en horario laboral
                </p>
              </div>
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-gray-soft rounded-3xl p-6 sm:p-8 border border-gray-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-semibold text-gray-700 mb-2 font-display"
                  >
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.nombre ? "border-red-400" : "border-gray-200"
                    } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body bg-white`}
                    placeholder="Tu nombre"
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-xs mt-1 font-body">{errors.nombre}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label
                    htmlFor="telefono"
                    className="block text-sm font-semibold text-gray-700 mb-2 font-display"
                  >
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.telefono ? "border-red-400" : "border-gray-200"
                    } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body bg-white`}
                    placeholder="(33) 0000-0000"
                  />
                  {errors.telefono && (
                    <p className="text-red-500 text-xs mt-1 font-body">{errors.telefono}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2 font-display"
                  >
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.email ? "border-red-400" : "border-gray-200"
                    } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body bg-white`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 font-body">{errors.email}</p>
                  )}
                </div>

                {/* Servicio */}
                <div>
                  <label
                    htmlFor="servicio"
                    className="block text-sm font-semibold text-gray-700 mb-2 font-display"
                  >
                    Tipo de servicio *
                  </label>
                  <select
                    id="servicio"
                    name="servicio"
                    value={formData.servicio}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.servicio ? "border-red-400" : "border-gray-200"
                    } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body bg-white appearance-none`}
                  >
                    <option value="">Selecciona un servicio</option>
                    {serviceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.servicio && (
                    <p className="text-red-500 text-xs mt-1 font-body">{errors.servicio}</p>
                  )}
                </div>

                {/* Mensaje */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="mensaje"
                    className="block text-sm font-semibold text-gray-700 mb-2 font-display"
                  >
                    Describe tu caso *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows="4"
                    value={formData.mensaje}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.mensaje ? "border-red-400" : "border-gray-200"
                    } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body bg-white resize-none`}
                    placeholder="Cuéntanos brevemente tu situación..."
                  />
                  {errors.mensaje && (
                    <p className="text-red-500 text-xs mt-1 font-body">{errors.mensaje}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all duration-200 inline-flex items-center justify-center gap-2 text-lg shadow-lg shadow-primary/30 hover:shadow-xl font-display"
              >
                <Send size={20} />
                Enviar consulta
              </button>

              <p className="text-center text-xs text-gray-400 mt-4 font-body">
                Al enviar aceptas nuestro aviso de privacidad. Tu información está segura.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
