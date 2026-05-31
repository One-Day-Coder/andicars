# AndiCars

Sitio web y panel interno para una agencia de compra y venta de autos.

La app actual esta construida con Next.js + Supabase y se despliega en Vercel.

## Estructura Actual

- `app/`: rutas de Next.js.
- `modules/`: arquitectura modular por area del negocio.
- `lib/`: infraestructura compartida, Supabase y formateadores genericos.
- `database/`: scripts SQL de Supabase.
- `legacy/`: version vieja estatica conservada como referencia.

Para entender la arquitectura, leer `ARCHITECTURE_MODULAR.md`.

Para entender productos futuros posibles, leer `PRODUCT_MODULES.md`.

Para entender como usar el sistema, leer `MANUAL_ANDICARS.md`.

## Instalar

```bash
npm install
```

## Ejecutar En Local

```bash
npm run dev
```

Despues abrir:

```text
http://localhost:3000
```

## Validar

```bash
npm run lint
npm run build
```

## Rutas Principales

- `/`
- `/autos`
- `/autos/[id]`
- `/admin`
- `/admin/vehiculos`
- `/admin/consultas`
- `/admin/gastos`
- `/admin/ventas`
- `/admin/reportes`
- `/admin/configuracion`
- `/admin/usuarios`

## Supabase

Los scripts SQL estan en `database/`. Ejecutarlos solo cuando una mejora lo requiera y siempre revisando el archivo antes.

En esta etapa no se implemento multiempresa, no hay `companies`, no hay `company_id` y no hay planes pagos.

## Version Vieja

La version vieja HTML/JS/CSS quedo en `legacy/`. No se usa en la app actual, pero se conserva como referencia historica.
