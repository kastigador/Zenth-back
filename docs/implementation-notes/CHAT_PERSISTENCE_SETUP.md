# Chat IA com Persistencia Completa

## Setup Backend

### 1. Instalar dependencias
```bash
cd crm-negocio-api
npm install
```

### 2. Variables de entorno
Verifica que `.env` tenga `DATABASE_URL` configurada correctamente para PostgreSQL.

### 3. Ejecutar migrations
```bash
npm run prisma:migrate
# Cuando pregunte por el nombre de la migration: add_chat_messages
```

### 4. Generar cliente Prisma
```bash
npm run prisma:generate
```

### 5. Ejecutar backend
```bash
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`.

## Setup Frontend

### 1. Instalar dependencias
```bash
cd crm-negocio-app
npm install
```

### 2. Variables de entorno
Verifica que las variables estén configuradas en `.env` (o directamente en el código):
- `EXPO_PUBLIC_API_URL` debe apuntar al backend (ej: `http://localhost:3000/v1`)

### 3. Ejecutar app
```bash
# Web
npm run web

# Android
npm run android

# iOS
npm run ios
```

## Endpoints de Chat

Todos requieren JWT en el header `Authorization: Bearer {token}`.

### Crear mensaje
```
POST /api/chat/messages
Content-Type: application/json

{
  "role": "USER",
  "type": "TEXT",
  "text": "Tu mensaje",
  "mediaUri": "file:///...",
  "card": { ... }
}
```

### Listar mensajes
```
GET /api/chat/messages?limit=50&offset=0
```

### Obtener un mensaje
```
GET /api/chat/messages/{id}
```

### Eliminar un mensaje
```
DELETE /api/chat/messages/{id}
```

### Borrar todo
```
DELETE /api/chat/messages
```

## Flujo de Sincronización

1. **Local-first**: mensajes se guardan en AsyncStorage inmediatamente
2. **Auto-sync**: cada 2 segundos, los mensajes con `synced: false` se envían al backend
3. **Marca como synced**: cuando el backend confirma, se marca como `synced: true`
4. **Cargar histórico**: al abrir el chat, carga todos los mensajes desde el servidor

## Tipos de Mensajes

- **TEXT**: mensaje de texto
- **IMAGE**: imagen seleccionada de galería (guardada en documentDirectory del dispositivo)
- **AUDIO**: grabación de audio (m4a, guardada en documentDirectory)

## Card Data (Datos Embebidos)

Ejemplo de tarjeta con datos de ventas:

```typescript
{
  label: "VENTAS TOTALES",
  value: "$45,200",
  growth: "+12%",
  orders: "128",
  avgTicket: "$353"
}
```

Se guarda como JSON en la BD para máxima flexibilidad.
