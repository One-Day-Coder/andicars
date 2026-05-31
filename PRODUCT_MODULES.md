# Productos Modulares Futuros

Este documento describe posibles productos comerciales a partir de los modulos internos de AndiCars.

No significa que ya esten vendidos por separado ni que exista multiempresa. Es una guia para decisiones futuras.

## AndiCRM

Producto enfocado en seguimiento comercial.

Modulos base:

- core
- crm

Modulos recomendados:

- settings
- users

Modulo opcional:

- vehicles

No debe depender de:

- expenses
- sales
- reports
- documents
- trade-ins

Tablas principales:

- `admin_users`
- `leads`
- `lead_notes`
- `app_settings`

## AndiStock

Producto enfocado en stock y catalogo de vehiculos.

Modulos base:

- core
- vehicles
- public-site

Modulos recomendados:

- settings
- users

Modulo opcional:

- crm

No debe depender de:

- expenses
- sales
- reports

Tablas principales:

- `vehicles`
- `vehicle_photos`
- `app_settings`
- `admin_users`

## AndiCars Pro

Producto operativo para agencias que necesitan stock, CRM, gastos, ventas y reportes.

Modulos incluidos:

- core
- vehicles
- public-site
- crm
- expenses
- sales
- reports
- settings
- users

Modulos opcionales:

- documents
- trade-ins

Tablas principales:

- `vehicles`
- `vehicle_photos`
- `leads`
- `lead_notes`
- `vehicle_expenses`
- `sales`
- `app_settings`
- `admin_users`

## AndiCars Full

Producto completo futuro para agencias con gestion documental y permutas.

Modulos incluidos:

- core
- vehicles
- public-site
- crm
- expenses
- sales
- reports
- settings
- users
- documents
- trade-ins

Dependencias futuras:

- tablas de documentacion
- tablas de permutas
- archivos/documentos por vehiculo
- alertas documentales
- permisos por empresa si se convierte en SaaS

## Nota Importante

Separar productos comercialmente no significa agregar multiempresa ahora. Primero conviene mantener la app actual estable y modular. La etapa SaaS debe planificarse aparte.
