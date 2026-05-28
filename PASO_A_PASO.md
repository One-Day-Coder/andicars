# AndiCars - paso a paso

Modulo nuevo agregado: para activar ventas, reservas y senas, ejecutar `database/sales.sql` y luego entrar a `http://localhost:3000/admin/ventas`.

Esta guia es para avanzar sin conocimientos previos.

## 1. Que acabamos de preparar

Ahora el proyecto tiene una base moderna con:

- Next.js: la tecnologia de la web.
- Supabase: la base de datos, usuarios y fotos.
- Web publica: inicio, catalogo y ficha del auto.
- Panel interno: inicio de panel y carga de vehiculos.
- SQL inicial: tablas `vehicles`, `vehicle_photos`, `leads` y `admin_users`.

La web vieja sigue estando en los archivos `index.html` y `admin.html`.
La app nueva usa la carpeta `app/`.

## 2. Instalar lo necesario

Primero tenes que instalar Node.js.

1. Entra a https://nodejs.org/
2. Descarga la version LTS.
3. Instalala con las opciones por defecto.
4. Cierra y vuelve a abrir la terminal o Codex.

Despues, en esta carpeta del proyecto, ejecuta:

```bash
npm install
```

Y para prender la web:

```bash
npm run dev
```

Cuando eso funcione, vas a abrir:

```text
http://localhost:3000
```

## 3. Crear Supabase

1. Entra a https://supabase.com/
2. Crea una cuenta.
3. Crea un proyecto nuevo.
4. Guarda la password de la base de datos en un lugar seguro.
5. Espera a que Supabase termine de crear el proyecto.

## 4. Crear las tablas

En Supabase:

1. Anda a SQL Editor.
2. Toca New query.
3. Copia todo el contenido de `database/schema.sql`.
4. Pegalo ahi.
5. Toca Run.

Eso crea las tablas iniciales.

## 5. Crear tu usuario admin

En Supabase:

1. Anda a Authentication.
2. Crea un usuario con tu email y contrasena.
3. Abri ese usuario y copia su `User UID`.
4. Anda a SQL Editor.
5. Ejecuta esto cambiando `PEGAR_UID_AQUI` por tu UID:

```sql
insert into public.admin_users (user_id)
values ('PEGAR_UID_AQUI');
```

Ese paso le dice al sistema que vos sos administrador.

## 6. Conectar la web con Supabase

En Supabase:

1. Anda a Project Settings.
2. Entra a API.
3. Copia `Project URL`.
4. Copia `anon public key`.

En el proyecto:

1. Crea un archivo llamado `.env.local`.
2. Copia esto adentro:

```bash
NEXT_PUBLIC_SUPABASE_URL=PEGAR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=PEGAR_ANON_PUBLIC_KEY
```

3. Reemplaza los valores por los de Supabase.
4. Reinicia la web con `npm run dev`.

## 7. Probar carga de vehiculos

1. Abri `http://localhost:3000/login`.
2. Entra con el usuario que creaste en Supabase.
3. Anda a `http://localhost:3000/admin/vehiculos`.
4. Carga un auto.
5. Marca `Publicar en la web`.
6. Pone estado `Disponible`.
7. Guarda.
8. Abri `http://localhost:3000/autos`.

El auto deberia aparecer en el catalogo publico.

## 8. Que hacemos despues

Cuando esto funcione, el orden recomendado es:

1. Editar y eliminar vehiculos.
2. Subir fotos a Supabase Storage.
3. Formulario de consultas conectado a `leads`.
4. CRM basico.
5. Gastos por vehiculo.
6. Ventas, senas y documentacion.

## 9. Activar fotos de vehiculos

Para subir fotos desde el panel:

1. En Supabase, anda a SQL Editor.
2. Toca New query.
3. Copia todo el contenido de `database/storage.sql`.
4. Pegalo y toca Run.
5. Reinicia la web con `npm run dev`.
6. Anda a `http://localhost:3000/admin/vehiculos`.
7. Edita un vehiculo.
8. En `Foto principal`, elegi una imagen JPG, PNG o WEBP.
9. Toca `Guardar cambios`.
10. Revisa `http://localhost:3000/autos`.

La foto deberia aparecer en la tarjeta del catalogo.

## 10. Probar consultas de clientes

1. Anda a `http://localhost:3000/autos`.
2. Entra a la ficha de un auto con `Ver ficha`.
3. Completa el formulario `Consultar por este auto`.
4. Toca `Enviar consulta`.
5. Anda a `http://localhost:3000/admin/consultas`.
6. La consulta deberia aparecer en el panel.
7. Cambia el estado, por ejemplo de `Nuevo` a `Contactado`.

Eso guarda interesados en la tabla `leads`.

## 11. Probar proteccion del panel

1. En el panel, toca `Cerrar sesion`.
2. Intenta entrar a `http://localhost:3000/admin`.
3. Deberia mandarte a `http://localhost:3000/login`.
4. Entra con tu email y contrasena.
5. Deberias volver a ver el panel interno.

## 12. Activar notas internas en consultas

1. En Supabase, anda a SQL Editor.
2. Toca New query.
3. Copia todo el contenido de `database/leads-notes.sql`.
4. Pegalo y toca Run.
5. Reinicia la web con `npm run dev`.
6. Entra a `http://localhost:3000/admin/consultas`.
7. Escribi una nota interna en una consulta.
8. Toca `Guardar nota`.

## 13. Activar gastos por vehiculo

1. En Supabase, anda a SQL Editor.
2. Toca New query.
3. Copia todo el contenido de `database/vehicle-expenses.sql`.
4. Pegalo y toca Run.
5. Reinicia la web con `npm run dev`.
6. Entra a `http://localhost:3000/admin/gastos`.
7. Selecciona un vehiculo.
8. Carga categoria, fecha, monto, moneda y detalle.
9. Toca `Guardar gasto`.

## 14. Activar roles internos

1. En Supabase, anda a SQL Editor.
2. Toca New query.
3. Copia todo el contenido de `database/user-roles.sql`.
4. Pegalo y toca Run.
5. Reinicia la web con `npm run dev`.

Roles iniciales:

- `owner`: dueño, ve todo.
- `manager`: encargado, puede ver finanzas.
- `seller`: vendedor, para ventas y consultas.
- `operator`: carga operativa.
