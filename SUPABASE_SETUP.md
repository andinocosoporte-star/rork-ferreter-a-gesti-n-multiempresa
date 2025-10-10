# 🚀 Configuración de Supabase

## ✅ Migración Completada

He migrado tu backend de una base de datos en memoria a Supabase. Aquí está lo que se ha hecho:

### Cambios Realizados

1. **✅ Instalado** `@supabase/supabase-js`
2. **✅ Creado** esquema SQL completo en `backend/db/supabase-schema.sql`
3. **✅ Configurado** cliente de Supabase en `backend/db/supabase.ts`
4. **✅ Migrado** todas las rutas de autenticación
5. **✅ Migrado** todas las rutas de inventario
6. **✅ Actualizado** `.env.example` con variables de Supabase

### Rutas Migradas

#### Autenticación
- ✅ Login
- ✅ Register
- ✅ Logout
- ✅ Get Current User

#### Inventario
- ✅ Get Products
- ✅ Create Product
- ✅ Update Product
- ✅ Delete Product
- ✅ Get Next Code
- ✅ Import Products
- ✅ Export Products

## 📋 Pasos para Completar la Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa los datos:
   - **Name**: Ferretería Gestión
   - **Database Password**: Guarda esta contraseña de forma segura
   - **Region**: Selecciona la más cercana a tus usuarios
   - **Pricing Plan**: Free tier es suficiente para empezar

### 2. Ejecutar el Esquema SQL

1. En tu proyecto de Supabase, ve a **SQL Editor** (en el menú lateral)
2. Haz clic en **New Query**
3. Copia todo el contenido de `backend/db/supabase-schema.sql`
4. Pégalo en el editor
5. Haz clic en **Run** (o presiona Ctrl/Cmd + Enter)
6. Verifica que se ejecutó sin errores

Esto creará:
- ✅ Todas las tablas (companies, branches, users, products, customers, sales, quotes, etc.)
- ✅ Índices para mejor rendimiento
- ✅ Políticas de Row Level Security (RLS)
- ✅ Datos de ejemplo (empresa, usuarios, productos)

### 3. Obtener Credenciales

1. Ve a **Settings** > **API** en tu proyecto de Supabase
2. Copia estos valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **IMPORTANTE**: El Service Role Key tiene acceso completo a tu base de datos. Nunca lo expongas en el frontend.

### 4. Configurar Variables de Entorno

#### Desarrollo Local

Actualiza tu archivo `.env`:

```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://rork-ferreter-a-gesti-n-multiempres.vercel.app

# Supabase Configuration
SUPABASE_URL=https://tu-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

#### Producción (Vercel)

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** > **Environment Variables**
3. Agrega estas variables:
   - `SUPABASE_URL`: Tu Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Tu Service Role Key
4. Haz un nuevo deploy para que tome las variables

### 5. Verificar la Migración

#### Usuarios de Prueba

El esquema SQL incluye estos usuarios de prueba:

| Email | Password | Rol |
|-------|----------|-----|
| admin@ferreteriaeltornillo.com | admin123 | Administrador |
| vendedor1@ferreteriaeltornillo.com | vendedor123 | Vendedor |
| almacen@ferreteriaeltornillo.com | almacen123 | Almacenista |

#### Datos de Ejemplo

También incluye:
- 1 empresa (Ferretería El Tornillo)
- 3 sucursales
- 15 productos de construcción
- 5 clientes
- 5 ventas
- 5 cotizaciones

### 6. Probar la Aplicación

1. Reinicia tu servidor de desarrollo
2. Inicia sesión con uno de los usuarios de prueba
3. Verifica que puedas:
   - ✅ Ver productos
   - ✅ Crear nuevos productos
   - ✅ Ver clientes
   - ✅ Crear ventas
   - ✅ Ver cotizaciones

## 🔄 Rutas Pendientes de Migrar

Las siguientes rutas aún usan la base de datos en memoria y necesitan ser migradas:

### Customers (5 rutas)
- `backend/trpc/routes/customers/get-customers/route.ts`
- `backend/trpc/routes/customers/create-customer/route.ts`
- `backend/trpc/routes/customers/get-customer-details/route.ts`
- `backend/trpc/routes/customers/add-payment/route.ts`
- `backend/trpc/routes/customers/get-next-code/route.ts`

### Sales (3 rutas)
- `backend/trpc/routes/sales/create-sale/route.ts`
- `backend/trpc/routes/sales/get-sales/route.ts`
- `backend/trpc/routes/sales/get-next-number/route.ts`

### Quotes (4 rutas)
- `backend/trpc/routes/quotes/create-quote/route.ts`
- `backend/trpc/routes/quotes/get-quotes/route.ts`
- `backend/trpc/routes/quotes/update-quote-status/route.ts`
- `backend/trpc/routes/quotes/get-next-number/route.ts`

### Patrón de Migración

Para cada ruta, sigue este patrón:

```typescript
// ANTES
import { db } from "../../../../db/schema";
const products = db.products.filter(p => p.companyId === input.companyId);

// DESPUÉS
import { supabase } from "../../../../db/supabase";
const { data: products } = await supabase
  .from("products")
  .select("*")
  .eq("company_id", input.companyId);
```

**Nota**: Los campos en Supabase usan `snake_case` (company_id) en lugar de `camelCase` (companyId).

Ver `backend/db/MIGRATION_GUIDE.md` para más detalles.

## 📊 Monitoreo y Administración

### Ver Datos en Supabase

1. Ve a **Table Editor** en Supabase
2. Selecciona una tabla (products, customers, sales, etc.)
3. Puedes ver, editar y eliminar registros directamente

### Consultas SQL

Usa el **SQL Editor** para ejecutar consultas personalizadas:

```sql
-- Ver todos los productos
SELECT * FROM products;

-- Ver ventas del último mes
SELECT * FROM sales 
WHERE date >= NOW() - INTERVAL '30 days'
ORDER BY date DESC;

-- Ver clientes con deuda
SELECT c.name, ct.balance 
FROM customers c
JOIN credit_transactions ct ON c.id = ct.customer_id
WHERE ct.balance > 0;
```

### Backups

Supabase hace backups automáticos, pero puedes hacer backups manuales:

1. Ve a **Database** > **Backups**
2. Haz clic en **Create Backup**

## 🔒 Seguridad

### Row Level Security (RLS)

El esquema incluye políticas RLS básicas que permiten acceso completo al service role. Para producción, deberías:

1. Implementar autenticación con Supabase Auth
2. Crear políticas RLS basadas en el usuario autenticado
3. Usar el anon key en el frontend en lugar del service role key

### Contraseñas

⚠️ **IMPORTANTE**: Las contraseñas se almacenan en texto plano. Para producción:

1. Instala bcrypt: `bun add bcrypt @types/bcrypt`
2. Hashea las contraseñas antes de guardarlas
3. Compara hashes en el login

## 🆘 Solución de Problemas

### Error: "Missing Supabase environment variables"

- Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén en tu `.env`
- Reinicia el servidor después de agregar las variables

### Error: "relation does not exist"

- Asegúrate de haber ejecutado el esquema SQL completo
- Verifica que no haya errores en el SQL Editor

### Error: "new row violates row-level security policy"

- Las políticas RLS están activas
- Usa el service role key (no el anon key) en el backend

### Los datos no aparecen

- Verifica que las variables de entorno estén configuradas
- Revisa los logs del servidor para ver errores
- Usa el Table Editor de Supabase para verificar que los datos existen

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor](https://supabase.com/docs/guides/database/overview)

## ✅ Checklist Final

- [ ] Proyecto de Supabase creado
- [ ] Esquema SQL ejecutado sin errores
- [ ] Variables de entorno configuradas en `.env`
- [ ] Variables de entorno configuradas en Vercel
- [ ] Login funciona con usuarios de prueba
- [ ] Productos se muestran correctamente
- [ ] Puedes crear nuevos productos
- [ ] Migrar rutas de customers
- [ ] Migrar rutas de sales
- [ ] Migrar rutas de quotes
- [ ] Eliminar `backend/db/schema.ts` (base de datos en memoria)
- [ ] Implementar hash de contraseñas
- [ ] Configurar políticas RLS para producción

¡Tu aplicación ahora usa Supabase como base de datos! 🎉
