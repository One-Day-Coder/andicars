# Expenses

## Responsabilidad

Gestiona gastos asociados a vehiculos, categorias, moneda, fechas, filtros y calculos iniciales de inversion.

## Archivos principales

- `components/ExpensesPanel.tsx`
- `queries.ts`
- `services/`
- `types.ts`
- `constants.ts`

## Rutas que lo usan

- `/admin/gastos`
- `/admin/reportes`

## Tablas Supabase

- `vehicle_expenses`
- lectura de `vehicles`
- lectura de `sales` para calculos relacionados

## Se puede modificar aca

- alta de gastos
- categorias
- filtros
- conversion ARS/USD
- totales de gastos

## No modificar desde aca

- ventas
- estados comerciales
- catalogo publico
- permisos globales

## Producto futuro

Es parte de `AndiCars Pro` y superiores. No es necesario para un CRM simple.
