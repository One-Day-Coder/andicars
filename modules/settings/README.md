# Settings

## Responsabilidad

Gestiona configuracion general de la agencia: nombre visible, WhatsApp, email, zona/direccion, mensaje automatico y proteccion anti-spam.

## Archivos principales

- `components/SettingsPanel.tsx`
- `queries.ts`
- `services/`
- `types.ts`
- `constants.ts`

## Rutas que lo usan

- `/admin/configuracion`
- componentes publicos que muestran contacto o WhatsApp
- formulario de consulta para reglas anti-spam

## Tablas Supabase

- `app_settings`

## Se puede modificar aca

- datos de contacto
- numero de WhatsApp
- mensaje automatico
- reglas anti-spam

## No modificar desde aca

- permisos de usuario
- stock
- ventas
- gastos

## Producto futuro

Conviene incluirlo en todos los productos que necesiten datos editables de agencia.
