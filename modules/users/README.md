# Users

## Responsabilidad

Gestiona usuarios internos, apodos visibles, roles y accesos al panel.

## Archivos principales

- `components/UsersPanel.tsx`
- `services/`
- `types.ts`
- `constants.ts`

## Rutas que lo usan

- `/admin/usuarios`
- `/admin` para mostrar usuario y rol

## Tablas Supabase

- `admin_users`
- Supabase Auth para crear usuarios reales

## Se puede modificar aca

- apodos
- email visible
- roles
- altas y bajas de acceso interno

## No modificar desde aca

- creacion directa de usuarios Auth con service role desde cliente
- permisos globales, que viven en `modules/core`

## Producto futuro

Debe existir en cualquier producto que tenga panel privado.
