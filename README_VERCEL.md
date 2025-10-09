# Despliegue en Vercel

## Pasos para desplegar el backend en Vercel:

### 1. Instalar Vercel CLI (opcional)
```bash
npm i -g vercel
```

### 2. Desplegar desde la terminal
```bash
vercel
```

Sigue las instrucciones:
- Selecciona tu cuenta
- Configura el proyecto
- Despliega

### 3. O desplegar desde el Dashboard de Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Add New Project"
3. Importa tu repositorio de Git (GitHub, GitLab, Bitbucket)
4. Vercel detectará automáticamente la configuración
5. Haz clic en "Deploy"

### 4. Configurar la variable de entorno en tu app

Después del despliegue, Vercel te dará una URL como:
```
https://tu-proyecto.vercel.app
```

Crea un archivo `.env` en la raíz de tu proyecto con:
```
EXPO_PUBLIC_RORK_API_BASE_URL=https://tu-proyecto.vercel.app
```

**IMPORTANTE:** Reemplaza `tu-proyecto` con el nombre real de tu proyecto en Vercel.

### 5. Reinicia tu app Expo

```bash
bun run start
```

## Notas importantes:

- El backend estará disponible en: `https://tu-proyecto.vercel.app/api`
- Los endpoints de tRPC estarán en: `https://tu-proyecto.vercel.app/api/trpc`
- Vercel desplegará automáticamente cada vez que hagas push a tu repositorio
- La base de datos es en memoria, se reiniciará con cada despliegue
- Para producción, considera usar una base de datos real (PostgreSQL, MongoDB, etc.)

## Verificar que funciona:

Visita en tu navegador:
```
https://tu-proyecto.vercel.app/api
```

Deberías ver:
```json
{"status":"ok","message":"API is running"}
```
