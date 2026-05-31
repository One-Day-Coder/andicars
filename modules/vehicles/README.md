# Vehicles

## Responsabilidad

Gestiona stock, carga de autos, fotos, estados, catalogo publico, ficha del vehiculo, filtros y datos tecnicos de cada unidad.

## Archivos principales

- `components/VehicleForm.tsx`
- `components/VehicleCard.tsx`
- `components/VehicleGallery.tsx`
- `components/PublicVehicleCatalog.tsx`
- `queries.ts`
- `services/`
- `types.ts`
- `constants.ts`

## Rutas que lo usan

- `/`
- `/autos`
- `/autos/[id]`
- `/admin/vehiculos`
- tambien es leido por gastos, ventas y reportes

## Tablas Supabase

- `vehicles`
- `vehicle_photos`
- Storage bucket `vehicle-photos`

## Se puede modificar aca

- carga y edicion de autos
- campos del stock
- estados del vehiculo
- filtros de vehiculos
- fotos y galeria
- catalogo y ficha publica del auto

## No modificar desde aca

- notas de clientes
- ventas/reservas
- gastos
- permisos globales

## Producto futuro

Puede formar el producto `AndiStock`. Debe poder funcionar con CRM opcional, no obligatorio.
