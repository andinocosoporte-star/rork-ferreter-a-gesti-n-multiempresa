# Guía de Migración a Supabase

## Estado de la Migración

### ✅ Completado
- Instalación de `@supabase/supabase-js`
- Esquema SQL creado en `backend/db/supabase-schema.sql`
- Cliente de Supabase configurado en `backend/db/supabase.ts`
- Rutas de autenticación migradas
- Rutas de inventario migradas

### 🔄 En Progreso
- Rutas de customers
- Rutas de sales
- Rutas de quotes

## Pasos para Completar la Migración

### 1. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve al SQL Editor y ejecuta el contenido de `backend/db/supabase-schema.sql`
3. Obtén tus credenciales:
   - URL del proyecto (Project URL)
   - Service Role Key (en Settings > API)

### 2. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 3. Patrón de Migración

Todas las rutas siguen este patrón de migración:

#### Antes (In-Memory DB):
```typescript
import { db } from "../../../../db/schema";

const products = db.products.filter(p => p.companyId === input.companyId);
```

#### Después (Supabase):
```typescript
import { supabase } from "../../../../db/supabase";

const { data: products } = await supabase
  .from("products")
  .select("*")
  .eq("company_id", input.companyId);
```

### 4. Mapeo de Campos

Los nombres de campos en Supabase usan snake_case en lugar de camelCase:

| Frontend/TypeScript | Supabase DB |
|---------------------|-------------|
| companyId | company_id |
| branchId | branch_id |
| createdAt | created_at |
| updatedAt | updated_at |
| minStock | min_stock |
| creditLimit | credit_limit |
| saleNumber | sale_number |
| quoteNumber | quote_number |
| detailedDescription | detailed_description |

### 5. Rutas Pendientes de Migrar

#### Customers:
- ✅ `get-customers/route.ts` - Necesita migración
- ✅ `create-customer/route.ts` - Necesita migración
- ✅ `get-customer-details/route.ts` - Necesita migración
- ✅ `add-payment/route.ts` - Necesita migración
- ✅ `get-next-code/route.ts` - Necesita migración

#### Sales:
- `create-sale/route.ts` - Necesita migración
- `get-sales/route.ts` - Necesita migración
- `get-next-number/route.ts` - Necesita migración

#### Quotes:
- `create-quote/route.ts` - Necesita migración
- `get-quotes/route.ts` - Necesita migración
- `update-quote-status/route.ts` - Necesita migración
- `get-next-number/route.ts` - Necesita migración

### 6. Consideraciones Especiales

#### JSONB Fields
Los campos `items` en `sales` y `quotes` se almacenan como JSONB en Supabase. No necesitas hacer nada especial, Supabase maneja la serialización automáticamente.

#### Transacciones
Para operaciones que requieren múltiples inserts (como crear una venta con transacción de crédito), considera usar transacciones de Supabase o manejar rollbacks manualmente.

#### Búsquedas
Para búsquedas de texto, usa los operadores de Supabase:
- `.ilike()` para búsquedas case-insensitive
- `.textSearch()` para búsquedas full-text

### 7. Testing

Después de migrar cada ruta:
1. Prueba la funcionalidad en la app
2. Verifica que los datos se guarden correctamente en Supabase
3. Verifica que las consultas retornen los datos esperados

### 8. Eliminar Código Antiguo

Una vez que todas las rutas estén migradas y probadas:
1. Elimina `backend/db/schema.ts` (la base de datos en memoria)
2. Busca y elimina cualquier referencia a `import { db } from` en el código

## Notas Importantes

- **Row Level Security (RLS)**: El esquema SQL incluye políticas RLS básicas. En producción, deberías implementar políticas más granulares basadas en el usuario autenticado.
- **Passwords**: Las contraseñas se almacenan en texto plano en el esquema actual. En producción, deberías usar bcrypt o similar para hashear las contraseñas.
- **Índices**: El esquema incluye índices básicos. Monitorea el rendimiento y agrega más índices según sea necesario.
