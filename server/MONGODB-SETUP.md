# Configuración de MongoDB Atlas

## Pasos para configurar MongoDB Atlas

### 1. Crear cuenta en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita (M0 - Free Tier)
3. Crea un nuevo cluster (puede tardar unos minutos)

### 2. Configurar acceso a la base de datos

1. En el dashboard de Atlas, ve a **Database Access**
2. Crea un nuevo usuario:
   - Username: `admin` (o el que prefieras)
   - Password: Genera una contraseña segura (guárdala)
   - Database User Privileges: `Atlas admin` o `Read and write to any database`

### 3. Configurar Network Access

1. Ve a **Network Access**
2. Agrega una IP:
   - Para desarrollo: `0.0.0.0/0` (permite acceso desde cualquier IP)
   - Para producción: Agrega solo las IPs de tus servidores

### 4. Obtener Connection String

1. Ve a **Database** → **Connect**
2. Selecciona **Connect your application**
3. Copia la connection string, se verá así:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 5. Configurar en el proyecto

1. Edita el archivo `.env` en la carpeta `server/`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tarjetas-db?retryWrites=true&w=majority
   ```

   Reemplaza:
   - `username`: Tu usuario de MongoDB
   - `password`: Tu contraseña
   - `cluster0.xxxxx`: Tu cluster
   - `tarjetas-db`: Nombre de tu base de datos

### 6. Poblar la base de datos

Ejecuta el script de seed para crear tiendas de ejemplo:

```bash
cd server
npm run seed-stores
```

O con la opción de limpiar datos existentes:

```bash
npm run seed-stores -- --clear
```

## Estructura del Schema

El modelo `StoreLocation` incluye:

- **name**: Nombre de la tienda (requerido)
- **address**: Dirección completa (requerido)
- **phone**: Teléfono (opcional)
- **hours**: Horarios de atención (opcional)
- **latitude**: Latitud GPS (requerido, -90 a 90)
- **longitude**: Longitud GPS (requerido, -180 a 180)
- **city**: Ciudad (requerido)
- **state**: Estado/Provincia (opcional)
- **country**: País (opcional, default: "México")
- **isActive**: Estado activo/inactivo (default: true)
- **createdAt**: Fecha de creación (automático)
- **updatedAt**: Fecha de actualización (automático)

## Endpoints disponibles

### GET /api/stores
Obtiene todas las tiendas (con filtros opcionales)

Query params:
- `city`: Filtrar por ciudad
- `state`: Filtrar por estado
- `isActive`: Filtrar por estado activo (true/false)
- `search`: Búsqueda de texto en nombre, dirección o ciudad

### GET /api/stores/:id
Obtiene una tienda por ID

### POST /api/stores
Crea una nueva tienda

Body:
```json
{
  "name": "Nombre de la tienda",
  "address": "Dirección completa",
  "phone": "+52 55 1234 5678",
  "hours": "Lun-Sab: 9:00 AM - 8:00 PM",
  "latitude": 19.4326,
  "longitude": -99.1332,
  "city": "Ciudad de México",
  "state": "CDMX",
  "country": "México",
  "isActive": true
}
```

### PUT /api/stores/:id
Actualiza una tienda existente

### DELETE /api/stores/:id
Elimina una tienda (soft delete por defecto)

Query params:
- `hard=true`: Eliminación física permanente

### POST /api/stores/bulk
Crea múltiples tiendas a la vez

Body:
```json
{
  "stores": [
    { "name": "...", "address": "...", ... },
    { "name": "...", "address": "...", ... }
  ]
}
```

## Índices creados

El schema incluye índices para optimizar búsquedas:

- Índice en `city`
- Índice en `state`
- Índice en `isActive`
- Índice geoespacial en `latitude` y `longitude`
- Índice de texto completo en `name`, `address` y `city`

## Ejemplos de uso

### Crear una tienda
```bash
curl -X POST http://localhost:3000/api/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Tienda",
    "address": "Calle Principal 123",
    "latitude": 19.4326,
    "longitude": -99.1332,
    "city": "Ciudad de México"
  }'
```

### Obtener todas las tiendas
```bash
curl http://localhost:3000/api/stores
```

### Obtener una tienda por ID
```bash
curl http://localhost:3000/api/stores/507f1f77bcf86cd799439011
```

### Buscar tiendas
```bash
curl "http://localhost:3000/api/stores?search=corazón&city=Ciudad de México"
```
