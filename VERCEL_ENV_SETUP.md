# Configuración de Variables de Entorno en Vercel

## Problema Actual

El error "JSON Parse error: Unexpected character: <" indica que el backend está devolviendo HTML en lugar de JSON. Esto ocurre porque las variables de entorno de Supabase no están configuradas en Vercel.

## Solución: Configurar Variables de Entorno en Vercel

### Paso 1: Acceder a la Configuración del Proyecto

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto: `rork-ferreter-a-gesti-n-multiempresa`
3. Ve a **Settings** (Configuración)
4. Selecciona **Environment Variables** (Variables de Entorno)

### Paso 2: Agregar las Variables de Entorno

Agrega las siguientes variables de entorno:

#### Variable 1: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** `https://hlufvzmsmrtsufcqzewp.supabase.co`
- **Environment:** Selecciona `Production`, `Preview`, y `Development`

#### Variable 2: SUPABASE_SERVICE_KEY
- **Name:** `SUPABASE_SERVICE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdWZ2em1zbXJ0c3VmY3F6ZXdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDExMjY3MSwiZXhwIjoyMDc1Njg4NjcxfQ.RipaAkAUOoKkUCtw3OJKSSRb5DyvpLO8G6k6eCSCKR4`
- **Environment:** Selecciona `Production`, `Preview`, y `Development`

⚠️ **IMPORTANTE:** Esta es la clave de servicio (service_role_key) que tiene permisos completos. Nunca la expongas en el código del cliente.

### Paso 3: Redesplegar el Proyecto

Después de agregar las variables de entorno, necesitas redesplegar el proyecto:

1. Ve a la pestaña **Deployments** (Despliegues)
2. Encuentra el último despliegue
3. Haz clic en los tres puntos (...) al lado del despliegue
4. Selecciona **Redeploy** (Redesplegar)
5. Confirma el redespliegue

### Paso 4: Verificar la Configuración

Una vez que el redespliegue esté completo:

1. Abre tu navegador y ve a: `https://rork-ferreter-a-gesti-n-multiempresa-6ei3g5vp5.vercel.app/api`
2. Deberías ver una respuesta JSON como:
   ```json
   {
     "status": "ok",
     "message": "API is running",
     "supabase": {
       "url": "configured",
       "serviceKey": "configured"
     }
   }
   ```

Si ves `"missing"` en lugar de `"configured"`, las variables de entorno no se configuraron correctamente.

### Paso 5: Probar el Login

1. Reinicia tu aplicación Expo con: `npx expo start -c`
2. Intenta iniciar sesión en la aplicación
3. El error debería desaparecer

## Verificación de Logs

Para ver los logs del servidor y verificar que todo funciona:

1. Ve a tu proyecto en Vercel
2. Selecciona la pestaña **Logs** (Registros)
3. Busca mensajes como:
   - `[Hono] Starting server...`
   - `[Hono] SUPABASE_URL: ✓ Set`
   - `[Hono] SUPABASE_SERVICE_KEY: ✓ Set`
   - `[Supabase] Initializing client...`

## Seguridad

- ✅ La clave de servicio está en `.env.local` que está en `.gitignore`
- ✅ La clave de servicio NO está en `.env` que se sube a git
- ✅ La clave de servicio solo se usa en el backend (Vercel)
- ✅ El cliente solo envía tokens de sesión, nunca la clave de servicio

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que las variables estén configuradas en Vercel
- Asegúrate de haber redesplegado después de agregar las variables

### Error: "JSON Parse error: Unexpected character: <"
- El backend está devolviendo HTML en lugar de JSON
- Esto indica que las variables de entorno no están configuradas
- Sigue los pasos anteriores para configurarlas

### Error: "signal is aborted without reason"
- Este error puede ocurrir si la URL del backend no es correcta
- Verifica que `EXPO_PUBLIC_RORK_API_BASE_URL` esté configurada correctamente en `.env`
- Reinicia Expo con: `npx expo start -c`
