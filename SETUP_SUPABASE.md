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

## Estado de este runbook

Este documento se escribió y se auto-revisó contra `supabase/schema.sql` y `supabase/seed.sql`
(nombres de tabla, columnas, políticas RLS, bucket y el valor `precio = 38000000` del seed), pero
**no se ejecutó todavía contra un proyecto de Supabase real** porque, al momento de escribirlo, no
existía ninguno. Falta que alguien lo siga de principio a fin y corrija aquí cualquier paso que no
coincida con la UI real de Supabase (los nombres de botones y menús cambian con el tiempo).

Pendiente de verificar en un proyecto real:
- Que el SQL de `schema.sql` y `seed.sql` corra sin errores tal cual, copiado y pegado.
- Los nombres exactos de menú (`Authentication → Users`, `Project Settings → API`) contra la UI vigente de Supabase.
- El flujo de login y subida de foto desde `/admin-hb` (esa página aún no existe; se construye en la fase 4).
- La prueba de RLS con `set local role anon`.
