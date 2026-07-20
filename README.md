# HEREDABIENES. Grupo Inmobiliario

Sitio institucional. Next.js 15 (App Router), React 19, Tailwind CSS 3.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint con `next/core-web-vitals` |
| `npm test` | Tests con Vitest (una pasada) |
| `npm run test:watch` | Tests en modo watch |

## Estructura

```
app/            rutas del App Router (layout, page, not-found, error, globals.css)
components/     componentes compartidos (.jsx)
public/         assets estáticos servidos desde /
```

## Convenciones

- Componentes con estado, efectos o handlers llevan `'use client';` como primera línea.
- Navegación interna con `next/link` (`href`), nunca `react-router-dom`.
- Imports absolutos con el alias `@/` (configurado en `jsconfig.json`).
- Las imágenes remotas usan `<img>` nativo por ahora; `images.remotePatterns` en `next.config.js` ya permite `images.unsplash.com` para una migración futura a `next/image`.

## Contacto (fuente de verdad)

- WhatsApp: https://wa.me/5213313013253
- Correo: heredabienes@outlook.com
