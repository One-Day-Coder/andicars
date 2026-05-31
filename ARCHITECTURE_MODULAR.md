# Arquitectura Modular AndiCars

## Objetivo

AndiCars sigue siendo una sola aplicacion Next.js, con una sola base Supabase y un solo deploy en Vercel.

La carpeta `modules/` ordena el codigo por areas del negocio. No implementa SaaS, multiempresa, planes pagos ni tablas `companies`.

## Capas actuales

`app/`

Solo rutas de Next.js. Las paginas deben ser delgadas y consumir componentes/servicios desde `modules/`.

`modules/`

Codigo organizado por dominio. Cada modulo es dueño de sus componentes, tipos, constantes, queries y servicios.

`lib/`

Infraestructura compartida: clientes Supabase, formateadores y helpers genericos. No debe contener logica especifica de vehiculos, CRM, ventas, gastos o usuarios.

`database/`

Scripts SQL de Supabase. En esta etapa no se cambiaron reglas RLS ni se agrego multiempresa.

`components/`

Carpeta neutralizada. No contiene componentes activos de dominio, solo un README para recordar que los componentes activos viven en `modules/`.

`types/`

Reservado para tipos globales reales. Los tipos de dominio viven dentro de cada modulo.

## Modulos actuales

`modules/core`

Permisos, roles, guardas de acceso, header, resumen inicial y registro de modulos.

`modules/vehicles`

Stock, alta/edicion de autos, fotos, estados, filtros, catalogo publico, ficha del auto y queries de vehiculos.

`modules/crm`

Consultas, leads, notas internas, prioridades, proximos contactos, cierres, reactivaciones y formulario de consulta.

`modules/expenses`

Gastos por vehiculo, categorias, monedas, filtros y calculos de inversion.

`modules/sales`

Reservas, senas, ventas, entregas, cancelaciones y saldos.

`modules/reports`

Resumen de stock, inversion, gastos, ventas y rentabilidad.

`modules/settings`

Datos generales, WhatsApp, email, zona/direccion, mensaje automatico y anti-spam.

`modules/users`

Usuarios internos, apodos, roles y accesos.

`modules/public-site`

Componentes publicos generales: contacto, WhatsApp y piezas comerciales no exclusivas de vehiculos.

`modules/documents`

Placeholder futuro para documentacion vehicular.

`modules/trade-ins`

Placeholder futuro para permutas.

## Como Trabajar Por Modulo

Si el cambio es de CRM, revisar primero `modules/crm`.

Si el cambio es de vehiculos, revisar primero `modules/vehicles`.

Si el cambio es de gastos, revisar primero `modules/expenses`.

Si el cambio es de ventas, revisar primero `modules/sales`.

Si el cambio es de reportes, revisar primero `modules/reports`.

Si el cambio es de permisos, login, roles o navegacion, revisar `modules/core`.

Si el cambio es de configuracion editable, revisar `modules/settings`.

Si el cambio es de usuarios internos, revisar `modules/users`.

Si el cambio es de textos publicos, contacto o home comercial, revisar `modules/public-site`.

No agregar componentes de dominio en `components/`. Esa carpeta queda solo como aviso historico para evitar duplicados entre la arquitectura vieja y la modular.

## Reglas De Imports

- `app/` puede importar desde `modules/` y desde `lib/` para infraestructura.
- `modules/*` puede importar desde `lib/` solo infraestructura generica.
- `modules/*` puede importar desde `modules/core` para roles y permisos.
- `modules/crm` no debe depender obligatoriamente de `modules/vehicles`.
- `modules/vehicles` no debe depender de `modules/crm`.
- `modules/reports` puede leer de varios modulos porque consolida informacion.
- `lib/` no debe importar desde modulos de dominio.
- Evitar dependencias circulares.

## Preparacion Para SaaS Futuro

Cuando llegue el momento de convertir AndiCars en multiempresa, habria que hacer otra etapa separada:

- tabla `companies`
- columna `company_id` en tablas principales
- tabla `company_modules`
- permisos por empresa
- planes comerciales
- RLS por empresa
- configuraciones por empresa
- migracion cuidada de datos actuales

Eso no se implementa en esta etapa para no tocar la base actual.
