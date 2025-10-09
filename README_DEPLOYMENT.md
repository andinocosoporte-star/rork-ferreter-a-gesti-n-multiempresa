# Guía de Despliegue del Backend en Vercel

## Pasos para desplegar tu backend:

### 1. Preparar el proyecto
Tu proyecto ya está configurado para Vercel con:
- `vercel.json` - Configuración de rutas
- `api/index.ts` - Punto de entrada del backend
- `backend/` - Código del servidor

### 2. Desplegar en Vercel

#### Opción A: Usando Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel

# Para producción
vercel --prod
```

#### Opción B: Usando Vercel Dashboard
1. Ve a https://vercel.com
2. Crea una cuenta o inicia sesión
3. Click en "Add New Project"
4. Importa tu repositorio de GitHub/GitLab/Bitbucket
5. Vercel detectará automáticamente la configuración
6. Click en "Deploy"

### 3. Configurar la URL en tu app

Después del despliegue, Vercel te dará una URL como:
`https://tu-proyecto.vercel.app`

Crea un archivo `.env` en la raíz de tu proyecto:
```
EXPO_PUBLIC_RORK_API_BASE_URL=https://tu-proyecto.vercel.app
```

### 4. Reiniciar tu app
```bash
# Detener el servidor actual (Ctrl+C)
# Iniciar de nuevo
npm start
```

## Verificar que funciona

1. Abre tu app
2. Ve a la pantalla de login
3. Deberías ver "Verificando conexión..." y luego el banner debería desaparecer
4. Si ves "Servidor no disponible", verifica:
   - Que la URL en `.env` sea correcta
   - Que el backend esté desplegado en Vercel
   - Que puedas acceder a `https://tu-proyecto.vercel.app/api` en tu navegador

## Solución de problemas

### Error: "Network request failed"
- Verifica que la URL en `.env` sea correcta
- Asegúrate de que el backend esté desplegado
- Prueba acceder a la URL en tu navegador

### Error: "Backend URL no configurado"
- Crea el archivo `.env` en la raíz del proyecto
- Agrega la línea: `EXPO_PUBLIC_RORK_API_BASE_URL=https://tu-proyecto.vercel.app`
- Reinicia el servidor de desarrollo

### El backend funciona en web pero no en móvil
- Asegúrate de usar HTTPS (no HTTP)
- Verifica que no haya firewall bloqueando la conexión
- Prueba con otra red WiFi o datos móviles
