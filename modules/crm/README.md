# CRM

## Responsabilidad

Gestiona consultas, leads, interesados, notas internas, prioridades, proximo contacto, cierre, reactivacion y seguimiento comercial.

## Archivos principales

- `components/LeadForm.tsx`
- `components/LeadsPanel.tsx`
- `queries.ts`
- `services/`
- `types.ts`
- `constants.ts`

## Rutas que lo usan

- `/autos/[id]` para crear consultas desde una ficha
- `/admin/consultas`
- `/admin` para resumen

## Tablas Supabase

- `leads`
- `lead_notes`
- relacion opcional con `vehicles`
- lectura opcional de `admin_users` para mostrar autores

## Se puede modificar aca

- estados de consulta
- prioridad
- notas internas
- acciones de cerrar/reactivar
- anti-spam aplicado al formulario de consulta
- seguimiento comercial

## No modificar desde aca

- stock como fuente principal
- precios de compra
- gastos o ventas

## Producto futuro

Puede formar `AndiCRM`. La relacion con vehiculos debe ser opcional para que el CRM pueda venderse sin modulo de stock.
