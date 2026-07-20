# Prueba E2E — Admin de propiedades: terreno de Colonia Seattle

**Estado: PENDIENTE (requiere Supabase real).**

Este proyecto no tiene `.env.local` ni proyecto Supabase configurado (no existen
credenciales reales ni datos mock). Por lo tanto esta prueba **no se ha
ejecutado**: el checklist de abajo es el procedimiento reproducible a correr
en cuanto exista un proyecto Supabase real (con el schema de
`supabase/schema.sql`, el bucket `propiedades` y un usuario admin con sesión).

## Requisitos previos

- [ ] `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` de un proyecto Supabase real.
- [ ] Schema aplicado (tabla `properties`, `property_images`, políticas RLS).
- [ ] Bucket de Storage `propiedades` creado, con carpetas `<id>/galeria` y `<id>/ficha`.
- [ ] Usuario admin creado y con sesión iniciada en `/admin-hb`.
- [ ] Servidor corriendo en el puerto 3001 (`PORT=3001 npm run dev`) — **nunca** el 3000, ocupado por otro proyecto.
- [ ] Al menos 3 archivos de imagen y 1 PDF de prueba a la mano para subir en el paso de Medios.

## Paso 1 — Captura desde cero

Con sesión iniciada, ir a `/admin-hb/dashboard` → clic en "Nueva propiedad" (abre `/admin-hb/dashboard/nueva`) y capturar exactamente:

### Identidad
| Campo | Valor |
|---|---|
| Título | `Terreno con Alta Plusvalía en Colonia Seattle` |
| Slug (verificar autogenerado) | `terreno-con-alta-plusvalia-en-colonia-seattle` |
| Gancho | `Terreno urbano premium` |
| Tipo | `terreno` |
| Operación | `venta` |
| Estatus | `disponible` |
| Destacada | encendida |
| Publicada | **apagada** (se deja así por ahora) |

**Verificar:** al escribir el título, el campo Slug se completa solo con el valor de la tabla sin tocarlo a mano.

### Precio
| Campo | Valor |
|---|---|
| Precio | `38000000` |
| Moneda | `MXN` |
| Mostrar precio | encendido |
| Nota del precio | `Por debajo de lo valuado` |
| Formas de pago | clic en las sugerencias `Contado` y `Aportación` |

### Ubicación
| Campo | Valor |
|---|---|
| Calle | `Calle 10` |
| Número exterior | `66` |
| Colonia | `Colonia Seattle` |
| Municipio | `Zapopan` |
| Estado | `Jalisco` |
| Mostrar dirección exacta | encendido |

### Superficie
**Verificar primero:** por ser tipo `terreno`, deben estar visibles los 4 campos de orientación (Norte/Sur/Oriente/Poniente).

| Campo | Valor |
|---|---|
| Norte | `46.00 m` |
| Sur | `36.00 m + quiebre de 10.00 m` |
| Oriente | `35.00 m` |
| Poniente | `33.00 m` |

### Específicos
**Verificar:** NO aparecen los campos de recámaras, baños, medios baños, niveles ni antigüedad (solo Estacionamientos, si aplica).

### Contenido
- Descripción: capturar un párrafo comercial libre.
- Ideal para / Ventajas / Entorno / Estatus legal: agregar **todas** las sugerencias de `PRESETS` con clic en cada chip.
- Highlights: clic en "Usar los sugeridos" → deben quedar 4 highlights, cada uno con ícono, título y texto ya llenos.

### Contacto y SEO
Dejar ambas secciones vacías (deben caer a los datos globales de Heredabienes / autogenerarse a partir del título y precio).

## Paso 2 — Guardar borrador y verificar que NO es público

1. Clic en "Guardar borrador".
2. **Esperado:** banner verde "Guardado como borrador. No es visible en el sitio.", la URL cambia de `/admin-hb/dashboard/nueva` a `/admin-hb/dashboard/<uuid>`.
3. Abrir `/propiedades` en una ventana privada (sin sesión) → la propiedad **no** debe aparecer en el listado.
4. Abrir `/propiedades/terreno-con-alta-plusvalia-en-colonia-seattle` en esa misma ventana privada → debe mostrar `not-found`.

Esto valida a la vez el flag `publicado` y la política RLS de lectura pública.

## Paso 3 — Medios

1. En la sección Medios, subir al menos 3 fotos del terreno.
2. Reordenarlas arrastrando (por ejemplo, mover la tercera al primer lugar).
3. Marcar la foto deseada como portada (ícono de estrella) → el badge PORTADA debe moverse a esa foto.
4. Subir la ficha PDF.
5. Guardar de nuevo como borrador.
6. **Esperado:** recargar la página → el orden de las fotos persiste; la portada marcada sigue siendo la misma.

## Paso 4 — Publicar y verificar la ficha pública

1. Clic en "Guardar y publicar".
2. **Esperado:** banner verde de publicada.
3. Abrir `/propiedades/terreno-con-alta-plusvalia-en-colonia-seattle` en ventana privada y confirmar, sin campos faltantes:
   - [ ] Galería con las fotos en el orden definido y la portada primero.
   - [ ] `$38,000,000 MXN` y la nota "Por debajo de lo valuado".
   - [ ] Las 4 medidas, incluida la de Sur con el texto del quiebre completo (`36.00 m + quiebre de 10.00 m`).
   - [ ] Los 4 highlights con su ícono correcto.
   - [ ] Las listas Ideal para / Ventajas / Entorno / Estatus legal completas.
   - [ ] Formas de pago: Contado y Aportación.
   - [ ] Botón de descarga de la ficha PDF, funcional.
   - [ ] "Ver código fuente" → `<meta property="og:image">` apunta a la portada y `<meta property="og:title">` al título.

## Paso 5 — Verificar que RLS protege de verdad

1. En una ventana privada (sin sesión), abrir `/propiedades`.
2. Abrir la consola del navegador y ejecutar un `update` cualquiera sobre `properties` usando el cliente de Supabase (por ejemplo, intentar cambiar el título de la propiedad recién publicada).
3. **Esperado:** la operación falla por política RLS (error de permisos), confirmando que la protección real es la base de datos y no el middleware (que solo esconde la UI del dashboard).

## Paso 6 — Duplicar y eliminar

1. Desde `/admin-hb/dashboard`, clic en "Duplicar" sobre la propiedad del terreno.
2. **Esperado:** se abre el formulario de la copia con todas las listas (Ideal para, Ventajas, Entorno, Estatus legal, highlights) y el estatus legal ya cargados, como borrador.
3. Cambiar el título y el slug de la copia (para no chocar con el original) y guardar.
4. Eliminar la copia usando la confirmación en línea (no `confirm()` del navegador).
5. **Esperado:** la copia desaparece de la tabla del dashboard.

## Paso 7 — Build

```bash
npm run build
```

**Esperado:** termina sin errores. Confirmar en la tabla de rutas de la salida que:
- `/admin-hb`, `/admin-hb/dashboard` y `/admin-hb/dashboard/[id]` se listan como rutas dinámicas (`ƒ`, server-rendered on demand), no prerenderizadas.
- `/propiedades` y `/propiedades/[slug]` sí se generan (estático/SSG según corresponda).

## Paso 8 — Commit

Si al ejecutar esta prueba aparece algún defecto, corregirlo en el archivo correspondiente y commitear con:

```
[ADMIN] correcciones de la prueba E2E del terreno de Colonia Seattle
```

Si la prueba pasa sin defectos, no hay nada que commitear en código: basta con
actualizar el estado de este documento a **EJECUTADA (fecha, resultado)**.
