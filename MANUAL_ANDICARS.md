# Manual AndiCars

Este archivo resume lo que fuimos agregando al sistema y como usar cada parte.
La idea es que no dependas de recordar todo de memoria.

## 1. Direcciones importantes

Local, en tu computadora:

```text
http://localhost:3000
```

Web publicada en Vercel:

```text
https://andicars.vercel.app
```

Login del panel:

```text
/login
```

Panel interno:

```text
/admin
```

## 2. Tecnologias usadas

- Next.js: estructura de la web.
- Supabase: base de datos, usuarios, login y fotos.
- GitHub: respaldo del codigo.
- Vercel: publicacion online.

Importante:

- GitHub guarda el codigo.
- Supabase guarda los datos reales: autos, usuarios, consultas, fotos, gastos, ventas y configuracion.
- Vercel publica la web usando el codigo de GitHub.
- `.env.local` no se sube a GitHub porque contiene claves.

## 3. Archivos SQL que se ejecutan en Supabase

Estos archivos estan en la carpeta `database/`.

```text
database/schema.sql
```

Crea la base principal: vehiculos, fotos, consultas, usuarios admin, gastos, ventas y configuracion.

```text
database/storage.sql
```

Activa el bucket para subir fotos de vehiculos.

```text
database/leads-notes.sql
```

Agrega notas internas para consultas.

```text
database/vehicle-expenses.sql
```

Agrega gastos por vehiculo.

```text
database/user-roles.sql
```

Agrega roles internos: owner, manager, seller y operator.

```text
database/sales.sql
```

Agrega ventas, reservas, senas y entregas.

```text
database/app-settings.sql
```

Agrega configuracion del panel: WhatsApp, email, zona y anti-spam.

```text
database/admin-users-management.sql
```

Permite que un usuario `owner` administre usuarios internos desde el panel.

## 4. Vehiculos

Ruta:

```text
/admin/vehiculos
```

Sirve para:

- cargar autos
- editar autos
- subir foto principal
- subir fotos adicionales
- publicar u ocultar autos
- cambiar estado
- eliminar autos

Estados disponibles:

- En preparacion
- Disponible
- Reservado
- Senado
- Vendido
- Entregado

Cuando aparece en la web publica:

- debe estar marcado como `Publicado`
- debe estar en estado `Disponible` o `Reservado`

Si esta oculto, vendido, entregado o en preparacion, no aparece en el catalogo publico.

## 5. Catalogo publico

Ruta:

```text
/autos
```

Muestra los autos publicados.

Cada tarjeta permite entrar a la ficha del auto.

## 6. Ficha del auto

Ruta de ejemplo:

```text
/autos/ID_DEL_AUTO
```

Muestra:

- galeria de fotos
- marca, modelo, version y anio
- precio
- kilometraje
- tipo, transmision y combustible
- descripcion
- boton de WhatsApp
- formulario de consulta

El boton de WhatsApp usa el numero configurado en:

```text
/admin/configuracion
```

## 7. Consultas de clientes

Ruta:

```text
/admin/consultas
```

Las consultas llegan desde el formulario de cada ficha de auto.

En el panel podes:

- ver datos del cliente
- ver por que auto consulto
- cambiar estado
- escribir notas internas
- filtrar y buscar

Estados de consultas:

- Nuevo
- Contactado
- Interesado
- Negociando
- Reservo
- Compro
- Perdido

Las notas internas no se muestran al cliente.

## 8. Anti-spam de consultas

Ruta:

```text
/admin/configuracion
```

La proteccion anti-spam se puede activar o desactivar.

Si esta desactivada:

- cualquier persona puede enviar consultas libremente
- es lo mejor para testear la web con conocidos

Si esta activada:

- bloquea consultas repetidas de la misma persona por el mismo auto
- permite consultar por otros autos
- usa telefono y email para detectar repetidos
- respeta la cantidad de horas configurada

Ejemplo con 24 horas:

- Juan consulta por Toyota Yaris hoy a las 10:00.
- Si vuelve a consultar por el mismo Toyota a las 10:15, se bloquea.
- Si consulta por una Ford Maverick a las 10:15, se permite.
- Si vuelve manana por el Toyota, se permite.

Recomendacion:

- Para pruebas: desactivado.
- Para uso real: activado con 24 horas.

## 9. Gastos

Ruta:

```text
/admin/gastos
```

Sirve para cargar gastos asociados a cada vehiculo.

Datos que se cargan:

- vehiculo
- categoria
- fecha
- monto
- moneda: ARS o USD
- detalle

Tambien tiene filtros:

- buscar texto
- vehiculo
- categoria
- moneda
- desde
- hasta

El panel calcula:

- total en ARS
- total en USD
- total convertido a USD
- resumen por vehiculo
- margen o ganancia

El tipo de dolar se carga en esa pantalla y se guarda en el navegador.

## 10. Ventas, reservas y senas

Ruta:

```text
/admin/ventas
```

Sirve para registrar una operacion comercial.

Datos que se cargan:

- vehiculo
- cliente
- telefono
- email
- estado de operacion
- precio acordado en USD
- sena o anticipo en USD
- fecha
- fecha de entrega
- forma de pago
- notas

Estados:

- Reservado
- Senado
- Vendido
- Entregado
- Cancelado

Cuando cargas una operacion como Reservado, Senado, Vendido o Entregado, tambien cambia el estado del vehiculo.

Calcula:

- total acordado
- senas cobradas
- saldo pendiente

## 11. Reportes

Ruta:

```text
/admin/reportes
```

Muestra una vista general del negocio.

Incluye:

- cantidad de vehiculos
- publicados y ocultos
- stock activo
- reservados o senados
- vendidos
- inversion de compra
- valor publicado del stock
- gastos totales
- ventas y reservas
- senas cobradas
- saldo pendiente
- ganancia real
- resultado proyectado

Ganancia real:

- usa operaciones cargadas en ventas.

Resultado proyectado:

- usa ventas reales cuando existen
- usa precio publicado cuando todavia no hay venta

## 12. Configuracion

Ruta:

```text
/admin/configuracion
```

Permite cambiar sin tocar codigo:

- nombre visible de la agencia
- email de contacto
- numero de WhatsApp
- zona o direccion
- mensaje automatico de WhatsApp
- anti-spam de consultas
- horas de bloqueo del anti-spam

Formato recomendado para WhatsApp:

```text
549XXXXXXXXXX
```

Sin espacios, sin guiones y con codigo de pais.

El mensaje de WhatsApp puede usar:

```text
{vehicle}
```

Ejemplo:

```text
Hola AndiCars, quiero consultar por el {vehicle}.
```

La web reemplaza `{vehicle}` por el auto real.

## 13. Usuarios admin y roles

Los usuarios se crean en:

```text
Supabase > Authentication > Users
```

Para que un usuario pueda entrar al panel, su UID debe estar en:

```text
public.admin_users
```

Roles:

- `owner`: dueno, ve todo.
- `manager`: encargado, puede ver finanzas.
- `seller`: vendedor, ventas y consultas.
- `operator`: carga operativa.

Por ahora, si queres agregar otro admin:

1. Crear usuario en Supabase Authentication.
2. Copiar su User UID.
3. Entrar a `Panel > Usuarios`.
4. Pegar su User UID, email visible y rol.

Ejemplo:

```sql
insert into public.admin_users (user_id, role)
values ('PEGAR_UID_AQUI', 'seller');
```

Tambien existe la pantalla:

```text
/admin/usuarios
```

Desde ahi un `owner` puede:

- ver usuarios internos
- cargar el email visible
- cambiar rol
- quitar acceso al panel

Por seguridad, esta pantalla no crea el usuario de login en Supabase.
Primero hay que crearlo en `Authentication > Users`.

## 14. Cambiar contrasena

Desde Supabase:

```text
Authentication > Users > usuario > Send password recovery
```

La web tiene esta pantalla:

```text
/actualizar-contrasena
```

Si el link del mail cae en la pagina principal, la web intenta redirigir automaticamente a esa pantalla.

Importante:

- Supabase limita los emails de recuperacion cuando se usa el servicio gratis/default.
- Puede bloquear despues de pocos intentos.
- Si aparece `email rate limit exceeded`, hay que esperar.
- Para produccion conviene configurar SMTP propio.

## 15. GitHub

Repositorio:

```text
https://github.com/One-Day-Coder/andicars
```

Sirve para:

- guardar respaldo del codigo
- tener historial de cambios
- conectar con Vercel

Cada vez que hacemos cambios importantes:

```bash
git add .
git commit -m "Descripcion del cambio"
git push
```

Al hacer `git push`, Vercel publica automaticamente.

## 16. Vercel

Web publicada:

```text
https://andicars.vercel.app
```

Vercel toma el codigo desde GitHub.

Variables necesarias en Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Son las mismas que usas en `.env.local`, pero cargadas en el panel de Vercel.

## 17. Recomendaciones de uso actual

Para seguir testeando:

- anti-spam desactivado
- cargar autos reales de prueba
- probar consultas desde celular
- probar WhatsApp
- probar cambios de estado
- probar ventas y senas
- revisar reportes

Antes de usar la web oficialmente:

- revisar textos comerciales
- poner WhatsApp real
- poner email real
- revisar logo y estetica
- configurar dominio propio
- configurar SMTP en Supabase
- definir usuarios admin reales
- hacer backup de datos importantes

## 18. Que falta o podria venir despues

Ideas futuras:

- modulo para administrar usuarios desde el panel
- subir documentos de vehiculos
- registrar pagos parciales
- historial de cambios por auto
- recordatorios de llamadas
- exportar reportes a Excel
- dominio propio
- diseno visual final
- SEO y redes sociales
- captcha si aparece spam real
