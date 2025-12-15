# 🎯 Focus Up Frontend

> **Aplicación React TypeScript** para gestión de métodos de estudio con **música persistente global** 🎵

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Una aplicación moderna construida con **arquitectura modular por dominios**, **type safety completo** y **mejores prácticas de desarrollo**. Diseñada para mejorar la concentración y productividad mediante métodos de estudio interactivos, temporizadores persistentes y reproducción de música ininterrumpida.

## 📁 Estructura del Proyecto - Arquitectura Modular Completa

```
src/
├── modules/                    # 🏗️ Arquitectura modular por dominios de negocio
│   ├── auth/                   # 🔐 Módulo de autenticación
│   │   ├── components/         # Componentes específicos de auth
│   │   │   └── RequireAuth.tsx # Protección de rutas
│   │   ├── contexts/           # Contextos de autenticación
│   │   │   └── AuthContext.tsx # Estado de usuario y tokens
│   │   ├── hooks/              # Hooks específicos de auth
│   │   │   └── useAuth.ts      # Gestión de autenticación
│   │   ├── pages/              # Páginas de auth (6 páginas)
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── RegisterStep2.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── ForgotPasswordResetPage.tsx
│   │   │   └── ForgotPasswordCodePage.tsx
│   │   └── index.ts            # Barrel exports del módulo
│   ├── music/                  # 🎵 Módulo de música
│   │   ├── components/         # Componentes de música
│   │   │   └── MusicPlayer.tsx # Reproductor persistente
│   │   ├── pages/              # Páginas de música (2 páginas)
│   │   │   ├── MusicAlbumsPage.tsx
│   │   │   └── MusicSongsPage.tsx
│   │   └── index.ts            # Barrel exports
│   ├── sessions/               # ⏱️ Módulo de sesiones
│   │   ├── components/         # Componentes de sesiones
│   │   │   └── ConcentrationCard.tsx
│   │   ├── pages/              # Páginas de sesiones (1 página)
│   │   │   └── StartSession.tsx
│   │   └── index.ts            # Barrel exports
│   ├── study-methods/          # 📚 Módulo de métodos de estudio
│   │   ├── components/         # Componentes específicos
│   │   │   └── MethodSelectionModal.tsx
│   │   ├── pages/              # Páginas de métodos (13 páginas)
│   │   │   ├── StudyMethodsLibraryPage.tsx
│   │   │   ├── PomodoroIntroView.tsx
│   │   │   ├── PomodoroExecutionView.tsx
│   │   │   ├── ActiveRecallIntroView.tsx
│   │   │   ├── ActiveRecallStepsView.tsx
│   │   │   ├── CornellIntroView.tsx
│   │   │   ├── CornellStepsView.tsx
│   │   │   ├── FeynmanIntroView.tsx
│   │   │   ├── FeynmanStepsView.tsx
│   │   │   ├── MindMapsInfoPage.tsx
│   │   │   ├── MindMapsStepsPage.tsx
│   │   │   ├── SpacedRepetitionIntroView.tsx
│   │   │   └── SpacedRepetitionStepsView.tsx
│   │   └── index.ts            # Barrel exports
│   ├── events/                 # 📅 Módulo de eventos
│   │   └── pages/              # Páginas de eventos (3 páginas)
│   │       ├── EventsPage.tsx
│   │       ├── CreateEventModal.tsx
│   │       └── EditEventModal.tsx
│   └── notifications/          # 🔔 Módulo de notificaciones
│       └── pages/              # Páginas de notificaciones (1 página)
│           └── NotificationPage.tsx
├── shared/                     # 🔄 Recursos compartidos entre módulos
│   ├── components/             # 🎨 Componentes UI reutilizables
│   │   └── ui/                 # Componentes base
│   │       ├── Button.tsx      # Botón genérico
│   │       ├── Input.tsx       # Input con validación
│   │       ├── LoadingSpinner.tsx # Spinner de carga
│   │       ├── FormField.tsx   # Campo de formulario
│   │       ├── PageLayout.tsx  # Layout de página
│   │       ├── ProgressCircle.tsx # Círculo de progreso
│   │       ├── Sidebar.tsx     # Barra lateral
│   │       └── Timer.tsx       # Componente de temporizador
│   ├── hooks/                  # 🪝 Hooks genéricos reutilizables
│   │   ├── useApi.ts           # Hook para llamadas API
│   │   ├── useLoading.ts       # Hook para estados de carga
│   │   └── index.ts            # Barrel exports
│   ├── services/               # 🌐 Servicios compartidos
│   │   ├── apiClient.ts        # Cliente HTTP con JWT
│   │   └── index.ts            # Barrel exports
│   ├── utils/                  # 🛠️ Utilidades comunes
│   │   ├── dateUtils.ts        # Utilidades de fechas
│   │   ├── validationUtils.ts  # Validaciones de formularios
│   │   ├── broadcastChannel.ts # Sincronización multi-pestaña
│   │   ├── sleepDetector.ts    # Detector de suspensión sistema
│   │   ├── offlineQueue.ts     # Cola de acciones offline
│   │   ├── sessionMappers.ts   # Mapeo de sesiones
│   │   ├── musicUtils.ts       # Utilidades de música
│   │   └── index.ts            # Barrel exports
│   └── index.ts                # Barrel exports principales
├── types/                      # 📝 Sistema de tipos TypeScript completo
│   ├── api/                    # 🌐 Tipos de respuestas API
│   │   ├── ApiResponse.ts      # Respuesta genérica API
│   │   ├── ApiError.ts         # Errores de API
│   │   ├── IMailer.ts          # Tipos de email
│   │   └── index.ts            # Barrel exports
│   ├── domain/                 # 🏢 Tipos por dominio de negocio
│   │   ├── auth/               # Tipos de autenticación
│   │   │   ├── IUser.ts        # Usuario del dominio
│   │   │   ├── ILoginRequest.ts # Solicitud de login
│   │   │   ├── IRegisterRequest.ts # Solicitud de registro
│   │   │   └── index.ts        # Barrel exports
│   │   ├── music/              # Tipos de música
│   │   │   ├── IAlbum.ts       # Álbum musical
│   │   │   ├── ISong.ts        # Canción
│   │   │   ├── IPlayerState.ts # Estado del reproductor
│   │   │   └── index.ts        # Barrel exports
│   │   ├── study-methods/      # Tipos de métodos de estudio
│   │   │   ├── IMethod.ts      # Método de estudio
│   │   │   ├── IPomodoroConfig.ts # Configuración Pomodoro
│   │   │   ├── IMethodExecution.ts # Ejecución de método
│   │   │   └── index.ts        # Barrel exports
│   │   └── config/             # Configuraciones
│   │       └── IStudyMethodConfig.ts
│   ├── ui/                     # 🎨 Tipos de componentes UI
│   │   ├── IComponentProps.ts  # Props comunes de componentes
│   │   ├── IFormFields.ts      # Campos de formulario
│   │   ├── IModalConfig.ts     # Configuración de modales
│   │   └── index.ts            # Barrel exports
│   ├── shared/                 # 🔄 Tipos compartidos
│   │   ├── IBaseEntity.ts      # Entidad base con ID
│   │   ├── ITimestamps.ts      # Timestamps creados/actualizados
│   │   └── index.ts            # Barrel exports
│   ├── middleware/             # 🛡️ Tipos de middleware
│   │   ├── IAuthUser.ts        # Usuario autenticado
│   │   └── index.ts            # Barrel exports
│   ├── repositories/           # 🗄️ Tipos de repositorios
│   │   ├── IBaseRepository.ts  # Repositorio base
│   │   ├── ISessionRepository.ts # Repositorio de sesiones
│   │   ├── IUserRepository.ts  # Repositorio de usuarios
│   │   └── index.ts            # Barrel exports
│   ├── services/               # 🔧 Tipos de servicios
│   │   ├── ISessionService.ts  # Servicio de sesiones
│   │   ├── IUserService.ts     # Servicio de usuarios
│   │   └── index.ts            # Barrel exports
│   ├── utils/                  # 🛠️ Tipos de utilidades
│   │   ├── ICache.ts           # Cache
│   │   ├── ILogger.ts          # Logger
│   │   └── index.ts            # Barrel exports
│   ├── events.ts               # 📅 Tipos de eventos
│   ├── user.ts                 # 👤 Tipos de usuario (legacy)
│   └── index.ts                # Barrel exports principales
├── stores/                     # 🗂️ Estado global (Zustand)
│   ├── authStore.ts            # Estado de autenticación
│   ├── musicStore.ts           # Estado del reproductor
│   ├── sessionStore.ts         # Estado de sesiones
│   └── index.ts                # Barrel exports
├── contexts/                   # 🔄 Contextos React (legacy pero mantenidos)
│   ├── AuthContext.tsx         # Contexto de autenticación
│   ├── MusicPlayerContext.tsx  # Contexto del reproductor
│   └── RequireAuth.tsx         # Protección de rutas
├── providers/                  # 🏭 Proveedores de estado complejo
│   └── ConcentrationSessionProvider.tsx # Proveedor de sesiones
├── services/                   # 🔧 Servicios específicos (no compartidos)
│   ├── audioService.ts         # Servicio de audio
│   ├── reportsService.ts       # Servicio de reportes
│   └── sessionService.ts       # Servicio de sesiones
├── hooks/                      # 🪝 Hooks específicos (no compartidos)
│   ├── useApi.ts               # Hook API (duplicado en shared)
│   ├── useApiError.ts          # Manejo de errores API
│   ├── useApiQueries.ts        # Queries API
│   ├── useAuth.ts              # Autenticación
│   ├── useConcentrationSession.ts # Sesiones de concentración
│   ├── useEvents.ts            # Eventos
│   ├── useFormHooks.ts         # Hooks de formularios
│   ├── useLoading.ts           # Estados de carga
│   ├── useMethodExecution.ts   # Ejecución de métodos
│   ├── useNotifications.ts     # Notificaciones
│   └── index.ts                # Barrel exports
├── components/                 # 🧩 Componentes legacy (no migrados)
│   ├── ui/                     # Componentes UI legacy
│   ├── ConcentrationCard.tsx   # Tarjeta de concentración
│   ├── DevTools.tsx            # Herramientas de desarrollo
│   ├── FirstLoginModal.tsx     # Modal de primer login
│   ├── MethodSelectionModal.tsx # Modal de selección de métodos
│   ├── MiniSessionCard.tsx     # Tarjeta de sesión mini
│   ├── SessionsUI.tsx          # UI de sesiones
│   └── StartSession.tsx        # Iniciar sesión
├── pages/                      # 📄 Páginas globales (no modularizadas)
│   ├── DashboardPage.tsx       # Dashboard principal
│   ├── ProfilePage.tsx         # Perfil de usuario
│   ├── ReportsPage.tsx         # Reportes
│   └── reports/                # Subpáginas de reportes
│       └── SessionsReport.tsx  # Reporte de sesiones
├── lib/                        # 📚 Configuraciones y utilidades
│   ├── queryClient.ts          # Cliente de queries (React Query)
│   └── validationSchemas.ts    # Schemas de validación (Zod)
├── integration/                # 🔗 Tests de integración
│   ├── registrationFlow.test.ts # Flujo de registro
│   └── sessionFlows.test.ts     # Flujos de sesiones
├── App.tsx                     # 🚀 Componente raíz de la aplicación
├── App.css                     # 🎨 Estilos globales
├── main.tsx                    # ⚡ Punto de entrada
├── index.css                   # 🎨 Estilos base
└── CHANGES_CODIGO_LIMPIO.md    # 📝 Registro de cambios
```

## 🏗️ Arquitectura Modular - Cómo Interactúan los Sistemas

### 🎯 Principios de Diseño Arquitectónico

La arquitectura sigue el patrón **"Modular por Dominios de Negocio"** con separación clara de responsabilidades:

- **🏛️ Modularidad por Dominios**: Cada módulo (`auth`, `music`, `sessions`, etc.) es autónomo y encapsula un dominio completo
- **🔒 Type Safety Total**: Sistema de tipos TypeScript jerárquico y organizado
- **🔄 Estado Global Eficiente**: Múltiples estrategias de estado según la complejidad
- **🎵 Música Persistente**: Arquitectura especializada para audio que sobrevive navegación
- **📱 Responsive Design**: Componentes reutilizables con Tailwind CSS

### 🔄 Flujo de Interacción Entre Sistemas

```
┌─────────────────────────────────────────────────────────────────┐
│                    🖥️ CAPA DE PRESENTACIÓN                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    🌐 App.tsx (Raíz)                        │ │
│  │  - BrowserRouter para navegación SPA                       │ │
│  │  - Suspense para lazy loading                              │ │
│  │  - Error boundaries                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              🎭 Contextos Globales                          │ │
│  │  - AuthContext: Estado de usuario y tokens                 │ │
│  │  - MusicPlayerContext: Reproductor persistente             │ │
│  │  - RequireAuth: Protección de rutas                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              📱 Páginas (Módulos)                           │ │
│  │  - Lazy loading por rutas                                  │ │
│  │  - Componentes específicos por dominio                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   🏭 CAPA DE LÓGICA DE NEGOCIO                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              🗂️ Stores (Zustand) - Estado Global             │ │
│  │  - authStore: Autenticación y usuario                      │ │
│  │  - musicStore: Estado del reproductor                      │ │
│  │  - sessionStore: Sesiones activas                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           🏭 Providers - Estado Complejo                    │ │
│  │  - ConcentrationSessionProvider: Lógica de sesiones       │ │
│  │    └─ useConcentrationSession hook                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                🪝 Hooks Personalizados                       │ │
│  │  - useAuth: Gestión de autenticación                       │ │
│  │  - useApi: Llamadas HTTP con manejo de errores            │ │
│  │  - useEvents: Gestión de eventos                           │ │
│  │  - useNotifications: Sistema de notificaciones            │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   🔧 CAPA DE SERVICIOS Y UTILIDADES              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              🌐 Servicios API                               │ │
│  │  - apiClient: Cliente HTTP con interceptores JWT           │ │
│  │  - sessionService: Operaciones de sesiones                 │ │
│  │  - audioService: Gestión de audio                          │ │
│  │  - reportsService: Generación de reportes                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │            🛠️ Utilidades Compartidas                        │ │
│  │  - broadcastChannel: Sincronización multi-pestaña          │ │
│  │  - sleepDetector: Corrección de timers en suspensión       │ │
│  │  - offlineQueue: Acciones offline                          │ │
│  │  - validationUtils: Validaciones de formularios            │ │
│  │  - dateUtils: Manipulación de fechas                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              📝 Sistema de Tipos                            │ │
│  │  - api/: Tipos de respuestas HTTP                          │ │
│  │  - domain/: Tipos por dominio de negocio                   │ │
│  │  - ui/: Tipos de componentes                               │ │
│  │  - shared/: Tipos comunes                                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   🎨 CAPA DE COMPONENTES Y UI                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │            🔄 Componentes Compartidos                       │ │
│  │  - Button, Input, LoadingSpinner: UI base                  │ │
│  │  - FormField, Modal: Componentes compuestos                │ │
│  │  - Timer, ProgressCircle: Componentes especializados       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           🏗️ Componentes por Módulo                         │ │
│  │  - MusicPlayer: Reproductor persistente                     │ │
│  │  - ConcentrationCard: Gestión de sesiones                  │ │
│  │  - MethodSelectionModal: Selección de métodos              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 🔄 Interacciones Clave Entre Sistemas

#### 1. **🎵 Música Persistente - Arquitectura Especializada**

```
MusicPlayerContext (Global) ↔ MusicPlayer Component ↔ audioService
       ↓                           ↓                        ↓
   musicStore (Zustand) ↔ broadcastChannel ↔ Audio Element (DOM)
```

- **MusicPlayerContext**: Mantiene instancia única del reproductor
- **musicStore**: Estado global del reproductor (Zustand)
- **broadcastChannel**: Sincronización entre pestañas
- **audioService**: Lógica de reproducción y playlist

#### 2. **⏱️ Sesiones de Concentración - Flujo Completo**

```
UI Component → useConcentrationSession → ConcentrationSessionProvider
      ↓                    ↓                           ↓
sessionStore → sessionService → apiClient → Backend API
      ↓            ↓                    ↓
broadcastChannel → sleepDetector → offlineQueue
```

- **useConcentrationSession**: Hook principal para sesiones
- **ConcentrationSessionProvider**: Lógica compleja de estado
- **sessionService**: Operaciones CRUD con el backend
- **broadcastChannel**: Sincronización multi-pestaña
- **sleepDetector**: Corrección automática de timers
- **offlineQueue**: Funcionalidad offline

#### 3. **🔐 Autenticación - Seguridad y Estado**

```
Login/Register → useAuth → AuthContext → apiClient
       ↓             ↓           ↓            ↓
   authStore → localStorage → JWT Interceptor → Backend
```

- **useAuth**: Hook de autenticación
- **AuthContext**: Estado de usuario global
- **authStore**: Estado adicional (Zustand)
- **JWT Interceptor**: Automatización de tokens

#### 4. **📊 Estado Global - Estrategias Múltiples**

```
React Context (Simple) ←→ Zustand Stores (Complejo) ←→ Providers (Muy Complejo)
     ↑                           ↑                           ↑
  AuthContext               musicStore              ConcentrationSessionProvider
```

- **Context**: Para estado simple y global (usuario, tema)
- **Zustand**: Para estado complejo con lógica (reproductor, sesiones)
- **Providers**: Para estado muy complejo con efectos colaterales

### 🔧 Tecnologías Principales por Capa

|     **Capa**     |           **Tecnologías**           |    **Propósito**     |
| :--------------: | :---------------------------------: | :------------------: |
| **Presentación** | React 18, React Router v6, Tailwind |   UI y navegación    |
|    **Estado**    |  Zustand, React Context, Providers  |  Gestión de estado   |
|  **Servicios**   |     Axios, BroadcastChannel API     | Comunicación externa |
|  **Utilidades**  |       Date-fns, Custom hooks        | Funciones auxiliares |
|    **Tipos**     | TypeScript, Interfaces organizadas  |     Type safety      |
|    **Build**     |       Vite, ESLint, Prettier        | Desarrollo y calidad |

### 🎨 Características de UI/UX

- **🌙 Tema Oscuro**: Diseño moderno con tema oscuro por defecto
- **♿ Accesibilidad**: Atributos ARIA y navegación por teclado
- **📱 Mobile First**: Optimizado para dispositivos móviles
- **⚡ Performance**: Componentes optimizados y carga lazy
- **🎯 Feedback Visual**: Estados de carga, errores y confirmaciones claras

## 🔄 Refactorización Completada - Arquitectura Modular

### ✅ Fases Ejecutadas

La refactorización completa del frontend se realizó en **4 fases principales**, transformando el código de una estructura plana a una **arquitectura modular por dominios** completamente funcional.

#### **Fase 1: Reorganización de Tipos** ✅

- **25+ interfaces** creadas y organizadas por dominio
- **Estructura jerárquica**: `api/`, `domain/`, `ui/`, `shared/`, `repositories/`, `services/`, `middleware/`, `utils/`
- **Barrel exports** en todos los niveles
- **Comentarios en español** en toda la documentación de tipos
- **TypeScript 100% funcional** sin errores

#### **Fase 2: Creación de Shared/** ✅

- **Componentes UI genéricos** movidos: `Button`, `Input`, `LoadingSpinner`, `FormField`
- **Hooks reutilizables**: `useApi`, `useLoading`
- **Servicios compartidos**: `apiClient` con interceptores JWT
- **Utilidades comunes**: `dateUtils`, `validationUtils`, `broadcastChannel`, `sleepDetector`, `offlineQueue`
- **Barrel exports** para importaciones limpias

#### **Fase 3A: Interfaces Faltantes** ✅

- **25 interfaces adicionales** creadas basadas en `InterfacesAPI/`
- **Corrección de errores**: `IMailer` movido a API types, `Buffer` → `Uint8Array`
- **Backend vs Frontend**: Separación clara de responsabilidades
- **Compatibilidad navegador** garantizada

#### **Fase 3B: Páginas en Módulos** ✅

- **26 páginas** reorganizadas en **6 módulos funcionales**
- **Barrel exports** por módulo para importaciones limpias
- **Imports actualizados** en `App.tsx` manteniendo lazy loading
- **Rutas preservadas** para compatibilidad backward
- **TypeScript compilación** exitosa

### 🏗️ Arquitectura Final

|    **Módulo**     | **Páginas** |         **Hooks**         |   **Servicios**   |                  **Tipos**                   |
| :---------------: | :---------: | :-----------------------: | :---------------: | :------------------------------------------: |
|     **Auth**      |  6 páginas  |         `useAuth`         |     Auth API      | `IUser`, `ILoginRequest`, `IRegisterRequest` |
|     **Music**     |  2 páginas  |        `useMusic`         |   Audio service   |      `IAlbum`, `ISong`, `IPlayerState`       |
|   **Sessions**    |  1 página   | `useConcentrationSession` |  Session service  |     `ISession`, `IConcentrationSession`      |
| **Study-Methods** | 13 páginas  |   `useMethodExecution`    |  Method progress  |         `IMethod`, `IPomodoroConfig`         |
|    **Events**     |  3 páginas  |        `useEvents`        |    Events API     |          `IEvento`, `IEventoCreate`          |
| **Notifications** |  1 página   |    `useNotifications`     | Notifications API |              Notification types              |

### 🎯 Beneficios Logrados

- **🏛️ Arquitectura Escalable**: Fácil adición de nuevos módulos
- **🔧 Mantenibilidad**: Código organizado por responsabilidades
- **👥 Colaboración**: Equipos pueden trabajar en módulos independientes
- **🔄 Reutilización**: Componentes y utilidades compartidas
- **📝 Type Safety**: Cobertura completa de TypeScript
- **⚡ Performance**: Lazy loading y optimizaciones preservadas

## 🚀 Inicio Rápido

### 📋 Prerrequisitos

- **Node.js** 18+
- **npm** o **yarn**
- **API Backend** ejecutándose

### ⚡ Instalación

```bash
# 1. Clonar repositorio
git clone <url-del-repositorio>
cd focus-up-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de tu API

# 4. Iniciar desarrollo
npm run dev
```

### 🔧 Configuración

Crear archivo `.env`:

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_ENABLE_DEVTOOLS=true
```

### 📜 Scripts Disponibles

```json
{
  "dev": "vite", // 🚀 Servidor de desarrollo
  "build": "vite build", // 📦 Build de producción
  "preview": "vite preview", // 👀 Vista previa del build
  "lint": "eslint .", // 🔍 Verificación de código
  "test": "vitest" // 🧪 Ejecutar tests
}
```

## 🎯 Características Principales

### 🎵 **Reproductor de Música Persistente**

- Reproducción continua durante toda la navegación
- Una única instancia de audio (sin fugas de memoria)
- Controles intuitivos: play/pause, siguiente/anterior, volumen
- Sincronización automática con sesiones de estudio

### ⏱️ **Sesiones de Concentración**

- Temporizadores precisos con pausa/resume
- Integración automática con música de fondo
- Corrección inteligente de suspensión del sistema
- Sincronización multi-pestaña con BroadcastChannel

### 📚 **Métodos de Estudio Interactivos**

- **Pomodoro**: Técnica 25+5 minutos con descansos
- **Mapas Mentales**: Creación visual de conceptos
- **Repetición Espaciada**: Aprendizaje basado en intervalos
- **Recuerdo Activo**: Técnicas de memorización
- **Feynman**: Explicación de conceptos complejos

### 🔐 **Sistema de Autenticación Seguro**

- Registro de 2 pasos con verificación de email
- JWT con refresh tokens automáticos
- Protección completa de rutas
- Gestión de perfiles con encuestas iniciales

### 📊 **Reportes y Analytics**

- Seguimiento detallado de sesiones completadas
- Estadísticas de progreso por método de estudio
- Dashboard personalizable con métricas
- Exportación de datos de productividad

## 🤝 Contribución

### 🛠️ Estándares de Desarrollo

- **TypeScript Estricto**: Verificación completa de tipos
- **ESLint + Prettier**: Código consistente y limpio
- **Conventional Commits**: Mensajes de commit estandarizados
- **Tests Obligatorios**: Cobertura mínima del 80%

### 🚀 Flujo de Desarrollo

1. **Fork** el repositorio
2. **Crear rama** de característica (`git checkout -b feature/nueva-funcionalidad`)
3. **Implementar** cambios con tests
4. **Commit** siguiendo conventional commits
5. **Push** y crear **Pull Request**

### 📋 Requisitos para PR

- ✅ Tests pasan
- ✅ ESLint sin errores
- ✅ TypeScript sin errores
- ✅ Documentación actualizada
- ✅ Música sigue funcionando en navegación

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver archivo `LICENSE` para más detalles.

---

**🎯 ¡Feliz estudio con Focus Up!** Mantén la concentración, la música sonará eternamente. 🎵

## 🔧 Configuración y Desarrollo

### Prerrequisitos

- Node.js 18+
- npm o yarn
- API del backend ejecutándose (ver documentación del backend)

### Instalación

```bash
# Clonar repositorio
git clone <url-del-repositorio>
cd focus-up-frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de construcción de producción
npm run preview
```

### Configuración de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Configuración de API
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Opcional: Configuraciones de desarrollo
VITE_ENABLE_DEVTOOLS=true
```

### Scripts de Desarrollo

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## 🧪 Estrategia de Pruebas

### Pruebas Unitarias

- Renderizado de componentes e interacciones
- Funcionalidad de proveedores de contexto
- Corrección de funciones de utilidad

### Pruebas de Integración

- Persistencia del reproductor de música a través de navegación
- Flujo de autenticación
- Seguimiento de progreso de métodos de estudio

### Pruebas E2E

- Recorridos completos de usuario
- Reproducción de música entre páginas
- Envíos de formularios y validaciones

## 🚀 Despliegue

### Proceso de Construcción

```bash
# Construcción de producción
npm run build

# Salida en directorio dist/
# Servir con cualquier servidor estático
```

### Variables de Entorno

Asegurar que el entorno de producción tenga:

- `VITE_API_BASE_URL` apuntando a la API de producción
- Configuración CORS apropiada
- HTTPS habilitado para reproducción de audio

## 🤝 Contribución

### Estándares de Código

- **TypeScript**: Verificación estricta de tipos habilitada
- **ESLint**: Configuración Airbnb con reglas de React
- **Prettier**: Formateo consistente de código
- **Nomenclatura**: PascalCase para componentes, camelCase para funciones

### Reglas de Arquitectura

1. **Persistencia de Música**: Nunca romper la regla de elemento de audio único
2. **Navegación SPA**: Siempre usar `useNavigate`, nunca `window.location`
3. **Uso de Contexto**: Estado global a través de contextos apropiados
4. **Estructura de Componentes**: Separación clara de responsabilidades
5. **Manejo de Errores**: Degradación elegante con retroalimentación al usuario

### Flujo de Desarrollo

1. Crear rama de característica desde `main`
2. Implementar cambios con pruebas
3. Asegurar que el reproductor de música aún funcione a través de navegación
4. Ejecutar suite completa de pruebas
5. Crear solicitud de extracción con descripción detallada

## 📊 Consideraciones de Rendimiento

### Optimización del Reproductor de Música

- **Elemento Único de Audio**: Previene fugas de memoria
- **Limpieza de Eventos**: Eliminación apropiada de listeners
- **Carga Perezosa**: Audio solo carga cuando es necesario
- **Límites de Error**: Manejo elegante de fallos de audio

### Optimización de Bundle

- **División de Código**: División basada en rutas con React Router
- **Tree Shaking**: Eliminación de código no utilizado
- **Optimización de Assets**: Compresión de imágenes y audio

### Monitoreo

- **Conteo de Elementos de Audio**: Asegurar instancia única
- **Uso de Memoria**: Monitorear fugas
- **Rendimiento de Navegación**: Eficiencia de enrutamiento SPA
- **Tasas de Error**: Fallos de carga y reproducción de audio

## 🐛 Solución de Problemas

### Problemas Comunes

**La música se detiene en navegación:**

- Verificar que MusicPlayerProvider esté en raíz absoluta
- Verificar que no se use `window.location.href`
- Asegurar que BrowserRouter envuelva todas las rutas

**Audio no carga:**

- Verificar configuración CORS
- Verificar que las URLs de audio sean accesibles
- Verificar problemas de red/firewall

**Problemas de autenticación:**

- Verificar almacenamiento y validez de token
- Verificar disponibilidad de endpoint de API
- Revisar implementación de RequireAuth

**Fallos de construcción:**

- Ejecutar `npm run lint` para problemas de código
- Verificar errores de TypeScript
- Verificar que todas las dependencias estén instaladas

## Plan "Código Limpio" - Optimización y Mantenimiento

### Resumen del Plan

El plan "Código Limpio" se ejecutó en fases para limpiar, optimizar y mantener el código del frontend, eliminando malas prácticas, código no usado y mejorando la mantenibilidad.

### Fases Ejecutadas

#### Fase 1: Auditoría

- Análisis estático del código en `src/` para identificar dead code, imports redundantes y problemas de rendimiento.
- Identificación de componentes con re-renders innecesarios y falta de memoización.
- Verificación del uso correcto de hooks (no llamados fuera de componentes).
- Revisión de fetches duplicados y gestión de side-effects.
- Identificación de comentarios en inglés para conversión.

#### Fase 2: Pruebas

- Ejecución de suite de tests existente.
- Identificación de cobertura faltante.
- Preparación para añadir tests unitarios e integración.

#### Fase 3: Refactor

- **Eliminación de código no usado**: Remoción de carpeta `Bloc_de_notas/` (4 archivos) que no era referenciada.
- **Extracción de utilidades**: Creación de `src/utils/validationUtils.ts` con funciones de validación reutilizables (username, password, email, date).
- **Memoización**: Verificación y mejora de uso de `useMemo` y `useCallback` donde necesario.
- **Corrección de hooks**: Aseguramiento de reglas de hooks de React.
- **Optimización**: Imágenes y lazy-loading para componentes pesados.
- **Accesibilidad**: Verificación de atributos `aria-*` y `cursor-pointer`.

#### Fase 4: Tests

- Ejecución de tests después de refactor para asegurar compatibilidad.
- Adición de tests para nuevas utilidades.

#### Fase 5: Revisión

- Ejecución de linter y formatter.
- Conversión de comentarios en inglés a español (ej: interceptores de API, tipos de módulos).
- Actualización de documentación.

#### Fase 6: Despliegue

- Build local exitoso.
- Creación de changelog `src/CHANGES_CODIGO_LIMPIO.md`.
- Verificación de compatibilidad con backend y rutas públicas.

### Cambios Realizados

- **Archivos eliminados**: `src/Bloc_de_notas/` (completa carpeta con app.js, html, css).
- **Archivos modificados**: `src/pages/RegisterPage.tsx`, `src/pages/ProfilePage.tsx`, `src/utils/validationUtils.ts` (nuevo), `src/utils/apiClient.ts`, `src/types/api.ts`.
- **Comentarios convertidos**: Todos los comentarios en inglés cambiados a español.
- **Utilidades extraídas**: Validaciones comunes centralizadas.
- **README actualizado**: Sección del plan "Código Limpio" añadida.

### Patrones Usados

- **Provider Pattern**: Para estado global (Auth, Music, Sessions).
- **Hooks personalizados**: `useApi`, `useAuth`, etc.
- **Servicio API**: Cliente Axios centralizado con interceptores.
- **Memoización**: `useCallback` para funciones, `useMemo` para cálculos costosos.
- **Validación centralizada**: Utilidades reutilizables en `validationUtils.ts`.

### Cómo Ejecutar Tests

```bash
npm run test  # Ejecuta tests con Vitest
npm run lint  # Verifica código con ESLint
```

### Verificación de Build

```bash
npm run build  # Construcción de producción
npm run preview  # Vista previa del build
```

### Revertir Cambios

Si algo falla, los cambios son seguros y pueden revertirse:

- Restaurar archivos desde git.
- Revertir commits por fase.

---

**¡Feliz estudio con música persistente!**
