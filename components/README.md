# components

Esta carpeta ya no contiene componentes activos del sistema.

La arquitectura actual de AndiCars usa modulos internos dentro de `modules/`.

Los componentes activos viven en:

- Core / permisos / layout admin: `modules/core`
- Vehiculos / stock / catalogo: `modules/vehicles`
- CRM / leads / consultas: `modules/crm`
- Gastos: `modules/expenses`
- Ventas: `modules/sales`
- Reportes: `modules/reports`
- Configuracion: `modules/settings`
- Usuarios: `modules/users`
- Web publica general: `modules/public-site`

No agregar nuevos componentes de dominio en esta carpeta.

Si hay que modificar algo de CRM, trabajar en `modules/crm`.
Si hay que modificar algo de vehiculos o stock, trabajar en `modules/vehicles`.
Si hay que modificar algo de gastos, trabajar en `modules/expenses`.
Si hay que modificar algo de ventas, trabajar en `modules/sales`.
Si hay que modificar algo de reportes, trabajar en `modules/reports`.
Si hay que modificar permisos, login, roles o navegacion comun, trabajar en `modules/core`.
