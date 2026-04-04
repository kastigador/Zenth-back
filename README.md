# 🚀 CRM-NEGOCIO: Sistema CRM Full-Stack con Chat IA

Una plataforma CRM integral y moderna diseñada para pequeñas y medianas empresas, con soporte para gestión de clientes, productos, pagos, notificaciones y un **chat inteligente con persistencia multimedia**.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Funcionalidades Principales](#funcionalidades-principales)
6. [Requisitos Previos](#requisitos-previos)
7. [Instalación](#instalación)
8. [Configuración](#configuración)
9. [Ejecución](#ejecución)
10. [API Endpoints](#api-endpoints)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Contribución](#contribución)

---

## 📱 Descripción General

**CRM-Negocio** es una solución empresarial completa que integra:

- **Backend API RESTful** con NestJS y Prisma
- **Aplicación Mobile/Web** con React Native y Expo
- **Base de datos PostgreSQL** para persistencia confiable
- **Chat IA bidireccional** con sincronización de media (texto, imágenes, audio)
- **Sistema de autenticación JWT** seguro
- **Integración de pagos** con Stripe
- **Notificaciones multicanal** (WhatsApp, Telegram)
- **Dashboard analítico** con métricas en tiempo real

### 🎯 Propósito del Proyecto

Facilitar a emprendedores y empresas pequeñas:
- Gestionar relaciones con clientes de forma centralizada
- Automatizar procesos de ventas y facturación
- Comunicarse con clientes e IA en un único lugar
- Sincronizar datos automáticamente entre dispositivos
- Acceder a información crítica offline

---

## 🏗️ Arquitectura del Proyecto

```
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN                      │
│              React Native + Expo (crm-negocio-app)          │
│  ┌─────────┬─────────┬──────────┬───────────┬────────────┐  │
│  │Dashboard│ Clientes│Productos │Pagos      │Chat IA     │  │
│  │ Analytics│         │Precios   │Notificac. │Multimedia  │  │
│  └─────────┴─────────┴──────────┴───────────┴────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST + JWT
┌────────────────────▼────────────────────────────────────────┐
│               CAPA DE APLICACIÓN                            │
│            NestJS + Passport (crm-negocio-api)             │
│  ┌──────────┬────────┬───────┬─────────┬──────┬──────────┐ │
│  │Auth      │Users   │Clients│Products │Chat  │Payments  │ │
│  │JWT Guard │Manager │Manager│Manager  │CRUD  │Processor │ │
│  └──────────┴────────┴───────┴─────────┴──────┴──────────┘ │
│  ┌──────────┬──────────┬───────────────────────────────────┐ │
│  │Dashboard │Pricing   │Notifications (WhatsApp, Telegram)│ │
│  │Service   │Service   │Queue Processing (Bull/Redis)     │ │
│  └──────────┴──────────┴───────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL + ORM
┌────────────────────▼────────────────────────────────────────┐
│               CAPA DE DATOS                                 │
│           PostgreSQL + Prisma ORM                           │
│  ┌──────────┬────────┬───────┬────────┬──────┬────────────┐ │
│  │Users     │Clients │Produc │Pricing │Msgs  │Payments    │ │
│  │+Roles    │+Deals  │+Stock │+Rules  │+Sync │+Status     │ │
│  └──────────┴────────┴───────┴────────┴──────┴────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Sincronización de Chat

```
┌────────────────────┐
│ React Native App   │
│  • Zustand Store   │
│  • AsyncStorage    │
└─────┬──────────────┘
      │ 1. Usuario escribe mensaje
      │ 2. Guarda localmente (offline-first)
      │
      ├──────────────────────────────────────┐
      │ 3. POST /api/chat/messages (cada 2s) │
      │                                      │
      ▼                                      ▼
┌────────────────┐                   ┌───────────────────┐
│ NestJS Backend │ ◄──GET messages───│ PostgreSQL ChatMsg│
│  JWT Guard ✓   │   + Sync Status   │  • userId index   │
│ User-scoped    │ ──────────────────►│  • timestamps     │
│ CRUD Service   │                   │  • media refs     │
└────────────────┘                   └───────────────────┘
      ▲
      │ 4. Auto-persist response
      └──────────────────────►
       (unsynced queue -> synced ✓)
```

---

## 💻 Stack Tecnológico

### Backend (crm-negocio-api)

| Componente | Tecnología | Versión |
|---|---|---|
| **Framework** | NestJS | ^10.4.2 |
| **ORM** | Prisma | ^5.22.0 |
| **Base Datos** | PostgreSQL | 12+ |
| **Auth** | JWT + Passport | ^10.2.0 |
| **Validación** | class-validator | ^0.14.1 |
| **Testing** | Jest | ^29.7.0 |
| **Encriptación** | Argon2 | ^0.41.1 |
| **Docs API** | Swagger | ^7.4.2 |

### Frontend (crm-negocio-app)

| Componente | Tecnología | Versión |
|---|---|---|
| **Framework** | React Native | 0.83.4 |
| **Runtime** | Expo | 55.0.9 |
| **Router** | Expo Router | ~55.0.8 |
| **Estado** | Zustand | ^4.5.5 |
| **HTTP** | Fetch API | Native |
| **Storage** | AsyncStorage | 2.2.0 |
| **UI Framework** | Tamagui | 1.144.4 |
| **Queries** | @tanstack/react-query | ^5.56.2 |
| **Payments** | Stripe React Native | 0.58.0 |
| **Testing** | Jest + React Native Testing Library | ^29.5.12 |
| **TypeScript** | TypeScript | ~5.9.2 |

---

## 📁 Estructura de Carpetas

```
crm-negocio/
├── crm-negocio-api/                    # Backend NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                   # Autenticación JWT + Roles
│   │   │   ├── users/                  # Gestión de usuarios
│   │   │   ├── clients/                # CRM: Clientes y deals
│   │   │   ├── products/               # Catálogo de productos
│   │   │   ├── pricing/                # Reglas de precios dinámicos
│   │   │   ├── payments/               # Integración Stripe
│   │   │   ├── dashboard/              # Métricas y analytics
│   │   │   ├── notifications/          # WhatsApp, Telegram
│   │   │   ├── queue/                  # Tareas asincrónicas
│   │   │   └── chat/                   # Chat con IA + Persistencia
│   │   ├── common/
│   │   │   ├── prisma.service.ts       # Cliente Prisma centralizado
│   │   │   └── security/
│   │   │       ├── payload-crypto.ts   # Encriptación de payloads
│   │   │       └── decrypt-payload.pipe.ts
│   │   ├── config/
│   │   │   └── env.validation.ts       # Variables de entorno
│   │   ├── app.module.ts               # Módulo raíz
│   │   └── main.ts                     # Entry point
│   ├── prisma/
│   │   ├── schema.prisma               # Modelo de datos
│   │   └── migrations/                 # Historial de cambios DB
│   ├── test/
│   │   ├── app.e2e-spec.ts            # Tests E2E
│   │   └── jest-e2e.json              # Config Jest E2E
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.ts
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── crm-negocio-app/                    # Frontend React Native
│   ├── app/
│   │   ├── _layout.tsx                 # Layout principal
│   │   ├── index.tsx                   # Root redirect
│   │   ├── (auth)/
│   │   │   └── login.tsx               # Pantalla de login
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx             # Tab navigator
│   │   │   ├── dashboard/              # Dashboard + Analytics
│   │   │   ├── clients/                # Lista de clientes
│   │   │   ├── contacts/               # Gestión de contactos
│   │   │   ├── deals/                  # Pipeline de ventas
│   │   │   ├── tasks/                  # Gestión de tareas
│   │   │   ├── catalog/                # Catálogo de productos
│   │   │   └── payments/               # Historial de pagos
│   │   └── modals/
│   │       ├── ai-chat.tsx             # Chat modal con media
│   │       ├── create-payment.tsx      # Crear invoice
│   │       └── import-prices.tsx       # Importar precios
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts               # HTTP client tipado
│   │   │   ├── auth.api.ts             # Endpoints de auth
│   │   │   ├── chat.api.ts             # Endpoints de chat
│   │   │   ├── clients.api.ts          # Endpoints CRM
│   │   │   ├── dashboard.api.ts        # Endpoints analytics
│   │   │   ├── payments.api.ts         # Endpoints pagos
│   │   │   └── pricing.api.ts          # Endpoints de precios
│   │   ├── store/
│   │   │   ├── auth.store.ts           # Auth state + persistence
│   │   │   └── chat.store.ts           # Chat state + AsyncStorage
│   │   ├── hooks/
│   │   │   ├── useChatSync.ts          # Sincronización chat (2s)
│   │   │   ├── useTheme.ts             # Tema dinámico
│   │   │   └── useAuth.ts              # Contexto de auth
│   │   ├── components/
│   │   │   └── ui/                     # Componentes reutilizables
│   │   ├── lib/
│   │   │   └── format.ts               # Utilidades de formato
│   │   ├── theme/
│   │   │   └── tokens.ts               # Design tokens
│   │   └── types/                      # Tipos TypeScript globales
│   ├── e2e/
│   │   ├── login.e2e-spec.tsx          # Tests E2E (login flow)
│   │   └── jest.e2e.config.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── jest.setup.ts
│   ├── metro.config.js
│   ├── app.json                        # Config Expo
│   ├── eas.json                        # Config EAS (build)
│   └── babel.config.js
│
└── docs/
    └── implementation-notes/
        ├── QUICK_START.md              # Guía de inicio rápido
        ├── CHANGES_SUMMARY.md          # Resumen de cambios
        ├── CHAT_PERSISTENCE_SETUP.md   # Setup del chat persistente
        ├── IMPLEMENTATION_STATUS.md    # Estado de implementación
        ├── VERIFICATION_REPORT.md      # Reporte de verificación
        └── NEXT_STEPS.md               # Próximos pasos / deployment
```

---

## ✨ Funcionalidades Principales

### 🔐 Autenticación y Seguridad
- ✅ JWT con refresh tokens
- ✅ Roles de usuario (ADMIN, SELLER)
- ✅ Encriptación de payloads sensibles
- ✅ Guards de autenticación en todas las rutas protegidas
- ✅ Validación de entrada con DTOs

### 👥 Gestión de Usuarios
- ✅ Registro y login
- ✅ Perfil de usuario
- ✅ Gestión de roles
- ✅ Historial de actividades

### 🏢 CRM: Gestión de Clientes
- ✅ Crear, actualizar, eliminar clientes
- ✅ Gestión de contactos y direcciones
- ✅ Pipeline de deals/oportunidades
- ✅ Historial de interacciones
- ✅ Asignación de vendedores

### 📦 Gestión de Productos
- ✅ Catálogo de productos
- ✅ Control de inventario
- ✅ Categorías y atributos
- ✅ Búsqueda y filtrado avanzado

### 💰 Precios Dinámicos
- ✅ Reglas de precios por customer segment
- ✅ Descuentos y promociones
- ✅ Precio base vs precio efectivo
- ✅ Histórico de cambios de precios

### 💳 Sistema de Pagos
- ✅ Integración con Stripe
- ✅ Crear invoices/cotizaciones
- ✅ Rastreo de pagos
- ✅ Múltiples métodos de pago
- ✅ Reporte de ingresos

### 🔔 Notificaciones Multicanal
- ✅ WhatsApp (confirmaciones, recordatorios)
- ✅ Telegram (alertas de vendedores)
- ✅ Email (invoices, estado de pedidos)
- ✅ Push notifications (app mobile)

### 📊 Dashboard Analytics
- ✅ KPIs en tiempo real
- ✅ Métricas de ventas
- ✅ Gráficos de desempeño
- ✅ Reportes exportables
- ✅ Predicciones basadas en datos

### 💬 Chat Inteligente IA (Persistencia Multimedia)
- ✅ Chat bidireccional completo
- ✅ **Sincronización automática cada 2 segundos**
- ✅ **Soporte multimedia**: Texto, Imágenes, Audio
- ✅ **Offline-first**: Funciona sin internet, syncs cuando vuelve conectividad
- ✅ **Persistencia dual**: LocalStorage + Backend PostgreSQL
- ✅ **Tipado fin-a-fin**: TypeScript en frontend y backend
- ✅ **User-scoped queries**: Cada usuario solo ve sus mensajes
- ✅ **Enums tipados**: Role (USER, ASSISTANT), Type (TEXT, IMAGE, AUDIO)

### ⚙️ Queue/Tareas Asincrónicas
- ✅ Procesar pagos en background
- ✅ Envío de notificaciones diferido
- ✅ Generación de reportes
- ✅ Sincronización de datos

---

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** >= 18.x
- **npm** >= 9.x o **yarn** >= 3.x
- **PostgreSQL** >= 12.x
- **Docker** y **Docker Compose** (recomendado para base de datos)
- **Git** >= 2.x

### Verificar instalaciones

```bash
node --version     # v18.x.x o mayor
npm --version      # 9.x.x o mayor
psql --version     # PostgreSQL 12.x o mayor
docker --version   # Docker 20.x o mayor
```

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd crm-negocio
```

### 2. Configurar Base de Datos

#### Opción A: Con Docker Compose (Recomendado)

```bash
# Dentro de crm-negocio-api/
docker-compose up -d

# Esperar 5-10 segundos a que PostgreSQL esté listo
sleep 10

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate
```

#### Opción B: PostgreSQL Local

```bash
# Crear base de datos
createdb crm_negocio_dev

# Actualizar DATABASE_URL en .env
# postgresql://user:password@localhost:5432/crm_negocio_dev

# En crm-negocio-api/
npm run prisma:migrate
```

### 3. Instalar Backend

```bash
cd crm-negocio-api

# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Copiar archivo de variables de entorno
cp .env.example .env
# Editar .env con tus valores
```

### 4. Instalar Frontend

```bash
cd ../crm-negocio-app

# Instalar dependencias
npm install

# Para web, también necesitas:
# npm install --save-dev @react-native-web/cli
```

---

## ⚙️ Configuración

### Backend (.env)

```ini
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/crm_negocio_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_ACCESS_SECRET="tu-access-secret-super-seguro"
JWT_REFRESH_SECRET="tu-refresh-secret-super-seguro"
JWT_ACCESS_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# API
PORT=3000
API_PREFIX="v1"
LOG_LEVEL="info" # fatal|error|warn|info|debug|trace|silent

# Frontend
FRONTEND_URL="http://localhost:8081"

# Stripe (Pagos)
STRIPE_API_KEY="sk_test_..."
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# WhatsApp (Notificaciones)
WHATSAPP_ACCOUNT_SID="your-twilio-account-sid"
WHATSAPP_AUTH_TOKEN="your-twilio-auth-token"
WHATSAPP_PHONE="whatsapp:+1234567890"

# Telegram (Notificaciones)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"

# Email
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="noreply@crmnegocio.com"

# OpenAI (Chat IA)
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4"

# Node
NODE_ENV="development"
```

### 🔎 Observabilidad: logs y trazabilidad

- El backend usa **logging estructurado con `nestjs-pino`**.
- Se redaccionan automáticamente campos sensibles como:
  - `Authorization`
  - `Cookie`
  - `password`
  - `refreshToken`
  - `Set-Cookie`
- Cada request tiene `requestId` y se propaga por header `x-request-id`.

Ejemplo de request con correlación:

```bash
curl -i -X POST "http://localhost:3000/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "x-request-id: demo-login-001" \
  -d '{"email":"admin@crm.local","password":"secret123"}'
```

En logs vas a poder correlacionar ese mismo `requestId` en toda la traza.

### 🛟 Mini Playbook de Incidentes (Auth/Chat)

Cuando algo falla en producción o staging, seguí este orden:

1. **Identificar `x-request-id`**
   - Pedí al frontend/QA el `x-request-id` de la respuesta fallida.
   - Buscalo en logs para reconstruir toda la traza de esa request.

2. **Validar evento de auth**
   - Login: `auth.login.attempt`, `auth.login.success`, `auth.login.failed`.
   - Refresh: `auth.refresh.failed`.
   - Si hay `failed`, revisar campo `reason` (`user_not_found`, `invalid_password`, `missing_token`, `invalid_token`).

3. **Confirmar estado HTTP y latencia**
   - Revisar `statusCode` y `responseTime` en la entrada HTTP de pino.
   - `401/403` recurrentes suelen indicar token/cookie vencida o rol insuficiente.

4. **Verificar cookies/tokens sin exponer secretos**
   - Confirmar que llegan cookies `crm_access_token`/`crm_refresh_token` (sin imprimir su valor).
   - En `NODE_ENV=production`, validar `secure=true` y `sameSite=none` si hay frontend en dominio distinto.

5. **Corroborar configuración efectiva**
   - Revisar `NODE_ENV`, `LOG_LEVEL`, `API_PREFIX`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
   - Si el problema es intermitente entre instancias, descartar drift de env vars.

6. **Si impacta chat, validar autenticación primero**
   - Antes de debuggear `/chat/messages`, confirmar que `/auth/me` responde 200 para el mismo usuario/request.
   - La mayoría de errores de chat en runtime derivan de sesión/token, no de persistencia.

### Frontend (.env)

```ini
# API Backend
EXPO_PUBLIC_API_URL="http://localhost:3000"
EXPO_PUBLIC_API_VERSION="v1"

# Stripe
EXPO_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."

# Debug
EXPO_PUBLIC_DEBUG="true"
```

---

## 🚀 Ejecución

### Terminal 1: Backend

```bash
cd crm-negocio-api

# Desarrollo con hot-reload
npm run start:dev

# Verás:
# [Nest] 12345  - 04/03/2026, 10:55:33 AM     LOG [NestFactory] Starting Nest application...
# [Nest] 12345  - 04/03/2026, 10:55:34 AM     LOG [InstanceLoader] PrismaService dependencies initialized
# [Nest] 12345  - 04/03/2026, 10:55:34 AM     LOG [RoutesResolver] AppController {/api}:
# Nest application successfully started on port 3000
```

### Terminal 2: Frontend (Web)

```bash
cd crm-negocio-app

# Web (desarrollo)
npm run web

# Verá un QR para escanear con el móvil
# URL: http://localhost:8081
```

### O en dispositivo físico/emulador

```bash
# Android
npm run android

# iOS (requiere macOS)
npm run ios

# Luego en Expo Go:
# 1. Abrir Expo Go
# 2. Escanear QR mostrado en terminal
# 3. Esperar a que se compile (1-2 min)
```

---

## 📡 API Endpoints

### Autenticación

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@crm.local",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "email": "admin@crm.local",
    "role": "ADMIN"
  }
}
```

### Chat (Persist con Media)

```http
# Crear mensaje
POST /api/chat/messages
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "content": "Hola, ¿cuál es el estado de mi pedido?",
  "type": "TEXT",
  "role": "USER"
}

# Obtener mensajes
GET /api/chat/messages?limit=50&offset=0
Authorization: Bearer {accessToken}

# Obtener mensajes sin sincronizar
GET /api/chat/messages/unsynced
Authorization: Bearer {accessToken}

Response: {
  "data": [
    {
      "id": "msg-123",
      "content": "Tu pedido está en tránsito",
      "type": "TEXT",
      "role": "ASSISTANT",
      "userId": "1",
      "createdAt": "2026-04-03T10:55:34Z",
      "synced": true
    }
  ],
  "total": 150
}

# Eliminar mensaje
DELETE /api/chat/messages/{messageId}
Authorization: Bearer {accessToken}
```

### Clientes (CRM)

```http
POST /api/clients
{
  "name": "Tech Corp S.L.",
  "email": "contact@techcorp.es",
  "phone": "+34912345678",
  "status": "ACTIVE"
}

GET /api/clients?status=ACTIVE&limit=20
GET /api/clients/{clientId}
PUT /api/clients/{clientId}
DELETE /api/clients/{clientId}
```

### Productos

```http
GET /api/products?category=HARDWARE&limit=50
GET /api/products/{productId}
POST /api/products
PUT /api/products/{productId}
DELETE /api/products/{productId}
```

### Pagos (Stripe)

```http
POST /api/payments/create-invoice
{
  "clientId": "1",
  "items": [
    {
      "productId": "prod-1",
      "quantity": 2
    }
  ],
  "dueDate": "2026-05-03"
}

GET /api/payments/invoices
GET /api/payments/invoices/{invoiceId}
POST /api/payments/webhooks/stripe
```

### Dashboard

```http
GET /api/dashboard/metrics
{
  "totalRevenue": 125000,
  "totalClients": 342,
  "totalOrders": 1250,
  "conversionRate": 8.5,
  "topProducts": [...],
  "salesByMonth": [...]
}

GET /api/dashboard/sales-forecast
GET /api/dashboard/reports/export?format=xlsx
```

### Documentación Swagger

```
http://localhost:3000/docs
http://localhost:3000/v1/docs
```

---

## 🧪 Testing

### Backend (Jest)

```bash
cd crm-negocio-api

# Tests unitarios
npm run test

# Modo watch (auto-rerun en cambios)
npm run test:watch

# Coverage
npm run test:cov

# Tests E2E
npm run test:e2e
```

### Frontend (Jest + React Native Testing Library)

```bash
cd crm-negocio-app

# Tests unitarios
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# Tests E2E
npm run test:e2e

# Ejecutar test especifico
npm run test -- login.e2e-spec
```

### Ejemplo: Test de Chat con Sincronización

```typescript
describe('Chat E2E', () => {
  it('debe sincronizar mensajes cada 2 segundos', async () => {
    // 1. Usuario escribe mensaje
    fireEvent.press(getByText('Send'));
    
    // 2. Debe guardarse localmente inmediatamente
    expect(useChatStore.getState().messages).toHaveLength(1);
    expect(useChatStore.getState().messages[0].synced).toBe(false);
    
    // 3. Hook useChatSync debe sincronizar en 2s
    await waitFor(
      () => expect(useChatStore.getState().messages[0].synced).toBe(true),
      { timeout: 3000 }
    );
    
    // 4. Backend debe persistir el mensaje
    expect(getChatApi).toHaveBeenCalled();
  });
});
```

---

## 🐳 Docker & Deployment

### Build Docker (Backend)

```bash
cd crm-negocio-api

# Build image
docker build -t crm-negocio-api:latest .

# Tag para registry
docker tag crm-negocio-api:latest registry.example.com/crm-negocio-api:latest

# Push a registry
docker push registry.example.com/crm-negocio-api:latest
```

### Docker Compose (Local Development)

```bash
# Levantar servicios (Postgres + Redis)
docker-compose up -d

# Logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Resetear base de datos
docker-compose down -v && docker-compose up -d
```

### Deployment a Producción

Ver [NEXT_STEPS.md](./docs/implementation-notes/NEXT_STEPS.md) para guía completa de deployment a:
- Heroku
- Vercel
- AWS (ECS, App Runner, Lambda)
- Railway
- DigitalOcean
- Azure

---

## 📈 Roadmap y Próximos Pasos

### Phase 1: Completado ✅
- [x] Autenticación JWT
- [x] CRUD de clientes
- [x] Chat con persistencia multimedia
- [x] Dashboard básico
- [x] Tests E2E

### Phase 2: En Progreso 🚧
- [ ] Integración de calendario
- [ ] Automatización de workflows
- [ ] Reports avanzados
- [ ] API de terceros (HubSpot sync, etc)

### Phase 3: Futuro 📅
- [ ] Mobile app nativa (iOS App Store, Google Play)
- [ ] Inteligencia artificial predictiva
- [ ] Integración con redes sociales
- [ ] Multilenguaje
- [ ] Soporte para múltiples sedes

---

## 🐛 Troubleshooting

### Error: "No se encuentra variable DATABASE_URL"

```bash
# Asegúrate que:
# 1. Existe el archivo .env en crm-negocio-api/
# 2. Contiene DATABASE_URL
# 3. La base de datos está corriendo
docker-compose up -d
```

### Error: "Cannot find module '@nestjs/common'"

```bash
cd crm-negocio-api
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
```

### Error: "ECONNREFUSED 127.0.0.1:3000" en frontend

```bash
# Backend no está corriendo
cd crm-negocio-api
npm run start:dev

# O revisa .env de frontend
cat .env # EXPO_PUBLIC_API_URL debe ser http://localhost:3000
```

### Error en Tests: "describe is not defined"

```bash
# Falta @types/jest en tsconfig.json
# Ejecutar: (ya hecho)
# tsconfig.json debe incluir "jest" en types[]
```

---

## 📚 Documentación Adicional

- **[QUICK_START.md](./docs/implementation-notes/QUICK_START.md)** - Inicio rápido
- **[CHAT_PERSISTENCE_SETUP.md](./docs/implementation-notes/CHAT_PERSISTENCE_SETUP.md)** - Detalles de Chat IA
- **[IMPLEMENTATION_STATUS.md](./docs/implementation-notes/IMPLEMENTATION_STATUS.md)** - Estado de implementación
- **[CHANGES_SUMMARY.md](./docs/implementation-notes/CHANGES_SUMMARY.md)** - Resumen de cambios
- **[VERIFICATION_REPORT.md](./docs/implementation-notes/VERIFICATION_REPORT.md)** - Reporte de verificación
- **[NEXT_STEPS.md](./docs/implementation-notes/NEXT_STEPS.md)** - Próximos pasos

---

## 👥 Equipo y Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -am 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

**Convenciones de Commit:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formateo de código
- `test:` Agregar/actualizar tests
- `chore:` Actualizaciones de dependencias

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 📞 Soporte

Para soporte técnico o reportar bugs:

- **Issues**: [Crear issue en GitHub](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Email**: support@crmnegocio.local

---

## 🙌 Agradecimientos

Construido con ❤️ usando:
- **NestJS** - Framework backend robusto
- **React Native + Expo** - Desarrollo mobile multiplataforma
- **Prisma** - ORM tipo-seguro
- **PostgreSQL** - Base de datos confiable
- **Zustand** - State management ligero
- **Stripe** - Procesamiento de pagos
- **TypeScript** - Type safety en JavaScript

---

**Última actualización:** 3 de abril de 2026  
**Versión:** 0.1.0  
**Estado:** En desarrollo activo
