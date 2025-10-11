# Corrección de Errores ESM en Vercel con tRPC

## Problema Resuelto

Se han corregido los errores de ESM (ECMAScript Modules) relacionados con tRPC en el runtime Edge de Vercel.

### Errores Originales

1. **"You're trying to use @trpc/server in a non-server environment"**
   - Causado por el check `typeof window !== "undefined"` en `create-context.ts`
   - Este check se ejecutaba durante la carga del módulo, causando problemas en Edge runtime

2. **Duplicidad de archivos API**
   - Existían dos directorios de API: `/api` y `/app/api`
   - Esto causaba confusión sobre cuál usar para el despliegue

3. **Configuración de TypeScript incompatible**
   - `module: "ESNext"` con `moduleResolution: "NodeNext"` es incompatible
   - Sobreescribía configuraciones de Expo innecesariamente

## Cambios Implementados

### 1. Limpieza de create-context.ts
**Archivo:** `backend/trpc/create-context.ts`
- ✅ Eliminado el check `typeof window !== "undefined"`
- ✅ El módulo ahora se carga correctamente en Edge runtime

### 2. Consolidación de Rutas API
**Cambios:**
- ✅ Eliminado directorio duplicado `/app/api`
- ✅ Todas las rutas API ahora están en `/api` (estándar de Vercel)
- ✅ Creado `/api/trpc/[...trpc].ts` con sintaxis correcta para Edge functions

### 3. Configuración TypeScript Corregida
**Archivo:** `tsconfig.json`
- ✅ Removidas configuraciones incompatibles de `module` y `moduleResolution`
- ✅ Ahora usa la configuración base de Expo sin sobrescrituras problemáticas

### 4. Configuración Vercel
**Archivo:** `vercel.json`
- ✅ Agregada configuración para despliegue en Vercel
- ✅ Especifica comando de instalación y build

### 5. Soporte CORS Mejorado
**Archivos:** `/api/trpc/[...trpc].ts`, `/api/ping/route.ts`
- ✅ Headers CORS apropiados en todas las respuestas
- ✅ Manejo correcto de peticiones OPTIONS (preflight)

## Estructura Final

```
/api
  /ping
    route.ts          # Endpoint de health check
  /trpc
    [...trpc].ts      # Catch-all handler para tRPC
/backend
  /trpc
    app-router.ts     # Router principal de tRPC
    create-context.ts # Contexto de tRPC (sin check de window)
    /routes           # Procedimientos individuales de tRPC
  /db
    supabase.ts       # Cliente de Supabase
```

## Cómo Desplegar

### 1. Despliegue en Vercel

```bash
# Opción A: CLI
npm i -g vercel
vercel login
vercel --prod

# Opción B: Dashboard
# Conecta tu repositorio en vercel.com
# Vercel detectará automáticamente la configuración
```

### 2. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, agrega:
- `SUPABASE_URL`: Tu URL de proyecto Supabase
- `SUPABASE_SERVICE_KEY`: Tu service role key de Supabase

### 3. Configurar Cliente (Expo App)

Crea `.env` en la raíz:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://tu-proyecto.vercel.app
```

## Verificación

### 1. Verificar API Health
```bash
curl https://tu-proyecto.vercel.app/api/ping
```

Debe devolver:
```json
{"status":"ok","runtime":"edge"}
```

### 2. Verificar tRPC
```bash
curl https://tu-proyecto.vercel.app/api/trpc/example.hi \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"World"}'
```

## Notas Técnicas

### Edge Runtime
- Todos los endpoints usan `export const config = { runtime: "edge" }`
- Edge runtime es más rápido y escalable que Node.js serverless
- Compatible con todas las librerías ESM modernas

### TypeScript
- La compilación TypeScript ahora funciona sin errores de módulos
- Los warnings sobre tipos `any` son pre-existentes y no afectan el funcionamiento
- Se recomienda usar `--skipLibCheck` para evitar warnings de dependencias

### CORS
- Todos los endpoints tienen headers CORS configurados
- Permite peticiones desde cualquier origen (`*`)
- Maneja correctamente preflight requests (OPTIONS)

## Resolución de Problemas

### Error: "Module not found"
- Verifica que todas las rutas relativas sean correctas
- Asegúrate de que las dependencias estén instaladas

### Error: "Missing Supabase credentials"
- Configura las variables de entorno en Vercel
- Verifica con `curl https://tu-proyecto.vercel.app/api/ping`

### Error: "Network request failed" en la app
- Verifica que `EXPO_PUBLIC_RORK_API_BASE_URL` esté configurada
- Reinicia el servidor Expo: `npx expo start -c`

## Referencias

- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [tRPC Server Setup](https://trpc.io/docs/server/adapters/fetch)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
