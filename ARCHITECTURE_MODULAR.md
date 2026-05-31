# Arquitectura Modular AndiCars

## Objetivo

AndiCars sigue siendo una sola aplicacion Next.js, con una sola base Supabase y un solo deploy en Vercel.

La separacion en `modules/` no convierte el proyecto en SaaS ni lo divide en varios repositorios. Solo ordena el codigo para que cada area del negocio tenga su propio lugar.

## Por que separar en modulos

Separar por modulos ayuda a:

- encontrar mas rapido donde vive cada parte del sistema
- evitar que `components/` y `lib/` crezcan sin orden
- preparar el proyecto para vender o activar partes en el futuro
- mantener `app/` como capa de rutas de Next.js
- reducir el riesgo de tocar una seccion y romper otra

## Capas actuales

`app/`

Rutas de Next.js. No deberia contener logica de negocio pesada. Importa componentes desde `modules/`.

`modules/`

Codigo organizado por dominio: stock, CRM, gastos, ventas, reportes, configuracion, usuarios y web publica.

`lib/`

Infraestructura compartida: Supabase, formatos y helpers genericos.

`database/`

SQL de Supabase. En esta etapa no se cambiaron reglas RLS ni se agrego multiempresa.

`types/`

Compatibilidad temporal. Los tipos especificos ya empiezan a vivir dentro de cada modulo.

## Modulos actuales

Core

Base comun: permisos, roles, guardas de acceso, header, dashboard y registro de modulos.

Vehicles

Stock de vehiculos, alta/edicion, fotos, estados, filtros, catalogo publico y queries de vehiculos.

CRM

Consultas, leads, notas internas, prioridades, proximos contactos, cierres y reactivaciones.

Expenses

Gastos por vehiculo, categorias, monedas y calculos de inversion.

Sales

Reservas, senas, ventas, entregas, cancelaciones y saldos.

Reports

Resumen de stock, inversion, gastos, ventas y rentabilidad.

Settings

Datos generales, WhatsApp, email, zona y proteccion anti-spam.

Users

Usuarios internos, apodos, roles y accesos del panel.

Public Site

Inicio, datos publicos, CTA y componentes publicos que no pertenecen solamente al stock.

Documents

Placeholder futuro para documentacion vehicular.

Trade-ins

Placeholder futuro para permutas.

## Modulo interno vs producto vendible

Un modulo interno es una carpeta tecnica dentro de la misma app.

Un producto vendible seria una combinacion comercial de modulos. Por ejemplo, vender solo CRM o vender CRM + stock. Eso todavia no esta implementado como plan comercial ni como SaaS.

## Preparacion para SaaS futuro

Cuando llegue el momento de convertir AndiCars en multiempresa, habria que sumar otra etapa:

- tabla `companies`
- columna `company_id` en tablas principales
- tabla `company_modules`
- permisos por empresa
- planes comerciales
- RLS por empresa
- configuraciones por empresa
- migracion cuidada de datos actuales

Eso no se implementa en esta etapa para no romper la base actual.

