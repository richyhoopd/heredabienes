'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { enviarSolicitud, OPCIONES_EXPERIENCIA } from '../../lib/api/solicitudes';

const FORM_VACIO = {
  nombre: '',
  telefono: '',
  email: '',
  ciudad: '',
  experiencia: '',
  mensaje: '',
  sitio_web: '', // honeypot: los humanos no lo ven ni lo llenan
};

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 font-body';

export default function FormularioAsesores() {
  const [form, setForm] = useState(FORM_VACIO);
  const [estado, setEstado] = useState('idle'); // idle | enviando | enviado | error
  const [errorMsg, setErrorMsg] = useState('');

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (estado === 'enviando') return;

    // Honeypot: si un bot llenó el campo oculto, fingimos éxito sin guardar.
    if (form.sitio_web) {
      setEstado('enviado');
      return;
    }

    setEstado('enviando');
    setErrorMsg('');
    try {
      await enviarSolicitud(form);
      setEstado('enviado');
    } catch (error) {
      setEstado('error');
      setErrorMsg(error?.message || 'No se pudo enviar la solicitud. Intenta de nuevo.');
    }
  };

  if (estado === 'enviado') {
    return (
      <div className="card p-8 text-center sm:p-12" role="status">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <CheckCircle2 size={30} className="text-primary" aria-hidden="true" />
        </div>
        <h3 className="mb-2 font-display text-2xl font-bold text-gray-900">
          Solicitud enviada
        </h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500 font-body">
          Gracias por tu interés en unirte al equipo. Revisamos cada solicitud y te contactamos
          por WhatsApp o correo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
      {/* Honeypot fuera de flujo visual y del tab order */}
      <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
        <label htmlFor="sitio_web">No llenes este campo</label>
        <input
          id="sitio_web"
          name="sitio_web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.sitio_web}
          onChange={change}
        />
      </div>

      <div>
        <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-gray-700 font-body">
          Nombre completo *
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          minLength={2}
          value={form.nombre}
          onChange={change}
          className={inputClass}
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label htmlFor="telefono" className="mb-2 block text-sm font-medium text-gray-700 font-body">
          Teléfono (WhatsApp) *
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          required
          minLength={7}
          value={form.telefono}
          onChange={change}
          className={inputClass}
          placeholder="33 0000 0000"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 font-body">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={change}
          className={inputClass}
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="ciudad" className="mb-2 block text-sm font-medium text-gray-700 font-body">
          Ciudad / zona donde trabajas
        </label>
        <input
          id="ciudad"
          name="ciudad"
          value={form.ciudad}
          onChange={change}
          className={inputClass}
          placeholder="Guadalajara, Zapopan…"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="experiencia" className="mb-2 block text-sm font-medium text-gray-700 font-body">
          Años de experiencia en bienes raíces
        </label>
        <select
          id="experiencia"
          name="experiencia"
          value={form.experiencia}
          onChange={change}
          className={`${inputClass} appearance-none`}
        >
          <option value="">Seleccionar…</option>
          {OPCIONES_EXPERIENCIA.map(({ valor, etiqueta }) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="mensaje" className="mb-2 block text-sm font-medium text-gray-700 font-body">
          Cuéntanos de ti
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          maxLength={2000}
          value={form.mensaje}
          onChange={change}
          className={`${inputClass} resize-none`}
          placeholder="Experiencia, zonas que dominas, por qué te interesa unirte…"
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={estado === 'enviando'}
          className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {estado === 'enviando' ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <Send size={18} aria-hidden="true" />
          )}
          {estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud'}
        </button>
        {estado === 'error' ? (
          <p className="mt-3 text-sm text-red-600 font-body" role="alert">
            {errorMsg}
          </p>
        ) : null}
      </div>
    </form>
  );
}
