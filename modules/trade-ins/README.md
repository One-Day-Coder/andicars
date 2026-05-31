# Trade-ins

## Responsabilidad

Modulo futuro para permutas y vehiculos recibidos como parte de pago.

Todavia no tiene pantallas ni tablas propias.

## Rutas que lo usan

Ninguna ruta activa por ahora.

## Tablas Supabase relacionadas

Ninguna tabla activa por ahora.

## Archivos principales

- `README.md`

## Que se debe modificar aca

Cuando llegue la etapa de permutas, aca deberian vivir:

- vehiculo recibido
- valor tomado
- relacion con una venta
- estado de evaluacion
- conversion a stock
- margen estimado

## Que NO se debe modificar aca

- stock principal
- catalogo publico
- CRM
- gastos
- permisos globales

## Dependencias permitidas

- `modules/core` si en el futuro necesita permisos
- `lib/supabase` si en el futuro necesita datos
- `modules/sales` si una permuta queda asociada a una venta
- `modules/vehicles` si una permuta se convierte en stock

## Producto futuro

Forma parte de `AndiCars Full`. No se implementa en esta etapa.
