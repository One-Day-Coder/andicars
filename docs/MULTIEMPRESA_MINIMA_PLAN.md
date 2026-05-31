# Plan técnico: Multiempresa mínima para AndiCars

## 1. Resumen Ejecutivo

Leí `AGENTS.md` y revisé el estado actual sin modificar archivos.

Recomendación: no implementar multiempresa todavía en un solo salto. Conviene preparar una multiempresa mínima por fases, manteniendo una empresa default llamada `AndiCars`, y recién después filtrar datos por `company_id`.

La idea segura es:

1. Crear `companies` y `company_modules`.
2. Crear empresa default `AndiCars`.
3. Agregar `company_id` primero como nullable.
4. Asociar todos los datos actuales a AndiCars.
5. Validar que no haya datos huérfanos.
6. Recién después poner `company_id not null`.
7. Ajustar queries/services por módulo.
8. Recién al final ajustar RLS por empresa.

No conviene tocar RLS primero, porque el riesgo principal es bloquear el panel o dejar de mostrar autos públicos.

## 2. Estado Actual Detectado

Archivos revisados:

- `database/schema.sql`
- `database/admin-users-management.sql`
- `database/app-settings.sql`
- `database/leads-notes.sql`
- `database/sales.sql`
- `database/storage.sql`
- `database/user-roles.sql`
- `database/vehicle-current-location.sql`
- `database/vehicle-expenses.sql`
- `modules/core/module-registry.ts`
- `PRODUCT_MODULES.md`
- tipos, queries y services principales de módulos

Tablas detectadas:

- `admin_users`
- `vehicles`
- `vehicle_photos`
- `vehicle_expenses`
- `sales`
- `app_settings`
- `leads`
- `lead_notes`
- `storage.objects` para fotos

Funciones detectadas:

- `is_admin()`
- `current_user_role()`
- `can_manage_financials()`
- `can_manage_sales()`
- `can_manage_admin_users()`
- `can_manage_app_settings()`
- `submit_lead(...)`
- `set_updated_at()`

Policies actuales principales:

- Admins pueden leer usuarios internos.
- Owners pueden administrar usuarios internos.
- Público puede leer vehículos publicados disponibles/reservados.
- Admins pueden administrar vehículos.
- Público puede leer fotos de vehículos publicados.
- Admins pueden administrar fotos.
- Owners/managers pueden administrar gastos.
- Usuarios internos autorizados pueden administrar ventas.
- Público puede leer configuración.
- Owners pueden administrar configuración.
- Cualquiera puede crear leads.
- Admins pueden administrar leads.
- Admins pueden leer/crear/editar notas.
- Owners pueden borrar notas.

## 3. Tablas Afectadas

`admin_users`

Sirve para usuarios internos y roles.  
Debe tener `company_id`: sí.  
Riesgo: si se filtra mal, nadie entra al panel.  
Relación: `auth.users`, permisos, roles.

`vehicles`

Sirve para stock/catálogo.  
Debe tener `company_id`: sí.  
Riesgo: autos públicos dejan de mostrarse si no tienen empresa.  
Relación: `vehicle_photos`, `vehicle_expenses`, `sales`, `leads`.

`vehicle_photos`

Sirve para galería de fotos.  
Debe tener `company_id`: recomendable sí, aunque también puede derivarse por `vehicle_id`.  
Riesgo: duplicar `company_id` puede desincronizarse si no se valida.  
Relación: pertenece a `vehicles`.

`vehicle_expenses`

Sirve para gastos por vehículo.  
Debe tener `company_id`: sí.  
Riesgo: reportes financieros mezclados entre empresas.  
Relación: pertenece a `vehicles`.

`sales`

Sirve para reservas, señas, ventas y entregas.  
Debe tener `company_id`: sí.  
Riesgo: ventas cruzadas entre empresas y reportes incorrectos.  
Relación: pertenece a `vehicles`.

`leads`

Sirve para consultas/clientes interesados.  
Debe tener `company_id`: sí.  
Riesgo: leads públicos sin empresa si llegan desde web pública.  
Relación: puede tener `vehicle_id`.

`lead_notes`

Sirve para historial interno de leads.  
Debe tener `company_id`: recomendable sí, aunque puede derivarse por `lead_id`.  
Riesgo: notas visibles entre empresas si RLS no acompaña.  
Relación: pertenece a `leads`.

`app_settings`

Sirve para configuración de agencia.  
Debe cambiar de single-row global a configuración por empresa.  
Debe tener `company_id`: sí, idealmente como primary/unique.  
Riesgo: WhatsApp/email/datos públicos mezclados entre empresas.

`storage.objects`

No tiene `company_id` directo.  
Recomendación futura: guardar archivos bajo rutas con empresa, por ejemplo:
`company-id/vehicle-id/file.jpg`.

## 4. Módulos Afectados

`modules/core`

Usa `admin_users`, roles y permisos.  
Debe resolver empresa actual del usuario.  
Riesgo: bloquear login o permisos si `admin_users.company_id` queda mal.

`modules/vehicles`

Usa `vehicles`, `vehicle_photos`, storage.  
Debe filtrar stock por `company_id`.  
La web pública debe usar empresa default por ahora.  
Riesgo: catálogo vacío.

`modules/crm`

Usa `leads`, `lead_notes`, `vehicles`, `admin_users`.  
Debe crear leads con `company_id`.  
`submit_lead` debe determinar empresa según vehículo o default.  
Riesgo: leads huérfanos.

`modules/expenses`

Usa `vehicle_expenses`, `vehicles`, `sales`.  
Debe filtrar por empresa.  
Riesgo: gastos mezclados en reportes.

`modules/sales`

Usa `sales`, `vehicles`.  
Debe filtrar por empresa y validar que venta y vehículo sean de la misma empresa.  
Riesgo: cambiar estado de un vehículo de otra empresa.

`modules/reports`

Usa `vehicles`, `vehicle_expenses`, `sales`.  
Debe filtrar todo por empresa.  
Riesgo: reportes financieros mezclados.

`modules/settings`

Usa `app_settings`.  
Debe pasar de `id=true` global a configuración por empresa.  
Riesgo: la web pública o WhatsApp tomen datos incorrectos.

`modules/users`

Usa `admin_users`.  
Debe permitir que owner gestione usuarios de su empresa.  
Riesgo: un owner vea usuarios de otra empresa.

`modules/public-site`

Usa `app_settings`, WhatsApp, contacto.  
Por ahora puede usar empresa default.  
Más adelante debería resolver empresa por dominio o slug.

## 5. Diseño Propuesto

Tabla futura `companies`:

```text
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

Tabla futura `company_modules`:

```text
id uuid primary key
company_id uuid references companies(id) on delete cascade
module_key text not null
enabled boolean not null default true
created_at timestamptz default now()
updated_at timestamptz default now()
unique(company_id, module_key)
```

Módulos posibles según `module-registry.ts`:

```text
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

## 6. Empresa Default AndiCars

Crear una empresa default:

```text
name: AndiCars
slug: andicars
is_active: true
```

Flujo recomendado:

1. Insertar empresa `AndiCars`.
2. Guardar su `id`.
3. Agregar `company_id nullable` a tablas.
4. Hacer backfill:
   - todos los vehículos actuales a AndiCars
   - todos los usuarios actuales a AndiCars
   - todos los leads actuales a AndiCars
   - gastos, ventas y fotos según su vehículo
   - notas según su lead
   - settings actuales a AndiCars
5. Validar huérfanos.
6. Recién ahí aplicar `not null`.

Para evitar huérfanos: no poner `not null` hasta que las consultas de validación den cero.

## 7. `company_id` Por Tabla

`admin_users`

- Sí debe tener `company_id`.
- `not null`: sí, después del backfill.
- FK: sí hacia `companies(id)`.
- Índice: sí, `(company_id)`.
- Orden: temprano, porque define acceso.

`vehicles`

- Sí.
- `not null`: sí después del backfill.
- FK: sí.
- Índice: sí, `(company_id, status, is_published)`.
- Orden: temprano.

`vehicle_photos`

- Sí recomendado.
- `not null`: sí después del backfill.
- FK: sí.
- Índice: sí, `(company_id, vehicle_id)`.
- Backfill: desde `vehicles.company_id`.

`vehicle_expenses`

- Sí.
- `not null`: sí.
- FK: sí.
- Índice: sí, `(company_id, vehicle_id)`.
- Backfill: desde `vehicles.company_id`.

`sales`

- Sí.
- `not null`: sí.
- FK: sí.
- Índice: sí, `(company_id, vehicle_id)`.
- Backfill: desde `vehicles.company_id`.

`leads`

- Sí.
- `not null`: recomendable sí, pero con cuidado por leads públicos.
- FK: sí.
- Índice: sí, `(company_id, vehicle_id)`, `(company_id, status)`.
- Backfill: desde vehículo si tiene `vehicle_id`; si no, default AndiCars.

`lead_notes`

- Sí recomendado.
- `not null`: sí.
- FK: sí.
- Índice: sí, `(company_id, lead_id)`.
- Backfill: desde `leads.company_id`.

`app_settings`

- Sí, o directamente cambiar primary key a `company_id`.
- `not null`: sí.
- FK: sí.
- Índice/unique: `unique(company_id)`.
- Backfill: settings actuales a AndiCars.

## 8. Diseño De RLS

No implementarlo todavía, pero el diseño debería ser:

Helpers futuros:

```text
current_company_id()
is_company_admin(company_id)
current_user_role(company_id)
can_manage_financials(company_id)
can_manage_sales(company_id)
can_manage_admin_users(company_id)
can_manage_app_settings(company_id)
```

`admin_users`

- Un usuario interno solo debería ver usuarios de su empresa.
- Owner puede administrar usuarios de su empresa.
- Nadie debería administrar usuarios de otra empresa.

`vehicles`

- Admins autenticados: solo vehículos de su empresa.
- Público: vehículos publicados de la empresa pública resuelta.
- No basta con `is_published`; debe incluir empresa.

`vehicle_photos`

- Público puede ver fotos si el vehículo asociado es público y de la empresa correcta.
- Admin puede administrar fotos de su empresa.

`vehicle_expenses`

- Solo owner/manager de la misma empresa.

`sales`

- Owner/manager/seller de la misma empresa.

`leads`

- Público puede crear lead para la empresa correcta.
- Admins ven leads de su empresa.
- El insert público debe setear `company_id` en función del vehículo o empresa default.

`lead_notes`

- Admins ven notas de leads de su empresa.
- Owner puede borrar notas de su empresa.

`app_settings`

- Público puede leer settings de la empresa pública actual.
- Owner puede administrar settings de su empresa.

Riesgo mayor: `security definer` en helpers debe estar muy bien escrito para no saltear filtros por empresa.

## 9. Impacto En Web Pública

Ahora conviene mantener la web pública usando AndiCars default.

No conviene implementar todavía:

- dominios por empresa
- `/agencia/[slug]`
- rutas multiagencia
- selector público de empresa

Más adelante hay dos caminos:

1. Por dominio:
   - `andicars.com`
   - `otra-agencia.com`

2. Por slug:
   - `/agencia/andicars`
   - `/agencia/otra-agencia`

Para ahora: empresa default fija.

Riesgo principal: si se agrega `company_id` a vehículos y no se filtra correctamente, `/autos` queda vacío.

## 10. Impacto En Panel Admin

El panel debe funcionar igual para AndiCars.

A futuro, después de login:

1. Buscar `admin_users` por `auth.uid()`.
2. Obtener `company_id`.
3. Usar ese `company_id` en queries/services.
4. Aplicar permisos según rol dentro de esa empresa.

No conviene permitir todavía que un usuario pertenezca a varias empresas, salvo que se diseñe una tabla intermedia tipo `company_users`. Para multiempresa mínima, `admin_users.company_id` alcanza.

## 11. `company_modules` Y Módulos Vendibles

`company_modules` puede activar/desactivar:

- `crm`
- `vehicles`
- `expenses`
- `sales`
- `reports`
- `settings`
- `users`
- `public_site`
- `documents`
- `trade_ins`

No implementaría planes pagos todavía.

Uso futuro:

- `core`: siempre activo, no vendible.
- `settings` y `users`: probablemente incluidos con cualquier producto.
- `crm`: producto CRM.
- `vehicles` + `public_site`: producto stock/catálogo.
- `crm` + `vehicles`: producto combinado.
- `expenses`, `sales`, `reports`: producto completo.

Primero conviene usar `company_modules` solo para visibilidad/permisos de navegación, no para facturación.

## 12. Fases De Implementación

Fase 1: plan y backup  
Hacer backup de Supabase antes de migrar.

Fase 2: crear `companies` y `company_modules`  
Sin tocar datos existentes todavía.

Fase 3: crear empresa default AndiCars  
Guardar `id`.

Fase 4: agregar `company_id nullable`  
En tablas principales. No activar restricciones fuertes aún.

Fase 5: backfill  
Asignar todos los datos actuales a AndiCars.

Fase 6: validaciones SQL  
Confirmar cero huérfanos.

Fase 7: poner `company_id not null` y FK  
Solo cuando todo esté validado.

Fase 8: ajustar types/queries/services por módulo  
Empezar por `core`, luego `vehicles`, `crm`, `expenses`, `sales`, `reports`, `settings`, `users`.

Fase 9: ajustar funciones SQL  
Especialmente `submit_lead` y helpers de permisos.

Fase 10: ajustar RLS  
Último paso sensible.

Fase 11: probar rutas públicas y panel  
Confirmar que AndiCars sigue funcionando como antes.

Fase 12: recién después pensar en módulos vendibles  
No mezclarlo con la migración base.

## 13. Riesgos Y Mitigaciones

Riesgo: bloquear acceso por RLS.  
Mitigación: no cambiar RLS hasta tener `company_id` completo y validado.

Riesgo: autos públicos no aparecen.  
Mitigación: validar `/autos` y policy pública con empresa default.

Riesgo: usuarios no pueden entrar.  
Mitigación: primero backfill de `admin_users.company_id`.

Riesgo: datos sin `company_id`.  
Mitigación: consultas SQL de huérfanos antes de `not null`.

Riesgo: reportes incorrectos.  
Mitigación: filtrar `vehicles`, `sales` y `vehicle_expenses` por la misma empresa.

Riesgo: leads públicos sin empresa.  
Mitigación: `submit_lead` debe setear `company_id`.

Riesgo: settings globales vs settings por empresa.  
Mitigación: migrar `app_settings` a una fila por empresa.

Riesgo: fotos visibles entre empresas.  
Mitigación: policy de `vehicle_photos` basada en `vehicles.company_id`.

Riesgo: storage público demasiado abierto.  
Mitigación: organizar rutas de storage por empresa y revisar policies después.

## 14. Validaciones Necesarias

Comandos:

```bash
npm run lint
npm run build
```

En Windows:

```bash
npm.cmd run lint
npm.cmd run build
```

Rutas manuales:

```text
/
 /autos
 /autos/[id]
 /admin
 /admin/vehiculos
 /admin/consultas
 /admin/gastos
 /admin/ventas
 /admin/reportes
 /admin/configuracion
 /admin/usuarios
 /login
 /actualizar-contrasena
```

Consultas SQL futuras de validación, cuando se implemente:

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

Validar fotos/gastos/ventas contra vehículo:

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
```

Validar notas contra leads:

```sql
select count(*)
from lead_notes n
join leads l on l.id = n.lead_id
where n.company_id <> l.company_id;
```

Validar empresa default:

```sql
select * from companies where slug = 'andicars';
```

Validar módulos default:

```sql
select module_key, enabled
from company_modules
where company_id = '<ANDICARS_COMPANY_ID>';
```

## 15. Preguntas O Decisiones Pendientes

1. ¿Un usuario puede pertenecer a una sola empresa o a varias?
   - Para mínimo seguro: una sola empresa.

2. ¿La web pública futura será por dominio o por slug?
   - Para ahora: empresa default.

3. ¿`app_settings` debe pasar a `company_id` como primary key?
   - Recomendado.

4. ¿Las fotos en storage deben separarse por empresa?
   - Recomendado antes de abrir multiempresa real.

5. ¿`company_modules` solo controla navegación o también permisos?
   - Primero navegación/activación simple. Facturación después.

## 16. Recomendación Final

Sí conviene preparar multiempresa, pero no ahora como cambio directo de código/SQL.

Mi recomendación de orden real:

1. Primero escribir una migración planificada, revisable y reversible.
2. Crear `companies` y empresa default.
3. Agregar `company_id nullable`.
4. Backfill.
5. Validar.
6. Ajustar código por módulo.
7. Recién al final tocar RLS.

El punto más delicado no es crear `companies`; lo delicado es RLS y `submit_lead`, porque ahí se puede romper el acceso interno o dejar sin funcionar las consultas públicas.

En esta tarea no modifiqué archivos, no ejecuté migraciones, no hice commit, no toqué SQL/RLS y no implementé multiempresa.