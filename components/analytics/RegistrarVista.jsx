'use client';

import { useEffect } from 'react';
import { registrarVistaUnaVez } from '../../lib/api/eventos';

// Se monta en la página de detalle (que es ISR/estática) para registrar la
// vista desde el navegador real, no desde el prerender del servidor.
export default function RegistrarVista({ propertyId }) {
  useEffect(() => {
    if (propertyId) registrarVistaUnaVez(propertyId);
  }, [propertyId]);

  return null;
}
