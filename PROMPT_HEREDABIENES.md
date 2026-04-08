

## CONTEXTO GENERAL

Construye el sitio web completo de **HeredaBienes. Grupo Inmobiliario** — una empresa especializada en regularización de propiedades heredadas, sucesiones, escrituración y gestión patrimonial en Jalisco, México. La empresa es el equivalente moderno y con branding propio de Heredum (heredum.com.mx), una firma que ayuda a las familias a regularizar su patrimonio inmobiliario.

**Stack tecnológico obligatorio:**
- React 18+ con Vite
- Tailwind CSS (usa clases de utilidad; NO componentes externos como shadcn a menos que ya estén instalados)
- React Router DOM para navegación
- Lucide React para íconos
- Imágenes desde **Unsplash** (usar URLs directas de `images.unsplash.com`) para todas las fotos

---

## IDENTIDAD DE MARCA

| Elemento | Valor |
|---|---|
| **Nombre** | HeredaBienes. Grupo Inmobiliario |
| **Tagline** | *"Tu patrimonio, en manos confiables."* |
| **Subtítulo hero** | *"Regularizamos, escrituramos y protegemos tu herencia en Jalisco."* |
| **Color primario** | `#0098FF` (azul brillante) |
| **Color secundario** | `#FFFFFF` (blanco) |
| **Color oscuro** | `#0A1628` (azul marino casi negro, para textos y fondos oscuros) |
| **Color acento** | `#007ACC` (azul más oscuro para hovers) |
| **Color gris claro** | `#F4F8FF` (fondo de secciones alternas) |
| **Fuentes sugeridas** | Display: `Plus Jakarta Sans` o `Outfit` (bold). Body: `Inter` o `DM Sans`. Importar desde Google Fonts. |
| **Tono** | Profesional, cálido, confiable, claro. Inspirar seguridad jurídica y cercanía familiar. |
| **Ubicación** | Guadalajara, Jalisco, México |

---

## ARQUITECTURA DE ARCHIVOS A GENERAR

```
src/
├── main.jsx
├── App.jsx
├── index.css
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── HeroCarousel.jsx
│   ├── ServicesGrid.jsx
│   ├── WhyUs.jsx
│   ├── ProcessSteps.jsx
│   ├── Testimonials.jsx
│   ├── StatsBar.jsx
│   ├── CTABanner.jsx
│   ├── ContactForm.jsx
│   └── FAQSection.jsx
└── pages/
    ├── Home.jsx
    ├── Servicios.jsx
    ├── Nosotros.jsx
    ├── Blog.jsx
    └── Contacto.jsx
```

---

## SECCIÓN 1 — NAVBAR

**Archivo:** `src/components/Navbar.jsx`

- Fondo: blanco con sombra suave `shadow-sm`
- Logo: texto `HeredaBienes.` en azul `#0098FF` (font-bold, tamaño grande) + subtexto "Grupo Inmobiliario" en gris debajo, más pequeño
- Menú de navegación: `Inicio | Servicios | Nosotros | Blog | Contacto`
- CTA botón: `"Consulta Gratis"` — fondo `#0098FF`, texto blanco, rounded-full, hover oscurece
- Sticky al hacer scroll con `position: sticky top-0 z-50`
- Responsive: hamburger menu en móvil con animación de apertura/cierre
- Al hacer scroll, añadir fondo blanco con sombra si originalmente era transparente

---

## SECCIÓN 2 — HERO CAROUSEL (sección más importante)

**Archivo:** `src/components/HeroCarousel.jsx`

Este es el elemento central y más impactante del sitio. Es un **carrusel de pantalla completa** que ocupa 100vh, con transición automática cada 5 segundos y controles manuales.

### Slides del carrusel (5 slides):

**Slide 1 — Sucesiones y Herencias**
- Imagen: `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80` (familia en casa)
- Título: `"¿Recibiste una propiedad en herencia?"`
- Subtítulo: `"Te ayudamos a regularizarla y escriturarla sin complicaciones."`
- CTA: `"Inicia tu trámite"`

**Slide 2 — Regularización de Propiedades**
- Imagen: `https://images.unsplash.com/photo-1582407947304-fd86f28f96da?w=1600&q=80` (edificio moderno)
- Título: `"Regulariza tu propiedad con seguridad jurídica"`
- Subtítulo: `"Propiedades sin escrituras, intestados sin resolver — nosotros lo gestionamos."`
- CTA: `"Ver servicios"`

**Slide 3 — Escrituración**
- Imagen: `https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1600&q=80` (manos firmando documentos)
- Título: `"Escrituración rápida y sin estrés"`
- Subtítulo: `"Más de 500 familias en Jalisco han protegido su patrimonio con nosotros."`
- CTA: `"Consulta gratis"`

**Slide 4 — Asesoría Patrimonial**
- Imagen: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80` (asesor profesional)
- Título: `"Asesoría patrimonial personalizada"`
- Subtítulo: `"Planifica el futuro de tu familia con expertos inmobiliarios."`
- CTA: `"Hablar con un asesor"`

**Slide 5 — Compra y Venta**
- Imagen: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80` (llaves de casa)
- Título: `"Compra y venta de propiedades heredadas"`
- Subtítulo: `"Maximiza el valor de tu inmueble con nuestro equipo de expertos."`
- CTA: `"Conoce más"`

### Especificaciones técnicas del carrusel:
- Cada slide tiene un **overlay degradado** oscuro de izquierda a centro (`from-black/70 to-transparent`) para que el texto sea legible
- El texto aparece animado con `fadeInUp` (translateY de 30px a 0, opacity 0 a 1) al mostrar cada slide
- **Indicadores** (dots) en la parte inferior centrados, el activo en `#0098FF`
- **Flechas izquierda/derecha** con íconos de Lucide (`ChevronLeft`, `ChevronRight`), semi-transparentes, que aparecen en hover
- **Autoplay** cada 5000ms, se pausa si el usuario interactúa manualmente
- Transición: `transition-all duration-700 ease-in-out`
- Badge flotante en la esquina superior derecha: `"✓ +500 familias atendidas"` con fondo `#0098FF`

---

## SECCIÓN 3 — BARRA DE ESTADÍSTICAS

**Archivo:** `src/components/StatsBar.jsx`

Barra horizontal con fondo `#0098FF`, texto blanco. 4 estadísticas con íconos:

| Ícono (Lucide) | Número | Descripción |
|---|---|---|
| `Home` | `+500` | Propiedades regularizadas |
| `Users` | `+1,200` | Familias atendidas |
| `Clock` | `15 años` | De experiencia |
| `MapPin` | Jalisco | Cobertura estatal |

- Números con animación contador al entrar en viewport (usar `IntersectionObserver`)
- Layout: grid de 4 columnas en desktop, 2 en tablet, 1 en móvil
- Separadores verticales entre columnas

---

## SECCIÓN 4 — SERVICIOS PRINCIPALES

**Archivo:** `src/components/ServicesGrid.jsx`

Título de sección: `"Nuestros Servicios"` centrado, con línea decorativa azul debajo.
Subtítulo: `"Soluciones integrales para proteger tu patrimonio inmobiliario en Jalisco."`

**8 tarjetas de servicio en grid (4 col desktop, 2 tablet, 1 móvil):**

1. **Sucesiones y Herencias**
   - Ícono: `FileText`
   - Imagen: `https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80`
   - Descripción: "Tramitamos juicios sucesorios testamentarios e intestamentarios. Te guiamos en cada paso para que tu herencia quede correctamente adjudicada."

2. **Regularización de Propiedades**
   - Ícono: `Shield`
   - Imagen: `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80`
   - Descripción: "Regularizamos inmuebles sin escrituras, propiedades ejidales, predios irregulares y todo tipo de situaciones patrimoniales complejas."

3. **Escrituración**
   - Ícono: `PenTool`
   - Imagen: `https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&q=80`
   - Descripción: "Gestionamos el proceso completo de escrituración ante notario público para que tu propiedad quede formalmente a tu nombre."

4. **Compra y Venta de Inmuebles**
   - Ícono: `Building`
   - Imagen: `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80`
   - Descripción: "¿Deseas vender una propiedad heredada o comprar un inmueble? Te asesoramos para cerrar la operación de forma segura y al mejor precio."

5. **Asesoría Patrimonial**
   - Ícono: `TrendingUp`
   - Imagen: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80`
   - Descripción: "Planifica el futuro de tu patrimonio familiar. Te ayudamos a estructurar tu herencia en vida y a proteger tus bienes para las próximas generaciones."

6. **Trámites ante el Registro Público**
   - Ícono: `Landmark`
   - Imagen: `https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80`
   - Descripción: "Realizamos inscripciones, cancelaciones de hipotecas, certificados de libertad de gravamen y todos los trámites ante el RPPC de Jalisco."

7. **Gestión de Predial y Adeudos**
   - Ícono: `CreditCard`
   - Imagen: `https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&q=80`
   - Descripción: "Regularizamos adeudos de predial, agua y otros servicios para que tu propiedad esté al corriente antes de cualquier trámite."

8. **Avalúos y Gestión Notarial**
   - Ícono: `BarChart2`
   - Imagen: `https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&q=80`
   - Descripción: "Coordinamos avalúos catastrales y comerciales, y gestionamos todos los trámites notariales para tus operaciones inmobiliarias."

### Estilo de las tarjetas:
- Fondo blanco, `rounded-2xl`, `shadow-md` con `hover:shadow-xl`
- Imagen en la parte superior con `object-cover h-48 w-full rounded-t-2xl`
- Ícono azul `#0098FF` sobre fondo `#F4F8FF` circular arriba del texto (superpuesto sobre la imagen)
- Título en negro bold, descripción en gris oscuro
- Botón inferior: `"Saber más"` en azul, con flecha `ArrowRight`
- Hover: borde izquierdo de 4px en `#0098FF` + leve translateY(-4px)

---

## SECCIÓN 5 — ¿POR QUÉ ELEGIRNOS?

**Archivo:** `src/components/WhyUs.jsx`

Layout de **2 columnas**: izquierda imagen grande, derecha contenido.

**Imagen izquierda:** `https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80` (equipo profesional reunión)

**Título derecho:** `"¿Por qué confiar en HeredaBienes?"`

**6 puntos con ícono de check azul:**

1. ✅ **Expertos en derecho inmobiliario** — Abogados especializados en sucesiones y regularización en Jalisco
2. ✅ **Proceso transparente** — Te informamos en cada etapa, sin letra chica ni sorpresas
3. ✅ **Atención personalizada** — Un asesor dedicado para tu caso, de inicio a fin
4. ✅ **Más de 15 años de experiencia** — Conocemos a fondo el sistema registral de Jalisco
5. ✅ **Soluciones para casos difíciles** — Propiedades sin escrituras, juicios sucesorios complejos, predios ejidales
6. ✅ **Consulta inicial sin costo** — Evaluamos tu caso gratis antes de cualquier compromiso

**Badge flotante** sobre la imagen: `"Consulta gratis disponible"` en `#0098FF` con sombra.

---

## SECCIÓN 6 — PROCESO DE TRABAJO

**Archivo:** `src/components/ProcessSteps.jsx`

Fondo: `#F4F8FF`. Título: `"¿Cómo trabajamos?"`. Subtítulo: `"Un proceso claro, acompañado y sin complicaciones."`

**4 pasos en línea horizontal (con línea conectora entre ellos):**

| Paso | Número | Título | Descripción |
|---|---|---|---|
| 1 | `01` | Consulta gratuita | Analizamos tu caso sin costo. Evaluamos el estado jurídico de tu propiedad. |
| 2 | `02` | Plan de acción | Te presentamos el camino más eficiente y el costo total, sin sorpresas. |
| 3 | `03` | Gestión completa | Nos encargamos de todos los trámites: notariales, registrales y fiscales. |
| 4 | `04` | Entrega de documentos | Recibes tu escritura o título registrado. Tu patrimonio, protegido. |

- Número del paso: grande, en `#0098FF`, font-bold
- Línea conectora horizontal entre pasos (CSS border-top punteado azul)
- En móvil: stack vertical con línea vertical conectora
- Íconos: `Phone`, `ClipboardList`, `Settings`, `CheckCircle` de Lucide

---

## SECCIÓN 7 — TESTIMONIOS

**Archivo:** `src/components/Testimonials.jsx`

Título: `"Lo que dicen nuestras familias"`. Fondo blanco.

**Mini-carousel de 3 testimonios** con auto-scroll o flechas:

> **Testimonio 1 — María G., Guadalajara**
> _"Teníamos una propiedad que llevaba 20 años sin escriturar después del fallecimiento de mi madre. HeredaBienes resolvió todo en 4 meses. Profesionales y muy humanos."_
> ⭐⭐⭐⭐⭐

> **Testimonio 2 — Roberto L., Zapopan**
> _"Mi caso era complicado: varios herederos y nadie de acuerdo. El equipo de HeredaBienes nos guió con mucha paciencia hasta llegar al acuerdo. 100% recomendados."_
> ⭐⭐⭐⭐⭐

> **Testimonio 3 — Familia Torres, Tlaquepaque**
> _"Pensábamos que regularizar la propiedad de mi abuelo sería imposible. En menos de 6 meses ya tenemos la escritura. El costo fue justo y el proceso muy claro."_
> ⭐⭐⭐⭐⭐

- Cada tarjeta: fondo blanco, `rounded-2xl`, `shadow-lg`, borde izquierdo 4px `#0098FF`
- Avatar: círculo con iniciales coloreadas
- Citas en itálica, nombre en bold

---

## SECCIÓN 8 — BANNER CTA

**Archivo:** `src/components/CTABanner.jsx`

Fondo: `#0098FF`. Texto blanco. Layout de 2 columnas.

**Izquierda:**
- Título grande: `"¿Tu propiedad tiene una historia sin resolver?"`
- Subtítulo: `"Nosotros la terminamos. Regularización, escrituración y asesoría en Jalisco."`

**Derecha:**
- 2 botones:
  - Primario: `"Agenda tu consulta gratis"` — fondo blanco, texto `#0098FF`, rounded-full
  - Secundario: `"Llámanos ahora"` — borde blanco, texto blanco, rounded-full, hover fondo blanco/10

**Elemento decorativo:** círculos SVG semi-transparentes en las esquinas para dar profundidad visual.

---

## SECCIÓN 9 — PREGUNTAS FRECUENTES

**Archivo:** `src/components/FAQSection.jsx`

Accordion interactivo. Fondo: `#F4F8FF`. Título: `"Preguntas frecuentes"`.

**8 preguntas:**

1. **¿Cuánto tiempo tarda regularizar una propiedad heredada en Jalisco?**
   → Dependiendo del caso, entre 3 y 12 meses. Con testamento, el proceso es más rápido. Nuestro equipo te dará un estimado real desde la primera consulta.

2. **¿Qué pasa si no hay testamento?**
   → Se tramita una sucesión intestamentaria ante notario público o juez, según corresponda. Te acompañamos en todo el proceso.

3. **¿Qué impuestos debo pagar al heredar una propiedad?**
   → El principal es el ISAI (Impuesto sobre Adquisición de Inmuebles), que en Jalisco puede estar exento en herencias en línea directa (padres a hijos). También aplican gastos notariales y de registro.

4. **¿Pueden regularizarse propiedades ejidales?**
   → Sí, aunque el proceso es distinto. Coordinamos con el Registro Agrario Nacional y las autoridades ejidales correspondientes.

5. **¿Qué documentos necesito para iniciar?**
   → Básicamente: INE, acta de defunción del propietario anterior, testamento (si existe), escrituras o documentos de la propiedad, y actas de nacimiento de herederos. En la consulta inicial te indicamos exactamente qué aplica a tu caso.

6. **¿Trabajan solo en Guadalajara o en todo Jalisco?**
   → Atendemos casos en todo el estado de Jalisco, incluyendo zonas metropolitanas y municipios del interior.

7. **¿Cuánto cuesta el servicio?**
   → El costo depende del tipo de trámite y la complejidad del caso. Ofrecemos una consulta inicial gratuita donde te damos un presupuesto exacto sin compromisos.

8. **¿Puedo iniciar el proceso si hay conflicto entre herederos?**
   → Sí. Contamos con abogados especializados en mediación y litigio familiar para estos casos.

- Accordion con animación suave de expansión/colapso
- Ícono `+`/`-` que rota con transición
- Borde inferior entre preguntas, la activa resalta en azul claro

---

## SECCIÓN 10 — FORMULARIO DE CONTACTO

**Archivo:** `src/components/ContactForm.jsx`

Layout de **2 columnas**: izquierda info de contacto, derecha formulario.

**Izquierda — Info:**
- Título: `"Contáctanos. Tu consulta es gratuita."`
- `📍 Guadalajara, Jalisco, México`
- `📞 (33) 1234-5678`
- `✉️ hola@heredabienes.com`
- Horario: `"Lunes a Viernes 9am – 6pm"`
- Íconos de redes: WhatsApp, Facebook, Instagram (Lucide o SVG inline)

**Derecha — Formulario (campos):**
- Nombre completo
- Teléfono
- Correo electrónico
- Tipo de servicio (select): Sucesión/Herencia | Regularización | Escrituración | Compra/Venta | Otro
- Mensaje / Describe tu caso (textarea)
- Botón: `"Enviar consulta"` — fondo `#0098FF`, full width, hover oscurece

- Validación básica en React (campos requeridos, formato email)
- Al enviar: mensaje de éxito `"¡Gracias! Te contactaremos en menos de 24 horas."` con ícono check verde
- Estilos: inputs con border `#E2E8F0`, focus border `#0098FF`, rounded-lg

---

## FOOTER

**Archivo:** `src/components/Footer.jsx`

Fondo: `#0A1628` (azul marino oscuro). Texto blanco/gris claro.

**4 columnas:**

**Col 1 — Logo + descripción:**
- `HeredaBienes.` en blanco bold grande
- `Grupo Inmobiliario` en azul `#0098FF`
- Párrafo: "Especialistas en regularización de propiedades, sucesiones y escrituración en Jalisco. Tu patrimonio en manos confiables."
- Íconos de redes sociales

**Col 2 — Servicios:**
- Sucesiones y Herencias
- Regularización de Propiedades
- Escrituración
- Compra y Venta
- Asesoría Patrimonial
- Trámites Registrales

**Col 3 — Empresa:**
- Nosotros
- Proceso de trabajo
- Testimonios
- Preguntas frecuentes
- Blog
- Contacto

**Col 4 — Contacto:**
- Dirección: Guadalajara, Jalisco, México
- Teléfono: (33) 1234-5678
- Email: hola@heredabienes.com
- Botón: `"Agenda consulta gratis"` en `#0098FF`

**Línea inferior:** `© 2025 HeredaBienes. Grupo Inmobiliario. Todos los derechos reservados. | Aviso de Privacidad`

---

## PÁGINAS INTERNAS

### `src/pages/Nosotros.jsx`

- Hero con imagen de fondo `https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80` + overlay
- Título: `"Somos HeredaBienes."` + descripción de la empresa
- **Misión:** "Facilitar el acceso de las familias mexicanas a la propiedad legal de sus inmuebles, eliminando barreras jurídicas y administrativas con asesoría experta, honesta y cercana."
- **Visión:** "Ser el grupo inmobiliario de mayor confianza en Jalisco para la gestión patrimonial y regularización de propiedades heredadas."
- **Valores:** Honestidad · Profesionalismo · Empatía · Transparencia · Compromiso familiar
- Sección equipo: 3 cards con foto de Unsplash de profesionales, nombre, cargo
- Logos/cifras de logros: 500+ propiedades, 1200+ familias, 15 años, Jalisco

### `src/pages/Servicios.jsx`

- Header con hero image + overlay
- Las 8 tarjetas de servicios expandidas (con más detalle que en home)
- Cada servicio tiene su propia subsección con imagen lateral, lista de lo que incluye y CTA
- CTA final: formulario de contacto embebido

### `src/pages/Blog.jsx`

- Grid de 6 artículos de blog con tarjetas:
  1. "¿Qué es una sucesión intestamentaria y cómo tramitarla en Jalisco?"
  2. "Guía completa: Impuestos al heredar una propiedad en México 2025"
  3. "Regularización de propiedades ejidales: todo lo que debes saber"
  4. "¿Cuánto cuesta escriturar una casa heredada en Guadalajara?"
  5. "Cómo poner a tu nombre una propiedad sin escrituras en Jalisco"
  6. "Testamento vs. intestado: diferencias y consecuencias para tus herederos"
- Cada card: imagen de Unsplash, categoría badge, título, extracto, fecha, botón "Leer más"

### `src/pages/Contacto.jsx`

- Hero pequeño con título `"Hablemos de tu caso"`
- Componente `<ContactForm />` completo
- Mapa placeholder (div estilizado con ícono de mapa, "Guadalajara, Jalisco")
- FAQ resumida (3 preguntas)

---

## DETALLES DE IMPLEMENTACIÓN TÉCNICA

### Tailwind config (tailwind.config.js)

```js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0098FF",
        "primary-dark": "#007ACC",
        "primary-light": "#E6F4FF",
        dark: "#0A1628",
        "gray-soft": "#F4F8FF",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "counter": "counter 2s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(30px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
```

### Google Fonts (index.html)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
```

### App.jsx con React Router

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Servicios from "./pages/Servicios";
import Nosotros from "./pages/Nosotros";
import Blog from "./pages/Blog";
import Contacto from "./pages/Contacto";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contacto" element={<Contacto />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
```

### Home.jsx — orden de secciones

```jsx
import HeroCarousel from "../components/HeroCarousel";
import StatsBar from "../components/StatsBar";
import ServicesGrid from "../components/ServicesGrid";
import WhyUs from "../components/WhyUs";
import ProcessSteps from "../components/ProcessSteps";
import Testimonials from "../components/Testimonials";
import CTABanner from "../components/CTABanner";
import FAQSection from "../components/FAQSection";
import ContactForm from "../components/ContactForm";

export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <StatsBar />
      <ServicesGrid />
      <WhyUs />
      <ProcessSteps />
      <Testimonials />
      <CTABanner />
      <FAQSection />
      <ContactForm />
    </main>
  );
}
```

---

## ESTILO VISUAL GLOBAL (index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  scroll-behavior: smooth;
}

body {
  font-family: "DM Sans", sans-serif;
  color: #1a2332;
}

h1, h2, h3, h4 {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 700;
}

.section-title {
  @apply text-3xl md:text-4xl font-bold text-gray-900 mb-3;
}

.section-subtitle {
  @apply text-lg text-gray-500 max-w-2xl mx-auto;
}

.section-divider {
  @apply w-16 h-1 bg-primary mx-auto mb-6 rounded-full;
}

.btn-primary {
  @apply bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-all duration-200 inline-flex items-center gap-2;
}

.btn-outline {
  @apply border-2 border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-200;
}

.card {
  @apply bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden;
}
```

---

## NOTAS FINALES PARA EL AGENTE

1. **Genera todos los archivos** listados en la arquitectura. No dejes stubs vacíos.
2. **El carrusel Hero es CRÍTICO** — debe verse impresionante, con transiciones suaves y texto animado.
3. Usa siempre **URLs de Unsplash** con parámetros `?w=800&q=80` para imágenes optimizadas.
4. Todos los textos deben estar en **español**.
5. El sitio debe ser **100% responsive** — revisar especialmente el navbar móvil y las grids.
6. Evita `<form>` HTML nativo; usa manejadores `onClick`/`onChange` de React.
7. El color `#0098FF` debe ser el protagonista visual. Úsalo en CTAs, íconos, bordes activos, líneas decorativas.
8. Añade `cursor-pointer` y `transition-all duration-200-300` a todos los elementos interactivos.
9. Cada sección debe tener al menos `py-16 md:py-24` de padding vertical.
10. El footer debe ser oscuro (`#0A1628`) como contraste final al sitio blanco/azul.

---

*Prompt generado para HeredaBienes. Grupo Inmobiliario — basado en la estructura y servicios de Heredum (heredum.com.mx), con branding completamente nuevo.*
