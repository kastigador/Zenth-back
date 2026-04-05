# Priorización MVP + Trazabilidad TDD (UC → Tests)

## Objetivo

Pasar de catálogo funcional a artefacto ejecutable para producto/QA:

1. Priorizar casos de uso por valor de negocio (Must/Should/Could)
2. Definir criterios de aceptación (Given/When/Then)
3. Mapear cobertura actual de tests y gaps

---

## 1) Priorización MVP (MoSCoW)

### MUST (imprescindibles para operar)

- **UC-01** Iniciar sesión
- **UC-03** Renovar sesión
- **UC-05** Consultar dashboard
- **UC-06** Buscar/listar clientes
- **UC-07** Crear cliente
- **UC-11** Consultar catálogo de productos
- **UC-15** Crear cobro
- **UC-16** Filtrar pagos
- **UC-20** Operar chat IA persistente
- **UC-22** Crear tarea (local-first + sync)
- **UC-23** Marcar tarea como realizada
- **UC-24** Consultar tareas sincronizadas

### SHOULD (muy valiosos, no bloquean salida MVP)

- **UC-02** Registrar usuario
- **UC-04** Cerrar sesión
- **UC-08** Actualizar/desactivar cliente
- **UC-10** Listar usuarios por rol
- **UC-12** Crear/actualizar producto
- **UC-13** Importación de precios
- **UC-14** Consultar precios actuales
- **UC-19** Enviar notificación de pago

### COULD (evolutivos / integración extendida)

- **UC-09** Gestionar tags de clientes (admin)
- **UC-17** Webhook Stripe
- **UC-18** Vinculación Telegram
- **UC-21** Limpiar conversación de chat

---

## 2) Criterios de aceptación (Given/When/Then) — UC críticos

## UC-01 — Iniciar sesión

### Escenario 1: login exitoso
- **Given** un usuario registrado con credenciales válidas
- **When** envía email y contraseña al endpoint de login
- **Then** recibe `accessToken`, `refreshToken` y datos de usuario
- **And** puede acceder a rutas protegidas

### Escenario 2: credenciales inválidas
- **Given** un usuario con contraseña incorrecta
- **When** intenta iniciar sesión
- **Then** el sistema responde `401 Unauthorized`
- **And** no crea sesión

## UC-03 — Renovar sesión

### Escenario 1: refresh válido
- **Given** un refresh token vigente
- **When** solicita renovación
- **Then** recibe nuevo access token

### Escenario 2: refresh inválido
- **Given** un refresh token inválido o ausente
- **When** solicita renovación
- **Then** recibe `401 Unauthorized`

## UC-06 — Buscar/listar clientes

### Escenario 1: búsqueda con resultados
- **Given** clientes cargados en el sistema
- **When** usuario filtra por texto
- **Then** ve lista paginada con coincidencias

### Escenario 2: sin resultados
- **Given** un filtro sin coincidencias
- **When** usuario ejecuta búsqueda
- **Then** la UI muestra estado vacío

## UC-15 — Crear cobro

### Escenario 1: creación válida
- **Given** un cliente existente y monto válido
- **When** usuario envía formulario de cobro
- **Then** backend crea el pago y lo devuelve en listado

### Escenario 2: validación de monto
- **Given** monto cero o negativo
- **When** usuario intenta crear cobro
- **Then** backend rechaza la operación
- **And** frontend muestra error de validación

## UC-20 — Chat IA persistente

### Escenario 1: mensaje sincronizado
- **Given** sesión activa y conectividad
- **When** usuario envía mensaje
- **Then** se guarda localmente y luego sincroniza con backend

### Escenario 2: modo offline
- **Given** sesión activa sin conectividad
- **When** usuario envía mensaje
- **Then** mensaje queda pendiente local
- **And** al recuperar conectividad, se sincroniza

## UC-22 — Crear tarea local-first + sync

### Escenario 1: tarea creada y sincronizada
- **Given** usuario autenticado y backend disponible
- **When** crea tarea válida
- **Then** tarea se guarda localmente
- **And** luego queda marcada como `synced=true`

### Escenario 2: backend no disponible
- **Given** usuario autenticado sin backend disponible
- **When** crea tarea válida
- **Then** tarea se conserva local con `synced=false`
- **And** el sistema reintenta sincronización

### Escenario 3: validación de fecha
- **Given** usuario abre selector de fecha
- **When** intenta seleccionar día anterior a hoy
- **Then** el calendario bloquea selección
- **And** muestra feedback visual de restricción

## UC-23 — Marcar tarea como realizada

### Escenario 1: toggle done
- **Given** tarea existente
- **When** usuario marca/desmarca checkbox
- **Then** cambia estado `done`
- **And** queda pendiente de sincronización

---

## 3) Matriz de trazabilidad (UC → tests actuales)

> Nota: “Cobertura” indica existencia de pruebas relevantes en repositorio, no necesariamente cobertura E2E completa de la historia de usuario.

| UC | Cobertura actual | Evidencia de tests | Estado |
|---|---|---|---|
| UC-01 Login | Backend + Front parcial | `auth.controller.spec.ts`, `auth.service.spec.ts`, `useRegisterForm.test.ts` (flujo auth parcial) | 🟡 Parcial |
| UC-02 Registro | Backend + Front parcial | `auth.controller.spec.ts`, `auth.service.spec.ts`, `useRegisterForm.test.ts` | 🟡 Parcial |
| UC-03 Refresh | Backend | `auth.controller.spec.ts`, `auth.service.spec.ts` | 🟢 Aceptable |
| UC-04 Logout | Backend | `auth.controller.spec.ts` | 🟢 Aceptable |
| UC-05 Dashboard | Backend | `dashboard.controller.spec.ts`, `dashboard.service.spec.ts` | 🟢 Aceptable |
| UC-06 Listar clientes | Backend | `clients.controller.spec.ts`, `clients.service.spec.ts`, `clients.dto.spec.ts` | 🟢 Aceptable |
| UC-07 Crear cliente | Backend | `clients.controller.spec.ts`, `clients.service.spec.ts` | 🟢 Aceptable |
| UC-08 Actualizar/desactivar cliente | Backend | `clients.controller.spec.ts`, `clients.service.spec.ts` | 🟢 Aceptable |
| UC-09 Tags clientes | Backend | `clients.controller.spec.ts`, `clients.service.spec.ts` | 🟢 Aceptable |
| UC-10 Listar usuarios por rol | Backend | `users.controller.spec.ts`, `users.service.spec.ts`, `roles.guard.spec.ts` | 🟢 Aceptable |
| UC-11 Listar productos | Backend | `products.controller.spec.ts`, `products.service.spec.ts`, `products.dto.spec.ts` | 🟢 Aceptable |
| UC-12 Crear/actualizar producto | Backend | `products.controller.spec.ts`, `products.service.spec.ts` | 🟢 Aceptable |
| UC-13 Importar precios | Backend | `pricing.controller.spec.ts`, `pricing.service.spec.ts`, `pricing.dto.spec.ts` | 🟢 Aceptable |
| UC-14 Precios actuales | Backend | `pricing.controller.spec.ts`, `pricing.service.spec.ts` | 🟢 Aceptable |
| UC-15 Crear cobro | Backend + Front parcial | `payments.controller.spec.ts`, `payments.service.spec.ts`, `payments.dto.spec.ts` | 🟡 Parcial |
| UC-16 Filtrar pagos | Backend | `payments.controller.spec.ts`, `payments.service.spec.ts` | 🟢 Aceptable |
| UC-17 Webhook pagos | Backend | `payments.controller.spec.ts`, `payments.service.spec.ts` | 🟢 Aceptable |
| UC-18 Vinculación Telegram | Backend | `notifications.controller.spec.ts`, `notifications.service.spec.ts` | 🟢 Aceptable |
| UC-19 Notificación de pago | Backend | `notifications.controller.spec.ts`, `notifications.service.spec.ts` | 🟢 Aceptable |
| UC-20 Chat persistente | Backend | `chat.controller.spec.ts`, `chat.service.spec.ts` | 🟢 Aceptable |
| UC-21 Limpiar chat | Backend | `chat.controller.spec.ts`, `chat.service.spec.ts` | 🟢 Aceptable |
| UC-22 Crear tarea local-first + sync | Backend + Front | `tasks.controller.spec.ts`, `tasks.service.spec.ts`, `tasks.store.test.ts`, `useTasksSync.test.ts`, `create-task*.test.ts` | 🟢 Fuerte |
| UC-23 Toggle tarea done + sync | Backend + Front | `tasks.service.spec.ts`, `tasks.store.test.ts`, `useTasksSync.test.ts` | 🟢 Fuerte |
| UC-24 Listar tareas + merge local/server | Backend + Front | `tasks.controller.spec.ts`, `useTasksSync.test.ts`, `tasks.store.test.ts` | 🟢 Fuerte |

---

## 4) Gaps y backlog de testing (prioridad)

## Alta prioridad

1. **E2E de login completo en app** (happy path + credenciales inválidas)
2. **E2E de crear cobro desde modal** con feedback de validación
3. **E2E de flujo tasks web** (abrir modal calendario, bloquear fecha pasada, crear task)

## Media prioridad

4. **E2E de clientes** (buscar + crear + desactivar)
5. **E2E de chat persistente** (offline/online sync)

## Baja prioridad

6. Tests de contrato API (OpenAPI snapshot) para endpoints críticos

---

## 5) Definición de “Done” documental para nuevos UC

Para cada nuevo caso de uso:

1. Definido en `USE_CASES.md`
2. Tiene al menos 1 escenario Gherkin (Given/When/Then)
3. Está mapeado a tests existentes o gap explícito
4. Si es Must/Should, no se cierra sin cobertura de test relevante
