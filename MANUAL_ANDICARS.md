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

Agrega roles internos. En la base se guardan como `owner`, `manager`, `seller` y `operator`, pero en el panel se ven en espanol.

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

Permite que un usuario Dueno administre usuarios internos desde el panel.

```text
database/vehicle-current-location.sql
```

Agrega el campo `Ubicacion actual` a cada vehiculo para saber en que agencia, deposito o sucursal se encuentra.

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
- ver una vista previa de las fotos antes de guardar
- cargar ubicacion actual del vehiculo
- publicar u ocultar autos
- cambiar estado
- eliminar autos
- buscar, filtrar y ordenar el stock cargado

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

Controles utiles:

- `Buscar`: encuentra autos por marca, modelo, version o año.
- `Ubicacion`: filtra autos por agencia, sucursal, deposito o zona escrita en `Ubicacion actual`.
- `Estado`: filtra por disponible, reservado, vendido, etc.
- `Publicacion`: filtra publicados, ocultos, visibles en catalogo, no visibles, sin foto o sin precio compra.
- `Orden`: ordena por mas nuevos, precio mayor, precio menor o estado.

Mientras cargas o editas un vehiculo, el panel muestra `Cambios sin guardar`.
Si intentas editar otro auto sin guardar primero, aparece una alerta para confirmar.

Campos importantes:

- Precio compra USD es interno. Sirve para reportes y rentabilidad; no aparece en la web publica.
- Solo el usuario Dueno puede ver o editar el Precio compra USD desde el panel.
- El usuario Dueno ve una alerta si algun auto no tiene precio de compra cargado.
- Ubicacion actual es interna. Sirve para saber donde esta fisicamente el vehiculo y para filtrar el stock del panel.
- Marca, modelo, año, kilometraje y precio publicado son datos obligatorios. Si falta alguno, el campo queda marcado en rojo antes de guardar.
- Año, kilometraje y precio tienen que ser numeros validos. El año debe quedar dentro de un rango realista.
- La foto principal se usa en el catalogo.
- Las fotos adicionales se ven dentro de la ficha del auto.

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
- marca, modelo, version y año
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
- agregar historial de notas internas
- filtrar y buscar
- abrir WhatsApp directo al cliente
- cerrar rapido una consulta como No responde o Perdido
- reactivar una consulta cerrada
- cargar prioridad del cliente
- programar proximo contacto
- cargar motivo de perdida

Estados de consultas:

- Nuevo
- Contactado
- Interesado
- No responde
- Negociando
- Reservo
- Compro
- Cerrado
- Descartado

Las notas internas no se muestran al cliente. Para guardar una nota, escribila en `Agregar nota interna` y toca `Agregar nota`. Las notas quedan como historial con fecha, asi no se pisa informacion anterior.

Si hubo un error en una nota, toca `Editar`, cambia el texto y luego `Guardar`. El boton `Eliminar` solo lo ve el rol Dueno.

Los botones `No responde`, `Perdido` y `Reactivar` cambian el estado y ademas agregan una nota automatica al historial para saber cuando se uso esa accion. Esas notas automaticas no se editan.

Cada nota muestra quien la agrego. Si una consulta esta en `No responde` o `Perdido`, no se pueden agregar notas nuevas hasta tocar `Reactivar`.

Si una nota manual se edita, queda visible quien la edito y cuando.

Cada consulta aparece cerrada como resumen. Toca `Ver detalle` para desplegar datos, notas y acciones.

La prioridad sirve para ordenar a quien contactar primero. El proximo contacto sirve para saber que clientes hay que llamar hoy o cuales quedaron vencidos.

Si una consulta se marca como `Perdido`, conviene cargar el motivo: precio, compro otro, no responde, no califica, auto vendido u otro.

El panel muestra alertas visuales de seguimiento:

- Vencidas: fecha de contacto anterior a hoy.
- Para hoy: fecha de contacto del dia actual.
- Sin fecha: consultas abiertas sin proximo contacto.

Las consultas se ordenan automaticamente poniendo primero las vencidas, despues las de hoy, luego las proximas y al final las que no tienen fecha.

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

Roles visibles en el panel:

- Dueno: ve todo y administra usuarios/configuracion.
- Encargado: vehiculos, consultas, gastos, ventas y reportes.
- Vendedor: vehiculos, consultas y ventas.
- Operador: vehiculos y consultas.

Nota tecnica: Supabase guarda esos roles como `owner`, `manager`, `seller` y `operator`. No pasa nada; es normal. La web los muestra en espanol.

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

Desde ahi un Dueno puede:

- ver usuarios internos
- cargar un apodo visible
- cargar el email visible
- cambiar rol
- quitar acceso al panel

El apodo es el nombre que se muestra en la barra superior del panel. El email queda como referencia interna.

Para evitar errores, los usuarios existentes no se editan directo: primero hay que tocar `Editar`, luego `Guardar` o `Cancelar`.

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
