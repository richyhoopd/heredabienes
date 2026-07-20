# Catálogo de propiedades Heredabienes — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar heredabienes a Next.js 15 y construir un catálogo de propiedades sobre Supabase, con páginas públicas compartibles por WhatsApp y un panel admin para el staff.

**Architecture:** Next.js 15 App Router in-place en el repo actual. Las páginas públicas son Server Components que consultan Supabase en el servidor, lo que permite emitir OG tags reales por propiedad con `generateMetadata()`. El admin son Client Components con sesión de Supabase Auth. No hay API routes propias: Supabase es el backend y RLS es la autorización.

**Tech Stack:** Next.js 15 (App Router) · React 19 · Tailwind CSS 3.4 · lucide-react · @supabase/supabase-js + @supabase/ssr · Vitest · JavaScript (sin TypeScript).

**Spec:** `docs/superpowers/specs/2026-07-20-catalogo-propiedades-design.md`

## Global Constraints

- **JavaScript, no TypeScript.** Extensiones `.js` / `.jsx`. Nada de anotaciones de tipo.
- **Node v25.2.1.** Directorio de trabajo: `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes`.
- **Identidad git:** `richyhoopd <theilluminatiduck@gmail.com>` (personal). Verificar con `git config user.email` antes del primer commit.
- **Runner de tests:** Vitest. Se instala y configura una sola vez en la Tarea 1.12; las fases posteriores solo agregan archivos de test.
- **Paleta Tailwind (no inventar colores):** `primary` `#0098FF` · `primary-dark` `#007ACC` · `primary-light` `#E6F4FF` · `dark` `#0A1628` · `gray-soft` `#F4F8FF`. Fuentes `font-display` (Plus Jakarta Sans) y `font-body` (DM Sans).
- **Clases reutilizables en `app/globals.css`:** `.section-title` `.section-subtitle` `.section-divider` `.btn-primary` `.btn-outline` `.btn-outline-white` `.card`.
- **Contacto real de la empresa:** WhatsApp `https://wa.me/5213313013253` · email `heredabienes@outlook.com`. Los datos `+52-33-1234-5678` y `hola@heredabienes.com` que hay en `public/index.html` son placeholders y se corrigen en la Fase 1.
- **Variables de entorno:** `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. `.env.local` va en `.gitignore`. Nunca commitear secretos. No se usa service-role key en ningún punto del proyecto.
- **La seguridad real es RLS**, no el middleware ni la ruta oscura del admin. El middleware solo esconde la interfaz.
- **Inyección del cliente de Supabase (regla que cruza fases 2, 3 y 4).** Las funciones de `lib/api/properties.js` reciben un cliente opcional como último argumento y, si se omite, caen al cliente de navegador. Por lo tanto:
  - **Todo Server Component, `generateMetadata`, `generateStaticParams` y Server Action DEBE inyectarlo:** `const supabase = await createServerSupabase()` y pasarlo. **Ojo: la forma de pasarlo NO es uniforme** — en las funciones que reciben un objeto de opciones, `client` va *dentro* del objeto; en las demás es el último argumento posicional:

    | Función | Cómo se inyecta |
    |---|---|
    | `listProperties` | `listProperties({ ...filtros, client: supabase })` |
    | `listRelatedProperties` | `listRelatedProperties({ id, municipio, tipoInmueble, limit, client: supabase })` |
    | `getPropertyBySlug` | `getPropertyBySlug(slug, supabase)` |
    | `getPropertyById` | `getPropertyById(id, supabase)` |
    | `listFeaturedProperties` | `listFeaturedProperties(limit, supabase)` |
    | `listMunicipios` | `listMunicipios(supabase)` |
  - **Los Client Components lo omiten** — el cliente de navegador ya lleva la sesión, que es lo que `includeUnpublished` necesita en el admin.
  - Omitirlo en el servidor no siempre revienta: los reads públicos parecen funcionar y `includeUnpublished` devuelve vacío **en silencio**. Por eso la regla es explícita y no negociable: si el archivo no lleva `'use client'`, inyecta el cliente.
- **Nombres de columna en español snake_case** en Postgres, mapeados a camelCase en el frontend con `fromRow`/`toRow`.
- **Propiedad de referencia para toda verificación:** terreno en Colonia Seattle, Zapopan, Jalisco — `$38,000,000 MXN`, Calle 10 #66, medidas norte `46.00 m`, sur `36.00 m + quiebre de 10.00 m`, oriente `35.00 m`, poniente `33.00 m`.
- **Commits frecuentes**, uno por tarea, en español, con el prefijo que indica cada fase (`[MIGRA]`, `[DATA]`, `[PROP]`, `[ADMIN]`).
- **Orden de ejecución:** las fases son secuenciales. No empezar una fase sin que la verificación de la anterior pase.

---
## FASE 1 — Migración a Next.js

**Objetivo:** convertir el proyecto Create React App a Next.js 15 App Router *in-place*, conservando las 5 rutas (`/`, `/servicios`, `/nosotros`, `/blog`, `/contacto`) con render pixel-idéntico. Los 13 componentes vivos se mueven con `git mv` (preserva historial) y se editan quirúrgicamente: solo cambian imports de `react-router-dom`, la prop `to` → `href`, y se añade `'use client'` donde hay hooks. No se agrega ninguna funcionalidad nueva. `src/`, `ScrollToTop.jsx`, `ServicesGrid.jsx` y `public/index.html` desaparecen al final.

**Verificación de la fase:**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm run build
```

Esperado (últimas líneas):

```
 ✓ Compiled successfully
 ✓ Generating static pages (8/8)

Route (app)                              Size  First Load JS
┌ ○ /                                    ...
├ ○ /_not-found                          ...
├ ○ /blog                                ...
├ ○ /contacto                            ...
├ ○ /nosotros                            ...
└ ○ /servicios                           ...

○  (Static)  prerendered as static content
```

Cero ocurrencias de `react-router-dom` en el repo, cero archivos bajo `src/`, y `npm test` verde.

---

### Riesgos de la migración (leer antes de empezar)

| # | Riesgo | Mitigación (implementada en las tareas de abajo) |
|---|---|---|
| R1 | **`StatsBar.jsx` NO estaba en la lista de "componentes con estado" del brief, pero SÍ usa `useState`, `useEffect`, `useRef` e `IntersectionObserver`** (líneas 12-16 y 33-46). Sin `'use client'` el build falla con `You're importing a component that needs useState`. | Tarea 1.7 lo incluye explícitamente. Son **7** client components, no 6. |
| R2 | Migrar a `next/image` en la misma fase rompería los ~34 hotlinks de Unsplash (aspect ratios, `fill`, `sizes`, LCP). | **Decisión explícita: se mantienen los `<img>` nativos tal cual en toda la Fase 1.** `next.config.js` incluye `images.remotePatterns` para `images.unsplash.com` solo para dejar el terreno listo, pero no se usa `next/image` en esta fase. La migración a `next/image` se difiere a una fase posterior. |
| R3 | Migrar a `next/font/google` cambia el `font-display`, el FOUT y el fallback métrico → riesgo de diferencias visuales sutiles. | **Decisión explícita: se conservan los `<link>` de Google Fonts literales de `public/index.html` dentro de `<head>` en `app/layout.js`.** `next/font` se difiere. |
| R4 | `useLocation()` devuelve un objeto (nueva referencia en cada navegación); `usePathname()` devuelve un string. El `useEffect` de Navbar que cierra el menú móvil depende de eso. | Tarea 1.7 cambia la dependencia `[location]` → `[pathname]`; el comportamiento es equivalente porque las 5 rutas tienen pathname distinto. |
| R5 | Los links `/#proceso`, `/#testimonios`, `/#faq` del Footer (`companyLinks`) dependen de anclas que solo existen en Home (`id="proceso"` en ProcessSteps:49, `id="testimonios"` en Testimonials:48, `id="faq"` en FAQSection:56). Next hace scroll a hash igual que RRD. | Tarea 1.6 los conserva idénticos; Tarea 1.13 los verifica manualmente. |
| R6 | Al quitar `react-scripts` se pierde `npm test` (aunque hoy no hay ni un solo archivo de test en `src/`). | Tarea 1.12 deja Vitest funcionando con un smoke test real. |
| R7 | `ContactForm` renderiza `id="contacto"` en dos ramas (líneas 68 y 102) y **está incluido tanto en Home como en Contacto** → IDs duplicados si ambas se montan. Ya pasaba en CRA. | Se documenta, **no se corrige en esta fase** (paridad 1:1). |
| R8 | Regresión visual invisible al ojo. | Tarea 1.1 captura screenshots de referencia con el CRA **antes** de tocar nada; Tarea 1.13 compara. |

---

### Tarea 1.1: Rama de trabajo y baseline visual

**Archivos:**
- Crear: ninguno en el repo (screenshots fuera del repo)
- Modificar: ninguno
- Eliminar: ninguno

**Interfaces:**
- Consume: proyecto CRA en estado `56d4f6c`
- Produce: rama `migra/nextjs` + 10 screenshots de referencia en `~/Desktop/baseline-cra/`

- [ ] **Paso 1: Confirmar árbol limpio y crear rama**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git status --short
git checkout -b migra/nextjs
```

Esperado:
```
Switched to a new branch 'migra/nextjs'
```
Si `git status --short` imprime algo distinto de vacío, commitear o stashear antes de continuar.

- [ ] **Paso 2: Levantar el CRA actual**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm start
```

Esperado: `Compiled successfully!` y `Local: http://localhost:3000`.

- [ ] **Paso 3: Capturar baseline visual**

Con el navegador en `http://localhost:3000`, capturar **screenshot de página completa** de las 5 rutas en dos anchos y guardarlas en `~/Desktop/baseline-cra/`:

```
desktop-1440-home.png       mobile-390-home.png
desktop-1440-servicios.png  mobile-390-servicios.png
desktop-1440-nosotros.png   mobile-390-nosotros.png
desktop-1440-blog.png       mobile-390-blog.png
desktop-1440-contacto.png   mobile-390-contacto.png
```

En mobile-390, abrir además el menú hamburguesa antes de capturar Home.

- [ ] **Paso 4: Detener el dev server**

`Ctrl+C` en la terminal de `npm start`.

- [ ] **Paso 5: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git commit --allow-empty -m "[MIGRA] inicia rama de migracion a Next.js 15 App Router"
```

---

### Tarea 1.2: Swap de dependencias (CRA → Next 15)

**Archivos:**
- Modificar: `package.json`, `package-lock.json`

**Interfaces:**
- Consume: `package.json` con `react-scripts@5.0.1`, `react-router-dom@^7.14.0`
- Produce: `package.json` con `next@^15`, sin `react-scripts`, sin `react-router-dom`, sin `web-vitals`; scripts `dev/build/start/lint`

- [ ] **Paso 1: Desinstalar todo lo de CRA y react-router**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
npm uninstall react-scripts react-router-dom web-vitals @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event
```

Esperado: `removed NNN packages` (aprox. 1300+), sin errores.
(`web-vitals` y `@testing-library/*` se desinstalan porque **no hay ni un solo import de ellos** en `src/` — no existen `setupTests.js`, `reportWebVitals.js` ni archivos `.test.js`. Testing Library se reinstala como devDependency en la Tarea 1.12.)

- [ ] **Paso 2: Instalar Next 15 y ESLint**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
npm install next@^15
npm install -D eslint@^9 eslint-config-next@^15 @eslint/eslintrc
```

Esperado: `added NNN packages` y `npx next --version` imprime `Next.js v15.x.x`.

- [ ] **Paso 3: Verificar compatibilidad Node**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && node -v && npx next --version
```

Esperado:
```
v25.2.1
Next.js v15.5.x
```
Next 15 requiere Node `>= 20`; Node 25.2.1 cumple.

- [ ] **Paso 4: Reescribir el bloque `scripts` y borrar `eslintConfig` + `browserslist` de `package.json`**

Reemplazar en `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/package.json` los bloques `"scripts"`, `"eslintConfig"` y `"browserslist"` por únicamente:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
```

`eslintConfig` (que extendía `react-app`/`react-app/jest`, provisto por `react-scripts`) y `browserslist` (consumido solo por Babel/CRA) se eliminan por completo: Next usa SWC y su propio target de browsers.

- [ ] **Paso 5: Verificar que package.json es JSON válido**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && node -e "const p=require('./package.json');console.log(Object.keys(p.scripts).join(','));console.log('rrd:',!!p.dependencies['react-router-dom'],'cra:',!!p.dependencies['react-scripts'])"
```

Esperado:
```
dev,build,start,lint,test,test:watch
rrd: false cra: false
```

- [ ] **Paso 6: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add package.json package-lock.json
git commit -m "[MIGRA] reemplaza react-scripts y react-router-dom por next 15"
```

---

### Tarea 1.3: Archivos de configuración de Next

**Archivos:**
- Crear: `next.config.js`, `jsconfig.json`, `eslint.config.mjs`
- Modificar: `tailwind.config.js`, `.gitignore`
- Eliminar: ninguno

**Interfaces:**
- Consume: `tailwind.config.js` actual (tema intacto), `postcss.config.js` actual (se conserva sin cambios)
- Produce: alias `@/*` resolviendo desde la raíz; `images.remotePatterns` para `images.unsplash.com`

- [ ] **Paso 1: Crear `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Preparado para una fase posterior. En FASE 1 seguimos usando <img> nativo
    // en los ~34 hotlinks de Unsplash para no alterar el layout actual.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Paso 2: Crear `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/jsconfig.json`**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "jsx": "preserve",
    "checkJs": false
  },
  "include": ["app/**/*", "components/**/*", "*.js", "*.mjs"],
  "exclude": ["node_modules", ".next"]
}
```

- [ ] **Paso 3: Crear `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/eslint.config.mjs`**

```js
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [".next/**", "node_modules/**", "out/**"],
  },
  {
    rules: {
      // En FASE 1 mantenemos <img> nativo a proposito (ver riesgo R2).
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
```

- [ ] **Paso 4: Cambiar SOLO la línea `content` de `tailwind.config.js`**

En `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/tailwind.config.js`, línea 3, reemplazar:

```js
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
```

por:

```js
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
```

**Nada más de este archivo se toca**: `colors` (primary `#0098FF`, primary-dark `#007ACC`, primary-light `#E6F4FF`, dark `#0A1628`, gray-soft `#F4F8FF`), `fontFamily` (display Plus Jakarta Sans, body DM Sans), `animation` y `keyframes` (fadeUp/fadeIn/slideDown) quedan idénticos. `postcss.config.js` no se toca: Next consume `postcss.config.js` con el mismo formato que CRA.

- [ ] **Paso 5: Añadir entradas de Next a `.gitignore`**

Reemplazar el bloque `# production` de `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/.gitignore`:

```
# production
/build
```

por:

```
# next.js
/.next/
/out/
next-env.d.ts

# vercel
.vercel
```

- [ ] **Paso 6: Verificar el config de Next**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && node -e "const c=require('./next.config.js');console.log(c.images.remotePatterns[0].hostname)"
```

Esperado:
```
images.unsplash.com
```

- [ ] **Paso 7: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add next.config.js jsconfig.json eslint.config.mjs tailwind.config.js .gitignore
git commit -m "[MIGRA] agrega next.config, jsconfig, eslint flat config y ajusta tailwind content"
```

---

### Tarea 1.4: Estilos globales y layout raíz

**Archivos:**
- Crear: `app/layout.js`
- Modificar: `public/manifest.json`
- Eliminar: ninguno todavía (`src/index.css` se mueve con `git mv`)

**Interfaces:**
- Consume: `src/index.css`, `public/index.html` (metas, fuentes, JSON-LD)
- Produce: `app/globals.css`, `app/layout.js` con `metadata`, `viewport`, fuentes y JSON-LD **con los contactos reales**

- [ ] **Paso 1: Crear el directorio `app/` y mover el CSS global preservando historial**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
mkdir -p app
git mv src/index.css app/globals.css
git status --short
```

Esperado:
```
R  src/index.css -> app/globals.css
```

El contenido de `app/globals.css` **no se modifica en absoluto**: quedan las 3 directivas `@tailwind`, el `* { scroll-behavior: smooth }`, `body`, `h1-h6`, el `@layer components` con `.section-title .section-subtitle .section-divider .btn-primary .btn-outline .btn-outline-white .card`, el scrollbar `::-webkit-scrollbar*` y `.animate-on-scroll`.

- [ ] **Paso 2: Crear `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/app/layout.js`**

Nota sobre los datos: el JSON-LD de `public/index.html` traía `"telephone": "+52-33-1234-5678"` y `"email": "hola@heredabienes.com"`, **ambos placeholders falsos** que contradicen los datos reales usados en `Navbar.jsx:77`, `Footer.jsx:145,156`, `ContactForm.jsx:139,153,183,220`, `CTABanner.jsx:50`, `SolutionsMap.jsx:361` y `WhyUs.jsx:94`: WhatsApp `https://wa.me/5213313013253` y correo `heredabienes@outlook.com`. Se corrigen aquí.

```jsx
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  metadataBase: new URL("https://heredabienes.com"),
  title:
    "HEREDABIENES. Grupo Inmobiliario | Regularización de Propiedades, Sucesiones y Escrituración en Jalisco",
  description:
    "HEREDABIENES Grupo Inmobiliario — Especialistas en regularización de propiedades heredadas, sucesiones testamentarias e intestamentarias, escrituración y gestión patrimonial en Guadalajara, Jalisco. Consulta gratuita. Tu patrimonio, en manos confiables.",
  keywords: [
    "regularización de propiedades",
    "sucesiones",
    "herencias",
    "escrituración",
    "gestión patrimonial",
    "Jalisco",
    "Guadalajara",
    "propiedades heredadas",
    "intestado",
    "testamento",
    "registro público de la propiedad",
    "avalúos",
    "notario",
    "HEREDABIENES",
  ],
  authors: [{ name: "HEREDABIENES. Grupo Inmobiliario" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://heredabienes.com" },
  manifest: "/manifest.json",
  icons: {
    icon: "/iconblue.png",
    shortcut: "/iconblue.png",
    apple: "/iconblue.png",
  },
  other: {
    "geo.region": "MX-JAL",
    "geo.placename": "Guadalajara, Jalisco, México",
    language: "es",
  },
  openGraph: {
    type: "website",
    siteName: "HEREDABIENES. Grupo Inmobiliario",
    title:
      "HEREDABIENES. Grupo Inmobiliario — Tu patrimonio, en manos confiables.",
    description:
      "Regularizamos, escrituramos y protegemos tu herencia en Jalisco. Más de 500 familias atendidas. Sucesiones, regularización de propiedades y asesoría patrimonial. Consulta gratuita.",
    url: "https://heredabienes.com",
    locale: "es_MX",
    images: [
      {
        url: "https://heredabienes.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "HEREDABIENES Grupo Inmobiliario — Regularización de propiedades y sucesiones en Jalisco",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "HEREDABIENES. Grupo Inmobiliario — Tu patrimonio, en manos confiables.",
    description:
      "Regularizamos, escrituramos y protegemos tu herencia en Jalisco. Consulta gratuita. +500 familias atendidas.",
    images: [
      {
        url: "https://heredabienes.com/og-image.png",
        alt: "HEREDABIENES Grupo Inmobiliario",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0098FF",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "HEREDABIENES. Grupo Inmobiliario",
  description:
    "Especialistas en regularización de propiedades heredadas, sucesiones, escrituración y gestión patrimonial en Jalisco, México.",
  url: "https://heredabienes.com",
  logo: "https://heredabienes.com/iconblue.png",
  image: "https://heredabienes.com/og-image.png",
  telephone: "+52-1-33-1301-3253",
  email: "heredabienes@outlook.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Guadalajara",
    addressRegion: "Jalisco",
    addressCountry: "MX",
  },
  areaServed: { "@type": "State", name: "Jalisco" },
  sameAs: [
    "https://wa.me/5213313013253",
    "https://facebook.com/heredabienes",
    "https://instagram.com/heredabienes",
  ],
  openingHours: "Mo-Fr 09:00-18:00",
  priceRange: "$$",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Se conservan los <link> literales de public/index.html en lugar de
            next/font para no alterar el FOUT ni las metricas de fallback (riesgo R3). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

`ScrollToTop` **no se porta**: el App Router de Next restaura/resetea el scroll en cada navegación por defecto.

- [ ] **Paso 3: Corregir `public/manifest.json` (traía los valores de ejemplo de CRA)**

Reemplazar todo el contenido de `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/public/manifest.json` por:

```json
{
  "short_name": "HEREDABIENES",
  "name": "HEREDABIENES. Grupo Inmobiliario",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "/logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0098FF",
  "background_color": "#ffffff",
  "lang": "es-MX"
}
```

- [ ] **Paso 4: Verificar JSON**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && node -e "const m=require('./public/manifest.json');console.log(m.short_name, m.theme_color)"
```

Esperado:
```
HEREDABIENES #0098FF
```

- [ ] **Paso 5: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add app/globals.css app/layout.js public/manifest.json
git commit -m "[MIGRA] agrega app/layout.js con metadata, fuentes y JSON-LD con contactos reales"
```

---

### Tarea 1.5: Mover los 13 componentes vivos con `git mv`

**Archivos:**
- Modificar (mover): `src/components/*.jsx` → `components/*.jsx` (13 archivos)
- Eliminar: `src/components/ScrollToTop.jsx`, `src/components/ServicesGrid.jsx`

**Interfaces:**
- Consume: `src/components/` (14 archivos)
- Produce: `components/` con 13 archivos, aún sin editar (siguen importando `react-router-dom`)

- [ ] **Paso 1: Mover los 13 componentes vivos**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
mkdir -p components
for f in Navbar Footer SolutionsMap Testimonials FAQSection ContactForm HeroCarousel StatsBar PainPoints ProcessSteps WhyUs CTABanner; do git mv "src/components/$f.jsx" "components/$f.jsx"; done
ls components
```

Esperado:
```
CTABanner.jsx	FAQSection.jsx	Footer.jsx	HeroCarousel.jsx	Navbar.jsx	PainPoints.jsx	ProcessSteps.jsx	SolutionsMap.jsx	StatsBar.jsx	Testimonials.jsx	WhyUs.jsx	ContactForm.jsx
```

- [ ] **Paso 2: Eliminar los dos componentes muertos**

`ServicesGrid.jsx` (159 líneas) no lo importa **nadie** — solo `Home.jsx` importa componentes y no lo incluye. `ScrollToTop.jsx` queda obsoleto por el scroll restoration nativo de Next.

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git rm src/components/ServicesGrid.jsx src/components/ScrollToTop.jsx
ls src/components 2>&1
```

Esperado:
```
ls: src/components: No such file or directory
```

- [ ] **Paso 3: Confirmar que nada quedaba referenciando lo borrado**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && grep -rn "ServicesGrid\|ScrollToTop" src app components 2>/dev/null; echo "exit=$?"
```

Esperado:
```
exit=1
```
(`exit=1` significa cero coincidencias — no queda ninguna referencia.)

- [ ] **Paso 4: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add -A components src
git commit -m "[MIGRA] mueve los 13 componentes vivos a components/ y elimina ServicesGrid y ScrollToTop"
```

---

### Tarea 1.6: Portar los componentes de servidor con `<Link>` (Footer, CTABanner, PainPoints)

**Archivos:**
- Modificar: `components/Footer.jsx`, `components/CTABanner.jsx`, `components/PainPoints.jsx`

**Interfaces:**
- Consume: componentes que importan `Link` de `react-router-dom` y usan la prop `to`
- Produce: los mismos componentes usando `next/link` con prop `href`, **sin** `'use client'` (no tienen hooks ni handlers → siguen siendo Server Components)

- [ ] **Paso 1: `components/CTABanner.jsx` — 2 cambios**

Línea 1, reemplazar:
```jsx
import { Link } from "react-router-dom";
```
por:
```jsx
import Link from "next/link";
```

Línea 43, reemplazar:
```jsx
              to="/contacto"
```
por:
```jsx
              href="/contacto"
```

La línea 50 (`href="https://wa.me/5213313013253?text=..."`) es un `<a>` externo: **no se toca**. Las 3 `<svg>` decorativas, los textos "¿Tu propiedad tiene una historia sin resolver?" y "Escríbenos por WhatsApp" quedan idénticos.

- [ ] **Paso 2: `components/PainPoints.jsx` — 2 cambios**

Línea 1, reemplazar:
```jsx
import { Link } from "react-router-dom";
```
por:
```jsx
import Link from "next/link";
```

Línea 66, reemplazar:
```jsx
                  to="/servicios"
```
por:
```jsx
                  href="/servicios"
```

Los 2 hotlinks de Unsplash de este archivo quedan como `<img>` nativos, sin cambios.

- [ ] **Paso 3: `components/Footer.jsx` — import**

Línea 1, reemplazar:
```jsx
import { Link } from "react-router-dom";
```
por:
```jsx
import Link from "next/link";
```

Línea 2 (`import { MapPin, Phone, Mail, ArrowRight, MessageCircle, Heart } from "lucide-react";`) **no se toca**.

- [ ] **Paso 4: `components/Footer.jsx` — renombrar la clave `to` → `href` en los dos arrays de datos**

Líneas 4-11, reemplazar:
```jsx
const serviceLinks = [
  { label: "Sucesiones y Herencias", to: "/servicios" },
  { label: "Regularización de Propiedades", to: "/servicios" },
  { label: "Escrituración", to: "/servicios" },
  { label: "Compra y Venta", to: "/servicios" },
  { label: "Asesoría Patrimonial", to: "/servicios" },
  { label: "Trámites Registrales", to: "/servicios" },
];
```
por:
```jsx
const serviceLinks = [
  { label: "Sucesiones y Herencias", href: "/servicios" },
  { label: "Regularización de Propiedades", href: "/servicios" },
  { label: "Escrituración", href: "/servicios" },
  { label: "Compra y Venta", href: "/servicios" },
  { label: "Asesoría Patrimonial", href: "/servicios" },
  { label: "Trámites Registrales", href: "/servicios" },
];
```

Líneas 13-20, reemplazar:
```jsx
const companyLinks = [
  { label: "Nosotros", to: "/nosotros" },
  { label: "Proceso de trabajo", to: "/#proceso" },
  { label: "Testimonios", to: "/#testimonios" },
  { label: "Preguntas frecuentes", to: "/#faq" },
  { label: "Blog", to: "/blog" },
  { label: "Contacto", to: "/contacto" },
];
```
por:
```jsx
const companyLinks = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Proceso de trabajo", href: "/#proceso" },
  { label: "Testimonios", href: "/#testimonios" },
  { label: "Preguntas frecuentes", href: "/#faq" },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
];
```

Los hashes `/#proceso`, `/#testimonios`, `/#faq` se conservan tal cual: `next/link` hace scroll al ancla igual que react-router.

- [ ] **Paso 5: `components/Footer.jsx` — las 4 props `to` en el JSX**

Línea 30, reemplazar `<Link to="/" className="inline-block mb-4">` por:
```jsx
            <Link href="/" className="inline-block mb-4">
```

Línea 89, reemplazar `                    to={link.to}` por:
```jsx
                    href={link.href}
```

Línea 112, reemplazar `                    to={link.to}` por:
```jsx
                    href={link.href}
```

Línea 165, reemplazar `              to="/contacto"` por:
```jsx
              href="/contacto"
```

Los `<a>` de las líneas 45 (`https://wa.me/5213313013253`), 145 (WhatsApp) y 156 (`mailto:heredabienes@outlook.com`) **no se tocan**.

- [ ] **Paso 6: Verificar que estos 3 archivos ya no referencian react-router**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && grep -n "react-router-dom\|link.to\| to=" components/Footer.jsx components/CTABanner.jsx components/PainPoints.jsx; echo "exit=$?"
```

Esperado:
```
exit=1
```

- [ ] **Paso 7: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add components/Footer.jsx components/CTABanner.jsx components/PainPoints.jsx
git commit -m "[MIGRA] Footer, CTABanner y PainPoints usan next/link con href"
```

---

### Tarea 1.7: Portar los 7 Client Components

**Archivos:**
- Modificar: `components/Navbar.jsx`, `components/HeroCarousel.jsx`, `components/StatsBar.jsx`, `components/Testimonials.jsx`, `components/FAQSection.jsx`, `components/SolutionsMap.jsx`, `components/ContactForm.jsx`

**Interfaces:**
- Consume: componentes con `useState` / `useEffect` / `useRef` / handlers
- Produce: los mismos con `'use client';` como primera línea; Navbar además migra `useLocation` → `usePathname`

- [ ] **Paso 1: `components/Navbar.jsx` — imports**

Reemplazar las líneas 1-3:
```jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
```
por:
```jsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle } from "lucide-react";
```

- [ ] **Paso 2: `components/Navbar.jsx` — array `navLinks`**

Líneas 5-11, reemplazar:
```jsx
const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/servicios", label: "Servicios" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/blog", label: "Blog" },
  { to: "/contacto", label: "Contacto" },
];
```
por:
```jsx
const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];
```

- [ ] **Paso 3: `components/Navbar.jsx` — `useLocation` → `usePathname`**

Línea 16, reemplazar:
```jsx
  const location = useLocation();
```
por:
```jsx
  const pathname = usePathname();
```

Líneas 26-28, reemplazar:
```jsx
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
```
por:
```jsx
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
```

El `useEffect` de scroll (líneas 18-24, `window.addEventListener("scroll", ...)` con `setScrolled(window.scrollY > 20)`) **no se toca**: ya está dentro de un client component.

- [ ] **Paso 4: `components/Navbar.jsx` — las 5 apariciones de `<Link>` y las 2 de `location.pathname`**

Línea 41, reemplazar `<Link to="/" className="flex items-center gap-2.5">` por:
```jsx
          <Link href="/" className="flex items-center gap-2.5">
```
(El `<img src="/iconblue.png" alt="HEREDABIENES Logo" className="h-10 w-10 object-contain" />` de la línea 43 **se mantiene como `<img>` nativo**; `/iconblue.png` sigue sirviéndose desde `public/`.)

Bloque desktop, líneas 60-64, reemplazar:
```jsx
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium font-body transition-all duration-200 ${
                  location.pathname === link.to
```
por:
```jsx
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium font-body transition-all duration-200 ${
                  pathname === link.href
```

Líneas 85-86, reemplazar:
```jsx
            <Link
              to="/contacto"
```
por:
```jsx
            <Link
              href="/contacto"
```

Bloque móvil, líneas 111-115, reemplazar:
```jsx
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-3 rounded-lg text-sm font-medium font-body transition-all duration-200 ${
                  location.pathname === link.to
```
por:
```jsx
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-lg text-sm font-medium font-body transition-all duration-200 ${
                  pathname === link.href
```

Líneas 133-134, reemplazar:
```jsx
              <Link
                to="/contacto"
```
por:
```jsx
              <Link
                href="/contacto"
```

Los `<a href="https://wa.me/5213313013253">` de las líneas 77 y 125 **no se tocan**.

- [ ] **Paso 5: `components/HeroCarousel.jsx` — imports**

Reemplazar las líneas 1-3:
```jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle } from "lucide-react";
```
por:
```jsx
'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle } from "lucide-react";
```

- [ ] **Paso 6: `components/HeroCarousel.jsx` — las 2 props `to`**

Las claves `ctaLink` del array `slides` (líneas 11, 18, 25, 32, 39 — valores `/contacto`, `/servicios`, `/contacto`, `/contacto`, `/servicios`) **no cambian de nombre**; solo cambia cómo se consumen.

Línea 142, reemplazar:
```jsx
                  to={slide.ctaLink}
```
por:
```jsx
                  href={slide.ctaLink}
```

Línea 149, reemplazar:
```jsx
                  to="/nosotros"
```
por:
```jsx
                  href="/nosotros"
```

Los 5 hotlinks de Unsplash de este archivo siguen siendo `<img>` nativos. Los handlers `handleManualNav` de las líneas 170, 177 y 189 y el `useEffect` de autoplay (línea 67) quedan igual.

- [ ] **Paso 7: `components/StatsBar.jsx` — solo `'use client'`**

**Este archivo NO estaba marcado como stateful en el brief pero lo es** (`useEffect, useRef, useState` en línea 1; `IntersectionObserver` y `requestAnimationFrame` en el contador animado). Sin la directiva, `npm run build` falla.

Insertar antes de la línea 1 actual (`import { useEffect, useRef, useState } from "react";`):
```jsx
'use client';

```
No hay ningún otro cambio en el archivo: no importa `react-router-dom`.

- [ ] **Paso 8: `components/Testimonials.jsx` — solo `'use client'`**

Insertar antes de la línea 1 actual (`import { useState, useEffect, useCallback } from "react";`):
```jsx
'use client';

```
No importa `react-router-dom` (solo `lucide-react`: `ChevronLeft, ChevronRight, Star, Quote`). El `id="testimonios"` de la línea 48 se conserva (lo usa el Footer).

- [ ] **Paso 9: `components/FAQSection.jsx` — solo `'use client'`**

Insertar antes de la línea 1 actual (`import { useState } from "react";`):
```jsx
'use client';

```
Conserva la prop `limit` (línea 47) y el `id="faq"` de la línea 56.

- [ ] **Paso 10: `components/SolutionsMap.jsx` — solo `'use client'`**

Insertar antes de la línea 1 actual (`import { useState } from "react";`):
```jsx
'use client';

```
No importa `react-router-dom`; el `<a href="https://wa.me/5213313013253?text=...">` de la línea 361 queda igual.

- [ ] **Paso 11: `components/ContactForm.jsx` — solo `'use client'`**

Insertar antes de la línea 1 actual (`import { useState } from "react";`):
```jsx
'use client';

```
No importa `react-router-dom`. El `handleSubmit` (línea 242), los 5 `onChange` y el botón de reset (línea 81) quedan idénticos. **Se conserva el `id="contacto"` duplicado** de las líneas 68 y 102 (paridad 1:1, ver riesgo R7).

- [ ] **Paso 12: Verificar las 7 directivas y cero react-router**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && head -1 components/*.jsx | grep -c "use client" && grep -rln "react-router-dom" components/ ; echo "rrd_exit=$?"
```

Esperado:
```
7
rrd_exit=1
```

- [ ] **Paso 13: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add components/
git commit -m "[MIGRA] marca los 7 client components y migra Navbar a usePathname"
```

---

### Tarea 1.8: Portar las 5 páginas a `app/`

**Archivos:**
- Modificar (mover): `src/pages/Home.jsx` → `app/page.js`, `src/pages/Servicios.jsx` → `app/servicios/page.js`, `src/pages/Nosotros.jsx` → `app/nosotros/page.js`, `src/pages/Blog.jsx` → `app/blog/page.js`, `src/pages/Contacto.jsx` → `app/contacto/page.js`

**Interfaces:**
- Consume: páginas que importan `../components/X`
- Produce: rutas App Router con imports `@/components/X` y `export const metadata` por ruta

- [ ] **Paso 1: Mover los 5 archivos preservando historial**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
mkdir -p app/servicios app/nosotros app/blog app/contacto
git mv src/pages/Home.jsx app/page.js
git mv src/pages/Servicios.jsx app/servicios/page.js
git mv src/pages/Nosotros.jsx app/nosotros/page.js
git mv src/pages/Blog.jsx app/blog/page.js
git mv src/pages/Contacto.jsx app/contacto/page.js
find app -name "page.js" | sort
```

Esperado:
```
app/blog/page.js
app/contacto/page.js
app/nosotros/page.js
app/page.js
app/servicios/page.js
```

- [ ] **Paso 2: `app/page.js` (Home) — reemplazar las 10 líneas de imports**

Reemplazar las líneas 1-10:
```jsx
import HeroCarousel from "../components/HeroCarousel";
import StatsBar from "../components/StatsBar";
import PainPoints from "../components/PainPoints";
import SolutionsMap from "../components/SolutionsMap";
import ProcessSteps from "../components/ProcessSteps";
import WhyUs from "../components/WhyUs";
import Testimonials from "../components/Testimonials";
import CTABanner from "../components/CTABanner";
import FAQSection from "../components/FAQSection";
import ContactForm from "../components/ContactForm";
```
por:
```jsx
import HeroCarousel from "@/components/HeroCarousel";
import StatsBar from "@/components/StatsBar";
import PainPoints from "@/components/PainPoints";
import SolutionsMap from "@/components/SolutionsMap";
import ProcessSteps from "@/components/ProcessSteps";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import CTABanner from "@/components/CTABanner";
import FAQSection from "@/components/FAQSection";
import ContactForm from "@/components/ContactForm";
```

El cuerpo (`export default function Home()` con el `<main>` y los 10 componentes en orden HeroCarousel → StatsBar → PainPoints → SolutionsMap → ProcessSteps → WhyUs → Testimonials → CTABanner → FAQSection → ContactForm) **no se toca**. El nombre `Home` del default export se conserva.

- [ ] **Paso 3: `app/servicios/page.js` — import de Link + prop `to` + metadata**

Línea 1, reemplazar:
```jsx
import { Link } from "react-router-dom";
```
por:
```jsx
import Link from "next/link";
```

Línea 14, reemplazar:
```jsx
import ContactForm from "../components/ContactForm";
```
por:
```jsx
import ContactForm from "@/components/ContactForm";
```

Línea 215, reemplazar:
```jsx
                      to="/contacto"
```
por:
```jsx
                      href="/contacto"
```

Justo antes de la línea `export default function Servicios() {` (línea 131), insertar:
```jsx
export const metadata = {
  title: "Servicios | HEREDABIENES. Grupo Inmobiliario",
  description:
    "Sucesiones y herencias, regularización de propiedades, escrituración, compra y venta, asesoría patrimonial y trámites registrales en Jalisco.",
  alternates: { canonical: "/servicios" },
};

```
Los 9 hotlinks de Unsplash del archivo siguen como `<img>`.

- [ ] **Paso 4: `app/nosotros/page.js` — import + metadata**

Línea 12, reemplazar:
```jsx
import CTABanner from "../components/CTABanner";
```
por:
```jsx
import CTABanner from "@/components/CTABanner";
```

Justo antes de `export default function Nosotros() {` (línea 42), insertar:
```jsx
export const metadata = {
  title: "Nosotros | HEREDABIENES. Grupo Inmobiliario",
  description:
    "Conoce al equipo de HEREDABIENES Grupo Inmobiliario. Más de 500 familias atendidas en Guadalajara, Jalisco.",
  alternates: { canonical: "/nosotros" },
};

```
Las imágenes locales `image: "/ceo_img.jpeg"` (línea 26) y `image: "/wanted_poster.png"` (línea 31) **no cambian**: ambos archivos ya viven en `public/` y se sirven desde la raíz igual que en CRA.

- [ ] **Paso 5: `app/blog/page.js` — solo metadata**

No importa nada de `react-router-dom` ni de `../components` (línea 1: `import { ArrowRight, Calendar, Clock } from "lucide-react";`). No tiene hooks. **No requiere `'use client'`.**

Justo antes de `export default function Blog() {` (línea 68), insertar:
```jsx
export const metadata = {
  title: "Blog | HEREDABIENES. Grupo Inmobiliario",
  description:
    "Artículos sobre sucesiones, regularización de propiedades, escrituración y gestión patrimonial en Jalisco.",
  alternates: { canonical: "/blog" },
};

```

- [ ] **Paso 6: `app/contacto/page.js` — imports + metadata**

Reemplazar las líneas 2-3:
```jsx
import ContactForm from "../components/ContactForm";
import FAQSection from "../components/FAQSection";
```
por:
```jsx
import ContactForm from "@/components/ContactForm";
import FAQSection from "@/components/FAQSection";
```

Justo antes de `export default function Contacto() {` (línea 5), insertar:
```jsx
export const metadata = {
  title: "Contacto | HEREDABIENES. Grupo Inmobiliario",
  description:
    "Agenda tu consulta gratuita. WhatsApp +52 1 33 1301 3253 · heredabienes@outlook.com · Guadalajara, Jalisco.",
  alternates: { canonical: "/contacto" },
};

```

- [ ] **Paso 7: Verificar que `src/pages` quedó vacío y no hay imports relativos rotos**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && ls src/pages 2>&1; grep -rn "\.\./components\|react-router-dom" app/ ; echo "exit=$?"
```

Esperado:
```
ls: src/pages: No such file or directory
exit=1
```

- [ ] **Paso 8: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add -A app src
git commit -m "[MIGRA] convierte las 5 paginas a rutas del App Router con metadata por ruta"
```

---

### Tarea 1.9: `not-found`, `error` y limpieza final de `src/`

**Archivos:**
- Crear: `app/not-found.js`, `app/error.js`
- Eliminar: `src/App.js`, `src/index.js`, `public/index.html`, directorio `src/`

**Interfaces:**
- Consume: nada
- Produce: rutas 404 y 500 con el mismo lenguaje visual (`.btn-primary`, `font-display`, `text-primary`)

- [ ] **Paso 1: Crear `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/app/not-found.js`**

```jsx
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
```

- [ ] **Paso 2: Crear `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/app/error.js`**

```jsx
'use client';

import { RefreshCw } from "lucide-react";

export default function Error({ error, reset }) {
  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-gray-soft py-20 sm:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="section-title">Algo salió mal</h1>
        <div className="section-divider" />
        <p className="section-subtitle mb-8">
          Ocurrió un error inesperado. Intenta de nuevo o escríbenos por
          WhatsApp y lo resolvemos contigo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => reset()} className="btn-primary">
            <RefreshCw size={20} />
            Reintentar
          </button>
          <a
            href="https://wa.me/5213313013253?text=Hola%2C%20tuve%20un%20error%20en%20el%20sitio"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
```

`app/error.js` **debe** llevar `'use client'`: es un Error Boundary de React.

- [ ] **Paso 3: Eliminar los restos de CRA**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git rm src/App.js src/index.js public/index.html
ls src 2>&1
```

Esperado:
```
ls: src: No such file or directory
```

`src/App.js` (BrowserRouter + Routes) y `src/index.js` (`ReactDOM.createRoot`) quedan sustituidos por `app/layout.js` + el file-system routing. `public/index.html` queda sustituido por `layout.js` (todas sus metas, fuentes y JSON-LD ya están portados en la Tarea 1.4).

- [ ] **Paso 4: Confirmar que no quedó nada de CRA**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && grep -rn "react-router-dom\|%PUBLIC_URL%\|react-scripts" app components public package.json ; echo "exit=$?"
```

Esperado:
```
exit=1
```

- [ ] **Paso 5: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add -A app src public package.json
git commit -m "[MIGRA] agrega not-found y error, elimina src/ y public/index.html"
```

---

### Tarea 1.10: Primer build verde

**Archivos:**
- Modificar: ninguno (salvo correcciones puntuales que reporte el compilador)

**Interfaces:**
- Consume: el árbol completo migrado
- Produce: `.next/` generado, 6 rutas estáticas

- [ ] **Paso 1: Limpiar artefactos viejos y compilar**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
rm -rf build .next
npm run build
```

Esperado:
```
 ✓ Compiled successfully
 ✓ Generating static pages (8/8)

Route (app)                              Size  First Load JS
┌ ○ /
├ ○ /_not-found
├ ○ /blog
├ ○ /contacto
├ ○ /nosotros
└ ○ /servicios

○  (Static)  prerendered as static content
```

Las 6 rutas deben aparecer con el símbolo `○` (Static). Si alguna sale como `ƒ (Dynamic)`, hay un componente accediendo a APIs de request y hay que investigarlo.

- [ ] **Paso 2: Si el build falla con `You're importing a component that needs useState`**

El mensaje nombra el archivo exacto. Añadir `'use client';` + línea en blanco al inicio de ese archivo y repetir el Paso 1. Los 7 archivos que legítimamente lo requieren ya se cubrieron en la Tarea 1.7: `Navbar`, `HeroCarousel`, `StatsBar`, `Testimonials`, `FAQSection`, `SolutionsMap`, `ContactForm` (más `app/error.js`).

- [ ] **Paso 3: Verificar que Tailwind compiló las clases custom**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && grep -ro "0098ff" .next/static/css/ | head -3
```

Esperado: al menos una coincidencia (confirma que `content` en `tailwind.config.js` está apuntando bien a `app/` y `components/`; si sale vacío, la Tarea 1.3 Paso 4 quedó mal).

- [ ] **Paso 4: Correr el linter**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm run lint
```

Esperado: sin errores (warnings aceptables). La regla `@next/next/no-img-element` está desactivada a propósito en `eslint.config.mjs`.

- [ ] **Paso 5: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add -A
git commit -m "[MIGRA] primer build verde de Next 15 con las 6 rutas estaticas"
```

---

### Tarea 1.11: Actualizar el README

**Archivos:**
- Modificar: `README.md`

**Interfaces:**
- Consume: README de CRA
- Produce: README con los comandos reales del proyecto

- [ ] **Paso 1: Reemplazar todo el contenido de `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/README.md`**

```markdown
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
```

- [ ] **Paso 2: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add README.md
git commit -m "[MIGRA] actualiza README con comandos y convenciones de Next"
```

---

### Tarea 1.12: Test runner (Vitest) para las fases siguientes

**Archivos:**
- Crear: `vitest.config.js`, `vitest.setup.js`, `components/CTABanner.test.jsx`
- Modificar: `package.json` (devDependencies), `eslint.config.mjs` (ignorar config de vitest no hace falta)

**Interfaces:**
- Consume: `components/CTABanner.jsx` (server component simple, con `next/link` y `lucide-react`)
- Produce: `npm test` verde; base para los tests de las fases 2+

**Por qué Vitest y no Jest:** Next 15 documenta oficialmente ambos, pero `next/jest` sigue requiriendo `jest-environment-jsdom` + transform SWC y arrastra fricción de ESM en Node moderno; Vitest corre ESM nativo, no necesita Babel ni `transformIgnorePatterns`, y reutiliza el mismo esquema de alias. Para un proyecto sin TypeScript y sin ningún test previo, es la opción con menos configuración que realmente funciona en Node 25.

- [ ] **Paso 1: Instalar Vitest y Testing Library como devDependencies**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
npm install -D vitest@^3 @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

Esperado: `added NNN packages`, sin `ERESOLVE`.

- [ ] **Paso 2: Crear `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/vitest.config.js`**

```js
import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd()),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.js"],
    include: ["{app,components}/**/*.test.{js,jsx}"],
    exclude: ["node_modules", ".next"],
  },
});
```

- [ ] **Paso 3: Crear `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/vitest.setup.js`**

```js
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

- [ ] **Paso 4: Crear el smoke test `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/components/CTABanner.test.jsx`**

Verifica lo esencial de la migración: que `next/link` resuelve, que la prop es `href` y no `to`, y que el WhatsApp real está intacto.

```jsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CTABanner from "@/components/CTABanner";

describe("CTABanner", () => {
  it("renderiza el titular", () => {
    render(<CTABanner />);
    expect(
      screen.getByText("¿Tu propiedad tiene una historia sin resolver?")
    ).toBeInTheDocument();
  });

  it("enlaza a /contacto con next/link", () => {
    render(<CTABanner />);
    const cta = screen.getByRole("link", {
      name: /Agenda tu consulta gratis/i,
    });
    expect(cta).toHaveAttribute("href", "/contacto");
  });

  it("apunta al WhatsApp real de HEREDABIENES", () => {
    render(<CTABanner />);
    const wa = screen.getByRole("link", {
      name: /Escríbenos por WhatsApp/i,
    });
    expect(wa.getAttribute("href")).toContain("wa.me/5213313013253");
  });
});
```

- [ ] **Paso 5: Correr los tests**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm test
```

Esperado:
```
 ✓ components/CTABanner.test.jsx (3 tests)

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

- [ ] **Paso 6: Confirmar que el build ignora los tests**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm run build 2>&1 | grep -c "CTABanner.test"
```

Esperado:
```
0
```
(Next no trata `*.test.jsx` dentro de `components/` como rutas, así que no interfiere. Si en fases futuras se ponen tests dentro de `app/`, añadir `pageExtensions: ["js", "jsx"]` no basta — mejor mantener los tests fuera de `app/` o usar la convención `__tests__/`.)

- [ ] **Paso 7: Commit**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add vitest.config.js vitest.setup.js components/CTABanner.test.jsx package.json package-lock.json
git commit -m "[MIGRA] configura Vitest + Testing Library con smoke test de CTABanner"
```

---

### Tarea 1.13: Verificación funcional y visual contra el baseline

**Archivos:**
- Modificar: ninguno (salvo correcciones que salgan de la verificación)

**Interfaces:**
- Consume: screenshots de `~/Desktop/baseline-cra/` (Tarea 1.1)
- Produce: confirmación de paridad visual y funcional

- [ ] **Paso 1: Levantar el dev server**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm run dev
```

Esperado:
```
   ▲ Next.js 15.x.x
   - Local:        http://localhost:3000

 ✓ Ready in ...
```

- [ ] **Paso 2: Verificar las 5 rutas responden 200**

En otra terminal:
```bash
for r in / /servicios /nosotros /blog /contacto /ruta-inexistente; do printf "%s " "$r"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000$r"; done
```

Esperado:
```
/ 200
/servicios 200
/nosotros 200
/blog 200
/contacto 200
/ruta-inexistente 404
```

- [ ] **Paso 3: Verificar el JSON-LD corregido en el HTML servido**

```bash
curl -s http://localhost:3000/ | grep -o "heredabienes@outlook.com\|hola@heredabienes.com\|1234-5678"
```

Esperado:
```
heredabienes@outlook.com
```
(No debe aparecer ni `hola@heredabienes.com` ni `1234-5678`.)

- [ ] **Paso 4: Verificar fuentes y theme-color en el `<head>`**

```bash
curl -s http://localhost:3000/ | grep -c "Plus+Jakarta+Sans\|theme-color"
```

Esperado: `2` o más.

- [ ] **Paso 5: Checklist de interacción manual en el navegador**

En `http://localhost:3000`, confirmar uno por uno:

1. **Navbar**: al hacer scroll >20px el fondo cambia (estado `scrolled`).
2. **Navbar activo**: en `/servicios`, el link "Servicios" está en `text-primary bg-primary-light` (verifica `usePathname`).
3. **Navbar móvil** (390px): hamburguesa abre el panel; al tocar "Blog" navega **y el panel se cierra solo** (verifica el `useEffect` con dep `[pathname]`).
4. **HeroCarousel**: autoplay avanza; flechas ‹ › funcionan; los dots cambian; las 5 imágenes de Unsplash cargan.
5. **StatsBar**: al hacer scroll hasta la barra, los números se animan de 0 hasta su valor (verifica `'use client'` + IntersectionObserver — el riesgo R1).
6. **SolutionsMap**: los tabs cambian de contenido al hacer click.
7. **Testimonials**: flechas y dots rotan los testimonios.
8. **FAQSection**: cada pregunta se despliega/colapsa.
9. **ContactForm**: enviar con campos vacíos muestra errores de validación; enviar válido muestra "¡Gracias por contactarnos!" y el botón de reset vuelve al formulario.
10. **Footer**: "Proceso de trabajo" desde `/blog` navega a `/` y hace scroll a `#proceso`; ídem `#testimonios` y `#faq` (riesgo R5).
11. **Scroll reset**: navegar `/` (scrolleado abajo) → `/nosotros` aterriza arriba de todo (sustituto de `ScrollToTop`).
12. **`/nosotros`**: cargan `/ceo_img.jpeg` y `/wanted_poster.png` desde `public/`.
13. **Consola del navegador**: cero errores rojos, cero hydration mismatch.

- [ ] **Paso 6: Comparar screenshots contra el baseline**

Capturar de nuevo las 10 vistas de la Tarea 1.1 en `~/Desktop/next-migrado/` con los mismos anchos (1440 y 390) y compararlas lado a lado con `~/Desktop/baseline-cra/`. Diferencias aceptables: ninguna. Si aparece un salto de tipografía, revisar que los tres `<link>` de Google Fonts estén en `app/layout.js`. Si aparece un color plano/gris donde había primary, revisar el `content` de `tailwind.config.js`.

- [ ] **Paso 7: Build de producción final y arranque**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
rm -rf .next && npm run build && npm run start
```

Esperado: build verde con las 6 rutas `○ (Static)` y luego:
```
   ▲ Next.js 15.x.x
   - Local:        http://localhost:3000
 ✓ Ready in ...
```

- [ ] **Paso 8: Commit final de la fase**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes
git add -A
git commit -m "[MIGRA] cierra FASE 1: paridad visual y funcional verificada en Next 15"
git log --oneline -12
```

Esperado: 12 commits con prefijo `[MIGRA]` sobre `56d4f6c`.

---

### Definición de Hecho de la FASE 1

- [ ] `npm run build` verde, 6 rutas prerenderizadas como estáticas.
- [ ] `npm run lint` sin errores.
- [ ] `npm test` verde (3 tests).
- [ ] `grep -rn "react-router-dom" app components package.json` → sin coincidencias.
- [ ] El directorio `src/` no existe; `public/index.html` no existe.
- [ ] `components/` tiene exactamente 12 `.jsx` de producción + 1 `.test.jsx`; no existen `ServicesGrid.jsx` ni `ScrollToTop.jsx`.
- [ ] Exactamente 7 componentes con `'use client'` en `components/` (Navbar, HeroCarousel, StatsBar, Testimonials, FAQSection, SolutionsMap, ContactForm) + `app/error.js`.
- [ ] El JSON-LD servido contiene `heredabienes@outlook.com` y `+52-1-33-1301-3253`, y ya no contiene los placeholders.
- [ ] Los 10 screenshots coinciden con el baseline de CRA.
- [ ] Se sigue usando `<img>` nativo en los ~34 hotlinks de Unsplash; `next/image` queda diferido.

---

## FASE 2 — Supabase: schema y capa de datos

**Objetivo:** dejar la base de datos, el storage y la capa de acceso a datos completas y estables, de modo que las fases 3 (páginas públicas) y 4 (admin) solo consuman funciones ya existentes. Al terminar esta fase existe: `supabase/schema.sql` idempotente aplicado en un proyecto real de Supabase, la propiedad del terreno de Colonia Seattle sembrada, dos clientes de Supabase (navegador y servidor con cookies), `lib/format.js` con helpers puros y constantes/presets, y los cuatro módulos de API (`properties`, `images`, `storage`, `auth`) con las firmas exactas que las fases siguientes esperan.

**Verificación de la fase:**
1. `npm test` pasa (tests de `slugify`, `formatPrecio`, `formatSuperficie`, `fromRow`, `toRow`).
2. En el SQL Editor de Supabase, correr `schema.sql` dos veces seguidas no produce errores.
3. `select slug, titulo, precio from properties;` devuelve la fila del terreno de Colonia Seattle con los 4 highlights y las 4 medidas.
4. Desde una sesión anónima (`anon key`), `select` sobre `properties` devuelve solo filas con `publicado = true`, y cualquier `insert` falla con error de RLS.
5. `npm run build` compila sin errores de `next/headers` en el bundle de cliente.
6. `git status` no muestra `.env.local` como archivo sin trackear pendiente de commit.

---

### Tarea 2.1: Dependencias de Supabase y variables de entorno

**Archivos:**
- Modificar: `package.json`
- Modificar: `vitest.config.js`
- Crear: `.env.example`
- Verificar: `.gitignore`

**Interfaces:**
- Consume: `vitest.config.js` y `vitest.setup.js` creados en la Tarea 1.12; el script `npm test` ya existe.
- Produce: `@supabase/supabase-js`, `@supabase/ssr` y `server-only` instalados; el glob de tests incluye `lib/`.

**Nota:** esta tarea no lleva TDD; es infraestructura para poder hacer TDD en 2.2 y 2.6. **Vitest ya quedó instalado y configurado en la Tarea 1.12 — no se reinstala ni se recrea la config.**

- [ ] **Paso 1: Instalar las dependencias de Supabase**

```bash
npm install @supabase/supabase-js@^2.110.5 @supabase/ssr@^0.12.3 server-only
```

`@supabase/ssr` declara `@supabase/supabase-js ^2.110.5` como peer dependency; ambas versiones deben quedar alineadas.

- [ ] **Paso 2: Ampliar el glob de tests para incluir `lib/`**

En `/Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/vitest.config.js`, dentro de `test`, reemplazar la línea `include`:

```js
    include: ["{app,components}/**/*.test.{js,jsx}"],
```

por:

```js
    include: ["{lib,app,components}/**/*.test.{js,jsx}"],
```

El resto del archivo queda igual. El entorno sigue siendo `jsdom` con `globals: true`, así que los tests de lógica pura de esta fase corren sin cambios adicionales (importan `describe`/`it`/`expect` explícitamente, lo cual es válido también con `globals: true`).

Verificar que el cambio no rompió nada:

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm test
```

Esperado: los 3 tests de la Fase 1 siguen en verde.

- [ ] **Paso 3: Documentar las variables de entorno**

Crear `.env.example`:

```
# Copia este archivo a .env.local y rellena los valores reales.
# .env.local está en .gitignore: NUNCA se commitea.
# Los valores están en Supabase → Project Settings → API.

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxx
```

- [ ] **Paso 4: Verificar el .gitignore**

Ejecutar:

```bash
grep -n "env" .gitignore && git check-ignore -v .env.local
```

Esperado: `.gitignore` ya contiene la línea `.env.local` (heredada de CRA) y `git check-ignore` responde `.gitignore:<n>:.env.local	.env.local`.

Si `git check-ignore` no responde nada, añadir a `.gitignore`:

```
# local env files
.env*.local
```

Verificar además que no hay secretos ya versionados:

```bash
git log --all --name-only --pretty=format: | sort -u | grep -E "^\.env" || echo "OK: ningun .env versionado"
```

- [ ] **Paso 5: Commit**

```bash
git add package.json package-lock.json vitest.config.js .env.example .gitignore
git commit -m "[DATA] dependencias de Supabase, vitest y variables de entorno"
```

---

### Tarea 2.2: `lib/format.js` — helpers puros y constantes de dominio

**Archivos:**
- Crear: `lib/format.js`
- Test: `lib/format.test.js`

**Interfaces:**
- Consume: nada (módulo sin dependencias).
- Produce:
  - `slugify(text) -> string`
  - `formatPrecio(precio, moneda = 'MXN', mostrarPrecio = true) -> string`
  - `formatSuperficie(m2) -> string`
  - `TIPOS_INMUEBLE`, `OPERACIONES`, `ESTATUS` — arreglos de `{ value, label }`; `value` coincide exactamente con los `CHECK` de la tabla.
  - `FORMAS_PAGO` — arreglo de strings.
  - `PRESETS` — `{ idealPara, ventajas, entorno, estatusLegal, amenidades, highlights }`.

- [ ] **Paso 1: Escribir el test que falla**

Crear `lib/format.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  slugify,
  formatPrecio,
  formatSuperficie,
  TIPOS_INMUEBLE,
  OPERACIONES,
  ESTATUS,
  FORMAS_PAGO,
  PRESETS,
} from './format';

describe('slugify', () => {
  it('pasa a minúsculas y une con guiones', () => {
    expect(slugify('Terreno Urbano Premium')).toBe('terreno-urbano-premium');
  });

  it('quita acentos y la ñ se degrada a n', () => {
    expect(slugify('Terreno con Alta Plusvalía en Colonia Seattle')).toBe(
      'terreno-con-alta-plusvalia-en-colonia-seattle'
    );
    expect(slugify('Cabaña del Niño')).toBe('cabana-del-nino');
  });

  it('colapsa signos y espacios repetidos en un solo guion', () => {
    expect(slugify('Casa  ---  ¡en   venta!')).toBe('casa-en-venta');
  });

  it('recorta guiones al inicio y al final', () => {
    expect(slugify('  ¿Local comercial?  ')).toBe('local-comercial');
  });

  it('trunca a 80 caracteres sin dejar guion colgando', () => {
    const largo = slugify('a'.repeat(78) + ' bcdefgh');
    expect(largo.length).toBeLessThanOrEqual(80);
    expect(largo.endsWith('-')).toBe(false);
  });

  it('tolera entradas vacías o nulas', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
  });
});

describe('formatPrecio', () => {
  it('formatea con separador de miles, símbolo y moneda', () => {
    expect(formatPrecio(38000000, 'MXN', true)).toBe('$38,000,000 MXN');
  });

  it('respeta otras monedas', () => {
    expect(formatPrecio(1250000, 'USD', true)).toBe('$1,250,000 USD');
  });

  it('usa MXN y mostrarPrecio=true por defecto', () => {
    expect(formatPrecio(950000)).toBe('$950,000 MXN');
  });

  it('redondea a pesos enteros', () => {
    expect(formatPrecio(38000000.49, 'MXN', true)).toBe('$38,000,000 MXN');
  });

  it('devuelve "Precio a consultar" cuando mostrarPrecio es false', () => {
    expect(formatPrecio(38000000, 'MXN', false)).toBe('Precio a consultar');
  });

  it('devuelve "Precio a consultar" cuando no hay precio válido', () => {
    expect(formatPrecio(null, 'MXN', true)).toBe('Precio a consultar');
    expect(formatPrecio(undefined)).toBe('Precio a consultar');
    expect(formatPrecio(0, 'MXN', true)).toBe('Precio a consultar');
    expect(formatPrecio('no soy un número')).toBe('Precio a consultar');
  });

  it('acepta el precio como string numérico (numeric de Postgres)', () => {
    expect(formatPrecio('38000000', 'MXN', true)).toBe('$38,000,000 MXN');
  });
});

describe('formatSuperficie', () => {
  it('formatea con separador de miles y unidad', () => {
    expect(formatSuperficie(1610)).toBe('1,610 m²');
  });

  it('conserva hasta dos decimales', () => {
    expect(formatSuperficie(240.5)).toBe('240.5 m²');
    expect(formatSuperficie(240.567)).toBe('240.57 m²');
  });

  it('acepta strings numéricos', () => {
    expect(formatSuperficie('1610.00')).toBe('1,610 m²');
  });

  it('devuelve cadena vacía cuando no hay superficie', () => {
    expect(formatSuperficie(null)).toBe('');
    expect(formatSuperficie(undefined)).toBe('');
    expect(formatSuperficie(0)).toBe('');
    expect(formatSuperficie('')).toBe('');
    expect(formatSuperficie('abc')).toBe('');
  });
});

describe('constantes de dominio', () => {
  it('TIPOS_INMUEBLE cubre exactamente los valores del CHECK', () => {
    expect(TIPOS_INMUEBLE.map((t) => t.value)).toEqual([
      'terreno',
      'casa',
      'departamento',
      'local',
      'oficina',
      'bodega',
      'rancho',
    ]);
  });

  it('OPERACIONES y ESTATUS cubren los valores del CHECK', () => {
    expect(OPERACIONES.map((o) => o.value)).toEqual(['venta', 'renta']);
    expect(ESTATUS.map((e) => e.value)).toEqual([
      'disponible',
      'apartado',
      'vendido',
      'pausado',
    ]);
  });

  it('todas las constantes traen label legible', () => {
    [...TIPOS_INMUEBLE, ...OPERACIONES, ...ESTATUS].forEach((c) => {
      expect(typeof c.label).toBe('string');
      expect(c.label.length).toBeGreaterThan(0);
    });
  });

  it('FORMAS_PAGO incluye los valores usados en el seed', () => {
    expect(FORMAS_PAGO).toContain('Contado');
    expect(FORMAS_PAGO).toContain('Aportación');
  });

  it('PRESETS expone las seis listas', () => {
    expect(Object.keys(PRESETS).sort()).toEqual([
      'amenidades',
      'entorno',
      'estatusLegal',
      'highlights',
      'idealPara',
      'ventajas',
    ]);
    expect(PRESETS.idealPara).toContain('Desarrollo habitacional');
    expect(PRESETS.estatusLegal).toContain('Escritura pública');
    expect(PRESETS.entorno).toContain('Centros comerciales');
  });

  it('PRESETS.highlights trae los 4 badges de la infografía', () => {
    expect(PRESETS.highlights).toHaveLength(4);
    expect(PRESETS.highlights.map((h) => h.titulo)).toEqual([
      'Zona Premium',
      'Ubicación Estratégica',
      'Servicios a la Mano',
      'Gran Oportunidad',
    ]);
    PRESETS.highlights.forEach((h) => {
      expect(h).toHaveProperty('icono');
      expect(h).toHaveProperty('titulo');
      expect(h).toHaveProperty('texto');
    });
  });
});
```

- [ ] **Paso 2: Correr el test y verificar que falla**

Ejecutar: `npm test -- lib/format.test.js`

Esperado: FAIL con `Failed to resolve import "./format" from "lib/format.test.js"` (el módulo aún no existe).

- [ ] **Paso 3: Implementación mínima**

Crear `lib/format.js`:

```js
// ----------------------------------------------------------------------------
// Helpers de formato y constantes de dominio del catálogo de propiedades.
// Módulo puro: sin React, sin Supabase, sin acceso a red. Se importa igual
// desde Server Components, Client Components y tests.
// ----------------------------------------------------------------------------

// Se usa el locale 'en-US' a propósito y no 'es-MX': ambos agrupan con coma,
// pero 'en-US' está garantizado en cualquier build de ICU (incluido el ICU
// reducido de algunos runtimes), así que el output es determinista.
const LOCALE = 'en-US';

const nfPrecio = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 0,
});

const nfSuperficie = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 2,
});

// Convierte un texto en un slug url-safe.
// "Terreno con Alta Plusvalía en Colonia Seattle"
//   → "terreno-con-alta-plusvalia-en-colonia-seattle"
export function slugify(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita los diacríticos separados por NFD
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, ''); // el slice pudo dejar un guion colgando
}

// Postgres devuelve numeric como string; toNumber normaliza ambos casos.
function toNumber(value) {
  if (value === null || value === undefined || value === '') return NaN;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
}

// "$38,000,000 MXN"  |  "Precio a consultar"
export function formatPrecio(precio, moneda = 'MXN', mostrarPrecio = true) {
  if (!mostrarPrecio) return 'Precio a consultar';
  const n = toNumber(precio);
  if (!Number.isFinite(n) || n <= 0) return 'Precio a consultar';
  return `$${nfPrecio.format(n)} ${moneda || 'MXN'}`;
}

// "1,610 m²"  |  ""  (cadena vacía: el bloque no se renderiza)
export function formatSuperficie(m2) {
  const n = toNumber(m2);
  if (!Number.isFinite(n) || n <= 0) return '';
  return `${nfSuperficie.format(n)} m²`;
}

// ----------------------------------------------------------------------------
// Constantes de dominio. Los `value` replican EXACTAMENTE los CHECK de
// supabase/schema.sql: si se agrega uno aquí, hay que agregarlo también allá.
// ----------------------------------------------------------------------------

export const TIPOS_INMUEBLE = [
  { value: 'terreno', label: 'Terreno' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'local', label: 'Local comercial' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'bodega', label: 'Bodega' },
  { value: 'rancho', label: 'Rancho' },
];

export const OPERACIONES = [
  { value: 'venta', label: 'Venta' },
  { value: 'renta', label: 'Renta' },
];

export const ESTATUS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'apartado', label: 'Apartado' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'pausado', label: 'Pausado' },
];

// Se guardan tal cual en la columna formas_pago (text[]).
export const FORMAS_PAGO = [
  'Contado',
  'Aportación',
  'Crédito bancario',
  'Permuta',
];

// Sugerencias precargadas para los chips del formulario del admin.
// Salen de la ficha del terreno de Colonia Seattle, Zapopan.
export const PRESETS = {
  idealPara: [
    'Desarrollo habitacional',
    'Residencias de lujo',
    'Torre de departamentos',
    'Proyecto vertical',
    'Desarrollo comercial',
    'Oficinas corporativas',
    'Inversión patrimonial',
  ],
  ventajas: [
    'Ubicación premium',
    'Alta plusvalía',
    'Excelente conectividad',
    'Zona consolidada',
    'Ideal para desarrolladores',
  ],
  entorno: [
    'Centros comerciales',
    'Corporativos',
    'Escuelas y universidades',
    'Restaurantes',
    'Servicios médicos',
    'Vialidades principales',
    'Zonas residenciales premium',
  ],
  estatusLegal: [
    'Propiedad privada',
    'Escritura pública',
    'Zona urbanizada',
    'Factibilidad de servicios',
  ],
  amenidades: [
    'Agua',
    'Luz',
    'Drenaje',
    'Alumbrado',
    'Alberca',
    'Jardín',
    'Seguridad',
  ],
  // Máximo 4. `icono` es un nombre de ícono de lucide-react en kebab-case;
  // el componente de la fase 3 lo resuelve contra su propio mapa.
  highlights: [
    {
      icono: 'crown',
      titulo: 'Zona Premium',
      texto: 'Colonia consolidada con alta plusvalía y desarrollos residenciales de primer nivel.',
    },
    {
      icono: 'map-pin',
      titulo: 'Ubicación Estratégica',
      texto: 'Conectividad inmediata con las principales vialidades y corporativos de la zona.',
    },
    {
      icono: 'plug',
      titulo: 'Servicios a la Mano',
      texto: 'Agua, luz, drenaje y alumbrado público disponibles con factibilidad de servicios.',
    },
    {
      icono: 'trending-up',
      titulo: 'Gran Oportunidad',
      texto: 'Precio por debajo del valor comercial de la zona: rendimiento desde el día uno.',
    },
  ],
};
```

- [ ] **Paso 4: Correr el test**

Ejecutar: `npm test -- lib/format.test.js`

Esperado: PASS, 20 tests.

- [ ] **Paso 5: Commit**

```bash
git add lib/format.js lib/format.test.js
git commit -m "[DATA] lib/format: slugify, formatPrecio, formatSuperficie y presets del catálogo"
```

---

### Tarea 2.3: `supabase/schema.sql` — DDL, índices, trigger, RLS, bucket y políticas de storage

**Archivos:**
- Crear: `supabase/schema.sql`

**Interfaces:**
- Consume: `TIPOS_INMUEBLE`, `OPERACIONES`, `ESTATUS` de `lib/format.js` (como contrato, no como import: los `CHECK` deben replicar esos `value`).
- Produce: tablas `public.properties` y `public.property_images`, bucket `propiedades`.

**Nota:** sin TDD. El schema no se testea con vitest; se verifica ejecutándolo dos veces en Supabase (idempotencia) y comprobando las políticas RLS desde el SQL Editor.

- [ ] **Paso 1: Escribir el schema completo**

Crear `supabase/schema.sql`:

```sql
-- ============================================================================
-- Heredabienes — Catálogo de propiedades
-- Esquema de base de datos (Supabase / Postgres)
-- ----------------------------------------------------------------------------
-- Cómo usarlo:
--   1. Crea un proyecto en https://supabase.com
--   2. SQL Editor → New query → pega TODO este archivo → Run
--   3. Corre después supabase/seed.sql (una sola vez)
--
-- Este archivo es IDEMPOTENTE: correrlo varias veces no rompe nada.
-- Ojo: `create table if not exists` no agrega columnas nuevas a una tabla
-- que ya existe. Si el modelo cambia, añade el `alter table ... add column
-- if not exists` correspondiente en la sección MIGRACIONES del final.
--
-- Modelo de permisos (RLS):
--   - El público (anon) solo LEE propiedades con publicado = true.
--   - El usuario autenticado (staff de Heredabienes) lee todo y escribe todo.
--   - No se usa service-role key en ningún lado.
-- ============================================================================

-- gen_random_uuid() viene de pgcrypto (ya disponible en Supabase).
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- TABLA: properties
-- ----------------------------------------------------------------------------
create table if not exists public.properties (
  -- Identidad y publicación -------------------------------------------------
  id                          uuid primary key default gen_random_uuid(),
  slug                        text unique not null,
  titulo                      text not null,
  gancho                      text,
  tipo_inmueble               text not null,
  operacion                   text not null,
  estatus                     text not null default 'disponible',
  publicado                   boolean not null default false,
  destacado                   boolean not null default false,
  orden                       integer default 0,

  -- Precio ------------------------------------------------------------------
  precio                      numeric,
  moneda                      text default 'MXN',
  mostrar_precio              boolean default true,
  precio_nota                 text,
  formas_pago                 text[],

  -- Ubicación ---------------------------------------------------------------
  calle                       text,
  numero_exterior             text,
  numero_interior             text,
  colonia                     text,
  municipio                   text,
  estado                      text,
  cp                          text,
  lat                         numeric,
  lng                         numeric,
  mostrar_direccion_exacta    boolean default true,

  -- Superficie y medidas ----------------------------------------------------
  -- Las medidas son text y no numeric a propósito: el lindero sur del terreno
  -- de Colonia Seattle es "36.00 m + quiebre de 10.00 m" y no cabe en un número.
  superficie_terreno_m2       numeric,
  superficie_construccion_m2  numeric,
  medida_norte                text,
  medida_sur                  text,
  medida_oriente              text,
  medida_poniente             text,
  medidas_nota                text,

  -- Específicos por tipo (opcionales) ---------------------------------------
  recamaras                   integer,
  banos                       integer,
  medios_banos                integer,
  estacionamientos            integer,
  niveles                     integer,
  antiguedad_anios            integer,

  -- Contenido ---------------------------------------------------------------
  descripcion                 text,
  ideal_para                  text[],
  ventajas                    text[],
  entorno                     text[],
  estatus_legal               text[],
  amenidades                  text[],
  -- highlights: arreglo de {icono, titulo, texto}, máximo 4.
  highlights                  jsonb not null default '[]'::jsonb,

  -- Medios, contacto y SEO --------------------------------------------------
  portada_url                 text,
  ficha_pdf_url               text,
  asesor_nombre               text,
  asesor_telefono             text,
  asesor_email                text,
  meta_title                  text,
  meta_description            text,

  -- Timestamps --------------------------------------------------------------
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CHECKs con nombre. Se agregan por separado (y se dropean antes) para que el
-- archivo siga siendo idempotente aunque la tabla ya exista.
-- Los valores replican TIPOS_INMUEBLE / OPERACIONES / ESTATUS de lib/format.js.
-- ----------------------------------------------------------------------------
alter table public.properties drop constraint if exists properties_tipo_inmueble_check;
alter table public.properties add  constraint properties_tipo_inmueble_check
  check (tipo_inmueble in ('terreno','casa','departamento','local','oficina','bodega','rancho'));

alter table public.properties drop constraint if exists properties_operacion_check;
alter table public.properties add  constraint properties_operacion_check
  check (operacion in ('venta','renta'));

alter table public.properties drop constraint if exists properties_estatus_check;
alter table public.properties add  constraint properties_estatus_check
  check (estatus in ('disponible','apartado','vendido','pausado'));

-- ----------------------------------------------------------------------------
-- TABLA: property_images
-- storage_path es obligatorio para poder borrar el archivo del bucket y no
-- dejar huérfanos cuando se elimina la imagen o la propiedad.
-- ----------------------------------------------------------------------------
create table if not exists public.property_images (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  url          text not null,
  storage_path text,
  alt          text,
  orden        integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ÍNDICES
-- slug ya tiene índice único por la constraint UNIQUE.
-- ----------------------------------------------------------------------------
create index if not exists properties_publicado_idx      on public.properties (publicado);
create index if not exists properties_municipio_idx      on public.properties (municipio);
create index if not exists properties_tipo_inmueble_idx  on public.properties (tipo_inmueble);
create index if not exists properties_destacado_idx      on public.properties (destacado);
create index if not exists properties_orden_idx          on public.properties (orden, created_at desc);

create index if not exists property_images_property_idx  on public.property_images (property_id, orden);

-- ----------------------------------------------------------------------------
-- updated_at automático
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_properties_updated on public.properties;
create trigger trg_properties_updated before update on public.properties
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.properties      enable row level security;
alter table public.property_images enable row level security;

-- ---- properties ------------------------------------------------------------
drop policy if exists "properties public read" on public.properties;
drop policy if exists "properties admin write" on public.properties;

create policy "properties public read" on public.properties
  for select using (publicado = true or auth.role() = 'authenticated');

create policy "properties admin write" on public.properties
  for all using (auth.role() = 'authenticated')
          with check (auth.role() = 'authenticated');

-- ---- property_images -------------------------------------------------------
-- Una imagen es visible si su propiedad es visible. El EXISTS se evalúa con
-- las políticas de `properties` activas para el rol que consulta, así que una
-- propiedad en borrador esconde automáticamente sus imágenes al público.
drop policy if exists "property_images public read" on public.property_images;
drop policy if exists "property_images admin write" on public.property_images;

create policy "property_images public read" on public.property_images
  for select using (
    exists (
      select 1 from public.properties p
      where p.id = property_images.property_id
    )
  );

create policy "property_images admin write" on public.property_images
  for all using (auth.role() = 'authenticated')
          with check (auth.role() = 'authenticated');

-- ============================================================================
-- STORAGE: bucket "propiedades" (fotos de galería, portadas y fichas PDF)
-- Público en lectura, autenticado en escritura.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('propiedades', 'propiedades', true)
on conflict (id) do update set public = true;

drop policy if exists "propiedades public read"  on storage.objects;
drop policy if exists "propiedades admin write"  on storage.objects;
drop policy if exists "propiedades admin update" on storage.objects;
drop policy if exists "propiedades admin delete" on storage.objects;

create policy "propiedades public read" on storage.objects
  for select using (bucket_id = 'propiedades');

create policy "propiedades admin write" on storage.objects
  for insert with check (bucket_id = 'propiedades' and auth.role() = 'authenticated');

create policy "propiedades admin update" on storage.objects
  for update using (bucket_id = 'propiedades' and auth.role() = 'authenticated');

create policy "propiedades admin delete" on storage.objects
  for delete using (bucket_id = 'propiedades' and auth.role() = 'authenticated');

-- ============================================================================
-- MIGRACIONES
-- Cuando el modelo evolucione, agrega aquí los ALTER idempotentes en vez de
-- tocar el CREATE TABLE de arriba. Ejemplo:
--   alter table public.properties add column if not exists tour_url text;
-- ============================================================================
```

- [ ] **Paso 2: Verificar idempotencia y RLS en Supabase**

En el SQL Editor del proyecto de Supabase:

1. Pegar y correr `schema.sql`. Esperado: `Success. No rows returned`.
2. Volver a correrlo. Esperado: el mismo `Success`, sin errores de "already exists".
3. Verificar las políticas:

```sql
select tablename, policyname, cmd
from pg_policies
where schemaname in ('public','storage')
  and (tablename in ('properties','property_images') or policyname ilike 'propiedades%')
order by tablename, policyname;
```

Esperado: 4 políticas en `properties`/`property_images` y 4 en `storage.objects`.

4. Verificar los CHECK:

```sql
insert into public.properties (slug, titulo, tipo_inmueble, operacion)
values ('test-check', 'Test', 'castillo', 'venta');
```

Esperado: FAIL con `new row for relation "properties" violates check constraint "properties_tipo_inmueble_check"`.

- [ ] **Paso 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "[DATA] schema.sql: tablas properties y property_images, índices, RLS y bucket propiedades"
```

---

### Tarea 2.4: `supabase/seed.sql` — terreno de Colonia Seattle, Zapopan

**Archivos:**
- Crear: `supabase/seed.sql`

**Interfaces:**
- Consume: `public.properties` (tarea 2.3); los strings de `formas_pago` coinciden con `FORMAS_PAGO` de `lib/format.js`.
- Produce: una fila publicada y destacada con slug `terreno-con-alta-plusvalia-en-colonia-seattle`.

**Nota:** sin TDD. Se verifica con un `select` después de correrlo.

- [ ] **Paso 1: Escribir el seed completo**

Crear `supabase/seed.sql`:

```sql
-- ============================================================================
-- Heredabienes — Seed inicial del catálogo
-- ----------------------------------------------------------------------------
-- Corre esto UNA VEZ, después de schema.sql.
-- Es idempotente: el ON CONFLICT (slug) actualiza la fila en vez de duplicarla,
-- así que puedes volver a correrlo si corriges algún dato.
--
-- Contenido: la ficha real del terreno en Colonia Seattle, Zapopan.
-- Las fotos NO se siembran aquí: se suben desde el admin (/admin-hb) al bucket
-- `propiedades`, que es quien llena portada_url y property_images.
-- ============================================================================

insert into public.properties (
  slug,
  titulo,
  gancho,
  tipo_inmueble,
  operacion,
  estatus,
  publicado,
  destacado,
  orden,
  precio,
  moneda,
  mostrar_precio,
  precio_nota,
  formas_pago,
  calle,
  numero_exterior,
  colonia,
  municipio,
  estado,
  mostrar_direccion_exacta,
  superficie_terreno_m2,
  medida_norte,
  medida_sur,
  medida_oriente,
  medida_poniente,
  medidas_nota,
  descripcion,
  ideal_para,
  ventajas,
  entorno,
  estatus_legal,
  amenidades,
  highlights,
  asesor_nombre,
  asesor_telefono,
  asesor_email,
  meta_title,
  meta_description
) values (
  'terreno-con-alta-plusvalia-en-colonia-seattle',
  'Terreno con Alta Plusvalía en Colonia Seattle',
  'Terreno urbano premium en una de las zonas mejor conectadas de Zapopan',
  'terreno',
  'venta',
  'disponible',
  true,
  true,
  1,

  -- Precio
  38000000,
  'MXN',
  true,
  'Por debajo de lo valuado',
  array['Contado','Aportación'],

  -- Ubicación
  'Calle 10',
  '66',
  'Seattle',
  'Zapopan',
  'Jalisco',
  true,

  -- Superficie y medidas
  1610,
  '46.00 m',
  '36.00 m + quiebre de 10.00 m',
  '35.00 m',
  '33.00 m',
  'El lindero sur presenta un quiebre de 10.00 m. Consulta el plano en la ficha técnica para el detalle exacto de los linderos.',

  -- Descripción
  'Terreno urbano de 1,610 m² en Colonia Seattle, Zapopan, una de las zonas de mayor plusvalía del área metropolitana de Guadalajara. Predio en esquina con frente amplio, totalmente urbanizado y con factibilidad de servicios, listo para desarrollar. Su ubicación lo coloca a minutos de corporativos, centros comerciales, escuelas y las principales vialidades de la zona, lo que lo hace ideal tanto para un proyecto vertical residencial como para un desarrollo de uso mixto. Se ofrece por debajo del valor comercial de la zona: una oportunidad patrimonial poco frecuente en un predio de este tamaño y ubicación.',

  -- Listas de contenido
  array[
    'Desarrollo habitacional',
    'Residencias de lujo',
    'Torre de departamentos',
    'Proyecto vertical',
    'Desarrollo comercial',
    'Oficinas corporativas',
    'Inversión patrimonial'
  ],
  array[
    'Ubicación premium',
    'Alta plusvalía',
    'Excelente conectividad',
    'Zona consolidada',
    'Ideal para desarrolladores'
  ],
  array[
    'Centros comerciales',
    'Corporativos',
    'Escuelas y universidades',
    'Restaurantes',
    'Servicios médicos',
    'Vialidades principales',
    'Zonas residenciales premium'
  ],
  array[
    'Propiedad privada',
    'Escritura pública',
    'Zona urbanizada',
    'Factibilidad de servicios'
  ],
  array['Agua','Luz','Drenaje','Alumbrado'],

  -- Highlights (los 4 badges de la infografía)
  '[
    {
      "icono": "crown",
      "titulo": "Zona Premium",
      "texto": "Colonia Seattle es una zona consolidada de Zapopan, con desarrollos residenciales de primer nivel y plusvalía sostenida."
    },
    {
      "icono": "map-pin",
      "titulo": "Ubicación Estratégica",
      "texto": "Conectividad inmediata con las principales vialidades de la ciudad y con los corredores corporativos de la zona."
    },
    {
      "icono": "plug",
      "titulo": "Servicios a la Mano",
      "texto": "Agua, luz, drenaje y alumbrado público disponibles, con factibilidad de servicios para desarrollar."
    },
    {
      "icono": "trending-up",
      "titulo": "Gran Oportunidad",
      "texto": "Precio por debajo del valor comercial de la zona: rendimiento patrimonial desde la adquisición."
    }
  ]'::jsonb,

  -- Contacto
  'Heredabienes',
  '+52 33 1301 3253',
  'heredabienes@outlook.com',

  -- SEO
  'Terreno en venta en Colonia Seattle, Zapopan — 1,610 m² | Heredabienes',
  'Terreno urbano de 1,610 m² en Colonia Seattle, Zapopan. $38,000,000 MXN, por debajo de lo valuado. Escritura pública, zona urbanizada y factibilidad de servicios. Ideal para proyecto vertical o desarrollo comercial.'
)
on conflict (slug) do update set
  titulo                   = excluded.titulo,
  gancho                   = excluded.gancho,
  tipo_inmueble            = excluded.tipo_inmueble,
  operacion                = excluded.operacion,
  estatus                  = excluded.estatus,
  publicado                = excluded.publicado,
  destacado                = excluded.destacado,
  orden                    = excluded.orden,
  precio                   = excluded.precio,
  moneda                   = excluded.moneda,
  mostrar_precio           = excluded.mostrar_precio,
  precio_nota              = excluded.precio_nota,
  formas_pago              = excluded.formas_pago,
  calle                    = excluded.calle,
  numero_exterior          = excluded.numero_exterior,
  colonia                  = excluded.colonia,
  municipio                = excluded.municipio,
  estado                   = excluded.estado,
  mostrar_direccion_exacta = excluded.mostrar_direccion_exacta,
  superficie_terreno_m2    = excluded.superficie_terreno_m2,
  medida_norte             = excluded.medida_norte,
  medida_sur               = excluded.medida_sur,
  medida_oriente           = excluded.medida_oriente,
  medida_poniente          = excluded.medida_poniente,
  medidas_nota             = excluded.medidas_nota,
  descripcion              = excluded.descripcion,
  ideal_para               = excluded.ideal_para,
  ventajas                 = excluded.ventajas,
  entorno                  = excluded.entorno,
  estatus_legal            = excluded.estatus_legal,
  amenidades               = excluded.amenidades,
  highlights               = excluded.highlights,
  asesor_nombre            = excluded.asesor_nombre,
  asesor_telefono          = excluded.asesor_telefono,
  asesor_email             = excluded.asesor_email,
  meta_title               = excluded.meta_title,
  meta_description         = excluded.meta_description;

-- PENDIENTE: lat / lng quedan en NULL a propósito. En cuanto se confirmen las
-- coordenadas exactas del predio, córrelas con:
--   update public.properties
--      set lat = <lat>, lng = <lng>
--    where slug = 'terreno-con-alta-plusvalia-en-colonia-seattle';
-- El bloque de mapa de la ficha (fase 3) no se renderiza mientras sean NULL.
```

- [ ] **Paso 2: Correr y verificar**

En el SQL Editor: pegar y correr `seed.sql`, luego:

```sql
select slug, titulo, precio, moneda, superficie_terreno_m2,
       medida_norte, medida_sur, medida_oriente, medida_poniente,
       formas_pago, estatus_legal,
       jsonb_array_length(highlights) as n_highlights,
       array_length(ideal_para, 1)    as n_ideal_para,
       array_length(ventajas, 1)      as n_ventajas,
       array_length(entorno, 1)       as n_entorno
from public.properties
where slug = 'terreno-con-alta-plusvalia-en-colonia-seattle';
```

Esperado: 1 fila, `precio = 38000000`, `n_highlights = 4`, `n_ideal_para = 7`, `n_ventajas = 5`, `n_entorno = 7`, `medida_sur = '36.00 m + quiebre de 10.00 m'`.

Correr `seed.sql` una segunda vez y repetir el `select`: sigue habiendo exactamente 1 fila.

- [ ] **Paso 3: Commit**

```bash
git add supabase/seed.sql
git commit -m "[DATA] seed.sql: ficha del terreno de Colonia Seattle, Zapopan"
```

---

### Tarea 2.5: Clientes de Supabase (navegador, servidor y middleware)

**Archivos:**
- Crear: `lib/supabase/client.js`
- Crear: `lib/supabase/server.js`
- Crear: `lib/supabase/middleware.js`

**Interfaces:**
- Consume: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `@supabase/ssr` `0.12.x`.
- Produce:
  - `createBrowserSupabase() -> SupabaseClient` (memoizado, seguro de llamar varias veces)
  - `isSupabaseConfigured() -> boolean`
  - `createServerSupabase() -> Promise<SupabaseClient>` (async: `cookies()` es async en Next 15)
  - `updateSession(request) -> Promise<NextResponse>` (lo consume el `middleware.js` raíz de la fase 4)

**Notas de diseño (leer antes de implementar):**

1. La API vigente de `@supabase/ssr` (v0.12.3) es `createBrowserClient(url, key)` y `createServerClient(url, key, { cookies: { getAll, setAll } })`. Las variantes `get/set/remove` están deprecadas: **no usarlas**. `getAll()` devuelve `{ name, value }[]`; `setAll(cookiesToSet, headers)` recibe `{ name, value, options }[]`.
2. En Next 15, `cookies()` de `next/headers` es asíncrono → `createServerSupabase()` es `async`.
3. Los Server Components no pueden escribir cookies. Por eso `setAll` va envuelto en `try/catch`: cuando falla, el refresh de token lo cubre el middleware.
4. `lib/supabase/server.js` importa `next/headers`, que solo existe en el bundle de servidor. Se marca con `import 'server-only'` y **ningún módulo de `lib/api/` lo importa**: los módulos de API reciben el cliente de servidor como argumento opcional (ver tarea 2.6). Esto evita el error de build "You're importing a component that needs next/headers".

**Nota:** sin TDD. Son wrappers de librería; testearlos sería testear `@supabase/ssr`.

- [ ] **Paso 1: Cliente de navegador**

Crear `lib/supabase/client.js`:

```js
'use client';

import { createBrowserClient } from '@supabase/ssr';

// Next expone al navegador solo las variables con prefijo NEXT_PUBLIC_.
// Se definen en .env.local (ver .env.example).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Placeholders válidos para que createBrowserClient NO lance cuando faltan las
// claves (lanzaría "supabaseUrl is required."). Así el sitio sigue vivo aunque
// no haya .env.local; cualquier llamada real falla y la UI muestra el aviso de
// "no configurado".
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

let cached = null;

// Memoizado: createBrowserClient ya devuelve un singleton por credenciales,
// pero cachearlo evita recrear el wrapper en cada render.
export function createBrowserSupabase() {
  if (cached) return cached;

  if (!isSupabaseConfigured()) {
    // eslint-disable-next-line no-console
    console.warn(
      '[supabase] Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Copia .env.example a .env.local y reinicia el dev server.'
    );
  }

  cached = createBrowserClient(url || PLACEHOLDER_URL, anonKey || PLACEHOLDER_KEY);
  return cached;
}
```

- [ ] **Paso 2: Cliente de servidor**

Crear `lib/supabase/server.js`:

```js
import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

// Cliente para Server Components, Server Actions y Route Handlers.
// En Next 15 cookies() es async, por eso esta función es async: hay que
// await-earla en cada uso.
//
//   const supabase = await createServerSupabase();
//
// NO memoizar: cada request tiene su propio cookie store.
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(url || PLACEHOLDER_URL, anonKey || PLACEHOLDER_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Llamado desde un Server Component, que no puede escribir cookies.
          // Se ignora: el refresh de la sesión lo hace el middleware.
        }
      },
    },
  });
}
```

- [ ] **Paso 3: Helper de middleware**

Crear `lib/supabase/middleware.js`:

```js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

// Refresca el token de la sesión y lo reescribe en las cookies de la respuesta.
// Devuelve { response, user }: el middleware raíz (fase 4) decide con `user`
// si redirige a /admin-hb, y debe devolver `response` tal cual para no perder
// las cookies actualizadas.
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    url || PLACEHOLDER_URL,
    anonKey || PLACEHOLDER_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANTE: esta llamada va inmediatamente después de crear el cliente.
  // Es la que dispara el refresh del token; si se mete código entre medias,
  // las sesiones se cierran solas de forma aleatoria y es imposible de depurar.
  // getClaims() verifica el JWT y cae a una llamada de red solo si hace falta;
  // nunca confiar en getSession() del lado del servidor.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  return { response: supabaseResponse, user };
}
```

- [ ] **Paso 4: Verificar que compila**

Ejecutar: `npm run build`

Esperado: build exitoso. En particular, **no** debe aparecer `You're importing a component that needs "next/headers"`. Si aparece, hay un Client Component importando `lib/supabase/server.js` directa o transitivamente: romper esa cadena.

- [ ] **Paso 5: Commit**

```bash
git add lib/supabase/client.js lib/supabase/server.js lib/supabase/middleware.js
git commit -m "[DATA] clientes de Supabase para navegador, servidor y middleware (@supabase/ssr)"
```

---

### Tarea 2.6: `lib/api/properties.js` — mapeo y CRUD

**Archivos:**
- Crear: `lib/api/properties.js`
- Test: `lib/api/properties.test.js`

**Interfaces:**
- Consume: `createBrowserSupabase()` de `lib/supabase/client.js`; `slugify` de `lib/format.js`; `imageFromRow` de `lib/api/images.js` (tarea 2.7 — implementarla antes o en paralelo, esta tarea la importa).
- Produce, exactamente:
  - `listProperties({ tipo, operacion, municipio, precioMin, precioMax, orden, includeUnpublished } = {}) -> Promise<Property[]>`
  - `getPropertyBySlug(slug) -> Promise<Property | null>`
  - `getPropertyById(id) -> Promise<Property>`
  - `listFeaturedProperties(limit = 3) -> Promise<Property[]>`
  - `listRelatedProperties({ id, municipio, tipoInmueble, limit = 3 }) -> Promise<Property[]>`
  - `listMunicipios() -> Promise<string[]>`
  - `createProperty(fields) -> Promise<Property>`
  - `updateProperty(id, fields) -> Promise<Property>`
  - `deleteProperty(id) -> Promise<void>`
  - `duplicateProperty(id) -> Promise<Property>`
  - Además, exportados para testeo: `fromRow(row) -> Property`, `toRow(partial) -> object`.

**Decisión de diseño — de dónde sale el cliente de Supabase:**
Este módulo se usa desde Server Components (lectura pública) y desde Client Components (admin). No puede importar `lib/supabase/server.js` porque eso arrastraría `next/headers` al bundle de cliente. Solución: **cada función acepta un cliente opcional como último argumento**, con el cliente de navegador como default.

- Client Component: `await listProperties({ tipo: 'terreno' })`
- Server Component: `await listProperties({ tipo: 'terreno', client: await createServerSupabase() })`
- `getPropertyBySlug(slug, client)` — el `client` es el segundo parámetro opcional; la firma requerida `getPropertyBySlug(slug)` sigue siendo válida.

Esto no cambia ninguna de las firmas exigidas: solo agrega parámetros opcionales al final.

- [ ] **Paso 1: Escribir el test que falla**

Crear `lib/api/properties.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { fromRow, toRow } from './properties';

const ROW_COMPLETA = {
  id: '11111111-1111-1111-1111-111111111111',
  slug: 'terreno-con-alta-plusvalia-en-colonia-seattle',
  titulo: 'Terreno con Alta Plusvalía en Colonia Seattle',
  gancho: 'Terreno urbano premium',
  tipo_inmueble: 'terreno',
  operacion: 'venta',
  estatus: 'disponible',
  publicado: true,
  destacado: true,
  orden: 1,
  precio: '38000000',
  moneda: 'MXN',
  mostrar_precio: true,
  precio_nota: 'Por debajo de lo valuado',
  formas_pago: ['Contado', 'Aportación'],
  calle: 'Calle 10',
  numero_exterior: '66',
  numero_interior: null,
  colonia: 'Seattle',
  municipio: 'Zapopan',
  estado: 'Jalisco',
  cp: null,
  lat: null,
  lng: null,
  mostrar_direccion_exacta: true,
  superficie_terreno_m2: '1610',
  superficie_construccion_m2: null,
  medida_norte: '46.00 m',
  medida_sur: '36.00 m + quiebre de 10.00 m',
  medida_oriente: '35.00 m',
  medida_poniente: '33.00 m',
  medidas_nota: 'El lindero sur presenta un quiebre.',
  recamaras: null,
  banos: null,
  medios_banos: null,
  estacionamientos: null,
  niveles: null,
  antiguedad_anios: null,
  descripcion: 'Terreno urbano de 1,610 m².',
  ideal_para: ['Desarrollo habitacional'],
  ventajas: ['Alta plusvalía'],
  entorno: ['Corporativos'],
  estatus_legal: ['Escritura pública'],
  amenidades: ['Agua', 'Luz'],
  highlights: [{ icono: 'crown', titulo: 'Zona Premium', texto: '...' }],
  portada_url: 'https://cdn/portada.jpg',
  ficha_pdf_url: 'https://cdn/ficha.pdf',
  asesor_nombre: 'Heredabienes',
  asesor_telefono: '+52 33 1301 3253',
  asesor_email: 'heredabienes@outlook.com',
  meta_title: 'Terreno en venta en Colonia Seattle',
  meta_description: 'Terreno urbano de 1,610 m².',
  created_at: '2026-07-20T00:00:00.000Z',
  updated_at: '2026-07-20T00:00:00.000Z',
};

describe('fromRow', () => {
  it('convierte snake_case a camelCase en todos los campos', () => {
    const p = fromRow(ROW_COMPLETA);

    expect(p.tipoInmueble).toBe('terreno');
    expect(p.mostrarPrecio).toBe(true);
    expect(p.precioNota).toBe('Por debajo de lo valuado');
    expect(p.formasPago).toEqual(['Contado', 'Aportación']);
    expect(p.numeroExterior).toBe('66');
    expect(p.mostrarDireccionExacta).toBe(true);
    expect(p.superficieTerrenoM2).toBe('1610');
    expect(p.superficieConstruccionM2).toBeNull();
    expect(p.medidaNorte).toBe('46.00 m');
    expect(p.medidaSur).toBe('36.00 m + quiebre de 10.00 m');
    expect(p.medidaOriente).toBe('35.00 m');
    expect(p.medidaPoniente).toBe('33.00 m');
    expect(p.medidasNota).toBe('El lindero sur presenta un quiebre.');
    expect(p.mediosBanos).toBeNull();
    expect(p.antiguedadAnios).toBeNull();
    expect(p.idealPara).toEqual(['Desarrollo habitacional']);
    expect(p.estatusLegal).toEqual(['Escritura pública']);
    expect(p.portadaUrl).toBe('https://cdn/portada.jpg');
    expect(p.fichaPdfUrl).toBe('https://cdn/ficha.pdf');
    expect(p.asesorNombre).toBe('Heredabienes');
    expect(p.asesorTelefono).toBe('+52 33 1301 3253');
    expect(p.asesorEmail).toBe('heredabienes@outlook.com');
    expect(p.metaTitle).toBe('Terreno en venta en Colonia Seattle');
    expect(p.metaDescription).toBe('Terreno urbano de 1,610 m².');
    expect(p.createdAt).toBe('2026-07-20T00:00:00.000Z');
    expect(p.updatedAt).toBe('2026-07-20T00:00:00.000Z');
  });

  it('expone exactamente las claves del contrato Property', () => {
    expect(Object.keys(fromRow(ROW_COMPLETA)).sort()).toEqual(
      [
        'id', 'slug', 'titulo', 'gancho', 'tipoInmueble', 'operacion', 'estatus',
        'publicado', 'destacado', 'orden', 'precio', 'moneda', 'mostrarPrecio',
        'precioNota', 'formasPago', 'calle', 'numeroExterior', 'numeroInterior',
        'colonia', 'municipio', 'estado', 'cp', 'lat', 'lng',
        'mostrarDireccionExacta', 'superficieTerrenoM2', 'superficieConstruccionM2',
        'medidaNorte', 'medidaSur', 'medidaOriente', 'medidaPoniente', 'medidasNota',
        'recamaras', 'banos', 'mediosBanos', 'estacionamientos', 'niveles',
        'antiguedadAnios', 'descripcion', 'idealPara', 'ventajas', 'entorno',
        'estatusLegal', 'amenidades', 'highlights', 'portadaUrl', 'fichaPdfUrl',
        'asesorNombre', 'asesorTelefono', 'asesorEmail', 'metaTitle',
        'metaDescription', 'createdAt', 'updatedAt', 'imagenes',
      ].sort()
    );
  });

  it('normaliza los arreglos ausentes a []', () => {
    const p = fromRow({ id: 'x', slug: 's', titulo: 't' });
    expect(p.formasPago).toEqual([]);
    expect(p.idealPara).toEqual([]);
    expect(p.ventajas).toEqual([]);
    expect(p.entorno).toEqual([]);
    expect(p.estatusLegal).toEqual([]);
    expect(p.amenidades).toEqual([]);
    expect(p.highlights).toEqual([]);
    expect(p.imagenes).toEqual([]);
  });

  it('mapea las imágenes anidadas y las ordena por orden', () => {
    const p = fromRow({
      ...ROW_COMPLETA,
      property_images: [
        { id: 'b', property_id: 'x', url: 'u2', storage_path: 'p2', alt: 'dos', orden: 2, created_at: 'c' },
        { id: 'a', property_id: 'x', url: 'u1', storage_path: 'p1', alt: 'uno', orden: 1, created_at: 'c' },
      ],
    });
    expect(p.imagenes.map((i) => i.id)).toEqual(['a', 'b']);
    expect(p.imagenes[0].storagePath).toBe('p1');
  });

  it('devuelve null si la fila es null', () => {
    expect(fromRow(null)).toBeNull();
  });
});

describe('toRow', () => {
  it('convierte camelCase a snake_case', () => {
    expect(
      toRow({
        titulo: 'Casa nueva',
        tipoInmueble: 'casa',
        mostrarPrecio: false,
        numeroExterior: '10',
        superficieTerrenoM2: 300,
        medidaSur: '20 m',
        mediosBanos: 1,
        antiguedadAnios: 5,
        idealPara: ['Familia'],
        estatusLegal: ['Escritura pública'],
        portadaUrl: 'https://cdn/a.jpg',
        fichaPdfUrl: 'https://cdn/a.pdf',
        asesorTelefono: '33',
        metaDescription: 'desc',
        mostrarDireccionExacta: false,
      })
    ).toEqual({
      titulo: 'Casa nueva',
      tipo_inmueble: 'casa',
      mostrar_precio: false,
      numero_exterior: '10',
      superficie_terreno_m2: 300,
      medida_sur: '20 m',
      medios_banos: 1,
      antiguedad_anios: 5,
      ideal_para: ['Familia'],
      estatus_legal: ['Escritura pública'],
      portada_url: 'https://cdn/a.jpg',
      ficha_pdf_url: 'https://cdn/a.pdf',
      asesor_telefono: '33',
      meta_description: 'desc',
      mostrar_direccion_exacta: false,
    });
  });

  it('omite las claves ausentes: permite updates parciales', () => {
    expect(toRow({ publicado: true })).toEqual({ publicado: true });
    expect(toRow({})).toEqual({});
  });

  it('ignora undefined pero conserva null (para poder limpiar un campo)', () => {
    expect(toRow({ precio: undefined })).toEqual({});
    expect(toRow({ precio: null })).toEqual({ precio: null });
  });

  it('ignora las claves que no son columnas', () => {
    expect(toRow({ id: 'x', createdAt: 'y', updatedAt: 'z', imagenes: [], loQueSea: 1 })).toEqual({});
  });

  it('es el inverso de fromRow para las columnas escribibles', () => {
    const row = toRow(fromRow(ROW_COMPLETA));
    expect(row.tipo_inmueble).toBe('terreno');
    expect(row.medida_sur).toBe('36.00 m + quiebre de 10.00 m');
    expect(row.formas_pago).toEqual(['Contado', 'Aportación']);
    expect(row.id).toBeUndefined();
    expect(row.created_at).toBeUndefined();
  });
});
```

- [ ] **Paso 2: Correr el test y verificar que falla**

Ejecutar: `npm test -- lib/api/properties.test.js`

Esperado: FAIL con `Failed to resolve import "./properties" from "lib/api/properties.test.js"`.

- [ ] **Paso 3: Implementación mínima**

Crear `lib/api/properties.js`:

```js
import { createBrowserSupabase } from '../supabase/client';
import { slugify } from '../format';
import { imageFromRow } from './images';

// La UI trabaja con objetos camelCase; la DB usa snake_case. Todo el mapeo
// vive aquí para que ningún componente sepa la forma de la tabla.

// Se pide la propiedad con sus imágenes anidadas en una sola consulta.
const SELECT = '*, property_images(*)';

// Resuelve el cliente a usar. Por defecto el de navegador; los Server
// Components pasan el suyo (creado con createServerSupabase()) porque este
// módulo NO puede importar next/headers sin romper el bundle de cliente.
function resolveClient(client) {
  return client || createBrowserSupabase();
}

export function fromRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    titulo: r.titulo,
    gancho: r.gancho ?? null,
    tipoInmueble: r.tipo_inmueble ?? null,
    operacion: r.operacion ?? null,
    estatus: r.estatus ?? null,
    publicado: r.publicado ?? false,
    destacado: r.destacado ?? false,
    orden: r.orden ?? 0,

    precio: r.precio ?? null,
    moneda: r.moneda ?? 'MXN',
    mostrarPrecio: r.mostrar_precio ?? true,
    precioNota: r.precio_nota ?? null,
    formasPago: r.formas_pago ?? [],

    calle: r.calle ?? null,
    numeroExterior: r.numero_exterior ?? null,
    numeroInterior: r.numero_interior ?? null,
    colonia: r.colonia ?? null,
    municipio: r.municipio ?? null,
    estado: r.estado ?? null,
    cp: r.cp ?? null,
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    mostrarDireccionExacta: r.mostrar_direccion_exacta ?? true,

    superficieTerrenoM2: r.superficie_terreno_m2 ?? null,
    superficieConstruccionM2: r.superficie_construccion_m2 ?? null,
    medidaNorte: r.medida_norte ?? null,
    medidaSur: r.medida_sur ?? null,
    medidaOriente: r.medida_oriente ?? null,
    medidaPoniente: r.medida_poniente ?? null,
    medidasNota: r.medidas_nota ?? null,

    recamaras: r.recamaras ?? null,
    banos: r.banos ?? null,
    mediosBanos: r.medios_banos ?? null,
    estacionamientos: r.estacionamientos ?? null,
    niveles: r.niveles ?? null,
    antiguedadAnios: r.antiguedad_anios ?? null,

    descripcion: r.descripcion ?? null,
    idealPara: r.ideal_para ?? [],
    ventajas: r.ventajas ?? [],
    entorno: r.entorno ?? [],
    estatusLegal: r.estatus_legal ?? [],
    amenidades: r.amenidades ?? [],
    highlights: r.highlights ?? [],

    portadaUrl: r.portada_url ?? null,
    fichaPdfUrl: r.ficha_pdf_url ?? null,
    asesorNombre: r.asesor_nombre ?? null,
    asesorTelefono: r.asesor_telefono ?? null,
    asesorEmail: r.asesor_email ?? null,
    metaTitle: r.meta_title ?? null,
    metaDescription: r.meta_description ?? null,

    createdAt: r.created_at ?? null,
    updatedAt: r.updated_at ?? null,

    // Postgrest no garantiza el orden de las relaciones anidadas: se ordena aquí.
    imagenes: Array.isArray(r.property_images)
      ? [...r.property_images]
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          .map(imageFromRow)
      : [],
  };
}

// Spread condicional: solo entran al row las claves presentes en el objeto,
// lo que permite updates parciales sin borrar columnas por accidente.
// `undefined` se ignora; `null` sí se escribe (sirve para limpiar un campo).
export function toRow(p = {}) {
  return {
    ...(p.slug !== undefined && { slug: p.slug }),
    ...(p.titulo !== undefined && { titulo: p.titulo }),
    ...(p.gancho !== undefined && { gancho: p.gancho }),
    ...(p.tipoInmueble !== undefined && { tipo_inmueble: p.tipoInmueble }),
    ...(p.operacion !== undefined && { operacion: p.operacion }),
    ...(p.estatus !== undefined && { estatus: p.estatus }),
    ...(p.publicado !== undefined && { publicado: p.publicado }),
    ...(p.destacado !== undefined && { destacado: p.destacado }),
    ...(p.orden !== undefined && { orden: p.orden }),

    ...(p.precio !== undefined && { precio: p.precio }),
    ...(p.moneda !== undefined && { moneda: p.moneda }),
    ...(p.mostrarPrecio !== undefined && { mostrar_precio: p.mostrarPrecio }),
    ...(p.precioNota !== undefined && { precio_nota: p.precioNota }),
    ...(p.formasPago !== undefined && { formas_pago: p.formasPago }),

    ...(p.calle !== undefined && { calle: p.calle }),
    ...(p.numeroExterior !== undefined && { numero_exterior: p.numeroExterior }),
    ...(p.numeroInterior !== undefined && { numero_interior: p.numeroInterior }),
    ...(p.colonia !== undefined && { colonia: p.colonia }),
    ...(p.municipio !== undefined && { municipio: p.municipio }),
    ...(p.estado !== undefined && { estado: p.estado }),
    ...(p.cp !== undefined && { cp: p.cp }),
    ...(p.lat !== undefined && { lat: p.lat }),
    ...(p.lng !== undefined && { lng: p.lng }),
    ...(p.mostrarDireccionExacta !== undefined && {
      mostrar_direccion_exacta: p.mostrarDireccionExacta,
    }),

    ...(p.superficieTerrenoM2 !== undefined && {
      superficie_terreno_m2: p.superficieTerrenoM2,
    }),
    ...(p.superficieConstruccionM2 !== undefined && {
      superficie_construccion_m2: p.superficieConstruccionM2,
    }),
    ...(p.medidaNorte !== undefined && { medida_norte: p.medidaNorte }),
    ...(p.medidaSur !== undefined && { medida_sur: p.medidaSur }),
    ...(p.medidaOriente !== undefined && { medida_oriente: p.medidaOriente }),
    ...(p.medidaPoniente !== undefined && { medida_poniente: p.medidaPoniente }),
    ...(p.medidasNota !== undefined && { medidas_nota: p.medidasNota }),

    ...(p.recamaras !== undefined && { recamaras: p.recamaras }),
    ...(p.banos !== undefined && { banos: p.banos }),
    ...(p.mediosBanos !== undefined && { medios_banos: p.mediosBanos }),
    ...(p.estacionamientos !== undefined && { estacionamientos: p.estacionamientos }),
    ...(p.niveles !== undefined && { niveles: p.niveles }),
    ...(p.antiguedadAnios !== undefined && { antiguedad_anios: p.antiguedadAnios }),

    ...(p.descripcion !== undefined && { descripcion: p.descripcion }),
    ...(p.idealPara !== undefined && { ideal_para: p.idealPara }),
    ...(p.ventajas !== undefined && { ventajas: p.ventajas }),
    ...(p.entorno !== undefined && { entorno: p.entorno }),
    ...(p.estatusLegal !== undefined && { estatus_legal: p.estatusLegal }),
    ...(p.amenidades !== undefined && { amenidades: p.amenidades }),
    ...(p.highlights !== undefined && { highlights: p.highlights }),

    ...(p.portadaUrl !== undefined && { portada_url: p.portadaUrl }),
    ...(p.fichaPdfUrl !== undefined && { ficha_pdf_url: p.fichaPdfUrl }),
    ...(p.asesorNombre !== undefined && { asesor_nombre: p.asesorNombre }),
    ...(p.asesorTelefono !== undefined && { asesor_telefono: p.asesorTelefono }),
    ...(p.asesorEmail !== undefined && { asesor_email: p.asesorEmail }),
    ...(p.metaTitle !== undefined && { meta_title: p.metaTitle }),
    ...(p.metaDescription !== undefined && { meta_description: p.metaDescription }),
  };
}

// Aplica el criterio de ordenamiento del listado público.
function aplicarOrden(query, orden) {
  switch (orden) {
    case 'precio-asc':
      return query.order('precio', { ascending: true, nullsFirst: false });
    case 'precio-desc':
      return query.order('precio', { ascending: false, nullsFirst: false });
    case 'recientes':
      return query.order('created_at', { ascending: false });
    default:
      // Por defecto manda el orden manual del admin y, a igualdad, lo reciente.
      return query
        .order('orden', { ascending: true })
        .order('created_at', { ascending: false });
  }
}

// ----------------------------------------------------------------------------
// LECTURA
// ----------------------------------------------------------------------------

export async function listProperties({
  tipo,
  operacion,
  municipio,
  precioMin,
  precioMax,
  orden,
  includeUnpublished = false,
  client,
} = {}) {
  const supabase = resolveClient(client);
  let query = supabase.from('properties').select(SELECT);

  if (!includeUnpublished) query = query.eq('publicado', true);
  if (tipo) query = query.eq('tipo_inmueble', tipo);
  if (operacion) query = query.eq('operacion', operacion);
  // ilike sin comodines = igualdad sin distinguir mayúsculas: permite ?municipio=zapopan
  if (municipio) query = query.ilike('municipio', municipio);
  if (precioMin !== undefined && precioMin !== null && precioMin !== '') {
    query = query.gte('precio', precioMin);
  }
  if (precioMax !== undefined && precioMax !== null && precioMax !== '') {
    query = query.lte('precio', precioMax);
  }

  query = aplicarOrden(query, orden);

  const { data, error } = await query;
  if (error) throw error;
  return data.map(fromRow);
}

// Devuelve null (no lanza) cuando el slug no existe: la página llama a
// notFound() en ese caso.
export async function getPropertyBySlug(slug, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('properties')
    .select(SELECT)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

// Para el admin: el id siempre debe existir, así que aquí sí lanza.
export async function getPropertyById(id, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('properties')
    .select(SELECT)
    .eq('id', id)
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function listFeaturedProperties(limit = 3, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('properties')
    .select(SELECT)
    .eq('publicado', true)
    .eq('destacado', true)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(fromRow);
}

// "Otras propiedades" del detalle: mismas por municipio O por tipo, nunca ella misma.
export async function listRelatedProperties({
  id,
  municipio,
  tipoInmueble,
  limit = 3,
  client,
} = {}) {
  const supabase = resolveClient(client);
  let query = supabase
    .from('properties')
    .select(SELECT)
    .eq('publicado', true)
    .order('destacado', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (id) query = query.neq('id', id);

  // Los valores van entre comillas dobles porque un municipio puede traer
  // espacios y PostgREST usa la coma como separador de condiciones.
  const condiciones = [];
  if (municipio) condiciones.push(`municipio.eq."${municipio}"`);
  if (tipoInmueble) condiciones.push(`tipo_inmueble.eq."${tipoInmueble}"`);
  if (condiciones.length) query = query.or(condiciones.join(','));

  const { data, error } = await query;
  if (error) throw error;
  return data.map(fromRow);
}

// Alimenta el filtro de municipio del listado. Se deduplica en JS porque
// PostgREST no expone SELECT DISTINCT.
export async function listMunicipios(client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('properties')
    .select('municipio')
    .eq('publicado', true)
    .not('municipio', 'is', null);
  if (error) throw error;

  const unicos = [...new Set(data.map((r) => r.municipio).filter(Boolean))];
  return unicos.sort((a, b) => a.localeCompare(b, 'es'));
}

// ----------------------------------------------------------------------------
// ESCRITURA (solo autenticado; lo impone RLS, no este código)
// ----------------------------------------------------------------------------

// 23505 = unique_violation de Postgres.
const UNIQUE_VIOLATION = '23505';

function sufijoCorto() {
  return Math.random().toString(36).slice(2, 6);
}

export async function createProperty(fields, client) {
  const supabase = resolveClient(client);
  const base = { ...fields };
  if (!base.slug) base.slug = slugify(base.titulo);

  const { data, error } = await supabase
    .from('properties')
    .insert(toRow(base))
    .select(SELECT)
    .single();

  // Slug repetido: se reintenta una vez con sufijo en vez de reventar el form.
  if (error && error.code === UNIQUE_VIOLATION) {
    const conSufijo = { ...base, slug: `${base.slug}-${sufijoCorto()}` };
    const retry = await supabase
      .from('properties')
      .insert(toRow(conSufijo))
      .select(SELECT)
      .single();
    if (retry.error) throw retry.error;
    return fromRow(retry.data);
  }

  if (error) throw error;
  return fromRow(data);
}

export async function updateProperty(id, fields, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('properties')
    .update(toRow(fields))
    .eq('id', id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return fromRow(data);
}

// Las imágenes caen solas por el ON DELETE CASCADE. Los archivos del bucket
// los borra el admin antes de llamar aquí (usa storagePath de cada imagen).
export async function deleteProperty(id, client) {
  const supabase = resolveClient(client);
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw error;
}

// Clona una propiedad como borrador. No copia las imágenes: los archivos del
// bucket son compartidos y borrar el duplicado no debe romper el original.
export async function duplicateProperty(id, client) {
  const original = await getPropertyById(id, client);

  const titulo = `${original.titulo} (copia)`;
  const copia = {
    ...original,
    titulo,
    slug: `${slugify(titulo)}-${sufijoCorto()}`,
    publicado: false,
    destacado: false,
  };

  delete copia.id;
  delete copia.createdAt;
  delete copia.updatedAt;
  delete copia.imagenes;

  return createProperty(copia, client);
}
```

- [ ] **Paso 4: Correr el test**

Ejecutar: `npm test -- lib/api/properties.test.js`

Esperado: PASS, 10 tests.

- [ ] **Paso 5: Commit**

```bash
git add lib/api/properties.js lib/api/properties.test.js
git commit -m "[DATA] lib/api/properties: mapeo fromRow/toRow y CRUD de propiedades"
```

---

### Tarea 2.7: `lib/api/images.js` — galería de la propiedad

**Archivos:**
- Crear: `lib/api/images.js`

**Interfaces:**
- Consume: `createBrowserSupabase()`.
- Produce:
  - `imageFromRow(row) -> Image` (la usa `properties.js` para las imágenes anidadas)
  - `listImagesByProperty(propertyId) -> Promise<Image[]>`
  - `addImage({ propertyId, url, storagePath, alt, orden }) -> Promise<Image>`
  - `reorderImages(orderedIds) -> Promise<void>`
  - `deleteImage(id) -> Promise<void>`
- Objeto `Image`: `{ id, propertyId, url, storagePath, alt, orden, createdAt }`.

**Nota:** el mapeo `imageFromRow` queda cubierto indirectamente por el test de `fromRow` de la tarea 2.6 ("mapea las imágenes anidadas y las ordena por orden"). No se añaden tests de integración contra Supabase.

- [ ] **Paso 1: Implementación**

Crear `lib/api/images.js`:

```js
import { createBrowserSupabase } from '../supabase/client';

function resolveClient(client) {
  return client || createBrowserSupabase();
}

export function imageFromRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    propertyId: r.property_id,
    url: r.url,
    storagePath: r.storage_path ?? null,
    alt: r.alt ?? null,
    orden: r.orden ?? 0,
    createdAt: r.created_at ?? null,
  };
}

export function imageToRow(i = {}) {
  return {
    ...(i.propertyId !== undefined && { property_id: i.propertyId }),
    ...(i.url !== undefined && { url: i.url }),
    ...(i.storagePath !== undefined && { storage_path: i.storagePath }),
    ...(i.alt !== undefined && { alt: i.alt }),
    ...(i.orden !== undefined && { orden: i.orden }),
  };
}

export async function listImagesByProperty(propertyId, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', propertyId)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(imageFromRow);
}

export async function addImage({ propertyId, url, storagePath, alt, orden } = {}, client) {
  const supabase = resolveClient(client);
  const { data, error } = await supabase
    .from('property_images')
    .insert(imageToRow({ propertyId, url, storagePath, alt, orden }))
    .select('*')
    .single();
  if (error) throw error;
  return imageFromRow(data);
}

// Recibe los ids en el orden final del drag & drop y persiste el índice.
// Son updates independientes: si uno falla, se lanza el primer error.
export async function reorderImages(orderedIds = [], client) {
  const supabase = resolveClient(client);
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('property_images').update({ orden: index }).eq('id', id)
    )
  );
  const fallo = results.find((r) => r.error);
  if (fallo) throw fallo.error;
}

// Borra solo el registro. El archivo del bucket lo borra el llamador con
// deleteFile(storagePath) de lib/api/storage.js, antes o después de esto.
export async function deleteImage(id, client) {
  const supabase = resolveClient(client);
  const { error } = await supabase.from('property_images').delete().eq('id', id);
  if (error) throw error;
}
```

- [ ] **Paso 2: Verificar que el test de properties sigue pasando**

Ejecutar: `npm test`

Esperado: PASS. En particular `fromRow > mapea las imágenes anidadas y las ordena por orden`, que ahora resuelve `imageFromRow` de verdad.

- [ ] **Paso 3: Commit**

```bash
git add lib/api/images.js
git commit -m "[DATA] lib/api/images: galería de propiedades (listar, agregar, reordenar, borrar)"
```

---

### Tarea 2.8: `lib/api/storage.js` — bucket `propiedades`

**Archivos:**
- Crear: `lib/api/storage.js`

**Interfaces:**
- Consume: `createBrowserSupabase()`, bucket `propiedades` del schema.
- Produce:
  - `uploadFile(file, folder = 'misc') -> Promise<{ path, url }>`
  - `deleteFile(path) -> Promise<void>`

**Nota:** sin TDD. Es un wrapper del SDK de storage; se verifica subiendo un archivo desde el admin en la fase 4.

- [ ] **Paso 1: Implementación**

Crear `lib/api/storage.js`:

```js
import { createBrowserSupabase } from '../supabase/client';

const BUCKET = 'propiedades';

// Solo letras, números, punto y guion: Supabase Storage rechaza rutas con
// espacios, acentos o caracteres raros.
function limpiarNombre(nombre) {
  return String(nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Sube un File (del <input type="file"> o del drag & drop) al bucket
// "propiedades" y devuelve { path, url }.
//   path → se guarda en property_images.storage_path, sirve para borrarlo luego
//   url  → URL pública, se guarda en property_images.url o en portada_url
// folder agrupa por tipo: 'galeria', 'portadas', 'fichas'.
export async function uploadFile(file, folder = 'misc') {
  if (!file) throw new Error('uploadFile: no se recibió ningún archivo');

  const supabase = createBrowserSupabase();
  const limpio = limpiarNombre(file.name);
  const ext = (limpio.split('.').pop() || 'bin').slice(0, 8);
  const unico = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${folder}/${unico}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

// Borra un archivo por el path que devolvió uploadFile.
// Es tolerante a path vacío para poder llamarla sin condicionales en el admin.
export async function deleteFile(path) {
  if (!path) return;
  const supabase = createBrowserSupabase();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
```

- [ ] **Paso 2: Verificación**

Ejecutar: `npm run build`

Esperado: build exitoso. La verificación funcional (subir y borrar un archivo real) ocurre en la fase 4, cuando exista el formulario del admin.

- [ ] **Paso 3: Commit**

```bash
git add lib/api/storage.js
git commit -m "[DATA] lib/api/storage: subida y borrado de archivos en el bucket propiedades"
```

---

### Tarea 2.9: `lib/auth.js` — sesión del admin

**Archivos:**
- Crear: `lib/auth.js`

**Interfaces:**
- Consume: `createBrowserSupabase()`.
- Produce:
  - `signIn(email, password) -> Promise<Session>`
  - `signOut() -> Promise<void>`
  - `getSession() -> Promise<Session | null>`
  - `getUser() -> Promise<User | null>`
  - `useAuth() -> { user, loading }`

**Nota:** sin TDD. `useAuth` es un hook sobre el SDK; testearlo exigiría un mock completo de `supabase.auth` que no aportaría nada. La protección real de rutas la da el `middleware.js` (fase 4) y, sobre todo, RLS.

- [ ] **Paso 1: Implementación**

Crear `lib/auth.js`:

```js
'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from './supabase/client';

// ----------------------------------------------------------------------------
// Auth con Supabase (email + password) para el admin de Heredabienes.
// No hay registro público: los usuarios se crean a mano en el dashboard de
// Supabase (Authentication → Users → Add user). Ver SETUP_SUPABASE.md.
//
// Este módulo solo maneja la sesión del navegador. La autorización real la
// imponen las políticas RLS de Postgres, no este código.
// ----------------------------------------------------------------------------

export async function signIn(email, password) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const supabase = createBrowserSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const supabase = createBrowserSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Hook para la UI del admin. Devuelve { user, loading }.
//   const { user, loading } = useAuth();
//   if (loading) return null;
//   if (!user) router.replace('/admin-hb');
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;
    const supabase = createBrowserSupabase();

    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
```

- [ ] **Paso 2: Verificación**

Ejecutar: `npm run build`

Esperado: build exitoso, sin advertencias de hooks fuera de un Client Component (la directiva `'use client'` está en la primera línea).

- [ ] **Paso 3: Commit**

```bash
git add lib/auth.js
git commit -m "[DATA] lib/auth: sesión del admin con Supabase Auth y hook useAuth"
```

---

### Tarea 2.10: `SETUP_SUPABASE.md` — runbook y verificación end-to-end

**Archivos:**
- Crear: `SETUP_SUPABASE.md`

**Interfaces:**
- Consume: `supabase/schema.sql`, `supabase/seed.sql`, `.env.example`.
- Produce: procedimiento reproducible de puesta en marcha.

- [ ] **Paso 1: Escribir el runbook**

Crear `SETUP_SUPABASE.md`:

```markdown
# Configurar Supabase para Heredabienes

Guía para dejar operativo el catálogo de propiedades desde cero.
Tiempo estimado: 15 minutos. Se hace una sola vez por entorno.

## 1. Crear el proyecto

1. Entra a https://supabase.com y crea una cuenta (o inicia sesión).
2. **New project**:
   - **Name:** `heredabienes`
   - **Database password:** genera una fuerte y guárdala en tu gestor de contraseñas. No la vas a necesitar para la app, pero sí para acceso directo a la base.
   - **Region:** la más cercana a México (`us-east-1` o `us-west-1`).
   - **Plan:** Free es suficiente para arrancar.
3. Espera a que el proyecto termine de aprovisionarse (~2 minutos).

## 2. Crear las tablas, RLS y el bucket

1. En el menú lateral: **SQL Editor** → **New query**.
2. Abre `supabase/schema.sql` de este repositorio y copia **todo** el contenido.
3. Pégalo en el editor y pulsa **Run**.
4. Resultado esperado: `Success. No rows returned`.

Este archivo es idempotente: puedes volver a correrlo sin romper nada.

**Qué crea:**
- Tabla `properties` (con los `CHECK` de tipo, operación y estatus).
- Tabla `property_images` (borrado en cascada al eliminar la propiedad).
- Índices en `slug`, `publicado`, `municipio`, `tipo_inmueble`, `destacado`.
- Trigger `touch_updated_at` sobre `properties`.
- Políticas RLS: el público lee solo lo publicado, el autenticado lee y escribe todo.
- Bucket de storage `propiedades`, público en lectura y autenticado en escritura.

## 3. Sembrar la primera propiedad

1. **SQL Editor** → **New query**.
2. Copia el contenido de `supabase/seed.sql` y pulsa **Run**.
3. Verifica con:

   ```sql
   select slug, titulo, precio, superficie_terreno_m2
   from properties;
   ```

   Debe devolver la fila del terreno de Colonia Seattle, Zapopan, con `precio = 38000000`.

El seed inserta la ficha completa del terreno **sin fotos**: las imágenes se suben después desde el panel admin.

## 4. Crear el usuario admin (a mano)

No hay registro público. El usuario se crea directamente en el dashboard:

1. Menú lateral: **Authentication** → **Users**.
2. **Add user** → **Create new user**.
3. Rellena:
   - **Email:** el correo del staff de Heredabienes.
   - **Password:** una contraseña fuerte, guardada en el gestor de contraseñas.
   - Marca **Auto Confirm User** (si no, el usuario queda pendiente de confirmar el correo y no podrá entrar).
4. **Create user**.

Repite el paso por cada persona del staff que deba publicar propiedades. Todos tienen los mismos permisos: no hay roles.

## 5. Copiar las variables de entorno

1. Menú lateral: **Project Settings** → **API**.
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. En la raíz del proyecto, crea `.env.local` a partir de `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

4. Pega los valores reales en `.env.local`.
5. Reinicia el servidor de desarrollo (Next solo lee `.env.local` al arrancar):

   ```bash
   npm run dev
   ```

### Seguridad

- `.env.local` está en `.gitignore`. **Nunca** lo commitees.
- Usa **solo** la `anon key`. La `service_role` key salta todas las políticas RLS: no debe aparecer en este repositorio ni en ninguna variable `NEXT_PUBLIC_*`, porque esas viajan al navegador.
- Si sospechas que una clave se filtró: **Project Settings → API → Rotate**.

## 6. Verificar que todo quedó bien

Con `npm run dev` corriendo:

1. Abre `http://localhost:3000/propiedades`. Debe aparecer el terreno de Colonia Seattle.
2. Abre `http://localhost:3000/admin-hb`. Inicia sesión con el usuario del paso 4.
3. En el dashboard, edita la propiedad, sube una foto de portada y guarda. La foto debe aparecer en `/propiedades`.
4. Prueba que RLS funciona: en el SQL Editor, corre

   ```sql
   set local role anon;
   select count(*) from properties;   -- solo cuenta las publicadas
   insert into properties (slug, titulo, tipo_inmueble, operacion)
   values ('hack', 'Hack', 'casa', 'venta');   -- debe fallar
   reset role;
   ```

   El `insert` debe fallar con `new row violates row-level security policy`.

## Despliegue (Vercel)

Las mismas dos variables hay que declararlas en el proyecto de Vercel:
**Settings → Environment Variables** → `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, para los entornos *Production*, *Preview* y *Development*. Después, redeploy.

## Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| "supabaseUrl is required" en consola | Falta `.env.local` o no reiniciaste el dev server | Paso 5, y reinicia `npm run dev` |
| El listado sale vacío | La propiedad tiene `publicado = false` | Publícala desde el admin, o `update properties set publicado = true;` |
| El login dice "Invalid login credentials" | El usuario no está confirmado | Recréalo con **Auto Confirm User** marcado |
| "new row violates row-level security policy" al guardar desde el admin | La sesión expiró | Cierra sesión y vuelve a entrar |
| Las fotos suben pero no se ven | El bucket quedó privado | Vuelve a correr `schema.sql`: pone `public = true` en el bucket |
```

- [ ] **Paso 2: Ejecutar el runbook completo**

Seguir `SETUP_SUPABASE.md` de principio a fin contra un proyecto real de Supabase. Cada paso que no funcione tal cual está escrito se corrige en el documento antes de commitear.

Verificación mínima con el proyecto ya configurado (`.env.local` presente):

```bash
npm test && npm run build
```

Esperado: PASS y build exitoso.

- [ ] **Paso 3: Commit**

```bash
git add SETUP_SUPABASE.md
git commit -m "[DATA] SETUP_SUPABASE.md: runbook de configuración del proyecto de Supabase"
```

---

### Dependencias y orden de ejecución

```
2.1 (deps + vitest + env)
 ├─ 2.2 lib/format.js                  ← independiente, se puede paralelizar
 ├─ 2.3 schema.sql ──► 2.4 seed.sql    ← 2.3 debe respetar los CHECK de 2.2
 └─ 2.5 clientes supabase
      └─ 2.7 lib/api/images.js  ──┐
      └─ 2.2 + 2.7 ──────────────┴─► 2.6 lib/api/properties.js
      └─ 2.8 lib/api/storage.js
      └─ 2.9 lib/auth.js
2.3 + 2.4 + 2.1 ──► 2.10 SETUP_SUPABASE.md
```

`2.6` importa `imageFromRow` de `2.7`: implementar `2.7` antes de correr los tests de `2.6`, o el test de imágenes anidadas fallará por import no resuelto.

### Riesgos y decisiones que la fase 3 debe conocer

1. **El cliente de Supabase se inyecta.** Todo Server Component que llame a `lib/api/properties.js` debe pasar `client: await createServerSupabase()` (o el segundo argumento en `getPropertyBySlug`/`getPropertyById`). Si se omite, la función usa el cliente de navegador y en el servidor corre sin sesión: los reads públicos funcionan, pero `includeUnpublished` devolvería vacío silenciosamente.
2. **`getPropertyBySlug` devuelve `null`, no lanza,** cuando el slug no existe. La página de detalle debe llamar a `notFound()`.
3. **`precio` y las superficies llegan como string** (`numeric` de Postgres se serializa como string en PostgREST). Por eso `formatPrecio`/`formatSuperficie` normalizan con `Number()`. Nunca comparar `precio` con `===` contra un número.
4. **`highlights` es un arreglo de `{icono, titulo, texto}`**; `icono` es un nombre de lucide-react en kebab-case y el componente de la fase 3 necesita su propio mapa nombre→componente (lucide-react no permite import dinámico por string sin arrastrar todo el paquete).
5. **`lat`/`lng` del terreno de Colonia Seattle están en NULL.** El bloque de mapa debe renderizarse solo si ambos tienen valor.

### Critical Files for Implementation
- /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/supabase/schema.sql
- /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/lib/api/properties.js
- /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/lib/format.js
- /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/lib/supabase/server.js
- /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/supabase/seed.sql

---

## FASE 3 — Páginas públicas de propiedades

**Objetivo:** construir `/propiedades` (listado con filtros en la URL) y `/propiedades/[slug]` (ficha completa con `generateMetadata`), más la integración en Navbar, Footer y Home. Todo el diseño es **mobile-first**: la ficha se abre desde un link de WhatsApp en un celular, así que el layout base es una columna, tipografías legibles sin zoom, targets táctiles ≥ 44 px, y los breakpoints `sm:` / `md:` / `lg:` solo agregan columnas.

**Verificación de la fase:** `npm run build` termina sin errores y sin warnings de `searchParams`/`params`; `npm run dev` y con la propiedad de referencia (terreno Colonia Seattle, Zapopan, `$38,000,000 MXN`, Calle 10 #66) se verifica: `/propiedades` la muestra en el grid y sobrevive a `?municipio=Zapopan&tipo=terreno&orden=precio_desc`; `/propiedades/terreno-alta-plusvalia-colonia-seattle` muestra las medidas norte 46.00 m, sur "36.00 m + quiebre de 10.00 m", oriente 35.00 m, poniente 33.00 m; `curl -s localhost:3000/propiedades/<slug> | grep 'og:image'` devuelve la `portadaUrl`; y una propiedad con arreglos vacíos no renderiza ningún encabezado huérfano.

**Decisiones tomadas en esta fase (una línea cada una):**
- **Mapa sin API key:** iframe a `https://www.google.com/maps?q=...&output=embed`, porque no requiere facturación ni clave y funciona embebido en móvil.
- **Encabezado "sticky":** el bloque de título va en flujo normal y las acciones se fijan en una barra inferior (`StickyCTA`) solo en móvil, porque un header sticky completo se come media pantalla en un celular.
- **Imports relativos, no alias `@/`:** no dependemos de que exista `jsconfig.json`.
- **`next/image` para portadas y galería:** requiere agregar el host de Supabase a `remotePatterns` (paso explícito en la Tarea 3.1).
- **Filtros con `<form>` + `router.push`:** un solo componente cliente, sin debounce ni estado global; la URL es la única fuente de verdad.

---

### Tarea 3.1: Cimientos — configuración de imágenes, helpers de opciones, WhatsApp y badges

**Archivos:**
- Modificar: `next.config.js`
- Crear: `lib/opciones.js`
- Crear: `lib/whatsapp.js`
- Crear: `components/propiedades/EstatusBadge.jsx`
- Crear: `components/propiedades/TipoBadge.jsx`

**Interfaces:**
- **Consume:** `TIPOS_INMUEBLE`, `OPERACIONES`, `ESTATUS` de `lib/format.js`.
- **Produce:**
  - `opciones(lista) -> {value,label}[]` — normaliza una constante de `lib/format.js` venga como `string[]` o como `{value,label}[]`.
  - `etiqueta(lista, value) -> string` — label legible; cae al `value` capitalizado si no hay match.
  - `WHATSAPP_FALLBACK` (`'5213313013253'`), `EMAIL_FALLBACK` (`'heredabienes@outlook.com'`).
  - `telefonoAWhatsApp(telefono) -> string` — deja solo dígitos y antepone `52` si faltan.
  - `urlWhatsAppPropiedad(property, urlPublica) -> string` — URL `wa.me` con mensaje prellenado citando título, colonia/municipio y link.
  - `urlPublicaPropiedad(slug) -> string` — URL absoluta con `NEXT_PUBLIC_SITE_URL`.
  - `<EstatusBadge estatus="disponible|apartado|vendido|pausado" size="sm|md" />` — Server Component.
  - `<TipoBadge tipo="terreno" operacion="venta" />` — Server Component; `operacion` opcional.

- [ ] **Paso 1: Confirmar la forma de las constantes de Fase 2**

```bash
grep -n "TIPOS_INMUEBLE\|OPERACIONES\|ESTATUS\|orden" /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/lib/format.js /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/lib/api/properties.js
```

Anota los valores aceptados por el parámetro `orden` de `listProperties`. En este plan se asume `'recientes' | 'precio_asc' | 'precio_desc'`; si difieren, el único lugar a ajustar es el arreglo `ORDENES` de `components/propiedades/PropertyFilters.jsx` (Tarea 3.2).

- [ ] **Paso 2: Agregar el host de Supabase Storage a `next.config.js`**

Abre `next.config.js` y deja el bloque `images.remotePatterns` así (conserva los patrones de Unsplash que puso la Fase 1 y agrega los dos nuevos):

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '*.supabase.in', pathname: '/storage/v1/object/public/**' },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Paso 3: Crear `lib/opciones.js`**

```js
/**
 * Normaliza las constantes de lib/format.js a una forma única {value, label}.
 * Acepta tanto string[] como {value,label}[] para no acoplarse a la fase 2.
 */

function capitalizar(texto) {
  const limpio = String(texto ?? '').replace(/[_-]/g, ' ').trim();
  if (!limpio) return '';
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

export function opciones(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.map((item) => {
    if (item && typeof item === 'object') {
      return { value: item.value ?? item.id ?? '', label: item.label ?? capitalizar(item.value ?? '') };
    }
    return { value: item, label: capitalizar(item) };
  });
}

export function etiqueta(lista, value) {
  if (!value) return '';
  const encontrada = opciones(lista).find((o) => o.value === value);
  return encontrada ? encontrada.label : capitalizar(value);
}
```

- [ ] **Paso 4: Crear `lib/whatsapp.js`**

```js
export const WHATSAPP_FALLBACK = '5213313013253';
export const EMAIL_FALLBACK = 'heredabienes@outlook.com';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://heredabienes.com').replace(/\/$/, '');

export function urlPublicaPropiedad(slug) {
  return `${SITE_URL}/propiedades/${slug}`;
}

/** Deja solo dígitos y antepone lada de México si el número viene local. */
export function telefonoAWhatsApp(telefono) {
  const digitos = String(telefono ?? '').replace(/\D/g, '');
  if (!digitos) return WHATSAPP_FALLBACK;
  if (digitos.startsWith('52')) return digitos;
  if (digitos.length === 10) return `521${digitos}`;
  return digitos;
}

export function urlWhatsAppPropiedad(property, urlPublica) {
  const numero = telefonoAWhatsApp(property?.asesorTelefono);
  const ubicacion = [property?.colonia, property?.municipio].filter(Boolean).join(', ');
  const link = urlPublica || urlPublicaPropiedad(property?.slug);
  const mensaje = [
    `Hola, vi la propiedad "${property?.titulo ?? ''}"`,
    ubicacion ? ` en ${ubicacion}` : '',
    ' y me interesa recibir más información.',
    `\n${link}`,
  ].join('');
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
```

- [ ] **Paso 5: Crear `components/propiedades/EstatusBadge.jsx`** (Server Component: solo pinta texto)

```jsx
const ESTILOS = {
  disponible: { label: 'Disponible', clase: 'bg-green-100 text-green-700 ring-green-200' },
  apartado: { label: 'Apartado', clase: 'bg-amber-100 text-amber-700 ring-amber-200' },
  vendido: { label: 'Vendido', clase: 'bg-gray-200 text-gray-600 ring-gray-300' },
  pausado: { label: 'Pausado', clase: 'bg-gray-200 text-gray-600 ring-gray-300' },
};

export default function EstatusBadge({ estatus, size = 'sm' }) {
  const config = ESTILOS[estatus];
  if (!config) return null;

  const dimension = size === 'md' ? 'text-sm px-3.5 py-1.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold font-display ring-1 ${config.clase} ${dimension}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </span>
  );
}
```

- [ ] **Paso 6: Crear `components/propiedades/TipoBadge.jsx`** (Server Component)

```jsx
import { TIPOS_INMUEBLE, OPERACIONES } from '../../lib/format';
import { etiqueta } from '../../lib/opciones';

export default function TipoBadge({ tipo, operacion }) {
  if (!tipo && !operacion) return null;

  const texto = [
    tipo ? etiqueta(TIPOS_INMUEBLE, tipo) : '',
    operacion ? `en ${etiqueta(OPERACIONES, operacion).toLowerCase()}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-semibold font-display text-primary-dark">
      {texto}
    </span>
  );
}
```

- [ ] **Paso 7: Verificar**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm run dev
```

Abre `http://localhost:3000` — el sitio de Fase 1 debe seguir levantando sin errores en consola (aún no hay UI nueva que ver; esta tarea solo agrega módulos y config).

- [ ] **Paso 8: Commit**

```bash
git add next.config.js lib/opciones.js lib/whatsapp.js components/propiedades/EstatusBadge.jsx components/propiedades/TipoBadge.jsx
git commit -m "[PROP] cimientos: remotePatterns de Supabase, helpers de opciones/WhatsApp y badges"
```

---

### Tarea 3.2: Listado `/propiedades` con filtros en la URL

**Archivos:**
- Crear: `components/propiedades/PropertyCard.jsx`
- Crear: `components/propiedades/PropertyFilters.jsx` (**Client**)
- Crear: `components/propiedades/EmptyState.jsx`
- Crear: `app/propiedades/page.js`
- Crear: `app/propiedades/loading.js`

**Interfaces:**
- **Consume:** `listProperties({ tipo, operacion, municipio, precioMin, precioMax, orden })`, `listMunicipios()`, `formatPrecio(precio, moneda, mostrarPrecio)`, `formatSuperficie(m2)`, `TIPOS_INMUEBLE`, `OPERACIONES`.
- **Produce:**
  - `<PropertyCard property={Property} priority={boolean} />` — Server Component. `priority` (default `false`) activa `priority` en el `next/image` de la portada; úsalo solo en las 2 primeras cards.
  - `<PropertyFilters municipios={string[]} />` — **Client Component** (usa `useRouter`, `useSearchParams`, estado del `<form>`). Lee valores iniciales de la URL y hace `router.push` al enviar.
  - `<EmptyState onClearHref="/propiedades" />` — Server Component; `onClearHref` es la URL del botón "Ver todas".

- [ ] **Paso 1: Crear `components/propiedades/PropertyCard.jsx`**

```jsx
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Maximize2 } from 'lucide-react';
import { formatPrecio, formatSuperficie } from '../../lib/format';
import EstatusBadge from './EstatusBadge';
import TipoBadge from './TipoBadge';

export default function PropertyCard({ property, priority = false }) {
  if (!property) return null;

  const ubicacion = [property.colonia, property.municipio].filter(Boolean).join(', ');
  const superficie = property.superficieTerrenoM2 || property.superficieConstruccionM2;
  const noDisponible = property.estatus === 'vendido' || property.estatus === 'apartado';

  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="card group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-soft">
        {property.portadaUrl ? (
          <Image
            src={property.portadaUrl}
            alt={`Portada de ${property.titulo}`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              noDisponible ? 'grayscale-[35%]' : ''
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400 font-body">
            Sin fotografía
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold font-display text-primary-dark shadow-sm">
            <TipoBadge tipo={property.tipoInmueble} operacion={property.operacion} />
          </span>
        </div>

        {noDisponible && (
          <div className="absolute right-3 top-3">
            <EstatusBadge estatus={property.estatus} />
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="mb-1.5 line-clamp-2 text-lg font-bold font-display text-gray-900 transition-colors group-hover:text-primary">
          {property.titulo}
        </h3>

        {ubicacion && (
          <p className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 font-body">
            <MapPin size={14} className="shrink-0 text-primary" aria-hidden="true" />
            <span className="line-clamp-1">{ubicacion}</span>
          </p>
        )}

        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-gray-100 pt-3">
          <span className="text-xl font-extrabold font-display text-primary">
            {formatPrecio(property.precio, property.moneda, property.mostrarPrecio)}
          </span>
          {superficie ? (
            <span className="flex items-center gap-1.5 text-sm text-gray-500 font-body">
              <Maximize2 size={14} className="text-gray-400" aria-hidden="true" />
              {formatSuperficie(superficie)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Paso 2: Crear `components/propiedades/PropertyFilters.jsx`**

**Es Client Component** porque necesita estado de formulario, `useSearchParams` para hidratar los campos desde la URL y `useRouter` para hacer push de la búsqueda.

```jsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { TIPOS_INMUEBLE, OPERACIONES } from '../../lib/format';
import { opciones } from '../../lib/opciones';

// Debe coincidir con los valores que acepta listProperties({ orden }) en lib/api/properties.js
const ORDENES = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
];

const CAMPOS = ['tipo', 'operacion', 'municipio', 'precioMin', 'precioMax', 'orden'];

const claseCampo =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-body text-gray-900 ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30';
const claseLabel = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 font-display';

export default function PropertyFilters({ municipios = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [abierto, setAbierto] = useState(false);

  const valorInicial = (campo) => searchParams.get(campo) ?? '';
  const activos = CAMPOS.filter((campo) => searchParams.get(campo)).length;

  const handleSubmit = (event) => {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    CAMPOS.forEach((campo) => {
      const valor = String(datos.get(campo) ?? '').trim();
      if (valor) params.set(campo, valor);
    });
    const query = params.toString();
    router.push(query ? `/propiedades?${query}` : '/propiedades', { scroll: false });
    setAbierto(false);
  };

  const limpiar = () => {
    router.push('/propiedades', { scroll: false });
    setAbierto(false);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
      {/* Toggle solo en móvil: en pantallas grandes los filtros están siempre visibles */}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="filtros-propiedades"
        className="flex w-full items-center justify-between rounded-xl bg-gray-soft px-4 py-3 text-sm font-semibold font-display text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-primary" aria-hidden="true" />
          Filtrar propiedades
          {activos > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">{activos}</span>
          )}
        </span>
        {abierto ? <X size={18} aria-hidden="true" /> : null}
      </button>

      <form
        id="filtros-propiedades"
        onSubmit={handleSubmit}
        className={`${abierto ? 'block' : 'hidden'} mt-4 lg:mt-0 lg:block`}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <label htmlFor="filtro-tipo" className={claseLabel}>Tipo de inmueble</label>
            <select id="filtro-tipo" name="tipo" defaultValue={valorInicial('tipo')} className={claseCampo}>
              <option value="">Todos</option>
              {opciones(TIPOS_INMUEBLE).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-operacion" className={claseLabel}>Operación</label>
            <select id="filtro-operacion" name="operacion" defaultValue={valorInicial('operacion')} className={claseCampo}>
              <option value="">Todas</option>
              {opciones(OPERACIONES).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-municipio" className={claseLabel}>Municipio</label>
            <select id="filtro-municipio" name="municipio" defaultValue={valorInicial('municipio')} className={claseCampo}>
              <option value="">Todos</option>
              {municipios.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-precio-min" className={claseLabel}>Precio mínimo</label>
            <input
              id="filtro-precio-min"
              name="precioMin"
              type="number"
              inputMode="numeric"
              min="0"
              step="100000"
              placeholder="0"
              defaultValue={valorInicial('precioMin')}
              className={claseCampo}
            />
          </div>

          <div>
            <label htmlFor="filtro-precio-max" className={claseLabel}>Precio máximo</label>
            <input
              id="filtro-precio-max"
              name="precioMax"
              type="number"
              inputMode="numeric"
              min="0"
              step="100000"
              placeholder="Sin límite"
              defaultValue={valorInicial('precioMax')}
              className={claseCampo}
            />
          </div>

          <div>
            <label htmlFor="filtro-orden" className={claseLabel}>Ordenar por</label>
            <select id="filtro-orden" name="orden" defaultValue={valorInicial('orden')} className={claseCampo}>
              {ORDENES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" className="btn-primary justify-center">
            <Search size={18} aria-hidden="true" />
            Buscar
          </button>
          {activos > 0 && (
            <button
              type="button"
              onClick={limpiar}
              className="rounded-full px-5 py-3 text-sm font-semibold font-display text-gray-500 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Paso 3: Crear `components/propiedades/EmptyState.jsx`**

```jsx
import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function EmptyState({ onClearHref = '/propiedades' }) {
  return (
    <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-md">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
        <SearchX size={28} className="text-primary" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-xl font-bold font-display text-gray-900">
        No encontramos propiedades con esos filtros
      </h3>
      <p className="mx-auto mb-6 max-w-md text-sm text-gray-500 font-body">
        Prueba ampliando el rango de precio o quitando el municipio. También podemos buscarte algo a
        la medida por WhatsApp.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href={onClearHref} className="btn-primary justify-center">
          Ver todas las propiedades
        </Link>
        <a
          href="https://wa.me/5213313013253?text=Hola%2C%20busco%20una%20propiedad%20y%20no%20la%20encontr%C3%A9%20en%20su%20cat%C3%A1logo"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline text-center"
        >
          Cuéntanos qué buscas
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Paso 4: Crear `app/propiedades/loading.js`**

```jsx
export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-soft pb-20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 h-10 w-64 animate-pulse rounded-xl bg-gray-200" />
        <div className="mb-10 h-40 animate-pulse rounded-2xl bg-gray-200" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="aspect-[4/3] animate-pulse bg-gray-200" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-2/5 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Paso 5: Crear `app/propiedades/page.js`** (Server Component; `searchParams` es una Promise en Next 15)

```jsx
import { Suspense } from 'react';
import { listProperties, listMunicipios } from '../../lib/api/properties';
import { createServerSupabase } from '../../lib/supabase/server';
import PropertyCard from '../../components/propiedades/PropertyCard';
import PropertyFilters from '../../components/propiedades/PropertyFilters';
import EmptyState from '../../components/propiedades/EmptyState';

export const revalidate = 300;

export const metadata = {
  title: 'Propiedades en venta y renta en Jalisco | HeredaBienes',
  description:
    'Terrenos, casas y locales seleccionados en Zapopan, Guadalajara y la Zona Metropolitana. Fichas completas, medidas y contacto directo con el asesor.',
  alternates: { canonical: '/propiedades' },
  openGraph: {
    title: 'Propiedades en venta y renta en Jalisco | HeredaBienes',
    description:
      'Terrenos, casas y locales seleccionados en Zapopan, Guadalajara y la Zona Metropolitana.',
    type: 'website',
  },
};

function aNumero(valor) {
  if (valor === undefined || valor === null || valor === '') return undefined;
  const n = Number(valor);
  return Number.isFinite(n) ? n : undefined;
}

export default async function PropiedadesPage({ searchParams }) {
  const sp = await searchParams;

  const filtros = {
    tipo: sp?.tipo || undefined,
    operacion: sp?.operacion || undefined,
    municipio: sp?.municipio || undefined,
    precioMin: aNumero(sp?.precioMin),
    precioMax: aNumero(sp?.precioMax),
    orden: sp?.orden || undefined,
  };

  const supabase = await createServerSupabase();

  const [propiedades, municipios] = await Promise.all([
    listProperties({ ...filtros, client: supabase }),
    listMunicipios(supabase),
  ]);

  return (
    <main className="min-h-screen bg-gray-soft pb-20">
      {/* Encabezado */}
      <section className="bg-dark px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary font-display">
            Catálogo
          </span>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight text-white font-display sm:text-4xl lg:text-5xl">
            Propiedades disponibles
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 font-body sm:text-lg">
            Inmuebles con documentación revisada por nuestro equipo legal. Cada ficha incluye
            medidas, superficie y contacto directo con el asesor.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Filtros: montados sobre el hero */}
        <div className="-mt-10 mb-8">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white shadow-md" />}>
            <PropertyFilters municipios={municipios} />
          </Suspense>
        </div>

        <p className="mb-6 text-sm text-gray-500 font-body" aria-live="polite">
          {propiedades.length === 0
            ? 'Sin resultados'
            : `${propiedades.length} ${propiedades.length === 1 ? 'propiedad' : 'propiedades'}`}
        </p>

        {propiedades.length === 0 ? (
          <EmptyState onClearHref="/propiedades" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {propiedades.map((property, index) => (
              <PropertyCard key={property.id} property={property} priority={index < 2} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Paso 6: Verificar**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm run dev
```

1. `http://localhost:3000/propiedades` — el terreno de Colonia Seattle aparece en el grid con badge "Terreno en venta", "Colonia Seattle, Zapopan", precio `$38,000,000 MXN` y su superficie.
2. `http://localhost:3000/propiedades?municipio=Zapopan&tipo=terreno&orden=precio_desc` — los selects de municipio/tipo/orden llegan preseleccionados con esos valores y el terreno sigue listado.
3. `http://localhost:3000/propiedades?precioMin=90000000` — se muestra el `EmptyState` con "No encontramos propiedades con esos filtros".
4. En viewport de 375 px: los filtros están colapsados detrás del botón "Filtrar propiedades" y las cards van a una columna.
5. Navegando con Tab, cada card y cada campo muestran anillo de foco visible.

- [ ] **Paso 7: Commit**

```bash
git add components/propiedades/PropertyCard.jsx components/propiedades/PropertyFilters.jsx components/propiedades/EmptyState.jsx app/propiedades/page.js app/propiedades/loading.js
git commit -m "[PROP] listado /propiedades con filtros en query params y estado vacío"
```

---

### Tarea 3.3: Galería con lightbox

**Archivos:**
- Crear: `components/propiedades/PropertyGallery.jsx` (**Client**)

**Interfaces:**
- **Produce:** `<PropertyGallery imagenes={[{id,url,alt,orden}]} portadaUrl={string} titulo={string} />` — **Client Component** porque maneja índice activo, apertura/cierre del lightbox y listeners de teclado. Si `imagenes` está vacío usa `portadaUrl` como única imagen; si tampoco hay portada devuelve `null` (la ficha no muestra bloque vacío).

- [ ] **Paso 1: Crear `components/propiedades/PropertyGallery.jsx`**

```jsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

export default function PropertyGallery({ imagenes = [], portadaUrl, titulo = 'Propiedad' }) {
  const fotos = useMemo(() => {
    const lista = Array.isArray(imagenes) ? [...imagenes] : [];
    lista.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    if (lista.length > 0) return lista;
    if (portadaUrl) return [{ id: 'portada', url: portadaUrl, alt: titulo, orden: 0 }];
    return [];
  }, [imagenes, portadaUrl, titulo]);

  const [activa, setActiva] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const total = fotos.length;

  const siguiente = useCallback(() => setActiva((i) => (i + 1) % total), [total]);
  const anterior = useCallback(() => setActiva((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') siguiente();
      if (e.key === 'ArrowLeft') anterior();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, siguiente, anterior]);

  if (total === 0) return null;

  const actual = fotos[activa];
  const textoAlt = actual.alt || `${titulo} — imagen ${activa + 1} de ${total}`;

  return (
    <section aria-label="Galería de la propiedad">
      {/* Imagen principal: pantalla completa en móvil, con esquinas redondeadas desde sm */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-soft sm:aspect-[16/10] sm:rounded-2xl">
        <Image
          src={actual.url}
          alt={textoAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />

        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Ver imagen en pantalla completa"
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Expand size={18} aria-hidden="true" />
        </button>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={siguiente}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white font-display">
              {activa + 1} / {total}
            </span>
          </>
        )}
      </div>

      {/* Miniaturas: scroll horizontal en móvil */}
      {total > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:px-0">
          {fotos.map((foto, i) => (
            <li key={foto.id ?? foto.url}>
              <button
                type="button"
                onClick={() => setActiva(i)}
                aria-label={`Ver imagen ${i + 1} de ${total}`}
                aria-current={i === activa}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  i === activa ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={foto.url}
                  alt={foto.alt || `${titulo} — miniatura ${i + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de ${titulo}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Cerrar galería"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={22} aria-hidden="true" />
          </button>

          <div className="relative h-[75vh] w-full max-w-5xl">
            <Image
              src={actual.url}
              alt={textoAlt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={anterior}
                aria-label="Imagen anterior"
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={siguiente}
                aria-label="Imagen siguiente"
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white font-display">
                {activa + 1} / {total}
              </span>
            </>
          )}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Paso 2: Verificar** — se valida completo en la Tarea 3.7 (cuando exista la página de detalle). Por ahora basta con que `npm run dev` no reporte error de compilación en el archivo.

- [ ] **Paso 3: Commit**

```bash
git add components/propiedades/PropertyGallery.jsx
git commit -m "[PROP] galería con miniaturas y lightbox accesible por teclado"
```

---

### Tarea 3.4: Encabezado, botón Compartir y barra de acciones móvil

**Archivos:**
- Crear: `components/propiedades/ShareButton.jsx` (**Client**)
- Crear: `components/propiedades/PropertyHeader.jsx`
- Crear: `components/propiedades/StickyCTA.jsx` (**Client**)

**Interfaces:**
- **Consume:** `formatPrecio(precio, moneda, mostrarPrecio)`, `urlWhatsAppPropiedad`, `urlPublicaPropiedad`.
- **Produce:**
  - `<ShareButton url={string} titulo={string} texto={string} className={string} />` — **Client Component**: usa `navigator.share` y, si no existe, `navigator.clipboard.writeText` mostrando "¡Link copiado!" 2 s.
  - `<PropertyHeader property={Property} urlPublica={string} whatsappUrl={string} />` — Server Component. Renderiza título, gancho, ubicación, precio, nota de precio, badges y acciones (WhatsApp, PDF, Compartir) visibles desde `sm:`.
  - `<StickyCTA whatsappUrl={string} fichaPdfUrl={string|null} precioTexto={string} />` — **Client Component** (necesita `useEffect` de scroll). Barra fija al fondo, visible solo `< lg`, aparece tras 400 px de scroll.

- [ ] **Paso 1: Crear `components/propiedades/ShareButton.jsx`**

```jsx
'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

export default function ShareButton({ url, titulo, texto = '', className = '' }) {
  const [copiado, setCopiado] = useState(false);

  const compartir = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto || titulo, url });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      window.prompt('Copia el link de la propiedad:', url);
    }
  };

  return (
    <button
      type="button"
      onClick={compartir}
      aria-live="polite"
      className={`inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-6 py-3 text-sm font-semibold font-display text-gray-700 transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      {copiado ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
      {copiado ? '¡Link copiado!' : 'Compartir'}
    </button>
  );
}
```

- [ ] **Paso 2: Crear `components/propiedades/PropertyHeader.jsx`**

```jsx
import { Download, MapPin, MessageCircle } from 'lucide-react';
import { formatPrecio } from '../../lib/format';
import EstatusBadge from './EstatusBadge';
import TipoBadge from './TipoBadge';
import ShareButton from './ShareButton';

export default function PropertyHeader({ property, urlPublica, whatsappUrl }) {
  const direccion = property.mostrarDireccionExacta
    ? [
        [property.calle, property.numeroExterior].filter(Boolean).join(' '),
        property.numeroInterior ? `Int. ${property.numeroInterior}` : '',
        property.colonia,
        property.municipio,
        property.estado,
      ]
        .filter(Boolean)
        .join(', ')
    : [property.colonia, property.municipio, property.estado].filter(Boolean).join(', ');

  return (
    <header className="border-b border-gray-100 bg-white px-4 py-6 sm:px-0 sm:py-8">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <TipoBadge tipo={property.tipoInmueble} operacion={property.operacion} />
        <EstatusBadge estatus={property.estatus} size="md" />
      </div>

      <h1 className="mb-2 text-2xl font-extrabold leading-tight text-gray-900 font-display sm:text-3xl lg:text-4xl">
        {property.titulo}
      </h1>

      {property.gancho ? (
        <p className="mb-3 text-base text-gray-500 font-body sm:text-lg">{property.gancho}</p>
      ) : null}

      {direccion ? (
        <p className="mb-5 flex items-start gap-2 text-sm text-gray-600 font-body sm:text-base">
          <MapPin size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <span>{direccion}</span>
        </p>
      ) : null}

      <div className="mb-6">
        <p className="text-3xl font-extrabold text-primary font-display sm:text-4xl">
          {formatPrecio(property.precio, property.moneda, property.mostrarPrecio)}
        </p>
        {property.precioNota ? (
          <p className="mt-1 text-sm font-semibold text-green-600 font-body">{property.precioNota}</p>
        ) : null}
      </div>

      {/* Acciones: en móvil se repiten en la StickyCTA del fondo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold font-display text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Preguntar por WhatsApp
        </a>

        {property.fichaPdfUrl ? (
          <a
            href={property.fichaPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold font-display text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Download size={18} aria-hidden="true" />
            Descargar ficha PDF
          </a>
        ) : null}

        <ShareButton
          url={urlPublica}
          titulo={property.titulo}
          texto={property.gancho || property.titulo}
        />
      </div>
    </header>
  );
}
```

- [ ] **Paso 3: Crear `components/propiedades/StickyCTA.jsx`**

```jsx
'use client';

import { useEffect, useState } from 'react';
import { Download, MessageCircle } from 'lucide-react';

export default function StickyCTA({ whatsappUrl, fichaPdfUrl, precioTexto }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(10,22,40,0.08)] backdrop-blur-md transition-transform duration-300 lg:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-display">Precio</p>
          <p className="truncate text-base font-extrabold text-primary font-display">{precioTexto}</p>
        </div>

        {fichaPdfUrl ? (
          <a
            href={fichaPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Descargar ficha PDF"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Download size={20} aria-hidden="true" />
          </a>
        ) : null}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold font-display text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
        >
          <MessageCircle size={18} aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Paso 4: Commit**

```bash
git add components/propiedades/ShareButton.jsx components/propiedades/PropertyHeader.jsx components/propiedades/StickyCTA.jsx
git commit -m "[PROP] encabezado de ficha, boton compartir con Web Share API y CTA fija movil"
```

---

### Tarea 3.5: Bloques de contenido (datos clave, highlights, descripción, medidas, listas, formas de pago)

**Archivos:**
- Crear: `components/propiedades/DatosClave.jsx`
- Crear: `components/propiedades/HighlightsGrid.jsx`
- Crear: `components/propiedades/Descripcion.jsx`
- Crear: `components/propiedades/MedidasTerreno.jsx`
- Crear: `components/propiedades/ListaChips.jsx`
- Crear: `components/propiedades/FormasPago.jsx`

**Interfaces:** todos son **Server Components** (solo presentación, cero interactividad). **Todos devuelven `null` cuando no hay datos** — ésta es la implementación de la regla de renderizado.
- `<DatosClave property={Property} />` → `null` si no hay ningún dato clave.
- `<HighlightsGrid highlights={[{icono,titulo,texto}]} />` → `null` si el arreglo está vacío.
- `<Descripcion texto={string} />` → `null` si `texto` es vacío/espacios.
- `<MedidasTerreno property={Property} />` → `null` si no hay ninguna de las 4 medidas ni superficies ni nota.
- `<ListaChips titulo={string} items={string[]} icono={LucideIcon} variante="chips"|"lista" />` → `null` si `items` está vacío. `variante` default `'chips'`.
- `<FormasPago formas={string[]} />` → `null` si está vacío.

- [ ] **Paso 1: Crear `components/propiedades/DatosClave.jsx`**

```jsx
import {
  Bath,
  BedDouble,
  Building2,
  CalendarClock,
  Car,
  Home,
  Layers,
  Maximize2,
  Ruler,
  Tag,
} from 'lucide-react';
import { formatSuperficie, TIPOS_INMUEBLE, OPERACIONES } from '../../lib/format';
import { etiqueta } from '../../lib/opciones';

export default function DatosClave({ property }) {
  if (!property) return null;

  const datos = [];

  if (property.superficieTerrenoM2) {
    datos.push({ icono: Maximize2, label: 'Terreno', valor: formatSuperficie(property.superficieTerrenoM2) });
  }
  if (property.superficieConstruccionM2) {
    datos.push({ icono: Ruler, label: 'Construcción', valor: formatSuperficie(property.superficieConstruccionM2) });
  }
  if (property.tipoInmueble) {
    datos.push({ icono: Building2, label: 'Tipo', valor: etiqueta(TIPOS_INMUEBLE, property.tipoInmueble) });
  }
  if (property.operacion) {
    datos.push({ icono: Tag, label: 'Operación', valor: etiqueta(OPERACIONES, property.operacion) });
  }
  if (property.recamaras) {
    datos.push({ icono: BedDouble, label: 'Recámaras', valor: String(property.recamaras) });
  }
  if (property.banos || property.mediosBanos) {
    const partes = [];
    if (property.banos) partes.push(`${property.banos} completo${property.banos > 1 ? 's' : ''}`);
    if (property.mediosBanos) partes.push(`${property.mediosBanos} medio${property.mediosBanos > 1 ? 's' : ''}`);
    datos.push({ icono: Bath, label: 'Baños', valor: partes.join(' · ') });
  }
  if (property.estacionamientos) {
    datos.push({ icono: Car, label: 'Estacionamientos', valor: String(property.estacionamientos) });
  }
  if (property.niveles) {
    datos.push({ icono: Layers, label: 'Niveles', valor: String(property.niveles) });
  }
  if (property.antiguedadAnios) {
    datos.push({
      icono: CalendarClock,
      label: 'Antigüedad',
      valor: `${property.antiguedadAnios} año${property.antiguedadAnios > 1 ? 's' : ''}`,
    });
  }

  if (datos.length === 0) return null;

  return (
    <section aria-labelledby="datos-clave" className="py-8">
      <h2 id="datos-clave" className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        Datos clave
      </h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {datos.map((dato) => {
          const Icono = dato.icono ?? Home;
          return (
            <div
              key={dato.label}
              className="rounded-2xl bg-gray-soft p-4 text-center sm:text-left"
            >
              <Icono size={22} className="mx-auto mb-2 text-primary sm:mx-0" aria-hidden="true" />
              <dt className="text-xs uppercase tracking-wide text-gray-400 font-display">{dato.label}</dt>
              <dd className="mt-0.5 text-sm font-bold text-gray-900 font-display sm:text-base">{dato.valor}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
```

- [ ] **Paso 2: Crear `components/propiedades/HighlightsGrid.jsx`**

El campo `icono` de cada highlight es una cadena; se resuelve contra un mapa cerrado y cae a `Sparkles` si no coincide.

```jsx
import {
  Building2,
  Landmark,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  Store,
  TreePine,
  TrendingUp,
  Zap,
} from 'lucide-react';

const ICONOS = {
  zona: Landmark,
  premium: Landmark,
  ubicacion: MapPin,
  estrategica: MapPin,
  servicios: Zap,
  oportunidad: TrendingUp,
  plusvalia: TrendingUp,
  conectividad: Route,
  comercio: Store,
  desarrollo: Building2,
  legal: ShieldCheck,
  entorno: TreePine,
};

function resolverIcono(nombre) {
  if (!nombre) return Sparkles;
  return ICONOS[String(nombre).toLowerCase().trim()] ?? Sparkles;
}

export default function HighlightsGrid({ highlights }) {
  const items = Array.isArray(highlights) ? highlights.filter((h) => h && h.titulo) : [];
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="highlights" className="py-8">
      <h2 id="highlights" className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        Por qué esta propiedad
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.slice(0, 4).map((item, i) => {
          const Icono = resolverIcono(item.icono);
          return (
            <div key={`${item.titulo}-${i}`} className="flex gap-4 rounded-2xl bg-white p-5 shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light">
                <Icono size={22} className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="mb-1 text-base font-bold text-gray-900 font-display">{item.titulo}</h3>
                {item.texto ? (
                  <p className="text-sm leading-relaxed text-gray-500 font-body">{item.texto}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Paso 3: Crear `components/propiedades/Descripcion.jsx`**

```jsx
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
```

- [ ] **Paso 4: Crear `components/propiedades/MedidasTerreno.jsx`**

```jsx
import { Compass, Maximize2, Ruler } from 'lucide-react';
import { formatSuperficie } from '../../lib/format';

const ORIENTACIONES = [
  { campo: 'medidaNorte', label: 'Norte' },
  { campo: 'medidaSur', label: 'Sur' },
  { campo: 'medidaOriente', label: 'Oriente' },
  { campo: 'medidaPoniente', label: 'Poniente' },
];

export default function MedidasTerreno({ property }) {
  if (!property) return null;

  const medidas = ORIENTACIONES.map((o) => ({ ...o, valor: property[o.campo] })).filter(
    (o) => o.valor && String(o.valor).trim(),
  );

  const superficies = [];
  if (property.superficieTerrenoM2) {
    superficies.push({ icono: Maximize2, label: 'Superficie de terreno', valor: formatSuperficie(property.superficieTerrenoM2) });
  }
  if (property.superficieConstruccionM2) {
    superficies.push({ icono: Ruler, label: 'Superficie de construcción', valor: formatSuperficie(property.superficieConstruccionM2) });
  }

  const nota = property.medidasNota && String(property.medidasNota).trim();

  if (medidas.length === 0 && superficies.length === 0 && !nota) return null;

  return (
    <section aria-labelledby="medidas" className="py-8">
      <h2 id="medidas" className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        Medidas y superficie
      </h2>

      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        {superficies.length > 0 && (
          <dl className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {superficies.map((s) => {
              const Icono = s.icono;
              return (
                <div key={s.label} className="flex items-center gap-3 p-5">
                  <Icono size={20} className="shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-400 font-display">{s.label}</dt>
                    <dd className="text-lg font-bold text-gray-900 font-display">{s.valor}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        )}

        {medidas.length > 0 && (
          <div className={superficies.length > 0 ? 'border-t border-gray-100' : ''}>
            <h3 className="flex items-center gap-2 border-b border-gray-100 bg-gray-soft px-5 py-3 text-sm font-semibold text-gray-700 font-display">
              <Compass size={16} className="text-primary" aria-hidden="true" />
              Medidas por orientación
            </h3>
            <dl className="divide-y divide-gray-100">
              {medidas.map((m) => (
                <div key={m.campo} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <dt className="text-sm font-semibold text-gray-500 font-display">{m.label}</dt>
                  <dd className="text-right text-sm font-bold text-gray-900 font-body">{m.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {nota ? (
        <p className="mt-3 text-sm italic leading-relaxed text-gray-500 font-body">{nota}</p>
      ) : null}
    </section>
  );
}
```

- [ ] **Paso 5: Crear `components/propiedades/ListaChips.jsx`**

```jsx
import { Check } from 'lucide-react';

export default function ListaChips({ titulo, items, icono: Icono, variante = 'chips' }) {
  const lista = Array.isArray(items) ? items.filter((i) => i && String(i).trim()) : [];
  if (lista.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 font-display sm:text-lg">
        {Icono ? <Icono size={18} className="text-primary" aria-hidden="true" /> : null}
        {titulo}
      </h3>

      {variante === 'lista' ? (
        <ul className="space-y-2.5">
          {lista.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 font-body">
              <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {lista.map((item) => (
            <li
              key={item}
              className="rounded-full bg-gray-soft px-3.5 py-1.5 text-sm text-gray-700 font-body"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Paso 6: Crear `components/propiedades/FormasPago.jsx`**

```jsx
import { Wallet } from 'lucide-react';

export default function FormasPago({ formas }) {
  const lista = Array.isArray(formas) ? formas.filter((f) => f && String(f).trim()) : [];
  if (lista.length === 0) return null;

  return (
    <section aria-labelledby="formas-pago" className="py-8">
      <h2 id="formas-pago" className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        Formas de pago
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {lista.map((forma) => (
          <li
            key={forma}
            className="flex items-center gap-3 rounded-2xl border border-primary-light bg-primary-light/50 px-4 py-3.5"
          >
            <Wallet size={20} className="shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-800 font-display">{forma}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Paso 7: Commit**

```bash
git add components/propiedades/DatosClave.jsx components/propiedades/HighlightsGrid.jsx components/propiedades/Descripcion.jsx components/propiedades/MedidasTerreno.jsx components/propiedades/ListaChips.jsx components/propiedades/FormasPago.jsx
git commit -m "[PROP] bloques de contenido de la ficha con render condicional estricto"
```

---

### Tarea 3.6: Mapa, asesor y propiedades relacionadas

**Archivos:**
- Crear: `components/propiedades/PropertyMap.jsx`
- Crear: `components/propiedades/AsesorCard.jsx`
- Crear: `components/propiedades/RelatedProperties.jsx`

**Interfaces:**
- **Consume:** `listRelatedProperties({ id, municipio, tipoInmueble, limit })`, `WHATSAPP_FALLBACK`, `EMAIL_FALLBACK`, `telefonoAWhatsApp`.
- **Produce (todos Server Components):**
  - `<PropertyMap property={Property} />` — `null` si no hay `lat/lng` ni `municipio`. Con `mostrarDireccionExacta === false` centra el mapa a nivel colonia/municipio y muestra aviso.
  - `<AsesorCard property={Property} whatsappUrl={string} />` — nunca es `null`: si faltan datos del asesor cae a los contactos globales.
  - `<RelatedProperties propiedades={Property[]} />` — `null` si el arreglo está vacío. La consulta se hace en la página, no aquí, para mantener el componente puro.

- [ ] **Paso 1: Crear `components/propiedades/PropertyMap.jsx`**

```jsx
import { Info, MapPin } from 'lucide-react';

export default function PropertyMap({ property }) {
  if (!property) return null;

  const exacta = property.mostrarDireccionExacta !== false;
  const tieneCoords = property.lat != null && property.lng != null;

  const zonaTexto = [property.colonia, property.municipio, property.estado].filter(Boolean).join(', ');
  const direccionTexto = [
    [property.calle, property.numeroExterior].filter(Boolean).join(' '),
    property.colonia,
    property.municipio,
    property.estado,
    property.cp,
  ]
    .filter(Boolean)
    .join(', ');

  let consulta = '';
  let zoom = 15;

  if (exacta && tieneCoords) {
    consulta = `${property.lat},${property.lng}`;
    zoom = 17;
  } else if (exacta && direccionTexto) {
    consulta = direccionTexto;
    zoom = 17;
  } else if (zonaTexto) {
    consulta = zonaTexto;
    zoom = 14;
  }

  if (!consulta) return null;

  const src = `https://www.google.com/maps?q=${encodeURIComponent(consulta)}&z=${zoom}&hl=es&output=embed`;

  return (
    <section aria-labelledby="mapa" className="py-8">
      <h2 id="mapa" className="mb-2 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        Ubicación
      </h2>

      <p className="mb-4 flex items-start gap-2 text-sm text-gray-600 font-body">
        <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        <span>{exacta ? direccionTexto || zonaTexto : zonaTexto}</span>
      </p>

      <div className="overflow-hidden rounded-2xl shadow-md">
        <iframe
          title={`Mapa de ${property.titulo}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-64 w-full border-0 sm:h-96"
          allowFullScreen
        />
      </div>

      {!exacta && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-gray-soft px-4 py-3 text-sm text-gray-500 font-body">
          <Info size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          Por privacidad del propietario, el mapa muestra la zona aproximada. La dirección exacta se
          comparte al agendar una visita.
        </p>
      )}
    </section>
  );
}
```

- [ ] **Paso 2: Crear `components/propiedades/AsesorCard.jsx`**

```jsx
import { Mail, MessageCircle, Phone, UserRound } from 'lucide-react';
import { EMAIL_FALLBACK, WHATSAPP_FALLBACK, telefonoAWhatsApp } from '../../lib/whatsapp';

export default function AsesorCard({ property, whatsappUrl }) {
  const nombre = property?.asesorNombre || 'Equipo HeredaBienes';
  const email = property?.asesorEmail || EMAIL_FALLBACK;
  const telefono = property?.asesorTelefono
    ? telefonoAWhatsApp(property.asesorTelefono)
    : WHATSAPP_FALLBACK;

  return (
    <section aria-labelledby="asesor" className="py-8">
      <h2 id="asesor" className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        ¿Te interesa esta propiedad?
      </h2>

      <div className="overflow-hidden rounded-2xl bg-dark p-6 text-white sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <UserRound size={26} className="text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-display">
              Tu asesor
            </p>
            <p className="text-lg font-bold text-white font-display">{nombre}</p>
          </div>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-gray-300 font-body">
          Resolvemos dudas de precio, documentación y agenda de visita. Todas nuestras propiedades
          pasan por revisión legal antes de publicarse.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3.5 text-sm font-semibold font-display text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Escribir por WhatsApp
          </a>
          <a
            href={`tel:+${telefono}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-6 py-3.5 text-sm font-semibold font-display text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Phone size={18} aria-hidden="true" />
            Llamar ahora
          </a>
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(`Interés en: ${property?.titulo ?? 'propiedad'}`)}`}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold font-display text-gray-300 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Mail size={18} aria-hidden="true" />
            {email}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Paso 3: Crear `components/propiedades/RelatedProperties.jsx`**

```jsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PropertyCard from './PropertyCard';

export default function RelatedProperties({ propiedades }) {
  const lista = Array.isArray(propiedades) ? propiedades.filter(Boolean) : [];
  if (lista.length === 0) return null;

  return (
    <section aria-labelledby="relacionadas" className="bg-gray-soft py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="relacionadas" className="text-2xl font-bold text-gray-900 font-display sm:text-3xl">
            Otras propiedades
          </h2>
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary font-display transition-colors hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Ver todo el catálogo
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Paso 4: Commit**

```bash
git add components/propiedades/PropertyMap.jsx components/propiedades/AsesorCard.jsx components/propiedades/RelatedProperties.jsx
git commit -m "[PROP] mapa con respeto a mostrarDireccionExacta, tarjeta de asesor y relacionadas"
```

---

### Tarea 3.7: Página de detalle `/propiedades/[slug]` con `generateMetadata`

**Archivos:**
- Crear: `app/propiedades/[slug]/page.js`
- Crear: `app/propiedades/[slug]/not-found.js`

**Interfaces:**
- **Consume:** `getPropertyBySlug(slug)`, `listProperties()`, `listRelatedProperties({ id, municipio, tipoInmueble, limit })`, `formatPrecio`, `urlPublicaPropiedad`, `urlWhatsAppPropiedad`, y los 12 componentes de `components/propiedades/`.
- **Produce:** ruta pública con `generateMetadata`, `generateStaticParams` y `revalidate = 300`.

**Nota Next 15:** `params` es una Promise tanto en la página como en `generateMetadata`; hay que hacer `await params`.

- [ ] **Paso 1: Crear `app/propiedades/[slug]/not-found.js`**

```jsx
import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-soft px-4 py-20">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light">
          <SearchX size={34} className="text-primary" aria-hidden="true" />
        </div>
        <h1 className="mb-3 text-2xl font-extrabold text-gray-900 font-display sm:text-3xl">
          Esta propiedad ya no está disponible
        </h1>
        <p className="mb-8 text-base leading-relaxed text-gray-500 font-body">
          Puede que se haya vendido o que el link esté incompleto. Revisa el catálogo, seguro
          tenemos algo parecido.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/propiedades" className="btn-primary justify-center">
            Ver propiedades
          </Link>
          <Link href="/" className="btn-outline inline-flex items-center justify-center gap-2">
            <Home size={18} aria-hidden="true" />
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Paso 2: Crear `app/propiedades/[slug]/page.js`**

```jsx
import { notFound } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  Landmark,
  Sparkles,
  Target,
  Trees,
} from 'lucide-react';
import {
  getPropertyBySlug,
  listProperties,
  listRelatedProperties,
} from '../../../lib/api/properties';
import { createServerSupabase } from '../../../lib/supabase/server';
import { formatPrecio } from '../../../lib/format';
import { urlPublicaPropiedad, urlWhatsAppPropiedad } from '../../../lib/whatsapp';
import PropertyGallery from '../../../components/propiedades/PropertyGallery';
import PropertyHeader from '../../../components/propiedades/PropertyHeader';
import StickyCTA from '../../../components/propiedades/StickyCTA';
import DatosClave from '../../../components/propiedades/DatosClave';
import HighlightsGrid from '../../../components/propiedades/HighlightsGrid';
import Descripcion from '../../../components/propiedades/Descripcion';
import MedidasTerreno from '../../../components/propiedades/MedidasTerreno';
import ListaChips from '../../../components/propiedades/ListaChips';
import FormasPago from '../../../components/propiedades/FormasPago';
import PropertyMap from '../../../components/propiedades/PropertyMap';
import AsesorCard from '../../../components/propiedades/AsesorCard';
import RelatedProperties from '../../../components/propiedades/RelatedProperties';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const supabase = await createServerSupabase();
    const propiedades = await listProperties({ client: supabase });
    return propiedades.map((p) => ({ slug: p.slug }));
  } catch (error) {
    // Sin conexión a Supabase en build: las rutas se generan bajo demanda.
    return [];
  }
}

function descripcionCorta(property) {
  if (property.metaDescription) return property.metaDescription;
  if (property.gancho) return property.gancho;
  if (property.descripcion) {
    const limpio = property.descripcion.replace(/\s+/g, ' ').trim();
    return limpio.length > 155 ? `${limpio.slice(0, 152)}…` : limpio;
  }
  const ubicacion = [property.colonia, property.municipio].filter(Boolean).join(', ');
  return `${property.titulo}${ubicacion ? ` en ${ubicacion}` : ''}. ${formatPrecio(
    property.precio,
    property.moneda,
    property.mostrarPrecio,
  )}.`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const property = await getPropertyBySlug(slug, supabase);

  if (!property) {
    return {
      title: 'Propiedad no encontrada | HeredaBienes',
      description: 'La propiedad que buscas ya no está disponible en nuestro catálogo.',
      robots: { index: false, follow: true },
    };
  }

  const ubicacion = [property.colonia, property.municipio].filter(Boolean).join(', ');
  const precio = formatPrecio(property.precio, property.moneda, property.mostrarPrecio);
  const title = property.metaTitle || `${property.titulo}${ubicacion ? ` — ${ubicacion}` : ''} | ${precio}`;
  const description = descripcionCorta(property);
  const url = urlPublicaPropiedad(property.slug);
  const imagen = property.portadaUrl || property.imagenes?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/propiedades/${property.slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: 'HEREDABIENES',
      locale: 'es_MX',
      images: imagen
        ? [{ url: imagen, width: 1200, height: 630, alt: property.titulo }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imagen ? [imagen] : [],
    },
  };
}

export default async function PropiedadDetallePage({ params }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const property = await getPropertyBySlug(slug, supabase);

  if (!property || property.publicado === false) notFound();

  const relacionadas = await listRelatedProperties({
    id: property.id,
    municipio: property.municipio,
    tipoInmueble: property.tipoInmueble,
    limit: 3,
    client: supabase,
  });

  const urlPublica = urlPublicaPropiedad(property.slug);
  const whatsappUrl = urlWhatsAppPropiedad(property, urlPublica);
  const precioTexto = formatPrecio(property.precio, property.moneda, property.mostrarPrecio);

  // Bloque 7: se renderiza solo si al menos una de las cinco listas trae elementos.
  const listas = [
    { titulo: 'Ideal para', items: property.idealPara, icono: Target, variante: 'chips' },
    { titulo: 'Ventajas', items: property.ventajas, icono: Sparkles, variante: 'lista' },
    { titulo: 'Entorno', items: property.entorno, icono: Trees, variante: 'chips' },
    { titulo: 'Estatus legal', items: property.estatusLegal, icono: Landmark, variante: 'lista' },
    { titulo: 'Amenidades y servicios', items: property.amenidades, icono: CheckCircle2, variante: 'chips' },
  ].filter((bloque) => Array.isArray(bloque.items) && bloque.items.filter(Boolean).length > 0);

  return (
    <main className="bg-white pb-24 lg:pb-0">
      {/* 1. Galería */}
      <div className="sm:mx-auto sm:max-w-5xl sm:px-6 sm:pt-8 lg:px-8">
        <PropertyGallery
          imagenes={property.imagenes}
          portadaUrl={property.portadaUrl}
          titulo={property.titulo}
        />
      </div>

      <div className="mx-auto max-w-5xl px-0 sm:px-6 lg:px-8">
        {/* 2. Encabezado + acciones */}
        <PropertyHeader property={property} urlPublica={urlPublica} whatsappUrl={whatsappUrl} />

        <div className="px-4 sm:px-0">
          {/* 3. Datos clave */}
          <DatosClave property={property} />

          {/* 4. Highlights */}
          <HighlightsGrid highlights={property.highlights} />

          {/* 5. Descripción */}
          <Descripcion texto={property.descripcion} />

          {/* 6. Medidas y superficie */}
          <MedidasTerreno property={property} />

          {/* 7. Listas de contenido */}
          {listas.length > 0 && (
            <section aria-labelledby="caracteristicas" className="py-8">
              <h2
                id="caracteristicas"
                className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl"
              >
                Características
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {listas.map((bloque) => (
                  <ListaChips
                    key={bloque.titulo}
                    titulo={bloque.titulo}
                    items={bloque.items}
                    icono={bloque.icono}
                    variante={bloque.variante}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 8. Formas de pago */}
          <FormasPago formas={property.formasPago} />

          {/* 9. Mapa */}
          <PropertyMap property={property} />

          {/* 10. Asesor + CTA */}
          <AsesorCard property={property} whatsappUrl={whatsappUrl} />
        </div>
      </div>

      {/* 11. Otras propiedades */}
      <RelatedProperties propiedades={relacionadas} />

      <StickyCTA
        whatsappUrl={whatsappUrl}
        fichaPdfUrl={property.fichaPdfUrl}
        precioTexto={precioTexto}
      />
    </main>
  );
}
```

> El icono `Building2` queda importado para uso futuro en los bloques; si el linter marca import sin usar, elimínalo de la lista de imports.

- [ ] **Paso 3: Verificar la ficha de referencia**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm run dev
```

Abre `http://localhost:3000/propiedades` y entra al terreno de Colonia Seattle. En viewport de 375 px debe verse, en este orden exacto:

1. Galería a ancho completo; al tocar la lupa abre lightbox; `Esc` y las flechas del teclado funcionan.
2. Badges "Terreno en venta" + "Disponible", título, "Calle 10 66, Colonia Seattle, Zapopan, Jalisco", precio **$38,000,000 MXN** en grande, botones WhatsApp / Descargar ficha PDF / Compartir.
3. Datos clave con la superficie del terreno y el tipo/operación.
4. Los 4 highlights en dos columnas desde `sm:`.
5. Descripción.
6. **Medidas y superficie**: Norte `46.00 m`, Sur `36.00 m + quiebre de 10.00 m` (texto completo, sin truncar), Oriente `35.00 m`, Poniente `33.00 m`, más la nota si existe.
7. Características con las listas que sí tengan datos.
8. Formas de pago.
9. Mapa embebido centrado en Calle 10 #66.
10. Tarjeta oscura del asesor con WhatsApp / Llamar / correo.
11. "Otras propiedades" con hasta 3 cards de Zapopan.

Además:
- Al hacer scroll más de 400 px aparece la barra inferior con el precio y el botón de WhatsApp; a partir de `lg` esa barra desaparece.
- El botón de WhatsApp abre `wa.me` con el mensaje prellenado citando el título y el link de la propiedad.
- El botón Compartir en escritorio (sin Web Share API) cambia a "¡Link copiado!" y el portapapeles tiene la URL.

Metadatos:

```bash
curl -s http://localhost:3000/propiedades/<slug-del-terreno> | grep -Eo '<meta property="og:(title|description|image)"[^>]*>'
```

Debe imprimir el título con el precio, la descripción y `og:image` apuntando a la `portadaUrl` de Supabase.

Slug inexistente:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/propiedades/no-existe-esta-propiedad
```

Debe devolver `404` y en el navegador mostrarse "Esta propiedad ya no está disponible".

- [ ] **Paso 4: Commit**

```bash
git add app/propiedades/\[slug\]/page.js app/propiedades/\[slug\]/not-found.js
git commit -m "[PROP] ficha /propiedades/[slug] con generateMetadata, OG image y not-found"
```

---

### Tarea 3.8: Integración con Navbar, Footer y Home

**Archivos:**
- Modificar: `components/Navbar.jsx`
- Modificar: `components/Footer.jsx`
- Crear: `components/propiedades/FeaturedProperties.jsx`
- Modificar: `app/page.js`

**Interfaces:**
- **Consume:** `listFeaturedProperties(limit = 3)`.
- **Produce:** `<FeaturedProperties limit={number} />` — Server Component **async**; hace la consulta él mismo y devuelve `null` si no hay destacadas (el Home no muestra una sección vacía). `limit` default `3`.

- [ ] **Paso 1: Agregar "Propiedades" al `components/Navbar.jsx`**

En el arreglo `navLinks` (que la Fase 1 dejó con `href` en vez de `to`), inserta la entrada como **segundo** elemento, para que quede antes de Servicios:

```js
const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/propiedades", label: "Propiedades" },
  { href: "/servicios", label: "Servicios" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];
```

No hace falta tocar nada más: el `.map` de escritorio y el de móvil consumen el mismo arreglo, y el resaltado activo ya compara con `usePathname()`.

- [ ] **Paso 2: Agregar "Propiedades" al `components/Footer.jsx`**

En el arreglo `companyLinks`, inserta como **primer** elemento:

```js
const companyLinks = [
  { label: "Propiedades", href: "/propiedades" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Proceso de trabajo", href: "/#proceso" },
  { label: "Testimonios", href: "/#testimonios" },
  { label: "Preguntas frecuentes", href: "/#faq" },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
];
```

- [ ] **Paso 3: Crear `components/propiedades/FeaturedProperties.jsx`**

```jsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { listFeaturedProperties } from '../../lib/api/properties';
import { createServerSupabase } from '../../lib/supabase/server';
import PropertyCard from './PropertyCard';

export default async function FeaturedProperties({ limit = 3 }) {
  let propiedades = [];
  try {
    const supabase = await createServerSupabase();
    propiedades = await listFeaturedProperties(limit, supabase);
  } catch (error) {
    // El Home no debe caerse si Supabase no responde: simplemente no se muestra la sección.
    return null;
  }

  if (!Array.isArray(propiedades) || propiedades.length === 0) return null;

  return (
    <section className="bg-gray-soft py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <div className="section-divider" />
          <h2 className="section-title">Propiedades destacadas</h2>
          <p className="section-subtitle">
            Inmuebles seleccionados con documentación revisada por nuestro equipo legal. Listos para
            escriturar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/propiedades" className="btn-primary">
            Ver todo el catálogo
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Paso 4: Insertar la sección en `app/page.js`**

Agrega el import y coloca `<FeaturedProperties />` **inmediatamente después de `<StatsBar />`** — así el visitante ve inventario real antes de bajar por el contenido de servicios legales:

```jsx
import HeroCarousel from '../components/HeroCarousel';
import StatsBar from '../components/StatsBar';
import FeaturedProperties from '../components/propiedades/FeaturedProperties';
import PainPoints from '../components/PainPoints';
import SolutionsMap from '../components/SolutionsMap';
import ProcessSteps from '../components/ProcessSteps';
import WhyUs from '../components/WhyUs';
import Testimonials from '../components/Testimonials';
import CTABanner from '../components/CTABanner';
import FAQSection from '../components/FAQSection';
import ContactForm from '../components/ContactForm';

export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <StatsBar />
      <FeaturedProperties limit={3} />
      <PainPoints />
      <SolutionsMap />
      <ProcessSteps />
      <WhyUs />
      <Testimonials />
      <CTABanner />
      <FAQSection />
      <ContactForm />
    </main>
  );
}
```

Si la Fase 1 dejó otro nombre o ruta para estos imports, respeta el existente y solo agrega la línea de `FeaturedProperties`.

- [ ] **Paso 5: Verificar**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm run dev
```

1. `http://localhost:3000` — "Propiedades" aparece en el Navbar (escritorio y menú hamburguesa) y en la columna Empresa del Footer.
2. La sección "Propiedades destacadas" aparece bajo la barra de estadísticas con el terreno de Colonia Seattle; el botón "Ver todo el catálogo" lleva a `/propiedades`.
3. Marca temporalmente `destacado = false` en todas las propiedades desde Supabase y recarga el Home: la sección desaparece por completo, sin encabezado huérfano. Revierte el cambio.
4. En `/propiedades` el link "Propiedades" del Navbar queda resaltado con `text-primary bg-primary-light`.

- [ ] **Paso 6: Commit**

```bash
git add components/Navbar.jsx components/Footer.jsx components/propiedades/FeaturedProperties.jsx app/page.js
git commit -m "[PROP] integracion: enlace en Navbar/Footer y destacadas en el Home"
```

---

### Tarea 3.9: Auditoría de la regla de renderizado y build de cierre

**Archivos:** ninguno nuevo; se corrigen los detectados.

**Interfaces:** ninguna nueva.

- [ ] **Paso 1: Auditar por código que ningún bloque puede quedar huérfano**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && grep -n "return null" components/propiedades/*.jsx
```

Debe aparecer al menos un `return null` en: `EstatusBadge.jsx`, `TipoBadge.jsx`, `PropertyCard.jsx`, `PropertyGallery.jsx`, `DatosClave.jsx`, `HighlightsGrid.jsx`, `Descripcion.jsx`, `MedidasTerreno.jsx`, `ListaChips.jsx`, `FormasPago.jsx`, `PropertyMap.jsx`, `RelatedProperties.jsx`, `FeaturedProperties.jsx`. `PropertyHeader.jsx`, `AsesorCard.jsx`, `ShareButton.jsx` y `StickyCTA.jsx` son los cuatro únicos que siempre renderizan, y es correcto: título/precio, contacto y acciones existen siempre (los subcampos opcionales dentro de ellos ya van con guardas `? :`).

- [ ] **Paso 2: Probar el caso mínimo en el navegador**

En Supabase, duplica temporalmente la propiedad de referencia con slug `prueba-minima` y **vacía**: `gancho`, `descripcion`, `precioNota`, `fichaPdfUrl`, las 4 medidas, `medidasNota`, y los arreglos `formasPago`, `idealPara`, `ventajas`, `entorno`, `estatusLegal`, `amenidades`, `highlights`. Abre `http://localhost:3000/propiedades/prueba-minima` y confirma que **no** aparecen los encabezados "Por qué esta propiedad", "Descripción", "Medidas y superficie", "Características" ni "Formas de pago"; la página va de Datos clave directo a Ubicación. Con `mostrarDireccionExacta = false` el mapa muestra la zona y el aviso de privacidad. Borra la propiedad de prueba al terminar.

- [ ] **Paso 3: Revisar accesibilidad básica**

- Todas las `<Image>` de galería y cards tienen `alt` descriptivo (no vacío, no "imagen").
- Todos los campos de `PropertyFilters` tienen `<label htmlFor>` asociado.
- Recorre la ficha completa con Tab: cada botón y link muestra anillo de foco (`focus-visible:ring-2`).
- Los iconos decorativos llevan `aria-hidden="true"`; los botones de solo icono llevan `aria-label`.

- [ ] **Paso 4: Build de producción**

```bash
cd /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes && npm run build
```

Debe terminar en `Compiled successfully`, listar `/propiedades` como ruta dinámica y `/propiedades/[slug]` con las rutas prerenderizadas por `generateStaticParams`. Cero errores de `params`/`searchParams` sin `await` y cero warnings de `next/image` por host no configurado.

- [ ] **Paso 5: Commit**

```bash
git add -A
git commit -m "[PROP] auditoria de render condicional, accesibilidad y build de cierre de fase 3"
```

---

## FASE 4 — Panel admin

**Objetivo:** Que el staff de Heredabienes capture, edite, publique, duplique y elimine propiedades desde `/admin-hb` sin tocar código, con sesión de Supabase Auth, formulario partido en secciones colapsables, galería con reordenamiento y portada, subida de ficha PDF, y revalidación del sitio público al guardar.

**Verificación de la fase:** Con `npm run dev`, entrar a `/admin-hb/dashboard` sin sesión redirige a `/admin-hb`; tras iniciar sesión se captura desde cero la propiedad del terreno de Colonia Seattle (caso E2E de la Tarea 4.11), se publica, y `/propiedades/<slug>` la muestra completa sin recargar manualmente. Cierra la fase `npm run build` sin errores ni warnings de React.

> **Seguridad — leer antes de implementar:** `middleware.js` **no** es la seguridad del sistema. Solo esconde la UI y ahorra un render vacío. La autorización real son las políticas RLS de `properties`, `property_images` y `storage.objects` creadas en la fase de schema. Cualquier persona puede llamar a la API de Supabase con la anon key desde la consola del navegador; lo que la detiene es `auth.role() = 'authenticated'` en Postgres, no un `redirect()` en el edge. No se usa service-role key en ningún punto de esta fase.

**Fuera de alcance de esta fase — NO implementar:** roles y permisos (hay un solo usuario, creado a mano en el dashboard de Supabase), historial de cambios / versiones, papelera o borrado suave (eliminar es definitivo, con confirmación), editor de texto enriquecido (`descripcion` es un `<textarea>` de texto plano), analytics de vistas, y recorte / edición de imágenes en el navegador (se sube el archivo tal cual).

---

### Tarea 4.1: Middleware de sesión y protección de `/admin-hb/dashboard`

**Archivos:**
- Crear `lib/supabase/middleware.js`
- Crear `middleware.js` (raíz del proyecto)

**Interfaces:**
- **Consume:** `@supabase/ssr` → `createServerClient(url, key, { cookies: { getAll, setAll } })`; `next/server` → `NextResponse`.
- **Produce:** `lib/supabase/middleware.js` → `actualizarSesion(request) -> Promise<NextResponse>`. `middleware.js` → `middleware(request)` + `config.matcher`.

Ambos archivos corren en el runtime de middleware (edge), no son ni Client ni Server Component: no llevan `'use client'` y no pueden usar `next/headers`.

- [ ] **Paso 1: Crear el helper `lib/supabase/middleware.js`**

La API vigente de `@supabase/ssr` es `getAll`/`setAll` (las antiguas `get`/`set`/`remove` están deprecadas y rompen el refresh del token). El patrón de reasignar `respuesta = NextResponse.next({ request })` dentro de `setAll` es obligatorio: sin él, la cookie refrescada no llega ni a los Server Components ni al navegador.

```js
// lib/supabase/middleware.js
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const RUTA_LOGIN = "/admin-hb";
const RUTA_PROTEGIDA = "/admin-hb/dashboard";

export async function actualizarSesion(request) {
  let respuesta = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin env vars no hay sesión posible: dejamos pasar y que la UI muestre
  // el estado "Supabase no configurado" en lugar de un redirect infinito.
  if (!url || !key) return respuesta;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        respuesta = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          respuesta.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresca el token. Debe llamarse SIEMPRE, aunque la ruta no esté protegida.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && path.startsWith(RUTA_PROTEGIDA)) {
    const destino = request.nextUrl.clone();
    destino.pathname = RUTA_LOGIN;
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  // El panel admin nunca debe cachearse en un CDN.
  if (path.startsWith(RUTA_LOGIN)) {
    respuesta.headers.set("Cache-Control", "private, no-store");
  }

  return respuesta;
}
```

- [ ] **Paso 2: Crear `middleware.js` en la raíz**

El matcher se limita a `/admin-hb/*`: el sitio público es estático y no necesita refresh de token en cada request; correr el middleware ahí solo agrega latencia.

```js
// middleware.js
import { actualizarSesion } from "./lib/supabase/middleware";

export async function middleware(request) {
  return await actualizarSesion(request);
}

export const config = {
  matcher: ["/admin-hb/:path*"],
};
```

- [ ] **Paso 3: Verificación manual**

1. `npm run dev`.
2. Abrir `http://localhost:3000/admin-hb/dashboard` en una ventana privada → debe redirigir a `http://localhost:3000/admin-hb` (aunque esa página todavía no exista, la URL en la barra debe cambiar).
3. Abrir `http://localhost:3000/propiedades` → carga normal, sin redirect.
4. En una terminal, con las env vars vacías temporalmente comentadas en `.env.local` y reiniciando el dev server, abrir `/admin-hb/dashboard` → no redirige ni truena (404 o la página en blanco es aceptable en este punto). Restaurar `.env.local`.

- [ ] **Paso 4: Commit**

```
[ADMIN] middleware de sesión Supabase y guarda de /admin-hb/dashboard
```

---

### Tarea 4.2: Página de login `/admin-hb`

**Archivos:**
- Crear `app/admin-hb/page.js`

**Interfaces:**
- **Consume:** `lib/auth.js` → `signIn(email, password)`, `getSession()`; `next/navigation` → `useRouter`; `lucide-react` → `Lock`, `Mail`, `Loader2`, `AlertCircle`.
- **Produce:** ruta `/admin-hb`. Client Component sin props.

Es **Client Component**: maneja estado de formulario, llama al cliente de navegador de Supabase (para que la sesión quede en cookies legibles por el middleware) y navega con `useRouter`.

- [ ] **Paso 1: Crear `app/admin-hb/page.js`**

La distinción entre "Supabase no configurado" y "credenciales inválidas" se hace **antes** de intentar el login, leyendo las env vars públicas (Next las inlinea en el bundle del cliente en tiempo de build). `signIn` se envuelve en try/catch y además se revisa `res?.error`, para ser inmune a que la fase previa haya elegido lanzar o retornar el error.

```jsx
// app/admin-hb/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { signIn, getSession } from "@/lib/auth";

const CONFIGURADO =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LoginAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(CONFIGURADO);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!CONFIGURADO) return;
    let vivo = true;
    (async () => {
      try {
        const sesion = await getSession();
        if (vivo && sesion) {
          router.replace("/admin-hb/dashboard");
          return;
        }
      } catch {
        // sin sesión: se queda en el login
      }
      if (vivo) setVerificando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [router]);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }
    setCargando(true);
    try {
      const res = await signIn(email.trim(), password);
      if (res?.error) throw res.error;
      router.replace("/admin-hb/dashboard");
      router.refresh();
    } catch (err) {
      const msg = String(err?.message || "");
      if (/invalid login credentials/i.test(msg)) {
        setError("Correo o contraseña incorrectos.");
      } else if (/email not confirmed/i.test(msg)) {
        setError("La cuenta existe pero el correo no está confirmado.");
      } else if (/fetch|network/i.test(msg)) {
        setError("No se pudo contactar a Supabase. Revisa tu conexión.");
      } else {
        setError(msg || "No se pudo iniciar sesión.");
      }
      setCargando(false);
    }
  };

  if (!CONFIGURADO) {
    return (
      <main className="min-h-screen bg-gray-soft flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-8 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold font-display text-dark mb-2">
            Supabase no está configurado
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            Faltan las variables de entorno. Crea un archivo{" "}
            <code className="bg-gray-100 px-1 rounded">.env.local</code> con:
          </p>
          <pre className="bg-dark text-left text-xs text-gray-soft rounded-xl p-4 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...`}
          </pre>
          <p className="text-gray-500 text-xs mt-4">
            Reinicia el servidor de desarrollo después de crearlo.
          </p>
        </div>
      </main>
    );
  }

  if (verificando) {
    return (
      <main className="min-h-screen bg-gray-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-soft flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-display text-dark">
            Panel Heredabienes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Acceso exclusivo para el equipo
          </p>
        </div>

        <form onSubmit={enviar} noValidate>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Correo
          </label>
          <div className="relative mb-4">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="correo@heredabienes.com"
            />
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Contraseña
          </label>
          <div className="relative mb-6">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
```

> Si el proyecto no tiene alias `@/*` en `jsconfig.json`, sustituir todos los imports `@/lib/...` y `@/components/...` de esta fase por rutas relativas. Verificarlo con `cat jsconfig.json` antes de continuar.

- [ ] **Paso 2: Verificación manual**

1. Abrir `http://localhost:3000/admin-hb` → tarjeta de login centrada, azul de marca.
2. Escribir `noexiste@x.com` / `12345678` → mensaje **"Correo o contraseña incorrectos."** (no un stack trace).
3. Comentar `NEXT_PUBLIC_SUPABASE_URL` en `.env.local`, reiniciar, recargar → pantalla **"Supabase no está configurado"** con el bloque de env vars. Restaurar y reiniciar.
4. Entrar con el usuario real creado en el dashboard de Supabase → redirige a `/admin-hb/dashboard` (404 esperado en este punto).
5. Volver a `/admin-hb` ya con sesión → redirige solo al dashboard.

- [ ] **Paso 3: Commit**

```
[ADMIN] login de /admin-hb con Supabase Auth y estado de no configurado
```

---

### Tarea 4.3: Layout del dashboard con cabecera y cierre de sesión

**Archivos:**
- Crear `app/admin-hb/dashboard/layout.js`

**Interfaces:**
- **Consume:** `lib/auth.js` → `signOut()`; `next/navigation` → `useRouter`, `usePathname`; `next/link`.
- **Produce:** layout de `/admin-hb/dashboard/*`. Client Component, prop `{ children }`.

Client Component porque el botón de salir necesita `onClick` y `useRouter`.

- [ ] **Paso 1: Crear `app/admin-hb/dashboard/layout.js`**

```jsx
// app/admin-hb/dashboard/layout.js
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Building2, ExternalLink } from "lucide-react";
import { signOut } from "@/lib/auth";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const salir = async () => {
    try {
      await signOut();
    } catch {
      // aunque falle, mandamos al login
    }
    router.replace("/admin-hb");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-soft">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/admin-hb/dashboard"
            className="flex items-center gap-2 font-display font-bold text-dark"
          >
            <Building2 className="w-5 h-5 text-primary" />
            Propiedades
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/propiedades"
              target="_blank"
              className="text-sm text-gray-500 hover:text-primary inline-flex items-center gap-1"
            >
              Ver sitio <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={salir}
              className="text-sm text-gray-500 hover:text-red-600 inline-flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
```

- [ ] **Paso 2: Verificación manual**

Con sesión iniciada, abrir `/admin-hb/dashboard` → barra superior blanca pegada arriba con "Propiedades", "Ver sitio" y "Salir". Clic en "Salir" → vuelve a `/admin-hb`; volver a `/admin-hb/dashboard` → el middleware redirige al login.

- [ ] **Paso 3: Commit**

```
[ADMIN] layout del dashboard con cabecera y cierre de sesión
```

---

### Tarea 4.4: Listado de propiedades en el dashboard

**Archivos:**
- Crear `app/admin-hb/dashboard/page.js`

**Interfaces:**
- **Consume:** `lib/api/properties.js` → `listProperties({ includeUnpublished: true })`, `deleteProperty(id)`, `duplicateProperty(id)`; `lib/format.js` → `formatPrecio(...)`, `ESTATUS`; `lucide-react`.
- **Produce:** ruta `/admin-hb/dashboard`. Client Component sin props.

Client Component: búsqueda en vivo, confirmación de borrado y mutaciones con la sesión del navegador (RLS autentica por la cookie de sesión, no por un secreto del servidor).

- [ ] **Paso 1: Crear `app/admin-hb/dashboard/page.js`**

Decisión UX: la eliminación pide confirmación en línea dentro de la propia fila (dos clics: "Eliminar" → "Confirmar"), no un `window.confirm`, para que el texto esté en español y no dependa del navegador.

```jsx
// app/admin-hb/dashboard/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Copy,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { listProperties, deleteProperty, duplicateProperty } from "@/lib/api/properties";
import { formatPrecio } from "@/lib/format";

const COLOR_ESTATUS = {
  disponible: "bg-green-50 text-green-700 border-green-200",
  apartado: "bg-amber-50 text-amber-700 border-amber-200",
  vendido: "bg-gray-100 text-gray-600 border-gray-200",
  pausado: "bg-red-50 text-red-600 border-red-200",
};

export default function DashboardPropiedades() {
  const router = useRouter();
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [porConfirmar, setPorConfirmar] = useState(null);
  const [ocupado, setOcupado] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const datos = await listProperties({ includeUnpublished: true });
      setPropiedades(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err?.message || "No se pudieron cargar las propiedades.");
    }
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return propiedades;
    return propiedades.filter((p) =>
      [p.titulo, p.colonia].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [propiedades, busqueda]);

  const duplicar = async (id) => {
    setOcupado(id);
    try {
      const copia = await duplicateProperty(id);
      await cargar();
      if (copia?.id) router.push(`/admin-hb/dashboard/${copia.id}`);
    } catch (err) {
      setError(err?.message || "No se pudo duplicar.");
    }
    setOcupado(null);
  };

  const eliminar = async (id) => {
    setOcupado(id);
    try {
      await deleteProperty(id);
      setPorConfirmar(null);
      await cargar();
    } catch (err) {
      setError(err?.message || "No se pudo eliminar.");
    }
    setOcupado(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-dark">Propiedades</h1>
          <p className="text-sm text-gray-500">
            {propiedades.length} en total ·{" "}
            {propiedades.filter((p) => p.publicado).length} publicadas
          </p>
        </div>
        <Link href="/admin-hb/dashboard/nueva" className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva propiedad
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por título o colonia…"
          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-3 mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {cargando ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">
            {busqueda
              ? "Ninguna propiedad coincide con la búsqueda."
              : "Todavía no hay propiedades. Crea la primera."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-soft text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                <th className="px-4 py-3 font-semibold">Precio</th>
                <th className="px-4 py-3 font-semibold">Estatus</th>
                <th className="px-4 py-3 font-semibold">Visibilidad</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtradas.map((p) => (
                <tr key={p.id} className="hover:bg-gray-soft/60">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-dark">{p.titulo}</div>
                    <div className="text-xs text-gray-400">/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {[p.colonia, p.municipio].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {p.precio ? formatPrecio(p.precio, p.moneda) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold capitalize ${
                        COLOR_ESTATUS[p.estatus] || COLOR_ESTATUS.pausado
                      }`}
                    >
                      {p.estatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.publicado ? (
                      <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold">
                        <Eye className="w-3.5 h-3.5" /> Publicada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-semibold">
                        <EyeOff className="w-3.5 h-3.5" /> Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {porConfirmar === p.id ? (
                        <>
                          <button
                            onClick={() => eliminar(p.id)}
                            disabled={ocupado === p.id}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold disabled:opacity-60"
                          >
                            {ocupado === p.id ? "Eliminando…" : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setPorConfirmar(null)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/admin-hb/dashboard/${p.id}`}
                            title="Editar"
                            className="p-2 rounded-lg hover:bg-primary-light text-gray-500 hover:text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => duplicar(p.id)}
                            disabled={ocupado === p.id}
                            title="Duplicar"
                            className="p-2 rounded-lg hover:bg-primary-light text-gray-500 hover:text-primary disabled:opacity-50"
                          >
                            {ocupado === p.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setPorConfirmar(p.id)}
                            title="Eliminar"
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Paso 2: Verificación manual**

1. Crear a mano una fila en la tabla `properties` desde el SQL editor de Supabase (`titulo`, `slug`, `tipo_inmueble`, `operacion` como mínimo) si la tabla está vacía.
2. Abrir `/admin-hb/dashboard` → aparece en la tabla con badge de estatus y "Borrador".
3. Escribir parte del título en el buscador → la fila se mantiene; escribir "zzz" → estado vacío "Ninguna propiedad coincide".
4. Clic en duplicar → aparece una segunda fila y navega a su formulario (404 esperado en este punto; volver atrás).
5. Clic en el bote de basura → los botones cambian a "Confirmar / Cancelar"; "Cancelar" no borra; "Confirmar" elimina la fila duplicada.

- [ ] **Paso 3: Commit**

```
[ADMIN] tabla de propiedades con búsqueda y acciones editar/duplicar/eliminar
```

---

### Tarea 4.5: Utilidades puras del formulario y set de iconos

**Archivos:**
- Crear `lib/admin/formulario.js`
- Crear `lib/admin/iconos.js`

**Interfaces:**
- **Consume:** `lib/format.js` → `TIPOS_INMUEBLE`, `OPERACIONES`, `ESTATUS`; `lucide-react`.
- **Produce:**
  - `lib/admin/formulario.js` → `propiedadVacia() -> Property`, `mostrarHabitacionales(tipo) -> boolean`, `mostrarMedidas(tipo) -> boolean`, `aNumero(valor) -> number|null`, `validarPropiedad(form) -> { [campo]: string }`.
  - `lib/admin/iconos.js` → `ICONOS_HIGHLIGHT: [{ valor, label, Icono }]`, `getIcono(valor) -> Component`.

Módulos sin `'use client'`: son puros y los importan Client Components (`iconos.js` reexporta componentes de `lucide-react`, que ya son client-safe).

- [ ] **Paso 1: Crear `lib/admin/formulario.js`**

Regla de condicionamiento por tipo, explícita: `terreno` no tiene recámaras/baños/medios baños/niveles/antigüedad pero sí medidas por orientación; `casa` y `departamento` lo inverso. Los tipos restantes (`local`, `oficina`, `bodega`, `rancho`) muestran **ambos** bloques, porque una bodega o un rancho sí tienen linderos y sí tienen baños.

```js
// lib/admin/formulario.js

export function propiedadVacia() {
  return {
    id: null,
    slug: "",
    titulo: "",
    gancho: "",
    tipoInmueble: "terreno",
    operacion: "venta",
    estatus: "disponible",
    publicado: false,
    destacado: false,
    orden: 0,
    precio: "",
    moneda: "MXN",
    mostrarPrecio: true,
    precioNota: "",
    formasPago: [],
    calle: "",
    numeroExterior: "",
    numeroInterior: "",
    colonia: "",
    municipio: "",
    estado: "Jalisco",
    cp: "",
    lat: "",
    lng: "",
    mostrarDireccionExacta: true,
    superficieTerrenoM2: "",
    superficieConstruccionM2: "",
    medidaNorte: "",
    medidaSur: "",
    medidaOriente: "",
    medidaPoniente: "",
    medidasNota: "",
    recamaras: "",
    banos: "",
    mediosBanos: "",
    estacionamientos: "",
    niveles: "",
    antiguedadAnios: "",
    descripcion: "",
    idealPara: [],
    ventajas: [],
    entorno: [],
    estatusLegal: [],
    amenidades: [],
    highlights: [],
    portadaUrl: "",
    fichaPdfUrl: "",
    asesorNombre: "",
    asesorTelefono: "",
    asesorEmail: "",
    metaTitle: "",
    metaDescription: "",
    imagenes: [],
  };
}

const SIN_HABITACIONALES = ["terreno"];
const SIN_MEDIDAS = ["casa", "departamento"];

export function mostrarHabitacionales(tipo) {
  return !SIN_HABITACIONALES.includes(tipo);
}

export function mostrarMedidas(tipo) {
  return !SIN_MEDIDAS.includes(tipo);
}

export function aNumero(valor) {
  if (valor === "" || valor === null || valor === undefined) return null;
  const n = Number(String(valor).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function validarPropiedad(form) {
  const errores = {};

  if (!form.titulo || !form.titulo.trim()) {
    errores.titulo = "El título es obligatorio.";
  }
  if (!form.tipoInmueble) {
    errores.tipoInmueble = "Selecciona el tipo de inmueble.";
  }
  if (!form.slug || !form.slug.trim()) {
    errores.slug = "El slug es obligatorio.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
    errores.slug = "Solo minúsculas, números y guiones.";
  }

  if (form.precio !== "" && form.precio !== null && aNumero(form.precio) === null) {
    errores.precio = "El precio debe ser un número.";
  }
  if (aNumero(form.precio) !== null && aNumero(form.precio) < 0) {
    errores.precio = "El precio no puede ser negativo.";
  }

  const numericos = [
    ["superficieTerrenoM2", "La superficie de terreno debe ser un número."],
    ["superficieConstruccionM2", "La superficie de construcción debe ser un número."],
    ["recamaras", "Las recámaras deben ser un número."],
    ["banos", "Los baños deben ser un número."],
    ["mediosBanos", "Los medios baños deben ser un número."],
    ["estacionamientos", "Los estacionamientos deben ser un número."],
    ["niveles", "Los niveles deben ser un número."],
    ["antiguedadAnios", "La antigüedad debe ser un número."],
    ["lat", "La latitud debe ser un número."],
    ["lng", "La longitud debe ser un número."],
  ];
  numericos.forEach(([campo, mensaje]) => {
    const v = form[campo];
    if (v !== "" && v !== null && v !== undefined && aNumero(v) === null) {
      errores[campo] = mensaje;
    }
  });

  if (form.asesorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.asesorEmail)) {
    errores.asesorEmail = "Correo inválido.";
  }
  if (Array.isArray(form.highlights) && form.highlights.length > 4) {
    errores.highlights = "Máximo 4 highlights.";
  }

  return errores;
}
```

- [ ] **Paso 2: Crear `lib/admin/iconos.js`**

Set fijo de 12 iconos, verificados como exportados por `lucide-react@1.7.0`. Se guarda el string `valor` en la BD, nunca el componente: la página pública resuelve el mismo mapa.

```js
// lib/admin/iconos.js
import {
  MapPin,
  TrendingUp,
  Building2,
  Trees,
  Ruler,
  ShieldCheck,
  Sparkles,
  Landmark,
  Car,
  Droplets,
  Zap,
  Route,
} from "lucide-react";

export const ICONOS_HIGHLIGHT = [
  { valor: "map-pin", label: "Ubicación", Icono: MapPin },
  { valor: "trending-up", label: "Plusvalía", Icono: TrendingUp },
  { valor: "building", label: "Zona urbana", Icono: Building2 },
  { valor: "trees", label: "Entorno natural", Icono: Trees },
  { valor: "ruler", label: "Superficie", Icono: Ruler },
  { valor: "shield", label: "Legal", Icono: ShieldCheck },
  { valor: "sparkles", label: "Premium", Icono: Sparkles },
  { valor: "landmark", label: "Inversión", Icono: Landmark },
  { valor: "car", label: "Accesos", Icono: Car },
  { valor: "droplets", label: "Agua", Icono: Droplets },
  { valor: "zap", label: "Servicios", Icono: Zap },
  { valor: "route", label: "Vialidades", Icono: Route },
];

export function getIcono(valor) {
  const encontrado = ICONOS_HIGHLIGHT.find((i) => i.valor === valor);
  return encontrado ? encontrado.Icono : Sparkles;
}
```

- [ ] **Paso 3: Verificación manual**

En una terminal, `node --input-type=module -e "import('./lib/admin/formulario.js').then(m => console.log(m.validarPropiedad(m.propiedadVacia())))"` → debe imprimir errores para `titulo` y `slug` únicamente. `mostrarHabitacionales('terreno')` → `false`; `mostrarMedidas('casa')` → `false`; `mostrarMedidas('bodega')` → `true`.

- [ ] **Paso 4: Commit**

```
[ADMIN] utilidades puras del formulario (validación, defaults, condicionales) e iconos
```

---

### Tarea 4.6: Primitivas de UI del formulario

**Archivos:**
- Crear `components/admin/SeccionColapsable.jsx`
- Crear `components/admin/Campos.jsx`

**Interfaces:**
- **Produce:**
  - `SeccionColapsable` — props: `{ titulo: string, descripcion?: string, Icono?: Component, abiertaInicial?: boolean, hayError?: boolean, children }`. Client Component (estado local abierto/cerrado).
  - `Campos.jsx` exporta: `Campo({ label, htmlFor, error, ayuda, children, className })`, `CampoTexto({ label, name, value, onChange, error, ayuda, placeholder, type, className })`, `CampoNumero({ label, name, value, onChange, error, ayuda, placeholder, sufijo, className })`, `CampoTextarea({ label, name, value, onChange, error, ayuda, rows, placeholder })`, `CampoSelect({ label, name, value, onChange, error, opciones: string[], className })`, `CampoCheck({ label, name, checked, onChange, ayuda })`. En todos, `onChange` es `(name, valor) => void` — nunca el evento crudo, para que las secciones no repitan `e.target.value`.

- [ ] **Paso 1: Crear `components/admin/SeccionColapsable.jsx`**

Decisión UX: las secciones nacen **abiertas** (`abiertaInicial` por defecto `true`) — un formulario de captura se recorre de arriba abajo una vez, y arrancar colapsado escondería errores de validación. El colapso sirve para reducir ruido al reeditar.

```jsx
// components/admin/SeccionColapsable.jsx
"use client";

import { useEffect, useState } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

export default function SeccionColapsable({
  titulo,
  descripcion,
  Icono,
  abiertaInicial = true,
  hayError = false,
  children,
}) {
  const [abierta, setAbierta] = useState(abiertaInicial);

  // Si aparece un error dentro, la sección se abre sola.
  useEffect(() => {
    if (hayError) setAbierta(true);
  }, [hayError]);

  return (
    <section className="bg-white rounded-2xl shadow-md overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-soft/60"
      >
        {Icono && (
          <span className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <Icono className="w-4 h-4 text-primary" />
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block font-display font-bold text-dark">{titulo}</span>
          {descripcion && (
            <span className="block text-xs text-gray-400">{descripcion}</span>
          )}
        </span>
        {hayError && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
        <ChevronDown
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
            abierta ? "rotate-180" : ""
          }`}
        />
      </button>
      {abierta && (
        <div className="px-5 pb-6 pt-1 border-t border-gray-100">{children}</div>
      )}
    </section>
  );
}
```

- [ ] **Paso 2: Crear `components/admin/Campos.jsx`**

```jsx
// components/admin/Campos.jsx
"use client";

const baseInput =
  "w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

export function Campo({ label, htmlFor, error, ayuda, children, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : ayuda ? (
        <p className="text-xs text-gray-400 mt-1">{ayuda}</p>
      ) : null}
    </div>
  );
}

export function CampoTexto({
  label,
  name,
  value,
  onChange,
  error,
  ayuda,
  placeholder,
  type = "text",
  className = "",
}) {
  return (
    <Campo label={label} htmlFor={name} error={error} ayuda={ayuda} className={className}>
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className={`${baseInput} ${error ? "border-red-300" : "border-gray-200"}`}
      />
    </Campo>
  );
}

export function CampoNumero({
  label,
  name,
  value,
  onChange,
  error,
  ayuda,
  placeholder,
  sufijo,
  className = "",
}) {
  return (
    <Campo label={label} htmlFor={name} error={error} ayuda={ayuda} className={className}>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="text"
          inputMode="decimal"
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
          className={`${baseInput} ${sufijo ? "pr-12" : ""} ${
            error ? "border-red-300" : "border-gray-200"
          }`}
        />
        {sufijo && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {sufijo}
          </span>
        )}
      </div>
    </Campo>
  );
}

export function CampoTextarea({
  label,
  name,
  value,
  onChange,
  error,
  ayuda,
  rows = 5,
  placeholder,
}) {
  return (
    <Campo label={label} htmlFor={name} error={error} ayuda={ayuda}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className={`${baseInput} ${error ? "border-red-300" : "border-gray-200"}`}
      />
    </Campo>
  );
}

export function CampoSelect({
  label,
  name,
  value,
  onChange,
  error,
  opciones = [],
  className = "",
}) {
  return (
    <Campo label={label} htmlFor={name} error={error} className={className}>
      <select
        id={name}
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        className={`${baseInput} bg-white capitalize ${
          error ? "border-red-300" : "border-gray-200"
        }`}
      >
        {opciones.map((op) => (
          <option key={op} value={op} className="capitalize">
            {op}
          </option>
        ))}
      </select>
    </Campo>
  );
}

export function CampoCheck({ label, name, checked, onChange, ayuda }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer select-none py-2">
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) => onChange(name, e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[#0098FF]"
      />
      <span>
        <span className="block text-sm font-semibold text-gray-700">{label}</span>
        {ayuda && <span className="block text-xs text-gray-400">{ayuda}</span>}
      </span>
    </label>
  );
}
```

- [ ] **Paso 3: Verificación**

No hay UI que abrir todavía; se verifica indirectamente en la Tarea 4.10. Confirmar que `npm run build` no marca imports rotos.

- [ ] **Paso 4: Commit**

```
[ADMIN] primitivas de formulario: sección colapsable y campos
```

---

### Tarea 4.7: Chips con presets y editor de highlights

**Archivos:**
- Crear `components/admin/ChipsPresets.jsx`
- Crear `components/admin/EditorHighlights.jsx`

**Interfaces:**
- **Produce:**
  - `ChipsPresets` — props: `{ label: string, valores: string[], presets: string[], onChange: (nuevos: string[]) => void, ayuda?: string, placeholder?: string }`. Client Component. Usado por `idealPara`, `ventajas`, `entorno`, `estatusLegal`, `amenidades` y `formasPago`.
  - `EditorHighlights` — props: `{ valores: [{icono,titulo,texto}], onChange: (nuevos) => void, presets?: [{icono,titulo,texto}], error?: string }`. Client Component. Máximo 4.
- **Consume:** `lib/admin/iconos.js` → `ICONOS_HIGHLIGHT`, `getIcono`.

- [ ] **Paso 1: Crear `components/admin/ChipsPresets.jsx`**

```jsx
// components/admin/ChipsPresets.jsx
"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

export default function ChipsPresets({
  label,
  valores = [],
  presets = [],
  onChange,
  ayuda,
  placeholder = "Agregar…",
}) {
  const [texto, setTexto] = useState("");

  const agregar = (valor) => {
    const limpio = String(valor || "").trim();
    if (!limpio) return;
    const yaEsta = valores.some(
      (v) => v.toLowerCase() === limpio.toLowerCase()
    );
    if (yaEsta) return;
    onChange([...valores, limpio]);
  };

  const quitar = (valor) => {
    onChange(valores.filter((v) => v !== valor));
  };

  const sugerencias = presets.filter(
    (p) => !valores.some((v) => v.toLowerCase() === p.toLowerCase())
  );

  return (
    <div>
      <span className="block text-sm font-semibold text-gray-700 mb-2">{label}</span>

      <div className="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
        {valores.length === 0 && (
          <span className="text-xs text-gray-400 py-1">Sin elementos todavía</span>
        )}
        {valores.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold pl-3 pr-1.5 py-1.5 rounded-full"
          >
            {v}
            <button
              type="button"
              onClick={() => quitar(v)}
              aria-label={`Quitar ${v}`}
              className="rounded-full hover:bg-white/25 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {sugerencias.length > 0 && (
        <div className="mb-3">
          <span className="block text-xs text-gray-400 mb-1.5">Sugerencias</span>
          <div className="flex flex-wrap gap-2">
            {sugerencias.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => agregar(p)}
                className="inline-flex items-center gap-1 border border-dashed border-gray-300 text-gray-600 text-xs px-3 py-1.5 rounded-full hover:border-primary hover:text-primary"
              >
                <Plus className="w-3 h-3" /> {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={texto}
          placeholder={placeholder}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              agregar(texto);
              setTexto("");
            }
          }}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="button"
          onClick={() => {
            agregar(texto);
            setTexto("");
          }}
          className="px-4 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white"
        >
          Agregar
        </button>
      </div>
      {ayuda && <p className="text-xs text-gray-400 mt-1">{ayuda}</p>}
    </div>
  );
}
```

- [ ] **Paso 2: Crear `components/admin/EditorHighlights.jsx`**

```jsx
// components/admin/EditorHighlights.jsx
"use client";

import { Plus, Trash2, Wand2 } from "lucide-react";
import { ICONOS_HIGHLIGHT, getIcono } from "@/lib/admin/iconos";

const MAX = 4;

export default function EditorHighlights({
  valores = [],
  onChange,
  presets = [],
  error,
}) {
  const actualizar = (indice, campo, valor) => {
    const copia = valores.map((h, i) =>
      i === indice ? { ...h, [campo]: valor } : h
    );
    onChange(copia);
  };

  const agregar = () => {
    if (valores.length >= MAX) return;
    onChange([...valores, { icono: "sparkles", titulo: "", texto: "" }]);
  };

  const quitar = (indice) => {
    onChange(valores.filter((_, i) => i !== indice));
  };

  const usarPresets = () => {
    onChange(presets.slice(0, MAX).map((h) => ({ ...h })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">
          Highlights ({valores.length}/{MAX})
        </span>
        {presets.length > 0 && valores.length === 0 && (
          <button
            type="button"
            onClick={usarPresets}
            className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:underline"
          >
            <Wand2 className="w-3.5 h-3.5" /> Usar los sugeridos
          </button>
        )}
      </div>

      <div className="space-y-3">
        {valores.map((h, i) => {
          const Icono = getIcono(h.icono);
          return (
            <div
              key={i}
              className="border border-gray-200 rounded-xl p-3 bg-gray-soft/50"
            >
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <Icono className="w-5 h-5 text-primary" />
                </span>
                <div className="flex-1 space-y-2">
                  <input
                    value={h.titulo ?? ""}
                    placeholder="Título (ej. Zona Premium)"
                    onChange={(e) => actualizar(i, "titulo", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    value={h.texto ?? ""}
                    placeholder="Texto corto (ej. Colonia Seattle, Zapopan)"
                    onChange={(e) => actualizar(i, "texto", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <select
                    value={h.icono ?? "sparkles"}
                    onChange={(e) => actualizar(i, "icono", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {ICONOS_HIGHLIGHT.map((op) => (
                      <option key={op.valor} value={op.valor}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => quitar(i)}
                  aria-label="Quitar highlight"
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {valores.length < MAX && (
        <button
          type="button"
          onClick={agregar}
          className="mt-3 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-primary hover:text-primary inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Agregar highlight
        </button>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
```

- [ ] **Paso 3: Verificación**

Se verifica visualmente en la Tarea 4.10. Por ahora, `npm run build` debe pasar.

- [ ] **Paso 4: Commit**

```
[ADMIN] componente de chips con presets y editor de highlights
```

---

### Tarea 4.8: Galería con reordenamiento y subida de ficha PDF

**Archivos:**
- Crear `components/admin/GaleriaEditor.jsx`
- Crear `components/admin/SubidaPdf.jsx`

**Interfaces:**
- **Consume:** `lib/api/storage.js` → `uploadFile(file, folder) -> {path, url}`, `deleteFile(path)`; `lib/api/images.js` → `listImagesByProperty(propertyId)`, `addImage({propertyId, url, storagePath, alt, orden})`, `reorderImages(orderedIds)`, `deleteImage(id)`.
- **Produce:**
  - `GaleriaEditor` — props: `{ propertyId: string|null, portadaUrl: string, onPortadaChange: (url: string) => void }`. Client Component; posee su propio estado de imágenes y persiste de inmediato contra Supabase.
  - `SubidaPdf` — props: `{ propertyId: string|null, valor: string, onChange: (url: string) => void }`. Client Component.

Decisión UX y de integridad: **con `propertyId === null` (propiedad nueva sin guardar) ambos componentes se muestran deshabilitados** con el mensaje "Guarda primero la propiedad para subir archivos". Razón: `addImage` exige un `propertyId` que satisfaga la FK, y subir al bucket antes de tener fila generaría archivos huérfanos si el usuario abandona el formulario.

- [ ] **Paso 1: Crear `components/admin/GaleriaEditor.jsx`**

El reordenamiento usa la API nativa de drag & drop de HTML5 — sin librería, sin dependencia nueva. El borrado hace `deleteImage(id)` primero y `deleteFile(storagePath)` después: si la fila se borra pero el archivo falla, queda un archivo suelto pero la UI es consistente; el orden inverso podría dejar una fila apuntando a un archivo inexistente.

```jsx
// components/admin/GaleriaEditor.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  Star,
  GripVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  listImagesByProperty,
  addImage,
  reorderImages,
  deleteImage,
} from "@/lib/api/images";
import { uploadFile, deleteFile } from "@/lib/api/storage";

export default function GaleriaEditor({ propertyId, portadaUrl, onPortadaChange }) {
  const inputRef = useRef(null);
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [arrastrando, setArrastrando] = useState(null);

  useEffect(() => {
    if (!propertyId) return;
    let vivo = true;
    (async () => {
      setCargando(true);
      try {
        const datos = await listImagesByProperty(propertyId);
        if (vivo) setImagenes(Array.isArray(datos) ? datos : []);
      } catch (err) {
        if (vivo) setError(err?.message || "No se pudieron cargar las imágenes.");
      }
      if (vivo) setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [propertyId]);

  const subir = async (e) => {
    const archivos = Array.from(e.target.files || []);
    if (!archivos.length || !propertyId) return;
    setSubiendo(true);
    setError("");
    let orden = imagenes.length;
    const nuevas = [];
    for (const archivo of archivos) {
      try {
        const { path, url } = await uploadFile(archivo, `${propertyId}/galeria`);
        const fila = await addImage({
          propertyId,
          url,
          storagePath: path,
          alt: "",
          orden: orden++,
        });
        nuevas.push(fila || { id: path, url, storagePath: path, alt: "", orden });
      } catch (err) {
        setError(`No se pudo subir ${archivo.name}: ${err?.message || "error"}`);
      }
    }
    const total = [...imagenes, ...nuevas];
    setImagenes(total);
    if (!portadaUrl && total[0]) onPortadaChange(total[0].url);
    setSubiendo(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const borrar = async (img) => {
    setError("");
    const restantes = imagenes.filter((i) => i.id !== img.id);
    setImagenes(restantes);
    try {
      await deleteImage(img.id);
      if (img.storagePath) await deleteFile(img.storagePath);
    } catch (err) {
      setError(err?.message || "No se pudo eliminar la imagen.");
      setImagenes(imagenes); // revierte
      return;
    }
    if (portadaUrl === img.url) {
      onPortadaChange(restantes[0] ? restantes[0].url : "");
    }
  };

  const soltar = async (destino) => {
    if (arrastrando === null || arrastrando === destino) {
      setArrastrando(null);
      return;
    }
    const copia = [...imagenes];
    const [movida] = copia.splice(arrastrando, 1);
    copia.splice(destino, 0, movida);
    setImagenes(copia);
    setArrastrando(null);
    try {
      await reorderImages(copia.map((i) => i.id));
    } catch (err) {
      setError(err?.message || "No se pudo guardar el nuevo orden.");
    }
  };

  if (!propertyId) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
        <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          Guarda primero la propiedad para subir imágenes.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">
          Galería ({imagenes.length})
        </span>
        <label className="btn-outline cursor-pointer !px-4 !py-2 !text-sm">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={subir}
            disabled={subiendo}
          />
          {subiendo ? "Subiendo…" : "Subir imágenes"}
        </label>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        Arrastra para reordenar. La estrella marca la portada, que es la imagen que
        aparece al compartir el link.
      </p>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl p-3 mb-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {cargando ? (
        <div className="py-10 text-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
        </div>
      ) : imagenes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
          Todavía no hay imágenes.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {imagenes.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setArrastrando(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => soltar(i)}
              onDragEnd={() => setArrastrando(null)}
              className={`relative group rounded-xl overflow-hidden border-2 bg-gray-100 ${
                portadaUrl === img.url ? "border-primary" : "border-transparent"
              } ${arrastrando === i ? "opacity-40" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || ""}
                className="w-full h-32 object-cover pointer-events-none"
              />
              <span className="absolute top-1.5 left-1.5 bg-black/50 text-white rounded-md p-1 cursor-grab">
                <GripVertical className="w-3.5 h-3.5" />
              </span>
              <div className="absolute top-1.5 right-1.5 flex gap-1">
                <button
                  type="button"
                  onClick={() => onPortadaChange(img.url)}
                  title="Marcar como portada"
                  className={`rounded-md p-1 ${
                    portadaUrl === img.url
                      ? "bg-primary text-white"
                      : "bg-black/50 text-white hover:bg-primary"
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => borrar(img)}
                  title="Eliminar imagen"
                  className="rounded-md p-1 bg-black/50 text-white hover:bg-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {portadaUrl === img.url && (
                <span className="absolute bottom-0 inset-x-0 bg-primary text-white text-[10px] font-bold text-center py-0.5">
                  PORTADA
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Paso 2: Crear `components/admin/SubidaPdf.jsx`**

```jsx
// components/admin/SubidaPdf.jsx
"use client";

import { useRef, useState } from "react";
import { FileText, Trash2, AlertCircle } from "lucide-react";
import { uploadFile } from "@/lib/api/storage";

export default function SubidaPdf({ propertyId, valor, onChange }) {
  const inputRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const subir = async (e) => {
    const archivo = (e.target.files || [])[0];
    if (!archivo || !propertyId) return;
    if (archivo.type !== "application/pdf") {
      setError("El archivo debe ser un PDF.");
      return;
    }
    setError("");
    setSubiendo(true);
    try {
      const { url } = await uploadFile(archivo, `${propertyId}/ficha`);
      onChange(url);
    } catch (err) {
      setError(err?.message || "No se pudo subir el PDF.");
    }
    setSubiendo(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (!propertyId) {
    return (
      <p className="text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
        Guarda primero la propiedad para subir la ficha PDF.
      </p>
    );
  }

  return (
    <div>
      <span className="block text-sm font-semibold text-gray-700 mb-2">
        Ficha técnica (PDF)
      </span>

      {valor ? (
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <a
            href={valor}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-w-0 truncate text-sm text-primary hover:underline"
          >
            {valor.split("/").pop()}
          </a>
          <button
            type="button"
            onClick={() => onChange("")}
            title="Quitar del formulario"
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="btn-outline cursor-pointer !px-4 !py-2 !text-sm inline-flex">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={subir}
            disabled={subiendo}
          />
          {subiendo ? "Subiendo…" : "Subir PDF"}
        </label>
      )}

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600 mt-2">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Paso 3: Verificación**

Se verifica en la Tarea 4.10 (necesita una propiedad guardada). `npm run build` debe pasar.

- [ ] **Paso 4: Commit**

```
[ADMIN] galería reordenable con portada y subida de ficha PDF
```

---

### Tarea 4.9: Las nueve secciones del formulario

**Archivos:**
- Crear `components/admin/SeccionIdentidad.jsx`
- Crear `components/admin/SeccionPrecio.jsx`
- Crear `components/admin/SeccionUbicacion.jsx`
- Crear `components/admin/SeccionSuperficie.jsx`
- Crear `components/admin/SeccionEspecificos.jsx`
- Crear `components/admin/SeccionContenido.jsx`
- Crear `components/admin/SeccionMedios.jsx`
- Crear `components/admin/SeccionContacto.jsx`
- Crear `components/admin/SeccionSeo.jsx`

**Interfaces:** todas son **Client Components** (reciben handlers y renderizan inputs controlados). Contrato común: `{ form, errores, onChange }` donde `onChange(nombreCampo, valor)`. Extras por sección:

| Componente | Props |
|---|---|
| `SeccionIdentidad` | `{ form, errores, onChange }` |
| `SeccionPrecio` | `{ form, errores, onChange }` |
| `SeccionUbicacion` | `{ form, errores, onChange }` |
| `SeccionSuperficie` | `{ form, errores, onChange }` |
| `SeccionEspecificos` | `{ form, errores, onChange }` |
| `SeccionContenido` | `{ form, errores, onChange }` |
| `SeccionMedios` | `{ form, propertyId, onChange }` |
| `SeccionContacto` | `{ form, errores, onChange }` |
| `SeccionSeo` | `{ form, errores, onChange }` |

**Consume:** `components/admin/SeccionColapsable.jsx`, `components/admin/Campos.jsx`, `components/admin/ChipsPresets.jsx`, `components/admin/EditorHighlights.jsx`, `components/admin/GaleriaEditor.jsx`, `components/admin/SubidaPdf.jsx`, `lib/format.js` (`slugify`, `TIPOS_INMUEBLE`, `OPERACIONES`, `ESTATUS`, `FORMAS_PAGO`, `PRESETS`), `lib/admin/formulario.js` (`mostrarHabitacionales`, `mostrarMedidas`).

- [ ] **Paso 1: `components/admin/SeccionIdentidad.jsx`**

El slug se autogenera desde el título **mientras el usuario no lo haya editado a mano** (bandera local `slugManual`). En cuanto lo toca, deja de sobrescribirse.

```jsx
// components/admin/SeccionIdentidad.jsx
"use client";

import { useState } from "react";
import { Tag, RefreshCw } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoTexto, CampoSelect, CampoCheck, Campo } from "./Campos";
import { slugify, TIPOS_INMUEBLE, OPERACIONES, ESTATUS } from "@/lib/format";

export default function SeccionIdentidad({ form, errores, onChange }) {
  const [slugManual, setSlugManual] = useState(Boolean(form.slug));

  const cambiarTitulo = (_name, valor) => {
    onChange("titulo", valor);
    if (!slugManual) onChange("slug", slugify(valor));
  };

  const cambiarSlug = (_name, valor) => {
    setSlugManual(true);
    onChange("slug", valor);
  };

  const regenerarSlug = () => {
    setSlugManual(false);
    onChange("slug", slugify(form.titulo || ""));
  };

  const hayError = Boolean(errores.titulo || errores.slug || errores.tipoInmueble);

  return (
    <SeccionColapsable
      titulo="Identidad"
      descripcion="Título, slug, tipo y estado de publicación"
      Icono={Tag}
      hayError={hayError}
    >
      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <CampoTexto
          label="Título *"
          name="titulo"
          value={form.titulo}
          onChange={cambiarTitulo}
          error={errores.titulo}
          placeholder="Terreno con Alta Plusvalía en Colonia Seattle"
          className="sm:col-span-2"
        />

        <Campo
          label="Slug *"
          htmlFor="slug"
          error={errores.slug}
          ayuda={`URL pública: /propiedades/${form.slug || "…"}`}
          className="sm:col-span-2"
        >
          <div className="flex gap-2">
            <input
              id="slug"
              value={form.slug ?? ""}
              onChange={(e) => cambiarSlug("slug", e.target.value)}
              className={`flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                errores.slug ? "border-red-300" : "border-gray-200"
              }`}
            />
            <button
              type="button"
              onClick={regenerarSlug}
              title="Regenerar desde el título"
              className="px-3 rounded-xl border border-gray-200 text-gray-500 hover:text-primary hover:border-primary"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </Campo>

        <CampoTexto
          label="Gancho"
          name="gancho"
          value={form.gancho}
          onChange={onChange}
          placeholder="Terreno urbano premium"
          className="sm:col-span-2"
        />

        <CampoSelect
          label="Tipo de inmueble *"
          name="tipoInmueble"
          value={form.tipoInmueble}
          onChange={onChange}
          error={errores.tipoInmueble}
          opciones={TIPOS_INMUEBLE}
        />
        <CampoSelect
          label="Operación *"
          name="operacion"
          value={form.operacion}
          onChange={onChange}
          opciones={OPERACIONES}
        />
        <CampoSelect
          label="Estatus"
          name="estatus"
          value={form.estatus}
          onChange={onChange}
          opciones={ESTATUS}
        />
        <CampoTexto
          label="Orden en el listado"
          name="orden"
          value={form.orden}
          onChange={onChange}
          ayuda="Menor número aparece primero"
        />

        <div className="sm:col-span-2 border-t border-gray-100 pt-2">
          <CampoCheck
            label="Publicada"
            name="publicado"
            checked={form.publicado}
            onChange={onChange}
            ayuda="Si está apagado, la propiedad queda como borrador y no aparece en el sitio."
          />
          <CampoCheck
            label="Destacada"
            name="destacado"
            checked={form.destacado}
            onChange={onChange}
            ayuda="Aparece en la sección de destacadas del Home."
          />
        </div>
      </div>
    </SeccionColapsable>
  );
}
```

- [ ] **Paso 2: `components/admin/SeccionPrecio.jsx`**

```jsx
// components/admin/SeccionPrecio.jsx
"use client";

import { DollarSign } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoNumero, CampoSelect, CampoTexto, CampoCheck } from "./Campos";
import ChipsPresets from "./ChipsPresets";
import { FORMAS_PAGO } from "@/lib/format";

export default function SeccionPrecio({ form, errores, onChange }) {
  return (
    <SeccionColapsable
      titulo="Precio"
      descripcion="Monto, moneda y formas de pago"
      Icono={DollarSign}
      hayError={Boolean(errores.precio)}
    >
      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <CampoNumero
          label="Precio"
          name="precio"
          value={form.precio}
          onChange={onChange}
          error={errores.precio}
          placeholder="38000000"
          ayuda="Solo números, sin comas ni signo de pesos."
        />
        <CampoSelect
          label="Moneda"
          name="moneda"
          value={form.moneda}
          onChange={onChange}
          opciones={["MXN", "USD"]}
        />
        <CampoTexto
          label="Nota del precio"
          name="precioNota"
          value={form.precioNota}
          onChange={onChange}
          placeholder="Por debajo de lo valuado"
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <CampoCheck
            label="Mostrar el precio en el sitio"
            name="mostrarPrecio"
            checked={form.mostrarPrecio}
            onChange={onChange}
            ayuda='Si se apaga, el sitio muestra "Precio a consultar".'
          />
        </div>
        <div className="sm:col-span-2">
          <ChipsPresets
            label="Formas de pago"
            valores={form.formasPago}
            presets={FORMAS_PAGO}
            onChange={(nuevos) => onChange("formasPago", nuevos)}
            placeholder="Otra forma de pago…"
          />
        </div>
      </div>
    </SeccionColapsable>
  );
}
```

- [ ] **Paso 3: `components/admin/SeccionUbicacion.jsx`**

```jsx
// components/admin/SeccionUbicacion.jsx
"use client";

import { MapPin } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoTexto, CampoNumero, CampoCheck } from "./Campos";

export default function SeccionUbicacion({ form, errores, onChange }) {
  return (
    <SeccionColapsable
      titulo="Ubicación"
      descripcion="Dirección y coordenadas del mapa"
      Icono={MapPin}
      hayError={Boolean(errores.lat || errores.lng)}
    >
      <div className="grid gap-4 sm:grid-cols-6 mt-4">
        <CampoTexto
          label="Calle"
          name="calle"
          value={form.calle}
          onChange={onChange}
          placeholder="Calle 10"
          className="sm:col-span-4"
        />
        <CampoTexto
          label="Número exterior"
          name="numeroExterior"
          value={form.numeroExterior}
          onChange={onChange}
          placeholder="66"
          className="sm:col-span-1"
        />
        <CampoTexto
          label="Interior"
          name="numeroInterior"
          value={form.numeroInterior}
          onChange={onChange}
          className="sm:col-span-1"
        />
        <CampoTexto
          label="Colonia"
          name="colonia"
          value={form.colonia}
          onChange={onChange}
          placeholder="Colonia Seattle"
          className="sm:col-span-3"
        />
        <CampoTexto
          label="Municipio"
          name="municipio"
          value={form.municipio}
          onChange={onChange}
          placeholder="Zapopan"
          className="sm:col-span-3"
        />
        <CampoTexto
          label="Estado"
          name="estado"
          value={form.estado}
          onChange={onChange}
          placeholder="Jalisco"
          className="sm:col-span-3"
        />
        <CampoTexto
          label="Código postal"
          name="cp"
          value={form.cp}
          onChange={onChange}
          placeholder="45150"
          className="sm:col-span-3"
        />
        <CampoNumero
          label="Latitud"
          name="lat"
          value={form.lat}
          onChange={onChange}
          error={errores.lat}
          placeholder="20.6970"
          className="sm:col-span-3"
        />
        <CampoNumero
          label="Longitud"
          name="lng"
          value={form.lng}
          onChange={onChange}
          error={errores.lng}
          placeholder="-103.4100"
          className="sm:col-span-3"
        />
        <div className="sm:col-span-6">
          <CampoCheck
            label="Mostrar la dirección exacta"
            name="mostrarDireccionExacta"
            checked={form.mostrarDireccionExacta}
            onChange={onChange}
            ayuda="Si se apaga, el sitio muestra solo colonia y municipio, y el mapa se aproxima."
          />
        </div>
      </div>
    </SeccionColapsable>
  );
}
```

- [ ] **Paso 4: `components/admin/SeccionSuperficie.jsx`**

Aquí vive la mitad "medidas por orientación" del condicionamiento por tipo: se ocultan para `casa` y `departamento`.

```jsx
// components/admin/SeccionSuperficie.jsx
"use client";

import { Ruler } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoNumero, CampoTexto, CampoTextarea } from "./Campos";
import { mostrarMedidas } from "@/lib/admin/formulario";

export default function SeccionSuperficie({ form, errores, onChange }) {
  const conMedidas = mostrarMedidas(form.tipoInmueble);

  return (
    <SeccionColapsable
      titulo="Superficie y medidas"
      descripcion={
        conMedidas
          ? "Área y linderos por orientación"
          : "Área de terreno y construcción"
      }
      Icono={Ruler}
      hayError={Boolean(errores.superficieTerrenoM2 || errores.superficieConstruccionM2)}
    >
      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <CampoNumero
          label="Superficie de terreno"
          name="superficieTerrenoM2"
          value={form.superficieTerrenoM2}
          onChange={onChange}
          error={errores.superficieTerrenoM2}
          sufijo="m²"
          placeholder="1500"
        />
        <CampoNumero
          label="Superficie de construcción"
          name="superficieConstruccionM2"
          value={form.superficieConstruccionM2}
          onChange={onChange}
          error={errores.superficieConstruccionM2}
          sufijo="m²"
          placeholder="0"
        />

        {conMedidas && (
          <>
            <div className="sm:col-span-2 border-t border-gray-100 pt-3">
              <p className="text-sm font-semibold text-gray-700">
                Medidas por orientación
              </p>
              <p className="text-xs text-gray-400">
                Texto libre: admite quiebres, por ejemplo “36.00 m + quiebre de 10.00 m”.
              </p>
            </div>
            <CampoTexto
              label="Norte"
              name="medidaNorte"
              value={form.medidaNorte}
              onChange={onChange}
              placeholder="46.00 m"
            />
            <CampoTexto
              label="Sur"
              name="medidaSur"
              value={form.medidaSur}
              onChange={onChange}
              placeholder="36.00 m + quiebre de 10.00 m"
            />
            <CampoTexto
              label="Oriente"
              name="medidaOriente"
              value={form.medidaOriente}
              onChange={onChange}
              placeholder="35.00 m"
            />
            <CampoTexto
              label="Poniente"
              name="medidaPoniente"
              value={form.medidaPoniente}
              onChange={onChange}
              placeholder="33.00 m"
            />
            <div className="sm:col-span-2">
              <CampoTextarea
                label="Nota de las medidas"
                name="medidasNota"
                value={form.medidasNota}
                onChange={onChange}
                rows={2}
                placeholder="Medidas aproximadas sujetas a levantamiento topográfico."
              />
            </div>
          </>
        )}
      </div>
    </SeccionColapsable>
  );
}
```

- [ ] **Paso 5: `components/admin/SeccionEspecificos.jsx`**

La otra mitad del condicionamiento: recámaras, baños, medios baños, niveles y antigüedad se ocultan cuando el tipo es `terreno`. Estacionamientos permanece siempre (un terreno puede ofrecer cajones).

```jsx
// components/admin/SeccionEspecificos.jsx
"use client";

import { Home } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoNumero } from "./Campos";
import { mostrarHabitacionales } from "@/lib/admin/formulario";

export default function SeccionEspecificos({ form, errores, onChange }) {
  const conHabitacionales = mostrarHabitacionales(form.tipoInmueble);

  return (
    <SeccionColapsable
      titulo="Específicos del inmueble"
      descripcion={
        conHabitacionales
          ? "Recámaras, baños, niveles y antigüedad"
          : "Un terreno no lleva datos habitacionales"
      }
      Icono={Home}
      hayError={Boolean(
        errores.recamaras ||
          errores.banos ||
          errores.mediosBanos ||
          errores.estacionamientos ||
          errores.niveles ||
          errores.antiguedadAnios
      )}
    >
      <div className="grid gap-4 sm:grid-cols-3 mt-4">
        {conHabitacionales && (
          <>
            <CampoNumero
              label="Recámaras"
              name="recamaras"
              value={form.recamaras}
              onChange={onChange}
              error={errores.recamaras}
            />
            <CampoNumero
              label="Baños completos"
              name="banos"
              value={form.banos}
              onChange={onChange}
              error={errores.banos}
            />
            <CampoNumero
              label="Medios baños"
              name="mediosBanos"
              value={form.mediosBanos}
              onChange={onChange}
              error={errores.mediosBanos}
            />
          </>
        )}
        <CampoNumero
          label="Estacionamientos"
          name="estacionamientos"
          value={form.estacionamientos}
          onChange={onChange}
          error={errores.estacionamientos}
        />
        {conHabitacionales && (
          <>
            <CampoNumero
              label="Niveles"
              name="niveles"
              value={form.niveles}
              onChange={onChange}
              error={errores.niveles}
            />
            <CampoNumero
              label="Antigüedad"
              name="antiguedadAnios"
              value={form.antiguedadAnios}
              onChange={onChange}
              error={errores.antiguedadAnios}
              sufijo="años"
            />
          </>
        )}
        {!conHabitacionales && (
          <p className="sm:col-span-3 text-sm text-gray-400">
            Cambia el tipo de inmueble a casa o departamento para capturar recámaras,
            baños, niveles y antigüedad.
          </p>
        )}
      </div>
    </SeccionColapsable>
  );
}
```

- [ ] **Paso 6: `components/admin/SeccionContenido.jsx`**

```jsx
// components/admin/SeccionContenido.jsx
"use client";

import { FileText } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoTextarea } from "./Campos";
import ChipsPresets from "./ChipsPresets";
import EditorHighlights from "./EditorHighlights";
import { PRESETS } from "@/lib/format";

export default function SeccionContenido({ form, errores, onChange }) {
  return (
    <SeccionColapsable
      titulo="Contenido"
      descripcion="Descripción, listas comerciales y highlights"
      Icono={FileText}
      hayError={Boolean(errores.highlights)}
    >
      <div className="space-y-6 mt-4">
        <CampoTextarea
          label="Descripción"
          name="descripcion"
          value={form.descripcion}
          onChange={onChange}
          rows={6}
          placeholder="Excelente terreno urbano en una de las zonas de mayor plusvalía de Zapopan…"
        />

        <ChipsPresets
          label="Ideal para"
          valores={form.idealPara}
          presets={PRESETS.idealPara}
          onChange={(nuevos) => onChange("idealPara", nuevos)}
        />
        <ChipsPresets
          label="Ventajas"
          valores={form.ventajas}
          presets={PRESETS.ventajas}
          onChange={(nuevos) => onChange("ventajas", nuevos)}
        />
        <ChipsPresets
          label="Entorno"
          valores={form.entorno}
          presets={PRESETS.entorno}
          onChange={(nuevos) => onChange("entorno", nuevos)}
        />
        <ChipsPresets
          label="Estatus legal"
          valores={form.estatusLegal}
          presets={PRESETS.estatusLegal}
          onChange={(nuevos) => onChange("estatusLegal", nuevos)}
        />
        <ChipsPresets
          label="Amenidades y servicios"
          valores={form.amenidades}
          presets={PRESETS.amenidades}
          onChange={(nuevos) => onChange("amenidades", nuevos)}
        />

        <div className="border-t border-gray-100 pt-5">
          <EditorHighlights
            valores={form.highlights}
            presets={PRESETS.highlights}
            onChange={(nuevos) => onChange("highlights", nuevos)}
            error={errores.highlights}
          />
        </div>
      </div>
    </SeccionColapsable>
  );
}
```

- [ ] **Paso 7: `components/admin/SeccionMedios.jsx`**

```jsx
// components/admin/SeccionMedios.jsx
"use client";

import { ImageIcon } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import GaleriaEditor from "./GaleriaEditor";
import SubidaPdf from "./SubidaPdf";

export default function SeccionMedios({ form, propertyId, onChange }) {
  return (
    <SeccionColapsable
      titulo="Medios"
      descripcion="Galería, portada y ficha PDF"
      Icono={ImageIcon}
    >
      <div className="space-y-6 mt-4">
        <GaleriaEditor
          propertyId={propertyId}
          portadaUrl={form.portadaUrl}
          onPortadaChange={(url) => onChange("portadaUrl", url)}
        />
        <div className="border-t border-gray-100 pt-5">
          <SubidaPdf
            propertyId={propertyId}
            valor={form.fichaPdfUrl}
            onChange={(url) => onChange("fichaPdfUrl", url)}
          />
        </div>
      </div>
    </SeccionColapsable>
  );
}
```

> `ImageIcon` es el alias de exportación de `Image` en `lucide-react`; importarlo como `Image` colisiona con `next/image`.

- [ ] **Paso 8: `components/admin/SeccionContacto.jsx`**

```jsx
// components/admin/SeccionContacto.jsx
"use client";

import { UserRound } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoTexto } from "./Campos";

export default function SeccionContacto({ form, errores, onChange }) {
  return (
    <SeccionColapsable
      titulo="Contacto"
      descripcion="Asesor responsable de esta propiedad"
      Icono={UserRound}
      hayError={Boolean(errores.asesorEmail)}
    >
      <div className="grid gap-4 sm:grid-cols-3 mt-4">
        <CampoTexto
          label="Nombre del asesor"
          name="asesorNombre"
          value={form.asesorNombre}
          onChange={onChange}
          ayuda="Si se deja vacío, se usan los datos generales de Heredabienes."
        />
        <CampoTexto
          label="Teléfono / WhatsApp"
          name="asesorTelefono"
          value={form.asesorTelefono}
          onChange={onChange}
          placeholder="5213313013253"
          ayuda="Formato internacional, sin signos."
        />
        <CampoTexto
          label="Correo"
          name="asesorEmail"
          type="email"
          value={form.asesorEmail}
          onChange={onChange}
          error={errores.asesorEmail}
          placeholder="heredabienes@outlook.com"
        />
      </div>
    </SeccionColapsable>
  );
}
```

- [ ] **Paso 9: `components/admin/SeccionSeo.jsx`**

```jsx
// components/admin/SeccionSeo.jsx
"use client";

import { Globe } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoTexto, CampoTextarea } from "./Campos";

export default function SeccionSeo({ form, errores, onChange }) {
  const largoTitle = (form.metaTitle || "").length;
  const largoDesc = (form.metaDescription || "").length;

  return (
    <SeccionColapsable
      titulo="SEO y vista previa al compartir"
      descripcion="Lo que se ve en Google y en WhatsApp"
      Icono={Globe}
      abiertaInicial={false}
    >
      <div className="space-y-4 mt-4">
        <CampoTexto
          label="Meta title"
          name="metaTitle"
          value={form.metaTitle}
          onChange={onChange}
          error={errores.metaTitle}
          ayuda={`${largoTitle}/60 caracteres. Si se deja vacío se genera del título.`}
        />
        <CampoTextarea
          label="Meta description"
          name="metaDescription"
          value={form.metaDescription}
          onChange={onChange}
          rows={3}
          ayuda={`${largoDesc}/160 caracteres. Si se deja vacío se genera del título y el precio.`}
        />
        <div className="bg-gray-soft rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Vista previa</p>
          <p className="text-primary font-semibold text-sm truncate">
            {form.metaTitle || form.titulo || "Título de la propiedad"}
          </p>
          <p className="text-xs text-green-700">
            heredabienes.com/propiedades/{form.slug || "…"}
          </p>
          <p className="text-xs text-gray-600 line-clamp-2">
            {form.metaDescription ||
              form.descripcion ||
              "Descripción de la propiedad."}
          </p>
        </div>
      </div>
    </SeccionColapsable>
  );
}
```

- [ ] **Paso 10: Verificación**

`npm run build` debe compilar sin errores de import. Las secciones se ven en la Tarea 4.10.

- [ ] **Paso 11: Commit**

```
[ADMIN] nueve secciones del formulario de propiedad como componentes independientes
```

---

### Tarea 4.10: Server Action de revalidación, verificación de slug y página del formulario

**Archivos:**
- Crear `app/admin-hb/dashboard/acciones.js`
- Modificar `lib/api/properties.js` (**agregar** `slugDisponible`, sin tocar las funciones existentes)
- Crear `app/admin-hb/dashboard/[id]/page.js`

**Interfaces:**
- **Consume:** `lib/api/properties.js` → `getPropertyById(id)`, `createProperty(fields)`, `updateProperty(id, fields)`; `lib/admin/formulario.js` → `propiedadVacia()`, `validarPropiedad(form)`, `aNumero(v)`; los nueve componentes de sección.
- **Produce:**
  - `app/admin-hb/dashboard/acciones.js` → **Server Action** `revalidarPropiedad(slug, slugAnterior?) -> Promise<{ ok: boolean }>`.
  - `lib/api/properties.js` → `slugDisponible(slug, idExcluir?) -> Promise<boolean>` (adición, no reemplazo).
  - `app/admin-hb/dashboard/[id]/page.js` → ruta `/admin-hb/dashboard/[id]`, con `id === "nueva"` para crear. Client Component.

- [ ] **Paso 1: Crear la Server Action `app/admin-hb/dashboard/acciones.js`**

Tiene que ser Server Action porque `revalidatePath` solo existe en el servidor. Se invoca desde el Client Component como una función asíncrona normal; Next la convierte en un POST interno. El archivo entero lleva `'use server'` y solo exporta funciones asíncronas.

```js
// app/admin-hb/dashboard/acciones.js
"use server";

import { revalidatePath } from "next/cache";

export async function revalidarPropiedad(slug, slugAnterior) {
  revalidatePath("/propiedades");
  if (slug) revalidatePath("/propiedades/" + slug);
  if (slugAnterior && slugAnterior !== slug) {
    revalidatePath("/propiedades/" + slugAnterior);
  }
  revalidatePath("/");
  return { ok: true };
}
```

- [ ] **Paso 2: Agregar `slugDisponible` al final de `lib/api/properties.js`**

Adición pura: no cambia ninguna firma existente. Consulta directa por índice único en lugar de traer todo el catálogo.

```js
// lib/api/properties.js — AGREGAR al final, sin modificar lo existente

export async function slugDisponible(slug, idExcluir) {
  const limpio = String(slug || "").trim();
  if (!limpio) return false;

  let consulta = supabase.from("properties").select("id").eq("slug", limpio).limit(1);
  if (idExcluir) consulta = consulta.neq("id", idExcluir);

  const { data, error } = await consulta;
  if (error) throw error;
  return !data || data.length === 0;
}
```

> Si el módulo no tiene una constante `supabase` en el ámbito, usar el mismo mecanismo de obtención del cliente que usan `listProperties`/`getPropertyById` en ese archivo (por ejemplo `const supabase = getClient()` dentro de la función). Revisar el archivo antes de pegar.

- [ ] **Paso 3: Crear `app/admin-hb/dashboard/[id]/page.js`**

Client Component porque mantiene el estado de un formulario grande, sube archivos con la sesión del navegador y navega tras guardar. La escritura va directo a Supabase con la anon key + sesión: **RLS es lo que autoriza**, no hay API route intermedia.

Decisión UX: al crear (`id === "nueva"`), el primer guardado hace `router.replace` a la URL con el id real, lo que habilita galería y PDF sin perder lo capturado.

```jsx
// app/admin-hb/dashboard/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import {
  getPropertyById,
  createProperty,
  updateProperty,
  slugDisponible,
} from "@/lib/api/properties";
import { propiedadVacia, validarPropiedad, aNumero } from "@/lib/admin/formulario";
import { slugify } from "@/lib/format";
import { revalidarPropiedad } from "../acciones";

import SeccionIdentidad from "@/components/admin/SeccionIdentidad";
import SeccionPrecio from "@/components/admin/SeccionPrecio";
import SeccionUbicacion from "@/components/admin/SeccionUbicacion";
import SeccionSuperficie from "@/components/admin/SeccionSuperficie";
import SeccionEspecificos from "@/components/admin/SeccionEspecificos";
import SeccionContenido from "@/components/admin/SeccionContenido";
import SeccionMedios from "@/components/admin/SeccionMedios";
import SeccionContacto from "@/components/admin/SeccionContacto";
import SeccionSeo from "@/components/admin/SeccionSeo";

const NUMERICOS = [
  "precio",
  "orden",
  "superficieTerrenoM2",
  "superficieConstruccionM2",
  "recamaras",
  "banos",
  "mediosBanos",
  "estacionamientos",
  "niveles",
  "antiguedadAnios",
  "lat",
  "lng",
];

function aPayload(form) {
  const salida = { ...form };
  delete salida.id;
  delete salida.imagenes;
  NUMERICOS.forEach((campo) => {
    salida[campo] = aNumero(form[campo]);
  });
  salida.titulo = (form.titulo || "").trim();
  salida.slug = slugify(form.slug || form.titulo || "");
  return salida;
}

export default function FormularioPropiedad() {
  const router = useRouter();
  const params = useParams();
  const esNueva = params.id === "nueva";

  const [propertyId, setPropertyId] = useState(esNueva ? null : params.id);
  const [form, setForm] = useState(propiedadVacia());
  const [slugOriginal, setSlugOriginal] = useState("");
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(!esNueva);
  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (esNueva) return;
    let vivo = true;
    (async () => {
      try {
        const datos = await getPropertyById(params.id);
        if (!datos) throw new Error("La propiedad no existe.");
        if (!vivo) return;
        const base = propiedadVacia();
        const combinado = { ...base };
        Object.keys(base).forEach((k) => {
          const v = datos[k];
          if (v === null || v === undefined) return;
          combinado[k] = v;
        });
        setForm(combinado);
        setSlugOriginal(datos.slug || "");
      } catch (err) {
        if (vivo) setErrorGlobal(err?.message || "No se pudo cargar la propiedad.");
      }
      if (vivo) setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [esNueva, params.id]);

  const onChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => (prev[campo] ? { ...prev, [campo]: undefined } : prev));
    setAviso("");
  };

  const guardar = async (publicar) => {
    setErrorGlobal("");
    setAviso("");

    const candidato = publicar ? { ...form, publicado: true } : form;
    const errs = validarPropiedad(candidato);
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      setErrorGlobal("Revisa los campos marcados en rojo.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setGuardando(true);
    const payload = aPayload(candidato);

    try {
      const libre = await slugDisponible(payload.slug, propertyId || undefined);
      if (!libre) {
        setErrores({ slug: "Ya existe otra propiedad con ese slug." });
        setErrorGlobal("El slug está ocupado. Cámbialo y vuelve a guardar.");
        setGuardando(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      let guardada;
      if (propertyId) {
        guardada = await updateProperty(propertyId, payload);
      } else {
        guardada = await createProperty(payload);
      }

      const idFinal = guardada?.id || propertyId;
      const slugFinal = guardada?.slug || payload.slug;

      setForm(candidato.publicado === payload.publicado ? candidato : candidato);
      setErrores({});

      try {
        await revalidarPropiedad(slugFinal, slugOriginal);
      } catch {
        // la revalidación no debe bloquear el guardado
      }
      setSlugOriginal(slugFinal);

      if (!propertyId && idFinal) {
        setPropertyId(idFinal);
        router.replace(`/admin-hb/dashboard/${idFinal}`);
      }

      setAviso(
        payload.publicado
          ? "Guardado y publicado. Ya es visible en el sitio."
          : "Guardado como borrador. No es visible en el sitio."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorGlobal(err?.message || "No se pudo guardar.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setGuardando(false);
  };

  if (cargando) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-28">
      <Link
        href="/admin-hb/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al listado
      </Link>

      <h1 className="text-2xl font-bold font-display text-dark mb-1">
        {esNueva && !propertyId ? "Nueva propiedad" : form.titulo || "Editar propiedad"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {form.publicado ? "Publicada" : "Borrador"} · {form.tipoInmueble} ·{" "}
        {form.operacion}
      </p>

      {errorGlobal && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-3 mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorGlobal}</span>
        </div>
      )}
      {aviso && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl p-3 mb-4">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{aviso}</span>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <SeccionIdentidad form={form} errores={errores} onChange={onChange} />
        <SeccionPrecio form={form} errores={errores} onChange={onChange} />
        <SeccionUbicacion form={form} errores={errores} onChange={onChange} />
        <SeccionSuperficie form={form} errores={errores} onChange={onChange} />
        <SeccionEspecificos form={form} errores={errores} onChange={onChange} />
        <SeccionContenido form={form} errores={errores} onChange={onChange} />
        <SeccionMedios form={form} propertyId={propertyId} onChange={onChange} />
        <SeccionContacto form={form} errores={errores} onChange={onChange} />
        <SeccionSeo form={form} errores={errores} onChange={onChange} />
      </form>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-end gap-3">
          <span className="mr-auto text-xs text-gray-400 hidden sm:block">
            /propiedades/{form.slug || "…"}
          </span>
          <button
            type="button"
            onClick={() => guardar(false)}
            disabled={guardando}
            className="btn-outline !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar borrador"}
          </button>
          <button
            type="button"
            onClick={() => guardar(true)}
            disabled={guardando}
            className="btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {guardando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Guardando…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Guardar y publicar
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Paso 4: Verificación manual**

1. `/admin-hb/dashboard` → "Nueva propiedad" → abre `/admin-hb/dashboard/nueva` con las 9 secciones en orden Identidad → Precio → Ubicación → Superficie → Específicos → Contenido → Medios → Contacto → SEO.
2. Clic en "Guardar borrador" sin llenar nada → banner rojo "Revisa los campos marcados en rojo" y errores bajo Título y Slug.
3. Escribir el título `Casa de prueba` → el slug se autocompleta a `casa-de-prueba`. Editarlo a mano a `otra-cosa`, luego cambiar el título → el slug ya **no** se sobrescribe. Clic en el botón de refrescar junto al slug → vuelve a generarse del título.
4. Con tipo `terreno`: la sección Superficie muestra Norte/Sur/Oriente/Poniente y Específicos no muestra recámaras/baños/niveles/antigüedad. Cambiar a `casa`: desaparecen las 4 medidas y aparecen recámaras, baños, medios baños, niveles y antigüedad. Cambiar a `bodega`: aparecen ambos bloques.
5. Escribir `abc` en Precio → al guardar, error "El precio debe ser un número" bajo el campo.
6. Guardar como borrador con datos válidos → mensaje verde "Guardado como borrador", la URL cambia de `/nueva` a `/<uuid>`, y la sección Medios deja de decir "Guarda primero la propiedad".
7. Subir 3 imágenes → aparecen; arrastrar la tercera al primer lugar → se reordena; recargar la página → el orden persiste. Marcar la estrella en otra → badge PORTADA se mueve. Eliminar una → desaparece; verificar en Supabase Storage (bucket `propiedades`, carpeta `<id>/galeria`) que el archivo ya no está.
8. Subir un PDF → aparece el enlace, abrirlo en pestaña nueva y confirmar que descarga.
9. Crear una segunda propiedad con el mismo slug → al guardar, error "Ya existe otra propiedad con ese slug."
10. "Guardar y publicar" → mensaje verde de publicada; abrir `/propiedades` en otra pestaña → aparece sin necesidad de reiniciar el server (efecto de `revalidatePath`).

- [ ] **Paso 5: Commit**

```
[ADMIN] formulario de propiedad con validación, slug único, medios y revalidación
```

---

### Tarea 4.11: Prueba end-to-end — terreno de Colonia Seattle

**Archivos:** ninguno (verificación). Si aparece un defecto, se corrige en el archivo correspondiente antes de cerrar la fase.

- [ ] **Paso 1: Captura desde cero**

Con sesión iniciada, ir a `/admin-hb/dashboard` → "Nueva propiedad" y capturar exactamente:

**Identidad**
- Título: `Terreno con Alta Plusvalía en Colonia Seattle`
- Slug (autogenerado, verificar): `terreno-con-alta-plusvalia-en-colonia-seattle`
- Gancho: `Terreno urbano premium`
- Tipo: `terreno` · Operación: `venta` · Estatus: `disponible`
- Destacada: encendida. Publicada: se deja apagada por ahora.

**Precio**
- Precio: `38000000` · Moneda: `MXN` · Mostrar precio: encendido
- Nota del precio: `Por debajo de lo valuado`
- Formas de pago: clic en las sugerencias `Contado` y `Aportación`

**Ubicación**
- Calle `Calle 10` · Número exterior `66` · Colonia `Colonia Seattle` · Municipio `Zapopan` · Estado `Jalisco`
- Mostrar dirección exacta: encendido

**Superficie** (confirmar que los 4 campos de orientación están visibles por ser `terreno`)
- Norte: `46.00 m`
- Sur: `36.00 m + quiebre de 10.00 m`
- Oriente: `35.00 m`
- Poniente: `33.00 m`

**Específicos**
- Confirmar que **no** aparecen recámaras, baños, medios baños, niveles ni antigüedad.

**Contenido**
- Descripción: un párrafo comercial.
- Ideal para / Ventajas / Entorno / Estatus legal: agregar todas las sugerencias de `PRESETS` con clic.
- Highlights: usar "Usar los sugeridos" → deben quedar 4, con ícono, título y texto.

**Contacto y SEO:** dejar vacíos (deben caer a los datos globales / autogenerarse).

- [ ] **Paso 2: Guardar borrador y verificar que NO es público**

Clic en "Guardar borrador". Abrir `/propiedades` en una ventana privada → la propiedad **no** debe aparecer. Abrir `/propiedades/terreno-con-alta-plusvalia-en-colonia-seattle` en esa misma ventana privada → `not-found`. Esto valida a la vez el flag `publicado` y la política RLS de lectura.

- [ ] **Paso 3: Medios**

En la sección Medios, subir al menos 3 fotos del terreno, reordenarlas arrastrando, marcar la deseada como portada, y subir la ficha PDF. Guardar de nuevo como borrador.

- [ ] **Paso 4: Publicar y verificar la ficha pública**

Clic en "Guardar y publicar". Abrir `/propiedades/terreno-con-alta-plusvalia-en-colonia-seattle` (ventana privada) y confirmar que se ve, sin campos faltantes:
- Galería con las fotos en el orden definido y la portada primero.
- `$38,000,000 MXN` y la nota "Por debajo de lo valuado".
- Las 4 medidas, incluida la de Sur con el texto del quiebre completo.
- Los 4 highlights con su ícono correcto.
- Las listas Ideal para / Ventajas / Entorno / Estatus legal.
- Formas de pago: Contado y Aportación.
- Botón de descarga de la ficha PDF, funcional.
- Con "Ver código fuente", que `<meta property="og:image">` apunte a la portada y `og:title` al título.

- [ ] **Paso 5: Verificar que RLS protege de verdad**

En una ventana privada (sin sesión), abrir la consola del navegador en `/propiedades` y ejecutar un `update` cualquiera sobre `properties` con el cliente de Supabase. Debe fallar por política RLS. Esto confirma lo que el middleware **no** hace: el middleware solo escondió la UI.

- [ ] **Paso 6: Duplicar y eliminar**

Desde el dashboard, duplicar la propiedad → se abre el formulario de la copia con todas las listas y el estatus legal ya cargados; cambiar título y slug. Después, eliminarla con la confirmación en línea → desaparece de la tabla.

- [ ] **Paso 7: Build**

```bash
npm run build
```

Debe terminar sin errores. Confirmar en la salida que `/admin-hb`, `/admin-hb/dashboard` y `/admin-hb/dashboard/[id]` se listan como rutas dinámicas (no prerenderizadas), y que `/propiedades` y `/propiedades/[slug]` sí se generan.

- [ ] **Paso 8: Commit**

```
[ADMIN] correcciones de la prueba E2E del terreno de Colonia Seattle
```

### Critical Files for Implementation
- /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/app/admin-hb/dashboard/[id]/page.js
- /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/components/admin/GaleriaEditor.jsx
- /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/lib/admin/formulario.js
- /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/lib/supabase/middleware.js
- /Users/ricardo/Work/inmobiliaria/lidfi/heredabienes/docs/superpowers/specs/2026-07-20-catalogo-propiedades-design.md