'use client';

import { registrarEvento } from '../../lib/api/eventos';

// <a> con registro de evento al click. Sustituto directo de los anchors de
// CTA en componentes de servidor (WhatsApp, tel:, mailto:).
export default function TrackedLink({ evento, propertyId, detalle, children, ...rest }) {
  return (
    <a {...rest} onClick={() => registrarEvento(evento, { propertyId, detalle })}>
      {children}
    </a>
  );
}
