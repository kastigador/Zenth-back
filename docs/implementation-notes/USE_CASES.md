# Casos de Uso — CRM Negocio

## Objetivo

Documentar los casos de uso funcionales **reales** del sistema (app + API), con foco en actores, precondiciones, flujo principal, alternativos y resultado esperado.

---

## Convenciones

- **Actor primario**: quien inicia el caso de uso.
- **Precondiciones**: qué debe cumplirse antes de ejecutar.
- **Flujo principal**: secuencia feliz.
- **Flujos alternativos / errores**: variaciones y fallas esperadas.
- **Postcondiciones**: estado final del sistema.

---

## UC-01 — Iniciar sesión

- **Actor primario**: Usuario (admin o vendedor)
- **Precondiciones**:
  - Usuario registrado
  - Backend disponible
- **Flujo principal**:
  1. Usuario abre pantalla login
  2. Ingresa email y contraseña
  3. App invoca `POST /v1/auth/login`
  4. Backend valida credenciales y responde tokens + usuario
  5. App guarda sesión y redirige a Dashboard
- **Alternativos / errores**:
  - Credenciales inválidas → 401 + mensaje de error
  - Backend caído → mensaje de conectividad
- **Postcondiciones**:
  - Sesión activa en cliente
  - Cookies/tokens configurados en backend

---

## UC-02 — Registrar usuario

- **Actor primario**: Nuevo usuario
- **Precondiciones**:
  - Email no existente
- **Flujo principal**:
  1. Usuario completa formulario de registro
  2. App invoca `POST /v1/auth/register`
  3. Backend crea usuario (y cliente base asociado)
  4. Backend devuelve sesión activa
  5. App redirige al área autenticada
- **Alternativos / errores**:
  - Email existente → 400
  - Validaciones fallidas (password/rol/email) → 400
- **Postcondiciones**:
  - Usuario creado y autenticado

---

## UC-03 — Renovar sesión

- **Actor primario**: Usuario autenticado
- **Precondiciones**:
  - Refresh token válido
- **Flujo principal**:
  1. App detecta necesidad de renovar token
  2. Invoca `POST /v1/auth/refresh`
  3. Backend valida refresh token y emite nuevo access token
  4. App continúa operación original
- **Alternativos / errores**:
  - Refresh inválido/ausente → 401
- **Postcondiciones**:
  - Access token vigente

---

## UC-04 — Cerrar sesión

- **Actor primario**: Usuario autenticado
- **Precondiciones**: Sesión activa
- **Flujo principal**:
  1. Usuario selecciona logout
  2. App llama `POST /v1/auth/logout`
  3. Backend limpia cookies de sesión
  4. App limpia estado local y vuelve a login
- **Postcondiciones**: sesión finalizada

---

## UC-05 — Consultar dashboard

- **Actor primario**: Usuario autenticado
- **Precondiciones**: JWT válido
- **Flujo principal**:
  1. App abre tab Dashboard
  2. App consulta `GET /v1/dashboard?period=current_month`
  3. Backend responde métricas
  4. App renderiza KPIs y actividad
- **Alternativos / errores**:
  - 401 por sesión vencida
  - Error de backend → fallback visual en app
- **Postcondiciones**: métricas visibles

---

## UC-06 — Buscar y listar clientes

- **Actor primario**: Usuario autenticado
- **Precondiciones**: JWT válido
- **Flujo principal**:
  1. Usuario abre tab Clients
  2. Ingresa término de búsqueda
  3. App consulta `GET /v1/clients?search=...&page=1&limit=50`
  4. Backend devuelve lista paginada
  5. App muestra cards con datos principales
- **Alternativos / errores**:
  - Sin resultados → estado vacío
  - Error backend → mensaje de carga
- **Postcondiciones**: cartera filtrada visible

---

## UC-07 — Crear cliente

- **Actor primario**: Usuario autenticado
- **Precondiciones**:
  - Datos mínimos válidos
- **Flujo principal**:
  1. Usuario completa datos de cliente
  2. App invoca `POST /v1/clients`
  3. Backend persiste cliente y actividad
  4. App actualiza listado
- **Alternativos / errores**:
  - Validación fallida → 400
- **Postcondiciones**: cliente disponible para operaciones posteriores

---

## UC-08 — Actualizar o desactivar cliente

- **Actor primario**: Usuario autenticado
- **Precondiciones**: cliente existente
- **Flujo principal**:
  1. Usuario edita datos o elige desactivar
  2. App llama `PATCH /v1/clients/:id` o `DELETE /v1/clients/:id` (soft delete)
  3. Backend aplica cambio y registra actividad
  4. App refleja estado actualizado
- **Alternativos / errores**:
  - Cliente inexistente → 404
- **Postcondiciones**: cliente actualizado o inactivo

---

## UC-09 — Gestionar tags de clientes

- **Actor primario**: Admin
- **Precondiciones**:
  - Rol admin
- **Flujo principal**:
  1. Admin crea tag en `POST /v1/clients/tags`
  2. Backend valida rol y persiste tag
  3. App puede usar tag en filtros
- **Alternativos / errores**:
  - Usuario sin rol admin → 403
- **Postcondiciones**: tag disponible para segmentación

---

## UC-10 — Listar usuarios (admin/vendedor)

- **Actor primario**: Admin o vendedor
- **Precondiciones**:
  - Rol autorizado (`admin|vendedor`)
- **Flujo principal**:
  1. App/flujo administrativo consulta `GET /v1/users`
  2. Backend valida rol y devuelve `items + total`
- **Alternativos / errores**:
  - Rol no autorizado → 403
- **Postcondiciones**: usuarios listados

---

## UC-11 — Consultar catálogo de productos

- **Actor primario**: Usuario autenticado
- **Precondiciones**: JWT válido
- **Flujo principal**:
  1. Usuario abre tab Catalog / productos
  2. App consulta `GET /v1/products` con filtros opcionales
  3. Backend devuelve productos
  4. App renderiza catálogo
- **Postcondiciones**: catálogo visible

---

## UC-12 — Crear/actualizar producto

- **Actor primario**: Usuario autenticado
- **Precondiciones**: datos de producto válidos
- **Flujo principal**:
  1. Usuario crea o edita producto
  2. App llama `POST /v1/products` o `PATCH /v1/products/:id`
  3. Backend persiste cambios
  4. App refresca listado
- **Alternativos / errores**:
  - Validación fallida → 400

---

## UC-13 — Iniciar importación de precios

- **Actor primario**: Usuario autenticado
- **Precondiciones**:
  - Archivo/entrada válida para import
- **Flujo principal**:
  1. Usuario inicia import desde modal de catálogo
  2. App invoca `POST /v1/pricing/import`
  3. Backend crea job asíncrono y devuelve `jobId`
  4. App consulta estado con `GET /v1/pricing/import/:jobId`
  5. Usuario visualiza progreso/resultado
- **Alternativos / errores**:
  - Import inválido → error de validación

---

## UC-14 — Consultar precios actuales

- **Actor primario**: Usuario autenticado
- **Precondiciones**: JWT válido
- **Flujo principal**:
  1. App invoca `GET /v1/pricing/current?search=...`
  2. Backend devuelve lista de precios vigentes
  3. App muestra resultados en UI de catálogo

---

## UC-15 — Crear cobro

- **Actor primario**: Usuario autenticado
- **Precondiciones**:
  - Cliente existente
  - Monto válido (> 0)
- **Flujo principal**:
  1. Usuario completa modal “Create payment”
  2. App invoca `POST /v1/payments`
  3. Backend crea payment intent/registra operación
  4. App actualiza listado de pagos
- **Alternativos / errores**:
  - Datos inválidos → 400

---

## UC-16 — Filtrar pagos por estado

- **Actor primario**: Usuario autenticado
- **Precondiciones**: JWT válido
- **Flujo principal**:
  1. Usuario elige filtro (Todos/Pendientes/Pagados)
  2. App consulta `GET /v1/payments?status=...`
  3. Backend devuelve colección filtrada
  4. App renderiza resultados

---

## UC-17 — Procesar webhook de pagos

- **Actor primario**: Stripe (sistema externo)
- **Precondiciones**:
  - Firma webhook válida
- **Flujo principal**:
  1. Stripe envía evento a `POST /v1/payments/webhook`
  2. Backend valida firma y tipo de evento
  3. Backend actualiza estado de pago
- **Alternativos / errores**:
  - Firma inválida → rechazo

---

## UC-18 — Iniciar vinculación Telegram

- **Actor primario**: Usuario autenticado
- **Precondiciones**:
  - Cliente existente
- **Flujo principal**:
  1. Usuario inicia link en `POST /v1/notifications/telegram/link/start`
  2. Backend genera código/token de vinculación
  3. Usuario confirma con `POST /v1/notifications/telegram/link/confirm`
  4. Backend vincula chatId al cliente

---

## UC-19 — Enviar notificación de pago

- **Actor primario**: Usuario autenticado / proceso interno
- **Precondiciones**:
  - Canal y destino configurados
- **Flujo principal**:
  1. App/servicio invoca `POST /v1/notifications/payments/send`
  2. Backend emite notificación (Telegram/otros)
  3. Registro en logs de notificación
  4. Consulta en `GET /v1/notifications/logs`

---

## UC-20 — Operar chat IA persistente

- **Actor primario**: Usuario autenticado
- **Precondiciones**:
  - Sesión activa
- **Flujo principal**:
  1. Usuario abre modal de chat
  2. Escribe/adjunta mensaje
  3. App guarda local (offline-first)
  4. App sincroniza con backend (`POST /v1/api/chat/messages`)
  5. Usuario consulta historial (`GET /v1/api/chat/messages`)
- **Alternativos / errores**:
  - Sin conectividad: queda local pendiente
  - Conectividad restaurada: sincroniza pendientes
- **Postcondiciones**:
  - Mensajes persistidos por usuario

---

## UC-21 — Limpiar conversación de chat

- **Actor primario**: Usuario autenticado
- **Precondiciones**: mensajes existentes
- **Flujo principal**:
  1. Usuario confirma limpieza
  2. App invoca `DELETE /v1/api/chat/messages`
  3. Backend elimina mensajes del usuario
  4. App refleja conversación vacía

---

## UC-22 — Crear tarea (local-first + sync)

- **Actor primario**: Usuario autenticado
- **Precondiciones**:
  - Título válido (>= 3)
  - Fecha no anterior a hoy
- **Flujo principal**:
  1. Usuario abre modal “New Task”
  2. Completa nombre/fecha/prioridad
  3. App guarda tarea en store local (persistente)
  4. Hook de sync intenta crear en backend (`POST /v1/tasks`)
  5. Si sincroniza, tarea queda marcada como synced
- **Alternativos / errores**:
  - Backend no disponible → modo local + reintento posterior

---

## UC-23 — Marcar tarea como realizada

- **Actor primario**: Usuario autenticado
- **Precondiciones**: tarea existente
- **Flujo principal**:
  1. Usuario toca checkbox
  2. App actualiza `done` localmente y marca pendiente sync
  3. Hook sincroniza con `PATCH /v1/tasks/:id`
  4. UI muestra estado final

---

## UC-24 — Consultar tareas sincronizadas

- **Actor primario**: Usuario autenticado
- **Precondiciones**: sesión activa
- **Flujo principal**:
  1. Al entrar a Tasks, app consulta backend (`GET /v1/tasks`)
  2. App mergea servidor + locales pendientes
  3. UI divide en “Hoy” y “Próximas”
  4. Muestra estado de sincronización

---

## Recomendación de evolución

Para madurez documental, el próximo paso es mapear cada caso de uso con:

1. **Endpoints exactos** (request/response ejemplo)
2. **Reglas de negocio** por caso (validaciones)
3. **Eventos observables** (logs/telemetría)
4. **Criterios de aceptación testeables** (Given/When/Then)

Eso te deja documentación lista para QA + backlog + arquitectura.
