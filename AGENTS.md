# AGENTS.md — AndiCars

Guía de trabajo para Codex sobre el repositorio AndiCars.

> Este archivo es la fuente de verdad para Codex.  
> Si una tarea contradice algo de este archivo, Codex debe frenar, avisar y pedir confirmación antes de modificar archivos.

---

## 1. Qué es AndiCars

AndiCars es una aplicación para una agencia de compra/venta de autos.

Incluye:

- Web pública.
- Catálogo de vehículos.
- Ficha individual de cada vehículo.
- Panel interno.
- Stock de vehículos.
- CRM / consultas.
- Gastos.
- Ventas.
- Reportes.
- Configuración.
- Usuarios.

La app actual usa:

- Next.js.
- TypeScript.
- Supabase.
- PostgreSQL.
- Vercel.

La app sigue siendo:

- Una sola aplicación Next.js.
- Una sola base Supabase.
- Un solo deploy.
- Un proyecto modular organizado dentro de `modules/`.

---

## 2. Estado actual importante

El proyecto ya fue limpiado y modularizado.

Estado esperado:

```txt
components/
└── README.md
```

```txt
lib/
├── format.ts
└── supabase/
    ├── client.ts
    └── server.ts
```

```txt
types/
└── README.md
```

No recrear archivos viejos como:

```txt
components/VehicleForm.tsx
components/LeadsPanel.tsx
components/SalesPanel.tsx
components/ReportsPanel.tsx
components/SiteHeader.tsx
lib/admin-permissions.ts
lib/vehicle-queries.ts
lib/demo-data.ts
types/vehicle.ts
```

Si una tarea necesita algo parecido, usar el módulo correcto dentro de `modules/`.

---

## 3. Stack

- Next.js 14.
- React 18.
- TypeScript.
- Supabase.
- PostgreSQL.
- ESLint con configuración de Next.js.
- Alias de imports: `@/*` apunta a la raíz del proyecto.

Ejemplos correctos:

```ts
import { VehicleForm } from "@/modules/vehicles";
import { LeadsPanel } from "@/modules/crm";
import { AdminGuard } from "@/modules/core";
import { createClient } from "@/lib/supabase/server";
```

Ejemplos prohibidos:

```ts
import { VehicleForm } from "@/components/VehicleForm";
import { Vehicle } from "@/types/vehicle";
import { getPublicVehicles } from "@/lib/vehicle-queries";
import { canAccessModule } from "@/lib/admin-permissions";
```

---

## 4. Comandos básicos

Para instalar:

```bash
npm install
```

Para desarrollo:

```bash
npm run dev
```

Para validar:

```bash
npm run lint
npm run build
```

En Windows/PowerShell, si `npm` falla por política de ejecución, usar:

```bash
npm.cmd run lint
npm.cmd run build
```

Eso se considera equivalente para validar el proyecto.

---

## 5. Regla principal: trabajar por módulos

Codex debe trabajar siempre por módulo.

No debe recorrer ni modificar todo el proyecto si la tarea pertenece a un área específica.

### CRM

Todo lo relacionado con consultas, leads, clientes/interesados, notas, prioridades, estados y seguimiento vive en:

```txt
modules/crm
```

Rutas relacionadas:

```txt
/admin/consultas
```

### Vehículos / stock / catálogo

Todo lo relacionado con carga de autos, edición, fotos, estados, filtros, catálogo público y ficha de vehículo vive en:

```txt
modules/vehicles
```

Rutas relacionadas:

```txt
/admin/vehiculos
/autos
/autos/[id]
```

### Gastos

Todo lo relacionado con gastos por vehículo, categorías, monedas, filtros y cálculos de inversión vive en:

```txt
modules/expenses
```

Ruta relacionada:

```txt
/admin/gastos
```

### Ventas

Todo lo relacionado con reservas, señas, ventas, entregas, cancelaciones y saldos vive en:

```txt
modules/sales
```

Ruta relacionada:

```txt
/admin/ventas
```

### Reportes

Todo lo relacionado con métricas, dashboard, stock, inversión, gastos, ventas y rentabilidad vive en:

```txt
modules/reports
```

Ruta relacionada:

```txt
/admin/reportes
```

`reports` puede leer datos de varios módulos, pero no debe modificar la lógica interna de otros módulos salvo autorización explícita.

### Configuración

Todo lo relacionado con datos generales de la agencia, WhatsApp, email, dirección, mensajes automáticos y anti-spam vive en:

```txt
modules/settings
```

Ruta relacionada:

```txt
/admin/configuracion
```

### Usuarios

Todo lo relacionado con usuarios internos, roles, apodos y accesos vive en:

```txt
modules/users
```

Ruta relacionada:

```txt
/admin/usuarios
```

### Core

Todo lo transversal vive en:

```txt
modules/core
```

Incluye:

- Permisos.
- Roles.
- Guards.
- Header.
- Navegación admin.
- Registro de módulos.
- Tipos core.

Rutas relacionadas:

```txt
/admin
/login
/actualizar-contrasena
```

### Web pública general

Todo lo público general que no sea específicamente ficha/catálogo de vehículo vive en:

```txt
modules/public-site
```

Ruta relacionada:

```txt
/
```

### Documentación vehicular

Módulo futuro:

```txt
modules/documents
```

No implementar salvo pedido explícito.

### Permutas

Módulo futuro:

```txt
modules/trade-ins
```

No implementar salvo pedido explícito.

---

## 6. Reglas de carpetas

### `app/`

`app/` contiene rutas de Next.js.

Las páginas deben ser delgadas.

Permitido:

- Importar componentes desde `modules/`.
- Importar servicios desde `modules/`.
- Importar infraestructura desde `lib/`.

No permitido:

- Poner lógica pesada de negocio.
- Duplicar lógica que ya vive en un módulo.

### `modules/`

Cada módulo es dueño de:

- `components/`
- `services/`
- `queries.ts`
- `types.ts`
- `constants.ts`
- `index.ts`
- `README.md`

No mezclar lógica de un módulo en otro.

### `lib/`

`lib/` es solo infraestructura compartida.

Permitido:

```txt
lib/format.ts
lib/supabase/client.ts
lib/supabase/server.ts
```

No permitido:

```txt
lib/admin-permissions.ts
lib/vehicle-queries.ts
lib/demo-data.ts
```

### `components/`

`components/` está neutralizado.

No crear nuevos componentes activos ahí.

Los componentes activos viven en `modules/`.

### `types/`

`types/` está reservado solo para tipos globales reales.

Los tipos de dominio viven dentro de cada módulo:

```txt
modules/vehicles/types.ts
modules/crm/types.ts
modules/sales/types.ts
modules/expenses/types.ts
modules/core/types.ts
```

### `database/`

`database/` es zona sensible.

No tocar SQL, tablas, funciones, triggers, policies ni RLS salvo autorización explícita.

### `legacy/`

`legacy/` contiene la versión vieja estática.

No modificar.
No importar.
No revivir código de ahí.

---

## 7. Reglas de imports

Permitido:

- `app/` puede importar de `modules/` y de `lib/`.
- `modules/*` puede importar de `lib/` solo infraestructura genérica.
- `modules/*` puede importar de `modules/core` para permisos, roles o tipos transversales.
- `modules/reports` puede leer varios módulos.

No permitido:

- `modules/crm` no debe depender obligatoriamente de `modules/vehicles`.
- `modules/vehicles` no debe depender de `modules/crm`.
- `lib/` no debe importar módulos de dominio.
- No crear dependencias circulares.
- No recrear imports hacia `@/components`.
- No recrear imports hacia `@/types/vehicle`.
- No recrear imports hacia `@/lib/admin-permissions`.
- No recrear imports hacia `@/lib/vehicle-queries`.
- No recrear imports hacia `@/lib/demo-data`.

---

## 8. Multiempresa

AndiCars todavía NO es multiempresa.

No agregar sin autorización explícita:

```txt
companies
company_id
company_modules
tenant_id
plans
subscriptions
```

No modificar RLS para multiempresa sin autorización explícita.

Si el usuario pide multiempresa, primero crear un plan técnico por etapas y esperar aprobación antes de modificar código o SQL.

---

## 9. RLS, Supabase y base de datos

No modificar:

```txt
database/
```

salvo que el usuario lo pida explícitamente.

No ejecutar scripts SQL sin explicar primero:

- Qué hacen.
- Qué tablas tocan.
- Qué políticas/RLS modifican.
- Si son reversibles o no.

No tocar datos reales sin confirmación.

---

## 10. Seguridad

No commitear:

```txt
.env
.env.local
.env.production
claves Supabase privadas
tokens
contraseñas
secretos
```

Solo se permite versionar ejemplos como:

```txt
.env.example
```

si no contienen secretos reales.

---

## 11. Reglas para tareas

Cada tarea debe ser pequeña y concreta.

Antes de modificar, Codex debe identificar:

1. Módulo principal.
2. Archivos que planea tocar.
3. Archivos que no debe tocar.
4. Si necesita SQL/RLS o no.

Si una tarea es ambigua, preguntar antes de modificar.

No mezclar en una misma tarea:

- CRM.
- Ventas.
- SQL.
- Reportes.
- Estilos.
- Refactor global.

Dividir en tareas separadas.

---

## 12. Validaciones obligatorias

Después de cualquier cambio de código:

```bash
npm run lint
npm run build
```

En Windows/PowerShell, si hace falta:

```bash
npm.cmd run lint
npm.cmd run build
```

Si se tocan imports, arquitectura o módulos, ejecutar también:

```bash
grep -R "@/components" app modules lib types components --exclude-dir=node_modules || true
grep -R "@/types/vehicle" app modules lib types components --exclude-dir=node_modules || true
grep -R "@/lib/admin-permissions" app modules lib types components --exclude-dir=node_modules || true
grep -R "@/lib/vehicle-queries" app modules lib types components --exclude-dir=node_modules || true
grep -R "@/lib/demo-data" app modules lib types components --exclude-dir=node_modules || true
```

Resultado esperado:

- No debe aparecer ningún import viejo.

---

## 13. Rutas que deben seguir funcionando

No cambiar estas rutas sin autorización explícita:

```txt
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

---

## 14. Resultado esperado al terminar una tarea

Codex debe responder con:

1. Qué se hizo.
2. Archivos modificados.
3. Archivos creados.
4. Archivos eliminados.
5. Módulos tocados.
6. Comandos ejecutados.
7. Resultado de `npm run lint`.
8. Resultado de `npm run build`.
9. Riesgos pendientes.
10. Confirmación de que no se tocó SQL/RLS, salvo que la tarea lo pidiera.
11. Confirmación de que no se recrearon archivos viejos.
12. Próximo paso recomendado.

---

## 15. Checklist antes de cerrar una tarea

Antes de cerrar:

- [ ] La tarea tocó solo el módulo correspondiente.
- [ ] No se tocó `database/` salvo autorización.
- [ ] No se modificó RLS salvo autorización.
- [ ] No se recreó `components/` con componentes activos.
- [ ] No se recreó `types/vehicle.ts`.
- [ ] No se recreó `lib/admin-permissions.ts`.
- [ ] No se recreó `lib/vehicle-queries.ts`.
- [ ] No se recreó `lib/demo-data.ts`.
- [ ] `npm run lint` pasó.
- [ ] `npm run build` pasó.
- [ ] Las rutas principales siguen iguales.

---

## 16. Documentación de referencia

Leer según la tarea:

- `README.md` — resumen e instalación.
- `ARCHITECTURE_MODULAR.md` — arquitectura modular.
- `PRODUCT_MODULES.md` — productos futuros.
- `MODULARIZATION_AUDIT.md` — estado de limpieza/modularización.
- `ROADMAP_ANDICARS.md` — próximos pasos del proyecto.
- `MANUAL_ANDICARS.md` — uso del sistema.
- `PASO_A_PASO.md` — guía operativa.

---

## 17. Regla final

Priorizar estabilidad sobre velocidad.

No hacer refactors grandes sin autorización.

No tocar SQL/RLS sin autorización.

No implementar multiempresa sin plan aprobado.

Trabajar por módulo, con cambios chicos, validables y fáciles de revisar.
