# AndiCars

Modulo nuevo agregado: para activar ventas, reservas y senas, ejecutar `database/sales.sql` y luego entrar a `http://localhost:3000/admin/ventas`.

Sitio web y base inicial para una agencia de compra y venta de autos.

La base nueva esta preparada con Next.js + Supabase.
Lee primero `PASO_A_PASO.md`.

## Web vieja

Abri `index.html` con doble clic en el navegador. No necesita instalar nada.

## App nueva

Cuando tengas Node.js instalado:

```bash
npm install
npm run dev
```

Despues abri:

```text
http://localhost:3000
```

## Como cargar vehiculos

1. Abri `admin.html`.
2. Completa los datos del vehiculo.
3. Toca `Guardar vehiculo`.
4. Volve a `index.html` y el catalogo va a mostrar lo cargado.

Importante: por ahora los datos se guardan en el navegador de esta computadora.
Para publicarlo en internet y cargar desde cualquier lugar, el siguiente paso es
conectarlo a una base de datos real como Supabase o Firebase.

En la app nueva, el panel sera:

```text
http://localhost:3000/admin/vehiculos
```

## Fotos de vehiculos

Para activar subida de fotos en Supabase, ejecutar:

```text
database/storage.sql
```

## Consultas

Las consultas entran desde la ficha de cada auto y se ven en:

```text
http://localhost:3000/admin/consultas
```

## Gastos

Para activar gastos por vehiculo en Supabase, ejecutar:

```text
database/vehicle-expenses.sql
```

Luego usar:

```text
http://localhost:3000/admin/gastos
```

## Roles internos

Para preparar permisos de usuarios, ejecutar:

```text
database/user-roles.sql
```

## Donde cambiar cosas importantes

- `script.js`: autos del catalogo, precios, kilometraje y telefono de WhatsApp.
- `admin.html` y `admin.js`: panel de carga de vehiculos.
- `index.html`: textos principales, correo, telefono visible y secciones.
- `styles.css`: colores, tamanos y diseno.
- `assets/hero-andicars.png`: imagen principal del sitio.

## Siguientes datos que conviene definir

- Telefono real de WhatsApp.
- Email real.
- Direccion o zona de atencion.
- Stock real de autos con fotos.
- Logo final de AndiCars si ya existe.
