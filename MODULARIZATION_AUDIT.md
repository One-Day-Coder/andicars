# Auditoria De Modularizacion

## Objetivo

Dejar AndiCars ordenado por modulos sin cambiar rutas, sin tocar Supabase SQL/RLS y sin implementar multiempresa.

## Auditoria Inicial

Fecha de esta pasada: 2026-05-30.

### Imports Desde `@/components`

No se encontraron imports activos.

Busqueda usada:

```bash
rg "@/components" app modules lib types
```

### Imports Desde `@/lib/vehicle-queries`

No se encontraron imports activos.

Busqueda usada:

```bash
rg "@/lib/vehicle-queries" app modules lib types
```

### Imports Desde `@/types/vehicle`

No se encontraron imports activos.

Busqueda usada:

```bash
rg "@/types/vehicle" app modules lib types
```

### Imports Desde `@/lib/admin-permissions`

No se encontraron imports activos.

Busqueda usada:

```bash
rg "@/lib/admin-permissions" app modules lib types
```

### Componentes En `components/`

`components/` no contiene componentes activos de dominio.

Archivo conservado:

- `components/README.md`

### Archivos En `lib/`

Infraestructura compartida:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/format.ts`

Logica de dominio detectada en `lib/`:

- Ninguna.

### Archivos En `types/`

`types/` queda reservado para tipos globales.

Archivo conservado:

- `types/README.md`

Tipos de dominio:

- Vehiculos: `modules/vehicles/types.ts`
- CRM: `modules/crm/types.ts`
- Gastos: `modules/expenses/types.ts`
- Ventas: `modules/sales/types.ts`
- Configuracion: `modules/settings/types.ts`
- Usuarios: `modules/users/types.ts`
- Core: `modules/core/types.ts`

## Plan De Migracion Por Modulo

### Core

Conservar permisos, roles, guardas, header, resumen inicial y registro de modulos en `modules/core`.

### Vehicles

Conservar stock, catalogo, ficha publica, fotos, filtros, queries, constantes, tipos y servicios en `modules/vehicles`.

### CRM

Conservar consultas, leads, notas, prioridades, proximos contactos, cierres y reactivaciones en `modules/crm`.

### Expenses

Conservar gastos por vehiculo, categorias, moneda y servicios de gastos en `modules/expenses`.

### Sales

Conservar reservas, senas, ventas, entregas, cancelaciones y saldos en `modules/sales`.

### Reports

Conservar metricas y consolidacion de datos en `modules/reports`.

### Settings

Conservar configuracion editable de agencia, WhatsApp, email, zona y anti-spam en `modules/settings`.

### Users

Conservar usuarios internos, apodos, roles y accesos en `modules/users`.

### Public Site

Conservar componentes publicos generales en `modules/public-site`.

### Documents

Conservar como modulo futuro documentado.

### Trade-ins

Conservar como modulo futuro documentado.

## Confirmacion Sobre Base De Datos

En esta pasada no se modifica SQL, RLS, tablas, policies ni datos de Supabase.

No se implementa multiempresa.

No se agregan:

- `companies`
- `company_id`
- `company_modules`
- planes pagos
- RLS multiempresa

## Acciones Realizadas

- Se mantuvo `components/` sin componentes activos, solo con README.
- Se mantuvo `lib/` solo con infraestructura generica.
- Se mantuvo `types/` solo con README explicativo.
- Se agregaron servicios faltantes en `modules/vehicles`.
- Se agregaron servicios faltantes en `modules/crm`.
- Se agregaron servicios faltantes en `modules/expenses`.
- Se agregaron servicios faltantes en `modules/sales`.
- Se agrego `modules/users/queries.ts`.
- Se eliminaron README placeholder dentro de carpetas `services/`.
- Se mejoraron los README de `documents` y `trade-ins`.

## Servicios Creados O Consolidados

Vehicles:

- `getPublicVehicles`
- `getFeaturedVehicles`
- `getPublicVehicleById`
- `getVehiclePhotos`
- `createVehicle`
- `updateVehicle`
- `deleteVehicle`
- `uploadVehiclePhoto`

CRM:

- `createLead`
- `getLeads`
- `updateLeadStatus`
- `createLeadNote`
- `closeLead`
- `reactivateLead`
- `markLeadAsLost`

Expenses:

- `createExpense`
- `updateExpense`
- `deleteExpense`
- `getExpenses`
- `getExpensesByVehicle`

Sales:

- `createSale`
- `updateSale`
- `updateSaleStatus`
- `cancelSale`
- `getSales`

Settings:

- `getSettings`
- `updateSettings`

Users:

- `createAdminUser`
- `updateAdminUser`
- `deleteAdminUser`

Reports:

- `getDashboardReport`
- `getStockReport`
- `getFinancialReport`

## Auditoria Final Esperada

Al terminar la validacion final, estas busquedas quedaron sin resultados:

```bash
rg "@/components" app modules lib types
rg "@/lib/vehicle-queries" app modules lib types
rg "@/types/vehicle" app modules lib types
rg "@/lib/admin-permissions" app modules lib types
```

## Validaciones Finales

`npm.cmd run lint`

- Resultado: correcto.
- Advertencia no bloqueante: Next.js recomienda usar `next/image` en `app/page.tsx` en lugar de `<img>`.

`npm.cmd run build`

- Resultado: correcto.
- La app compila y genera las rutas esperadas.

## Rutas A Probar Manualmente

- `/`
- `/autos`
- `/autos/[id]`
- `/admin`
- `/admin/vehiculos`
- `/admin/consultas`
- `/admin/gastos`
- `/admin/ventas`
- `/admin/reportes`
- `/admin/configuracion`
- `/admin/usuarios`

## Estado Final

- No quedan imports viejos hacia `@/components`.
- No quedan imports viejos hacia `@/lib/vehicle-queries`.
- No quedan imports viejos hacia `@/types/vehicle`.
- No quedan imports viejos hacia `@/lib/admin-permissions`.
- `components/` no contiene componentes activos.
- `lib/` no contiene logica de dominio.
- `types/` no contiene tipos de dominio.
- Cada modulo principal tiene `README.md`.
- Cada modulo activo tiene `index.ts`.
- No se modifico SQL/RLS.
- No se implemento multiempresa.
