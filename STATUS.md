# 📊 Estado del Proyecto - MemeCards

**Fecha de revisión:** 26 de enero de 2026  
**Versión:** 1.0.0

---

## 🎯 Resumen del Proyecto

**MemeCards** es una aplicación web full-stack para crear y compartir tarjetas de audio personalizadas. El sistema permite a los usuarios grabar mensajes de voz, crear tarjetas digitales con códigos únicos, y compartirlas mediante URLs o códigos QR. Incluye funcionalidades de gestión de tiendas físicas con integración de mapas.

### Características Principales

- ✅ **Grabación de audio en tiempo real** desde el navegador
- ✅ **Procesamiento de audio** con FFmpeg (conversión, optimización)
- ✅ **Generación automática de páginas** (10 páginas adicionales por cada tarjeta creada)
- ✅ **Sistema de códigos únicos** de 8 caracteres para cada tarjeta
- ✅ **Reproductor de audio** con límite de reproducciones (autodestrucción)
- ✅ **Generación de códigos QR** para compartir tarjetas
- ✅ **Dashboard administrativo** para gestionar páginas y tiendas
- ✅ **Gestión de tiendas físicas** con MongoDB Atlas
- ✅ **Integración con Google Maps** para ubicaciones
- ✅ **Búsqueda de GIFs** integrada
- ✅ **Personalización de tarjetas** (nombre remitente/destinatario, mensaje escrito, GIF)

---

## 🏗️ Arquitectura

### Frontend
- **Framework:** React 18.3.1 con TypeScript
- **Build Tool:** Vite 5.4.2
- **Estilos:** Tailwind CSS 3.4.1
- **Estado:** React Hooks (useState, useEffect)
- **Iconos:** Lucide React
- **QR Codes:** qrcode library
- **Base de datos:** Backend local (JSON file) + MongoDB Atlas para tiendas

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 4.18.2
- **Lenguaje:** TypeScript 5.5.3
- **Base de datos:** MongoDB Atlas (Mongoose 8.0.3)
- **Procesamiento de audio:** FFmpeg (fluent-ffmpeg 2.1.2)
- **Upload de archivos:** Multer 1.4.5-lts.1
- **Almacenamiento:** Sistema de archivos local (uploads/, processed/)

### Estructura de Datos
- **Páginas de audio:** JSON file (`server/pages-data/pages.json`)
- **Tiendas:** MongoDB Atlas (colección `storelocations`)

---

## 📁 Estructura del Proyecto

```
memecards/
├── src/                          # Frontend React
│   ├── components/               # Componentes React
│   │   ├── CardDisplay.tsx      # Visualización de tarjeta
│   │   ├── CardSuccess.tsx      # Página de éxito
│   │   ├── CreateCardForm.tsx   # Formulario de creación
│   │   ├── Dashboard.tsx        # Dashboard principal
│   │   ├── LandingPage.tsx      # Página de inicio
│   │   ├── PinLock.tsx          # Bloqueo por PIN
│   │   ├── StoreLocations.tsx   # Lista de tiendas
│   │   ├── StorePage.tsx        # Página de tienda
│   │   └── StoresDashboard.tsx  # Dashboard de tiendas
│   ├── lib/
│   ├── utils/
│   │   └── cardCode.ts           # Generación de códigos
│   └── App.tsx                   # Componente principal
│
├── server/                       # Backend Node.js/Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts      # Conexión MongoDB
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts  # Manejo de errores
│   │   │   └── upload.ts        # Configuración Multer
│   │   ├── models/
│   │   │   └── StoreLocation.ts # Modelo de tienda
│   │   ├── routes/
│   │   │   ├── api.routes.ts    # Info, health, version
│   │   │   ├── audio.routes.ts  # Endpoints de audio
│   │   │   ├── gif.routes.ts    # Búsqueda de GIFs
│   │   │   ├── page.routes.ts   # API de páginas
│   │   │   ├── publicPage.routes.ts # Páginas públicas
│   │   │   └── storeLocation.routes.ts # API de tiendas
│   │   ├── services/
│   │   │   ├── audioProcessor.ts    # Procesamiento FFmpeg
│   │   │   ├── autoGeneratePages.ts # Generación automática
│   │   │   ├── pageService.ts       # Gestión de páginas
│   │   │   └── templateService.ts   # Renderizado HTML
│   │   └── templates/
│   │       └── audioPage.html       # Template de página
│   ├── scripts/                  # Scripts de utilidad
│   │   ├── generate-100-pages.ts
│   │   ├── seed-stores.ts
│   │   └── ...
│   └── pages-data/              # Datos de páginas (JSON)
│
└── [archivos de configuración]
```

---

## 🔧 Tecnologías y Dependencias

### Frontend
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "qrcode": "^1.5.4",
  "lucide-react": "^0.344.0",
  "vite": "^5.4.2",
  "tailwindcss": "^3.4.1",
  "typescript": "^5.5.3"
}
```

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "multer": "^1.4.5-lts.1",
  "fluent-ffmpeg": "^2.1.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "uuid": "^9.0.1",
  "qrcode": "^1.5.4",
  "typescript": "^5.5.3"
}
```

---

## ⚙️ Configuración Actual

### Variables de Entorno

#### Frontend (`.env` en raíz)
```env
VITE_BACKEND_URL=http://localhost:3000
```

#### Backend (`server/.env`)
```env
PORT=3000
NODE_ENV=development
UPLOAD_DIR=./uploads
PROCESSED_DIR=./processed
PAGES_DIR=./pages-data
BASE_URL=http://localhost:3000
MONGODB_ATLAS=mongodb+srv://...  # ✅ Configurado
```

### Estado de Servicios

- ✅ **Backend Express:** Configurado y funcionando
- ✅ **MongoDB Atlas:** Conectado (db_bot)
- ✅ **FFmpeg:** Requerido para procesamiento de audio

---

## 🚀 Endpoints de la API

### Información General
- `GET /api` - Información completa de la API
- `GET /api/health` - Estado de salud del servidor
- `GET /api/version` - Versión de la API

### Audio
- `POST /api/audio/upload` - Subir archivo de audio
- `POST /api/audio/process` - Procesar audio
- `GET /api/audio/stream/:filename` - Stream de audio
- `GET /api/audio/info/:filename` - Información del audio
- `POST /api/audio/convert` - Convertir formato

### Páginas
- `POST /api/pages/create` - Crear página (genera 10 adicionales)
- `GET /api/pages` - Listar todas las páginas
- `GET /api/pages/:code` - Obtener página por código
- `PUT /api/pages/:code/personalize` - Personalizar página
- `POST /api/pages/:code/play` - Incrementar contador de reproducciones
- `DELETE /api/pages/:code` - Eliminar página
- `GET /page/:code` - Página pública HTML

### Tiendas (MongoDB)
- `GET /api/stores` - Listar tiendas
- `GET /api/stores/:id` - Obtener tienda por ID
- `POST /api/stores` - Crear tienda
- `PUT /api/stores/:id` - Actualizar tienda
- `DELETE /api/stores/:id` - Eliminar tienda
- `POST /api/stores/bulk` - Crear múltiples tiendas

### GIFs
- `GET /api/gifs/search` - Buscar GIFs

---

## ✅ Funcionalidades Implementadas

### Frontend
- [x] Página de inicio (Landing Page)
- [x] Formulario de creación de tarjetas
- [x] Grabación de audio en tiempo real
- [x] Reproducción de audio antes de enviar
- [x] Visualización de tarjetas creadas
- [x] Página de éxito con código QR
- [x] Dashboard administrativo
- [x] Búsqueda y filtrado de páginas
- [x] Generación y descarga de códigos QR
- [x] Gestión de tiendas
- [x] Integración con Google Maps
- [x] Búsqueda de GIFs
- [x] Personalización de tarjetas

### Backend
- [x] Procesamiento de audio con FFmpeg
- [x] Generación automática de páginas (10 adicionales)
- [x] Sistema de códigos únicos
- [x] Límite de reproducciones (autodestrucción)
- [x] Streaming de audio con range requests
- [x] API REST completa
- [x] Integración con MongoDB Atlas
- [x] Gestión de tiendas físicas
- [x] Búsqueda de GIFs (integración externa)
- [x] Health checks y monitoreo
- [x] Manejo de errores centralizado

### Características Especiales
- [x] **Autodestrucción:** Las tarjetas se eliminan automáticamente después de 5 reproducciones
- [x] **Expiración:** Fecha de expiración configurada (14 de febrero de 2026)
- [x] **Generación masiva:** Cada tarjeta crea 10 páginas adicionales automáticamente
- [x] **Personalización:** Campos para remitente, destinatario, mensaje escrito y GIF

---

## 🔄 Flujo de la Aplicación

### Creación de Tarjeta
1. Usuario accede a la landing page
2. Hace clic en "Crear Tarjeta"
3. Completa formulario (nombres, mensaje escrito)
4. Graba mensaje de voz
5. Reproduce y verifica el audio
6. Envía el formulario
7. Sistema procesa el audio con FFmpeg
8. Crea página principal con código único
9. Genera automáticamente 10 páginas adicionales (en segundo plano)
10. Muestra página de éxito con código QR y URL

### Visualización de Tarjeta
1. Usuario accede a `/page/:code` o `/card/:code`
2. Sistema carga información de la página
3. Muestra reproductor de audio personalizado
4. Al reproducir, incrementa contador
5. Si alcanza 5 reproducciones, se autodestruye

### Dashboard
1. Acceso a `/dashboard`
2. Visualiza todas las páginas creadas
3. Genera códigos QR
4. Copia URLs
5. Elimina páginas
6. Gestiona tiendas

---

## 📊 Estado de Desarrollo

### ✅ Completado
- Arquitectura base (frontend + backend)
- Sistema de grabación de audio
- Procesamiento de audio con FFmpeg
- Generación de páginas dinámicas
- Sistema de códigos únicos
- Dashboard administrativo
- Integración con MongoDB
- Gestión de tiendas
- Búsqueda de GIFs
- Personalización de tarjetas
- Autodestrucción por límite de reproducciones

### ⚠️ Pendiente / Mejoras Sugeridas
- [ ] Tests unitarios y de integración
- [ ] Documentación de API más detallada (Swagger/OpenAPI)
- [ ] Autenticación y autorización
- [ ] Rate limiting en endpoints
- [ ] Validación más robusta de inputs
- [ ] Manejo de errores más específico en frontend
- [ ] Optimización de imágenes y assets
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Analytics y métricas de uso
- [ ] Internacionalización (i18n)
- [ ] Modo oscuro
- [ ] Compresión de audio más agresiva
- [ ] CDN para archivos estáticos
- [ ] Backup automático de páginas

---

## 🐛 Problemas Conocidos

1. **Variable de entorno faltante:** `storeId` no está definida en `App.tsx` (línea 50)
3. **Almacenamiento local:** Las páginas se guardan en JSON file, no en base de datos (puede ser limitante a escala)

---

## 📝 Scripts Disponibles

### Frontend
```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linter
npm run typecheck    # Verificación de tipos
```

### Backend
```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm start            # Ejecutar en producción
npm run typecheck    # Verificación de tipos
npm run generate-pages    # Generar 100 páginas de prueba
npm run seed-stores       # Seed de tiendas
npm run create-test-pages # Crear páginas de prueba
```

---

## 🔐 Seguridad

### Implementado
- CORS configurado
- Validación de tipos con TypeScript
- Sanitización básica de inputs
- Manejo de errores sin exponer información sensible

### Recomendaciones
- Implementar rate limiting
- Validación más estricta de archivos subidos
- Autenticación para endpoints administrativos
- HTTPS en producción
- Sanitización de HTML en templates

---

## 📈 Métricas y Monitoreo

### Disponible
- Health check endpoint (`/api/health`)
- Información del servidor (`/api`)
- Uptime tracking
- Estado de servicios (MongoDB, storage)

### Pendiente
- Logging estructurado
- Métricas de uso (páginas creadas, reproducciones)
- Alertas automáticas
- Dashboard de métricas

---

## 🚀 Despliegue

### Requisitos
- Node.js 18+
- FFmpeg instalado
- MongoDB Atlas (o MongoDB local)
- Variables de entorno configuradas

### Pasos
1. Instalar dependencias (frontend y backend)
2. Configurar variables de entorno
3. Compilar backend: `cd server && npm run build`
4. Compilar frontend: `npm run build`
5. Ejecutar servidor: `cd server && npm start`
6. Servir frontend (puede usar el mismo servidor o servidor estático)

---

## 📚 Documentación Adicional

- `server/README.md` - Documentación del backend
- `server/API-DOCUMENTATION.md` - Documentación completa de la API
- `server/MONGODB-SETUP.md` - Guía de configuración de MongoDB
- `SETUP-AUDIO.md` - Configuración de audio
- `SETUP-INSTRUCTIONS.md` - Instrucciones generales

---

## 👥 Notas de Desarrollo

- El proyecto usa TypeScript en ambos lados (frontend y backend)
- El backend está en modo ES modules (`"type": "module"`)
- Las páginas se almacenan en JSON file, no en base de datos (diseño intencional)
- Cada tarjeta genera automáticamente 10 páginas adicionales para distribución
- El sistema tiene límite de 5 reproducciones por tarjeta antes de autodestruirse
- Fecha de expiración hardcodeada: 14 de febrero de 2026

---

**Última actualización:** 26 de enero de 2026
