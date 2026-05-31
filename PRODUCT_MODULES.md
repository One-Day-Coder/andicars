# Productos Modulares Futuros

Este documento describe posibles productos comerciales a partir de los modulos internos de AndiCars.

No significa que ya esten vendidos por separado ni que exista multiempresa. Es una guia para decisiones futuras.

## AndiCRM

Producto enfocado en seguimiento comercial.

Modulos incluidos:

- core
- crm
- settings
- users

Modulos opcionales:

- vehicles
- public_site

Dependencias tecnicas:

- Supabase Auth
- `admin_users`
- `leads`
- `lead_notes`
- `app_settings`

Pantallas:

- `/login`
- `/admin`
- `/admin/consultas`
- `/admin/configuracion`
- `/admin/usuarios`

## AndiStock

Producto enfocado en stock y catalogo de vehiculos.

Modulos incluidos:

- core
- vehicles
- public_site
- settings
- users

Modulos opcionales:

- crm
- expenses

Dependencias tecnicas:

- Supabase Auth
- `vehicles`
- `vehicle_photos`
- `app_settings`

Pantallas:

- `/`
- `/autos`
- `/autos/[id]`
- `/admin`
- `/admin/vehiculos`
- `/admin/configuracion`
- `/admin/usuarios`

## AndiCars Pro

Producto operativo para agencias que necesitan stock, CRM, gastos y ventas.

Modulos incluidos:

- core
- vehicles
- crm
- expenses
- sales
- reports
- settings
- users
- public_site

Modulos opcionales:

- documents
- trade_ins

Dependencias tecnicas:

- `vehicles`
- `vehicle_photos`
- `leads`
- `lead_notes`
- `vehicle_expenses`
- `sales`
- `app_settings`
- `admin_users`

Pantallas:

- todas las pantallas actuales del panel y web publica

## AndiCars Full

Producto completo futuro para agencias con gestion documental y permutas.

Modulos incluidos:

- core
- vehicles
- crm
- expenses
- sales
- reports
- settings
- users
- public_site
- documents
- trade_ins

Modulos opcionales:

- integraciones externas
- automatizaciones
- reportes avanzados

Dependencias tecnicas futuras:

- tablas de documentacion
- tablas de permutas
- archivos/documentos por vehiculo
- alertas documentales
- permisos por empresa si se convierte en SaaS

Pantallas futuras:

- `/admin/documentacion`
- `/admin/permutas`
- reportes documentales y de permutas
