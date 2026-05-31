# Plan tecnico: Multiempresa minima para AndiCars

## 1. Objetivo

Preparar AndiCars para soportar varias agencias/empresas en el futuro, sin convertirlo todavia en SaaS completo.

La app debe seguir funcionando con una empresa default llamada `AndiCars`.

La preparacion debe permitir que en el futuro puedan venderse modulos como:

- CRM.
- Stock/catalogo.
- CRM + stock.
- Sistema completo.

## 2. Principio de seguridad

No implementar todo en un solo salto.

Orden seguro:

1. Crear `companies` y `company_modules`.
2. Crear empresa default `AndiCars`.
3. Agregar `company_id` primero como nullable.
4. Asociar datos actuales a AndiCars.
5. Validar que no existan registros huerfanos.
6. Recien despues aplicar `company_id not null`.
7. Ajustar queries/services por modulo.
8. Recien al final ajustar RLS por empresa.

No tocar RLS al principio porque puede bloquear el panel o dejar de mostrar autos publicos.

## 3. Tablas actuales detectadas

Tablas actuales relevantes:

- `admin_users`
- `vehicles`
- `vehicle_photos`
- `vehicle_expenses`
- `sales`
- `app_settings`
- `leads`
- `lead_notes`
- `storage.objects`

## 4. Tablas futuras propuestas

### `companies`

Columnas propuestas:

```txt
id uuid primary key
name text not null
slug text unique not null
logo_url text
phone text
email text
address text
is_active boolean default true
created_at timestamptz default now()
updated_at timestamptz default now()
```

### `company_modules`

Columnas propuestas:

```txt
id uuid primary key
company_id uuid references companies(id) on delete cascade
module_key text not null
enabled boolean not null default true
created_at timestamptz default now()
updated_at timestamptz default now()
unique(company_id, module_key)
```

## 5. Empresa default

Crear en el futuro una empresa default:

```txt
name: AndiCars
slug: andicars
is_active: true
```

Todos los datos actuales deben asociarse a esa empresa.

## 6. Tablas que deberian recibir `company_id`

Tablas candidatas:

- `admin_users`
- `vehicles`
- `vehicle_photos`
- `vehicle_expenses`
- `sales`
- `leads`
- `lead_notes`
- `app_settings`

Primero `company_id` debe ser nullable. Solo debe pasar a `not null` despues de validar el backfill y confirmar que no quedan registros huerfanos.

## 7. Modulos afectados

Impacto futuro:

- `modules/core`: resolver empresa actual del usuario.
- `modules/vehicles`: filtrar stock por empresa.
- `modules/crm`: crear y listar leads por empresa.
- `modules/expenses`: filtrar gastos por empresa.
- `modules/sales`: filtrar ventas por empresa.
- `modules/reports`: consolidar datos por empresa.
- `modules/settings`: configuracion por empresa.
- `modules/users`: usuarios por empresa.
- `modules/public-site`: por ahora usar empresa default.

## 8. RLS

RLS no debe tocarse al principio.

Diseno futuro:

- usuarios internos solo ven datos de su empresa;
- publico solo ve vehiculos publicados de la empresa publica resuelta;
- leads publicos deben crearse con `company_id`;
- `app_settings` debe leerse por empresa;
- helpers como `current_company_id()` podrian ser necesarios.

## 9. Web publica

Por ahora la web publica debe seguir usando empresa default `AndiCars`.

No implementar todavia:

- dominios por empresa;
- `/agencia/[slug]`;
- selector publico de agencia;
- rutas multiagencia.

## 10. Fases futuras de implementacion

1. Backup.
2. Crear `companies` y `company_modules`.
3. Crear empresa default `AndiCars`.
4. Agregar `company_id nullable`.
5. Hacer backfill.
6. Validar datos huerfanos.
7. Aplicar `not null` y foreign keys.
8. Ajustar codigo por modulos.
9. Ajustar funciones SQL como `submit_lead`.
10. Ajustar RLS.
11. Probar rutas publicas y panel.
12. Recien despues pensar en planes/modulos vendibles.

## 11. Riesgos

- Bloquear acceso por RLS.
- Catalogo publico vacio.
- Usuarios sin acceso.
- Datos sin `company_id`.
- Reportes mezclados.
- Leads publicos sin empresa.
- Settings globales vs settings por empresa.
- Fotos/storage visibles entre empresas.

## 12. Validaciones futuras

Validaciones de datos huerfanos:

```sql
select count(*) from vehicles where company_id is null;
select count(*) from vehicle_photos where company_id is null;
select count(*) from vehicle_expenses where company_id is null;
select count(*) from sales where company_id is null;
select count(*) from leads where company_id is null;
select count(*) from lead_notes where company_id is null;
select count(*) from admin_users where company_id is null;
select count(*) from app_settings where company_id is null;
```

Validaciones cruzadas:

```sql
select count(*)
from vehicle_photos p
join vehicles v on v.id = p.vehicle_id
where p.company_id <> v.company_id;

select count(*)
from vehicle_expenses e
join vehicles v on v.id = e.vehicle_id
where e.company_id <> v.company_id;

select count(*)
from sales s
join vehicles v on v.id = s.vehicle_id
where s.company_id <> v.company_id;

select count(*)
from lead_notes n
join leads l on l.id = n.lead_id
where n.company_id <> l.company_id;
```

## 13. Decisiones pendientes

- Por ahora un usuario pertenece a una sola empresa.
- Por ahora web publica usa empresa default.
- `company_modules` se usara primero para activacion/visibilidad, no facturacion.
- Storage por empresa queda para etapa posterior.
- RLS queda para etapa final.

## 14. Recomendacion final

No implementar multiempresa completa de golpe.

Primero dejar documentado el plan.

Luego crear una migracion SQL revisable para `companies`, `company_modules` y empresa default.
