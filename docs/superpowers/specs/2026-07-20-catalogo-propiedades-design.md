# Catálogo de propiedades — Heredabienes

**Fecha:** 2026-07-20
**Estado:** Diseño aprobado

## Objetivo

Permitir que el staff interno de Heredabienes publique propiedades desde un panel admin, y que un cliente reciba por WhatsApp el link de una propiedad, la vea bien presentada y navegue el resto del catálogo con facilidad.

## Contexto

`heredabienes` es hoy un sitio de servicios legales (sucesiones, escrituración) construido con Create React App + React 19 + react-router-dom 7 + Tailwind. No existe ninguna estructura de propiedades: ni datos, ni rutas, ni componentes de listado. Todo el contenido está hardcodeado en arreglos a nivel de módulo.

El backend será Supabase, replicando el patrón ya probado en `~/Work/personal/Portfolio`: cliente con fallback ante env faltantes, módulos CRUD con `fromRow`/`toRow`, `storage.js` sobre bucket público, Supabase Auth con un único usuario creado a mano, y RLS como autorización real. Sin service-role key.

El modelo de datos se derivó de la ficha técnica del terreno en Colonia Seattle, Zapopan (`$38,000,000 MXN`) y de su infografía comercial.

## Decisiones tomadas

| Decisión | Elección | Razón |
|---|---|---|
| Alcance del catálogo | Multi-tipo desde el inicio | Evita migración de schema cuando entren casas y departamentos |
| Integración | Sección dentro del sitio actual | Un repo, un deploy, un dominio; el tráfico legal alimenta al inmobiliario |
| Auth admin | Supabase Auth (email + password) | Seguridad real vía RLS; una password compartida en el cliente es seguridad falsa |
| Contenido de marketing | Listas estructuradas con presets | Fichas consistentes y captura rápida |
| Preview al compartir | Migrar a Next.js | SSR real: OG tags por propiedad + SEO indexable |
| Ejecución de la migración | In-place, mismo repo, App Router | Historial de git continuo, sin convivir con dos deploys |
| Medios | Galería + portada, ficha PDF, mapa | Sin video ni tour virtual por ahora |
| Estilo de las páginas | Paleta azul actual (`#0098FF`) | Mantiene la identidad del sitio; difiere del navy+gold de la infografía impresa |

## Modelo de datos

Nombres de columna en español, `snake_case`, mapeados a `camelCase` en el frontend con `fromRow`/`toRow`.

### Tabla `properties`

**Identidad y publicación**

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `uuid` pk | `gen_random_uuid()` |
| `slug` | `text` unique not null | Auto desde el título, editable, con verificación de choque |
| `titulo` | `text` not null | *"Terreno con Alta Plusvalía en Colonia Seattle"* |
| `gancho` | `text` | Subtítulo corto: *"Terreno urbano premium"* |
| `tipo_inmueble` | `text` not null | `terreno · casa · departamento · local · oficina · bodega · rancho` |
| `operacion` | `text` not null | `venta · renta` |
| `estatus` | `text` not null default `disponible` | `disponible · apartado · vendido · pausado` |
| `publicado` | `boolean` not null default `false` | |
| `destacado` | `boolean` not null default `false` | Aparece en el Home |
| `orden` | `integer` default `0` | Orden manual en el listado |

**Precio**

| Campo | Tipo | Notas |
|---|---|---|
| `precio` | `numeric` | |
| `moneda` | `text` default `'MXN'` | |
| `mostrar_precio` | `boolean` default `true` | `false` → "Precio a consultar" |
| `precio_nota` | `text` | *"Por debajo de lo valuado"* |
| `formas_pago` | `text[]` | Presets: contado, aportación, crédito bancario, permuta |

**Ubicación**

`calle` · `numero_exterior` · `numero_interior` · `colonia` · `municipio` · `estado` · `cp` — todos `text`.
`lat` · `lng` — `numeric`.
`mostrar_direccion_exacta` — `boolean` default `true`.

**Superficie y medidas**

| Campo | Tipo | Notas |
|---|---|---|
| `superficie_terreno_m2` | `numeric` | |
| `superficie_construccion_m2` | `numeric` | |
| `medida_norte` | `text` | Texto, no numérico |
| `medida_sur` | `text` | *"36.00 m + quiebre de 10.00 m"* no cabe en un número |
| `medida_oriente` | `text` | |
| `medida_poniente` | `text` | |
| `medidas_nota` | `text` | |

**Específicos por tipo** (opcionales, se muestran solo si aplican)

`recamaras` · `banos` · `medios_banos` · `estacionamientos` · `niveles` · `antiguedad_anios` — todos `integer`.

**Contenido**

| Campo | Tipo | Presets sugeridos en el admin |
|---|---|---|
| `descripcion` | `text` | Párrafo comercial |
| `ideal_para` | `text[]` | Desarrollo habitacional, Residencias de lujo, Torre de departamentos, Proyecto vertical, Desarrollo comercial, Oficinas corporativas, Inversión patrimonial |
| `ventajas` | `text[]` | Ubicación premium, Alta plusvalía, Excelente conectividad, Zona consolidada, Ideal para desarrolladores |
| `entorno` | `text[]` | Centros comerciales, Corporativos, Escuelas y universidades, Restaurantes, Servicios médicos, Vialidades principales, Zonas residenciales premium |
| `estatus_legal` | `text[]` | Propiedad privada, Escritura pública, Zona urbanizada, Factibilidad de servicios |
| `amenidades` | `text[]` | Agua, Luz, Drenaje, Alumbrado, Alberca, Jardín, Seguridad |
| `highlights` | `jsonb` | Arreglo de `{icono, titulo, texto}`, máximo 4 |

Los `highlights` por defecto corresponden a los badges de la infografía: Zona Premium, Ubicación Estratégica, Servicios a la Mano, Gran Oportunidad.

**Medios, contacto y SEO**

`portada_url` · `ficha_pdf_url` · `asesor_nombre` · `asesor_telefono` · `asesor_email` · `meta_title` · `meta_description` — todos `text`.

Los campos de asesor caen a los datos globales de Heredabienes (`wa.me/5213313013253`, `heredabienes@outlook.com`) cuando están vacíos. Los campos SEO se autogeneran del título y precio cuando están vacíos.

**Timestamps:** `created_at` · `updated_at` (con trigger `touch_updated_at`, igual que en Portfolio).

### Tabla `property_images`

`id` `uuid` pk · `property_id` `uuid` fk → `properties(id)` on delete cascade · `url` `text` · `storage_path` `text` · `alt` `text` · `orden` `integer` · `created_at`.

`storage_path` es necesario para poder borrar el archivo del bucket y no dejar huérfanos.

### Decisiones de modelado

1. **Medidas por orientación como `text`.** Se pierde el cálculo automático de área, se gana poder capturar terrenos irregulares. El área vive aparte en `superficie_terreno_m2`.
2. **`highlights` como JSONB, no tabla.** Máximo 4 por propiedad, nunca se consultan ni filtran por separado.
3. **`tipo_inmueble`/`operacion`/`estatus` como `text` con constraint `CHECK`, no enums de Postgres.** Agregar un valor a un enum requiere migración; a un CHECK, no.

### RLS

```sql
alter table public.properties enable row level security;
alter table public.property_images enable row level security;

create policy "properties public read" on public.properties
  for select using (publicado = true or auth.role() = 'authenticated');
create policy "properties admin write" on public.properties
  for all using (auth.role() = 'authenticated')
          with check (auth.role() = 'authenticated');
```

`property_images` sigue la misma forma: lectura pública, escritura autenticada. El bucket `propiedades` es público en lectura y autenticado en escritura, replicando las políticas de `storage.objects` de Portfolio.

## Arquitectura

Migración a **Next.js 15 App Router**, in-place, mismo repo. Se eliminan `react-scripts` y `react-router-dom`. Se conservan Tailwind, `tailwind.config.js`, `lucide-react` y las fuentes (Plus Jakarta Sans / DM Sans).

```
app/
  layout.js                    Navbar + Footer + fuentes
  page.js                      Home
  servicios/page.js
  nosotros/page.js
  blog/page.js
  contacto/page.js
  propiedades/
    page.js                    Listado + filtros           (Server Component)
    [slug]/page.js             Detalle + generateMetadata  (Server Component)
    [slug]/not-found.js
  admin-hb/
    page.js                    Login
    dashboard/page.js          Listado admin               (Client Component)
    dashboard/[id]/page.js     Formulario                  (Client Component)
components/                    los 14 actuales + los de propiedades
lib/
  supabase/client.js           navegador (anon key)
  supabase/server.js           servidor (cookies, @supabase/ssr)
  api/properties.js            CRUD fromRow/toRow
  api/storage.js               subida de imágenes y PDF
  format.js                    precio, superficie, slug
middleware.js                  protege /admin-hb/dashboard
supabase/schema.sql            DDL + RLS + bucket, idempotente
```

### Flujo de datos

Dos caminos distintos, a propósito:

- **Público (lectura):** Server Components consultan Supabase en el servidor. El HTML llega renderizado, lo que permite que `generateMetadata()` emita OG tags reales por propiedad — el motivo de migrar. Se revalida con `revalidatePath` al guardar desde el admin.
- **Admin (escritura):** Client Components con el cliente de navegador y sesión de Supabase Auth. Sin API routes propias: Supabase es el backend y RLS es la autorización.

### Seguridad

La ruta `/admin-hb` y el `middleware.js` solo esconden la interfaz. Lo que protege los datos son las políticas RLS de Postgres. No se usa service-role key en ningún lado.

### Consideraciones de la migración

- Los ~30 hotlinks a Unsplash entran en `images.remotePatterns` de `next.config.js`.
- Llevan `'use client'`: `Navbar`, `HeroCarousel`, `ContactForm`, `SolutionsMap`, `FAQSection`, `Testimonials`. El resto queda como Server Component.
- `ScrollToTop.jsx` se elimina: Next restaura scroll por ruta.
- `ServicesGrid.jsx` no se porta — no lo importa nadie.
- El JSON-LD de `public/index.html` tiene contactos placeholder (`+52-33-1234-5678`, `hola@heredabienes.com`) que contradicen los reales usados en los componentes. Se corrige al portarlo al `layout.js`.

### Manejo de errores

`not-found.js` para slug inexistente, `error.js` por segmento, y el fallback de env faltantes de Portfolio: si faltan `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`, la app no revienta — avisa en consola y la UI muestra el estado de "no configurado".

### Variables de entorno

`NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Se documentan en `.env.example`; `.env.local` queda en `.gitignore`.

## Páginas públicas

### `/propiedades` — listado

Grid de cards: portada, badge de tipo, título, colonia + municipio, precio, superficie.

Filtros reflejados en la URL como query params (`?tipo=terreno&municipio=zapopan`), para poder compartir búsquedas y no solo propiedades: tipo de inmueble, operación, municipio, rango de precio, y orden (recientes / precio ascendente / precio descendente). Estado vacío explícito cuando no hay resultados.

Las propiedades vendidas o apartadas se muestran con badge en vez de ocultarse: comunican tracción.

### `/propiedades/[slug]` — detalle

Estructurado para lectura en celular, no como réplica de la infografía impresa:

1. Galería — foto principal + miniaturas, lightbox al tocar.
2. Encabezado sticky — título, ubicación, precio grande, badges de estatus. Botones: WhatsApp (mensaje prellenado citando la propiedad), Descargar ficha PDF, Compartir.
3. Datos clave — fila de íconos: superficie, tipo, operación, y recámaras/baños/estacionamientos cuando apliquen.
4. Los 4 highlights.
5. Descripción.
6. Medidas y superficie — las cuatro orientaciones y la nota.
7. Ideal para / Ventajas / Entorno / Estatus legal / Amenidades.
8. Formas de pago.
9. Mapa — respetando `mostrar_direccion_exacta`.
10. Contacto del asesor + CTA.
11. Otras propiedades — 3 relacionadas por municipio y tipo.

**Regla de renderizado:** cada bloque aparece solo si su arreglo trae elementos o su campo tiene valor. Nunca se muestra un encabezado vacío.

`generateMetadata()` emite por propiedad: título, descripción y `og:image` = portada. Eso hace que el link llegue a WhatsApp con foto y precio.

### Integración con el sitio existente

"Propiedades" entra al `Navbar` y al `Footer`. El Home suma una sección de propiedades destacadas.

## Admin

### `/admin-hb` — login

Email + password de Supabase Auth. Un solo usuario, creado a mano en el dashboard de Supabase. `middleware.js` redirige a login si no hay sesión.

### `/admin-hb/dashboard` — listado

Tabla con búsqueda, badge de estatus, indicador de borrador/publicado, y acciones editar / duplicar / eliminar.

*Duplicar* existe porque los terrenos de una misma zona comparten `entorno`, `estatus_legal` y `ventajas` casi por completo. Clonar y ajustar reduce la captura de ~20 minutos a ~3.

### Formulario de propiedad

Una sola página en secciones colapsables, en el orden del modelo de datos: Identidad → Precio → Ubicación → Superficie → Específicos → Contenido → Medios → Contacto → SEO.

- **Campos condicionados por tipo:** `terreno` oculta recámaras/baños/niveles y muestra medidas por orientación; `casa` hace lo inverso.
- **Chips con presets:** cada arreglo se captura clicando sugerencias precargadas más un input libre.
- **Galería:** subida múltiple al bucket `propiedades`, reordenable arrastrando, una marcada como portada. Borrar una imagen elimina el archivo del bucket vía `storage_path`.
- **PDF:** subida al mismo bucket.
- **Borrador vs. publicar:** permite capturar en varias sesiones sin exponer una ficha incompleta.
- **Slug:** auto desde el título, editable, con verificación de choque.

Al guardar se dispara `revalidatePath` de `/propiedades` y del detalle.

### Fuera de alcance (YAGNI)

Roles y permisos, historial de cambios, papelera, editor de texto enriquecido, analytics de vistas, recorte de imágenes en el navegador.

## Testing

El proyecto no tiene tests reales hoy (solo el `App.test.js` de CRA). Alcance mínimo y útil: tests unitarios de `slugify`, `fromRow`/`toRow` y el formateo de precio y superficie — la lógica pura donde un bug pasa desapercibido. Sin E2E.

## Criterios de éxito

1. El staff crea, edita, publica y elimina propiedades desde `/admin-hb` sin tocar código.
2. Un link `/propiedades/[slug]` pegado en WhatsApp muestra título, precio y foto de portada de esa propiedad.
3. La ficha del terreno de Colonia Seattle se reproduce completa desde la base de datos, sin campos faltantes.
4. Desde el detalle, un cliente llega a otras propiedades sin volver al listado.
5. Las 5 páginas actuales del sitio funcionan igual después de la migración.
6. Un visitante no autenticado no puede escribir ni borrar en `properties` ni en el bucket.
