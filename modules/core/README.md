# Core

## Responsabilidad

Contiene la base comun del panel: login protegido, permisos, roles, navegacion compartida, header, resumen inicial y registro de modulos.

## Archivos principales

- `components/AdminGuard.tsx`
- `components/RoleGuard.tsx`
- `components/SiteHeader.tsx`
- `components/AdminSummary.tsx`
- `permissions.ts`
- `module-registry.ts`
- `types.ts`

## Rutas que lo usan

- Todas las rutas publicas usan `SiteHeader`.
- Todas las rutas `/admin/*` usan guardas y permisos.

## Tablas Supabase

- `admin_users`
- Supabase Auth

## Se puede modificar aca

- roles
- permisos
- navegacion comun
- acceso al panel
- componentes transversales del panel

## No modificar desde aca

- logica propia de vehiculos, CRM, gastos, ventas o reportes
- esquema SQL de negocio

## Producto futuro

Es obligatorio para cualquier producto futuro porque concentra acceso, permisos y estructura comun.
