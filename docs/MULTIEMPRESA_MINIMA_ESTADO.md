# Estado de multiempresa minima

Este documento registra el estado real posterior a la ejecucion de Fase 1 y Fase 2 en Supabase.

## Resumen ejecutivo

Fase 1 y Fase 2 fueron ejecutadas y validadas correctamente.

La aplicacion sigue funcionando como una sola empresa operativa llamada `AndiCars`, pero la base ya quedo preparada para avanzar con multiempresa de forma controlada.

## Fase 1 ejecutada

Se ejecuto en Supabase la creacion de:

```txt
public.companies
public.company_modules
```

Tambien quedo creada la empresa default:

```txt
name: AndiCars
slug: andicars
is_active: true
```

Tambien quedaron creados los modulos default para AndiCars:

```txt
core
vehicles
crm
expenses
sales
reports
settings
users
public_site
documents
trade_ins
```

Todos quedaron con:

```txt
enabled = true
```

Validacion:

```txt
company_modules duplicados: 0
```

## Fase 2 ejecutada

Se ejecuto en Supabase el agregado de `company_id` nullable en:

```txt
admin_users
vehicles
vehicle_photos
vehicle_expenses
sales
leads
lead_notes
app_settings
```

Todas quedaron con:

```txt
company_id uuid
```

El backfill hacia la empresa default `AndiCars` fue correcto.

## Validaciones de company_id null

Resultado:

```txt
admin_users        0
vehicles           0
vehicle_photos     0
vehicle_expenses   0
sales              0
leads              0
lead_notes         0
app_settings       0
```

## Validaciones cruzadas

Resultado de cruces inconsistentes:

```txt
vehicle_photos      0
vehicle_expenses    0
sales               0
lead_notes          0
```

Esto confirma que los datos relacionados quedaron asociados a la misma empresa cuando correspondia.

## Validacion visual de la app

La app fue probada visualmente despues de Fase 2 y abrio correctamente.

Rutas verificadas visualmente:

```txt
/
/autos
/admin
/admin/vehiculos
/admin/consultas
/admin/gastos
/admin/ventas
/admin/reportes
/admin/configuracion
/admin/usuarios
```

No se detectaron roturas despues de Fase 2.

## Todavia no realizado

Todavia no se hizo:

```txt
company_id NOT NULL
foreign keys hacia companies
RLS por empresa en tablas existentes
policies multiempresa
ajustes de codigo para insertar company_id automaticamente
dominios por empresa
/agencia/[slug]
planes pagos
subscriptions
```

## Proximo paso recomendado

La siguiente fase no debe ser `NOT NULL` todavia.

La proxima fase recomendada es:

```txt
Fase 3: ajustar codigo para que nuevas altas usen company_id
```

Motivo:

Antes de aplicar `NOT NULL`, foreign keys fuertes o RLS por empresa, la app debe poder crear nuevos registros con `company_id`.

Fase 3 deberia ocuparse de que nuevas altas de:

```txt
vehicles
leads
sales
vehicle_expenses
vehicle_photos
lead_notes
app_settings
admin_users
```

queden asociadas a la empresa default AndiCars o a la empresa actual del usuario.

Por ahora, como AndiCars sigue siendo empresa unica, Fase 3 puede usar la empresa default `andicars` de forma controlada.

## Criterio de seguridad para seguir

Antes de avanzar a `company_id NOT NULL`, foreign keys o RLS por empresa, hay que confirmar que:

- el codigo nuevo inserta `company_id`;
- las rutas publicas siguen mostrando el catalogo;
- el panel interno sigue cargando stock, consultas, gastos, ventas, reportes, configuracion y usuarios;
- no quedan registros nuevos con `company_id` vacio.
