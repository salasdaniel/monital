# Documentacion funcional de modulos - Monital

## 1. Acceso al sistema

La aplicacion frontend es una React App. El usuario accede desde la pantalla de login y debe ingresar usuario y contrasena.

Credenciales iniciales de administrador:

- Usuario: `admin`
- Contrasena: `admin123`

El login valida:

- Usuario obligatorio.
- Contrasena obligatoria.
- Contrasena con minimo 6 caracteres en el formulario.
- Credenciales correctas contra la base de datos.
- `X-App-Key` requerido para autorizar la aplicacion frontend contra la API.

Cuando el login es correcto, el backend genera un token JWT con vigencia de 3 horas. El frontend guarda en `localStorage`:

- `access_token`
- Datos del usuario autenticado: rol, empresa, RUC, nombre, apellido, email, username.

Redireccion posterior al login:

- Rol `admin`: va a `/panel-control`.
- Rol `user`: va a `/dashboard`.

Todas las rutas principales usan `ProtectedRoute`, que permite entrar si existe token en `localStorage`. Si no hay token, redirecciona al login.

## 2. Roles y permisos generales

Roles registrados en el modelo de usuario:

- `admin`
- `user`

Existe tambien referencia visual al rol `moderator` en el menu lateral, pero el backend solo acepta `admin` y `user` al crear o editar usuarios.

Permisos funcionales por rol segun la aplicacion:

| Modulo | Admin | User |
| --- | --- | --- |
| `/panel-control` | Accede y ve informacion global del sistema | No debe acceder |
| `/empresas` | Lista, crea, edita e inactiva empresas | No debe acceder |
| `/users` | Lista, crea, edita y activa/inactiva usuarios | No debe acceder |
| `/matriculas` | Ve todas o filtra por empresa; crea, importa y edita tracker ID | Ve solo matriculas de su empresa |
| `/ventas` | Ve todas o filtra por empresa | Ve solo ventas de su empresa |
| `/ventas-detalle` | Ve todos o filtra por empresa | Ve solo detalles de su empresa |
| `/dashboard` | Puede consultar dashboard por empresa | Ve dashboard de su empresa |

Nota tecnica importante: varias restricciones de rol estan aplicadas principalmente en el frontend mediante menu, filtros y controles visibles. En backend, la validacion comun es `X-App-Key` + JWT. El endpoint `/api/dashboard/admin/` si valida explicitamente que el usuario sea `admin`; otros endpoints administrativos como empresas y usuarios no verifican explicitamente `role == admin` en la vista.

## 3. Empresas - `/empresas`

Objetivo funcional:

Registrar primero las empresas para luego poder asociar usuarios, matriculas, ventas y datos de dashboard a cada empresa.

Acceso:

- Solo administradores en la operacion funcional.
- El menu lateral muestra Empresas para `admin` y `moderator`; en el flujo definido se considera uso de `admin`.

Funciones disponibles:

- Listar empresas.
- Crear empresa.
- Editar empresa.
- Inactivar empresa.
- Buscar y paginar empresas en la vista.
- Visualizar contadores de empresas totales, activas e inactivas.

Campos principales:

- Razon social.
- Nombre comercial.
- RUC.
- Direccion.
- Correo de referencia.
- Numero de referencia.
- Estado activo/inactivo.
- Usuario creador.

Validaciones:

- `razon_social` obligatorio.
- `nombre_comercial` obligatorio.
- `ruc` obligatorio.
- `direccion` obligatorio.
- RUC unico al crear.
- Al editar, no se permite repetir el RUC de otra empresa.
- Si la empresa no existe al editar o inactivar, devuelve error.
- El backend exige `X-App-Key` y token JWT.

Comportamiento:

- Al crear una empresa queda asociada al usuario que la creo.
- Al inactivar no se elimina fisicamente; se cambia `activo = false`.
- La empresa inicial del sistema es Monital S.R.L. con RUC `80008811-5`.

## 4. Usuarios - `/users`

Objetivo funcional:

Crear los usuarios que pertenecen a una empresa para que puedan iniciar sesion y consultar informacion relacionada a esa empresa.

Acceso:

- Solo administradores en la operacion funcional.
- Los administradores son usuarios asociados a la empresa principal Monital.

Funciones disponibles:

- Listar usuarios.
- Crear usuario.
- Editar usuario.
- Activar o inactivar usuario.
- Generar contrasena aleatoria desde el formulario.
- Buscar y paginar usuarios.
- Filtrar visualmente por estado/rol segun la pantalla.

Campos principales:

- Nombre.
- Apellido.
- Username.
- Email.
- RUC.
- Contrasena.
- Rol: `admin` o `user`.
- Empresa asociada.
- Estado activo/inactivo.

Validaciones:

- Al crear son obligatorios: `email`, `name`, `last_name`, `ruc`, `username`, `password`, `role`, `empresa_id`.
- Al editar son obligatorios: `email`, `name`, `last_name`, `ruc`, `username`, `role`, `empresa_id`.
- La contrasena es obligatoria al crear y opcional al editar.
- Contrasena minima de 6 caracteres en frontend.
- Si se informa contrasena al editar, tambien debe tener minimo 6 caracteres.
- Email unico.
- Username unico.
- RUC unico.
- Rol debe ser `admin` o `user`.
- La empresa seleccionada debe existir.
- El backend exige `X-App-Key` y token JWT.

Comportamiento:

- Las contrasenas se guardan con hash SHA-256.
- Si el rol seleccionado es `admin`, el frontend asigna automaticamente `empresa_id = 1`, correspondiente a la empresa principal.
- Para usuarios normales se debe elegir una empresa activa.
- Activar/inactivar cambia el campo `activo`; no elimina el registro.

Observacion:

El login actual valida credenciales pero no bloquea explicitamente por `activo = false` en la vista de autenticacion.

## 5. Matriculas - `/matriculas`

Objetivo funcional:

Administrar las matriculas de vehiculos y asociarlas a empresas. Las matriculas pueden cargarse manualmente, importarse masivamente por Excel o crearse automaticamente cuando llegan ventas por API.

Acceso:

- Admin: ve todas las matriculas o puede filtrar por empresa. Puede crear, importar y editar.
- User: ve solo matriculas de su empresa. No se muestran controles administrativos de alta/importacion/edicion.

Funciones disponibles:

- Listar matriculas.
- Filtrar por empresa para administradores.
- Crear matricula manual.
- Editar `tracker_id`.
- Importar matriculas desde archivo Excel `.xlsx`.
- Buscar y paginar matriculas.

Campos principales:

- Numero de matricula.
- Tracker ID.
- Empresa asociada.
- Usuario creador.
- Fechas de creacion y actualizacion.

Validaciones manuales:

- `nro_matricula` obligatorio.
- Numero de matricula unico.
- `tracker_id` opcional.
- `empresa_id` opcional; puede quedar sin empresa.
- Para editar, solo se actualiza `tracker_id`.
- Si no se envia `tracker_id` al editar, la API devuelve error.
- El backend exige `X-App-Key` y token JWT.

Validaciones de importacion Excel:

- Debe enviarse un archivo.
- El archivo debe tener extension `.xlsx`.
- Debe tener al menos 2 columnas: matricula y tracker ID.
- Se omite la primera fila como encabezado.
- La matricula no puede estar vacia.
- Si la matricula ya existe, actualiza su `tracker_id`.
- Si no existe, crea una nueva matricula.
- La importacion devuelve cantidad de creadas, actualizadas y errores por fila.

Comportamiento automatico por API:

- Cuando llega una venta por la integracion, si la matricula no existe se crea automaticamente.
- Si la empresa se pudo identificar por RUC del cliente, la matricula queda vinculada a esa empresa.
- Si la empresa no existe, la API puede crear tambien la empresa automaticamente con los datos recibidos.
- El usuario creador automatico es `apiUser`.

## 6. Ventas - `/ventas`

Objetivo funcional:

Visualizar las cargas/ventas recibidas por API para las empresas.

Acceso:

- Admin: ve todas las ventas o puede filtrar por empresa.
- User: ve solo ventas de su empresa.

Funciones disponibles:

- Listar ventas.
- Filtrar por empresa para administradores.
- Buscar y paginar registros.
- Ver datos generales de cada carga: ticket, fecha, cliente, estacion, chofer, matricula, total, moneda y lineas.

Origen de datos:

Las ventas ingresan por el endpoint de integracion `/api/registrar`, usando credenciales en headers:

- `usuario`
- `password`

Campos principales de venta:

- Tipo.
- Identificador de transaccion.
- Ticket.
- Fecha.
- Codigo/RUC/nombre de cliente.
- Codigo/nombre de estacion.
- Codigo de moneda.
- Total.
- Documento y nombre del chofer.
- Matricula.
- Kilometraje.
- Tarjeta.
- Numero de vale.
- Numero de autorizacion de vale.
- Empresa asociada.
- Matricula asociada.
- Lineas de productos.

Validaciones y reglas:

- Para consultar ventas se exige `X-App-Key` y token JWT.
- Si se envia `empresa_id`, la empresa debe existir.
- Si no se envia `empresa_id`, la API devuelve todas las ventas.
- En el frontend, los usuarios `user` siempre consultan con su `empresa_id`.
- Los administradores pueden consultar todas o seleccionar una empresa.
- En la integracion de carga, todos los campos de la venta son opcionales/nullable.
- La fecha se intenta convertir con formato `YYYY-MM-DD HH:MM:SS` o `YYYY-MM-DD HH:MM`; si no coincide, queda nula.
- El total se guarda como decimal si viene informado.

Comportamiento automatico en integracion:

- Busca empresa por RUC del cliente.
- Si no existe y llegan RUC/nombre del cliente, crea la empresa automaticamente.
- Busca matricula por numero.
- Si no existe, crea la matricula y la vincula a la empresa encontrada/creada.
- Crea la venta.
- Crea sus lineas.
- Cada linea puede incluir producto, precio unitario, unidad y cantidad.
- El subtotal de linea se calcula como `precio_unitario * cantidad` cuando ambos valores existen.

## 7. Ventas Detalle - `/ventas-detalle`

Objetivo funcional:

Visualizar el detalle consolidado de ventas y productos recibidos por API.

Acceso:

- Admin: ve todos los detalles o puede filtrar por empresa.
- User: ve solo detalles de su empresa.

Funciones disponibles:

- Listar detalles de ventas.
- Filtrar por empresa para administradores.
- Buscar y paginar registros.
- Consultar datos combinados de venta y linea de producto.

Origen de datos:

El modulo consulta una vista SQL llamada `vw_venta_detalle`, representada en Django por el modelo `VentaDetalle` no administrado. Esta vista combina datos de `api_venta` y `api_venta_linea`.

Campos principales:

- ID de venta.
- Tipo.
- Identificador de transaccion.
- Ticket.
- Fecha.
- Codigo/RUC/nombre de cliente.
- Codigo/nombre de estacion.
- Codigo de moneda.
- Chofer.
- Matricula.
- Codigo y nombre de producto.
- Cantidad.
- Precio unitario.
- Subtotal.
- Empresa.
- Matricula asociada.

Validaciones y reglas:

- Para consultar se exige `X-App-Key` y token JWT.
- Si se envia `empresa_id`, la empresa debe existir.
- Si no se envia `empresa_id`, la API devuelve todos los detalles.
- En el frontend, los usuarios `user` siempre consultan con su `empresa_id`.
- Los administradores pueden consultar todos o filtrar por empresa.

## 8. Dashboard - `/dashboard`

Objetivo funcional:

Mostrar un resumen operativo de ventas, litros, matriculas y comportamiento de consumo de una empresa.

Acceso:

- Admin: puede seleccionar empresa para consultar el dashboard.
- User: consulta automaticamente la empresa asociada a su usuario.

Parametros requeridos por API:

- `empresa_id`
- `cant_dias`

Validaciones:

- `empresa_id` obligatorio.
- `cant_dias` obligatorio.
- `cant_dias` debe ser numero entero.
- Se exige `X-App-Key` y token JWT.

Datos calculados:

- Rango de fechas: desde hoy menos `cant_dias - 1` hasta hoy.
- Total de cargas.
- Total vendido.
- Litros totales.
- Total de matriculas de la empresa.
- Ventas por dia.
- Ticket promedio.
- Litros por carga.
- Cantidad de estaciones distintas.
- Cantidad de matriculas activas con compras.
- Top estaciones por cantidad de cargas.
- Distribucion de combustibles por litros y porcentaje.
- Top matriculas por cantidad de cargas y litros.

Comportamiento:

- El filtro principal siempre es por empresa y rango de fechas.
- Para usuarios normales, el frontend usa el `empresa_id` guardado en la sesion.
- Para administradores, el frontend permite seleccionar empresa.

## 9. Panel de control - `/panel-control`

Objetivo funcional:

Visualizar informacion global del sistema para administracion: empresas, usuarios, matriculas, cargas y uso de plataforma.

Acceso:

- Solo `admin`.
- Este endpoint si valida explicitamente en backend que el rol del usuario sea `admin`.

Datos mostrados:

- Total de empresas.
- Empresas activas e inactivas.
- Total de usuarios.
- Usuarios activos e inactivos.
- Total de matriculas del sistema.
- Total de cargas del sistema.
- Metricas por empresa:
  - Usuarios totales.
  - Usuarios activos/inactivos.
  - Porcentaje de actividad.
  - Total de matriculas.
  - Total de cargas.
  - Total vendido.
  - Ultima carga.
  - Dias de inactividad.
- Resumen del mes actual:
  - Cargas del mes.
  - Usuarios nuevos del mes.
  - Matriculas nuevas del mes.
  - Empresas nuevas del mes.
  - Combustible mas cargado.
  - Estacion mas frecuentada.
  - Monto total del mes.

Validaciones:

- `X-App-Key` obligatorio.
- JWT obligatorio.
- Rol `admin` obligatorio.
- Si el usuario no es admin, responde con error 403.

## 10. Seguridad y validaciones transversales

Validaciones comunes:

- Las APIs internas requieren header `X-App-Key`.
- Las APIs protegidas requieren header `Authorization: Bearer <token>`.
- El token JWT expira en 3 horas.
- Si falta token: error 401.
- Si el token expiro: error 401.
- Si el token es invalido: error 401.
- Si la app key no coincide: error 403.

Validaciones de integracion:

- El endpoint `/api/registrar` no usa JWT; usa headers `usuario` y `password` configurados en backend.
- La integracion registra logs del body y headers recibidos.
- El JSON invalido devuelve error 400.
- Errores de procesamiento devuelven error 500.

## 11. Flujo funcional recomendado

1. Ingresar como administrador.
2. Registrar empresas.
3. Registrar usuarios y asociarlos a su empresa.
4. Cargar matriculas manualmente o por Excel, asociandolas a empresas cuando corresponda.
5. Recibir ventas desde la API de integracion.
6. Revisar ventas y ventas detalle.
7. Consultar dashboard por empresa.
8. Usar panel de control para monitoreo global del sistema.

## 12. Observaciones funcionales detectadas

- La regla de "solo admin" para Empresas y Usuarios esta reflejada en la navegacion y en la operacion esperada, pero no esta reforzada explicitamente en las vistas backend de esos endpoints.
- El `ProtectedRoute` solo valida existencia de token, no valida rol por ruta.
- El rol `moderator` aparece en el menu lateral, pero no es un rol valido en el modelo ni en las validaciones de usuario.
- El login no valida explicitamente si el usuario esta activo.
- En usuarios, los administradores se asignan automaticamente a `empresa_id = 1`; esto depende de que la empresa Monital sea efectivamente la empresa con ID 1.
- En importacion de matriculas, las matriculas nuevas creadas por Excel no quedan asociadas a empresa desde el archivo; solo se crean con matricula, tracker ID y usuario creador.
