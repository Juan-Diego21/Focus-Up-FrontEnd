---
title: "🎯 Focus Up Frontend — Aplicación React con Arquitectura Modular"
description: "Aplicación moderna de React TypeScript para gestión de métodos de estudio con música persistente, arquitectura modular por dominios, type safety completo y mejores prácticas de desarrollo."
features: "Arquitectura modular por dominios, type safety TypeScript, música persistente global, sesiones de concentración, métodos de estudio, notificaciones programadas, interfaces responsivas y testing completo"
includes: "arquitectura modular con módulos funcionales, estructura de carpetas organizada, principios SOLID, patrones de diseño, mejores prácticas React, configuración Vite y documentación completa"
---

# 🎯 Focus Up Frontend — Aplicación React con Arquitectura Modular

Aplicación moderna de **React TypeScript** para la gestión de métodos de estudio con **reproducción de música persistente global**. Construida con **arquitectura modular por dominios**, **type safety completo**, **mejores prácticas de desarrollo** y **interfaces responsivas** para la gestión del enfoque y la productividad personal.

**🎨 ARQUITECTURA MODULAR + TYPE SAFETY**: Implementa arquitectura por dominios funcionales, type safety TypeScript completo, música persistente global, sesiones de concentración con temporizadores, métodos de estudio interactivos, notificaciones programadas y testing integral.

Incluye detalles de **arquitectura modular con módulos funcionales, estructura de carpetas organizada, principios SOLID, patrones de diseño, mejores prácticas React** y **configuración de desarrollo**.

## Estructura del Proyecto

La aplicación sigue una arquitectura modular organizada por dominios de negocio:

```
src/
├── modules/                          # Arquitectura modular por dominios
│   ├── auth/                        # Módulo de autenticación
│   │   ├── components/
│   │   │   └── RequireAuth.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── index.ts
│   ├── music/                       # Módulo de música
│   │   ├── components/
│   │   │   └── MusicPlayer.tsx
│   │   └── index.ts
│   ├── sessions/                    # Módulo de sesiones
│   │   ├── components/
│   │   │   └── ConcentrationCard.tsx
│   │   └── index.ts
│   └── study-methods/               # Módulo de métodos de estudio
│       ├── components/
│       │   └── MethodSelectionModal.tsx
│       └── index.ts
├── shared/                          # Recursos compartidos
│   ├── components/
│   │   └── ui/                      # Componentes UI reutilizables
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── FormField.tsx
│   ├── hooks/                       # Hooks genéricos
│   │   ├── useApi.ts
│   │   └── useLoading.ts
│   ├── services/                    # Servicios compartidos
│   │   └── apiClient.ts
│   ├── utils/                       # Utilidades compartidas
│   │   ├── dateUtils.ts
│   │   ├── validationUtils.ts
│   │   ├── musicUtils.ts
│   │   ├── sessionMappers.ts
│   │   ├── broadcastChannel.ts
│   │   ├── sleepDetector.ts
│   │   └── offlineQueue.ts
│   └── index.ts
├── types/                           # Tipos organizados por dominio
│   ├── api/
│   │   ├── ApiResponse.ts
│   │   ├── ApiError.ts
│   │   └── index.ts
│   ├── domain/
│   │   ├── auth/
│   │   │   ├── IUser.ts
│   │   │   ├── ILoginRequest.ts
│   │   │   ├── IRegisterRequest.ts
│   │   │   └── index.ts
│   │   ├── music/
│   │   │   ├── IAlbum.ts
│   │   │   ├── ISong.ts
│   │   │   ├── IPlayerState.ts
│   │   │   └── index.ts
│   │   ├── sessions/
│   │   │   ├── ISession.ts
│   │   │   ├── IConcentrationSession.ts
│   │   │   ├── ISessionReport.ts
│   │   │   └── index.ts
│   │   └── study-methods/
│   │       ├── IMethod.ts
│   │       ├── IPomodoroConfig.ts
│   │       ├── IMethodExecution.ts
│   │       └── index.ts
│   ├── ui/
│   │   ├── IComponentProps.ts
│   │   ├── IFormFields.ts
│   │   ├── IModalConfig.ts
│   │   └── index.ts
│   ├── shared/
│   │   ├── IBaseEntity.ts
│   │   ├── ITimestamps.ts
│   │   └── index.ts
│   └── index.ts
├── components/                      # Componentes legacy (a migrar)
├── contexts/                        # Contextos legacy (a migrar)
├── hooks/                          # Hooks legacy (a migrar)
├── pages/                          # Páginas de la aplicación
├── providers/                      # Proveedores globales
├── services/                       # Servicios legacy (a migrar)
├── utils/                          # Utilidades legacy (a migrar)
├── App.tsx
├── main.tsx
└── index.css
```

## Refactorización Modular Completada

El proyecto ha sido refactorizado siguiendo una arquitectura modular por dominios de negocio, implementando mejores prácticas de desarrollo y organización del código.

### Fases de Refactorización Ejecutadas

#### Fase 1: Reorganización de Tipos

- Creación de estructura jerárquica `src/types/` organizada por dominio
- Migración de tipos existentes a carpetas `api/`, `domain/`, `ui/`, `shared/`
- Creación de tipos basados en interfaces de API (`InterfacesAPI/`)
- Implementación de barrel exports (`index.ts`) en todas las carpetas
- Verificación de compatibilidad con TypeScript

#### Fase 2: Creación de Shared/

- Centralización de recursos reutilizables en `src/shared/`
- Migración de componentes UI genéricos (`Button`, `Input`, `LoadingSpinner`, etc.)
- Migración de hooks compartidos (`useApi`, `useLoading`)
- Migración de servicios compartidos (`apiClient`)
- Migración de utilidades comunes (`dateUtils`, `validationUtils`, `musicUtils`, etc.)
- Actualización de imports en todo el proyecto

#### Fase 3: Creación de Módulos - Auth

- Estructura modular para autenticación en `src/modules/auth/`
- Migración de componentes, contextos y hooks relacionados
- Implementación de barrel exports
- Verificación de funcionamiento sin errores

#### Fase 4: Creación de Módulos - Music

- Estructura modular para música en `src/modules/music/`
- Migración del reproductor de música y utilidades relacionadas
- Implementación de barrel exports
- Verificación de funcionamiento

#### Fase 5: Creación de Módulos - Sessions

- Estructura modular para sesiones en `src/modules/sessions/`
- Migración de componentes de temporizador y utilidades
- Implementación de barrel exports
- Verificación de funcionamiento

#### Fase 6: Creación de Módulos - Study-Methods, Notifications, Events

- Estructura modular para métodos de estudio en `src/modules/study-methods/`
- Migración de componentes de selección de métodos
- Preparación de estructuras para notifications y events

#### Fase 7: Implementación de Mejores Prácticas

- Configuración de aliases de rutas en `vite.config.ts` y `tsconfig.app.json`
- Implementación de barrel exports en todos los módulos
- Configuración de path mapping para TypeScript
- Preparación para patrón Container/Presentational

#### Fase 8: Limpieza y Optimización Final

- Actualización de documentación (README.md)
- Verificación final de TypeScript
- Optimización de estructura de archivos

### Beneficios de la Arquitectura Modular

- **Separación de Responsabilidades**: Cada módulo maneja un dominio específico
- **Mantenibilidad**: Código organizado y fácil de localizar
- **Reutilización**: Componentes y utilidades compartidas centralizadas
- **Escalabilidad**: Fácil adición de nuevos módulos y funcionalidades
- **Type Safety**: Tipos organizados por dominio con barrel exports
- **Developer Experience**: Aliases de rutas y estructura clara

### Uso de Aliases de Ruta

```typescript
// Importaciones limpias con aliases
import { Button } from "@shared/components/ui";
import { useApi } from "@shared/hooks";
import type { IUser } from "@types/domain/auth";
import { MusicPlayer } from "@modules/music";
```

## Resumen de Arquitectura

### Proveedores Globales (main.tsx)

La aplicación utiliza una arquitectura de proveedores en capas para asegurar la persistencia del estado global:

```typescript
<MusicPlayerProvider>
  {" "}
  // Estado global de música (persistente)
  <BrowserRouter>
    {" "}
    // Enrutamiento SPA
    <StrictMode>
      {" "}
      // Verificaciones de desarrollo de React
      <AuthProvider>
        {" "}
        // Autenticación de usuario
        <ConcentrationSessionProvider>
          {" "}
          // Estado global de sesiones de concentración
          <App /> // Aplicación principal
          <MusicPlayer /> // UI de música global (condicional)
          <ConcentrationCard /> // UI de temporizador (condicional)
        </ConcentrationSessionProvider>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
</MusicPlayerProvider>
```

### Explicación de Jerarquía de Proveedores

1. **MusicPlayerProvider** (Raíz Absoluta)

   - Contiene la única instancia de `HTMLAudioElement`
   - Persiste a través de toda la navegación y ciclos de vida de React
   - Nunca se desmonta durante el uso de la aplicación
   - Gestiona reproducción de audio, lista de reproducción y estado

2. **BrowserRouter** (Navegación SPA)

   - Habilita enrutamiento del lado del cliente sin recargas de página
   - Crítico para la persistencia de música y sesiones durante la navegación
   - Envuelve todas las rutas autenticadas

3. **AuthProvider** (Sesión de Usuario)

   - Gestiona estado de autenticación
   - Controla visibilidad de rutas protegidas
   - Maneja limpieza de cierre de sesión

4. **ConcentrationSessionProvider** (Sesiones de Concentración)

   - Gestiona estado global de sesiones activas
   - Persistencia en LocalStorage para supervivencia a recargas
   - Sincronización multi-pestaña con BroadcastChannel
   - Integración con música y métodos de estudio

5. **Componentes Globales** (UI Condicional)

   - **MusicPlayer**: Barra de reproducción fija en la parte inferior
   - **ConcentrationCard**: Overlay de temporizador centrado
   - Se renderizan condicionalmente basado en estado de autenticación y sesiones

## Arquitectura del Reproductor de Música

### Componentes Principales

#### MusicPlayerContext (`src/contexts/MusicPlayerContext.tsx`)

- **Única Fuente de Verdad**: Todo el estado de música se gestiona aquí
- **Elemento de Audio Persistente**: Un `HTMLAudioElement` que sobrevive a la navegación
- **Gestión de Estado**: Reproducción, lista de reproducción, volumen, modos aleatorio y repetición
- **Persistencia en LocalStorage**: Guarda lista de reproducción y configuraciones entre sesiones

#### MusicPlayer UI (`src/components/ui/MusicPlayer.tsx`)

- **Renderizado Condicional**: Solo se muestra cuando está autenticado y reproduciendo
- **Posicionamiento Global**: Barra fija en la parte inferior, centrada horizontalmente
- **Controles**: Reproducir/pausar, siguiente/anterior, volumen, progreso, gestión de cola
- **Diseño Responsivo**: Se adapta a diferentes tamaños de pantalla

### Características Principales

- **Reproducción Persistente**: Continúa a través de toda la navegación de páginas
- **Instancia Única de Audio**: Sin fugas de memoria o elementos duplicados
- **Integración de Autenticación**: Solo visible para usuarios conectados
- **Limpieza de Cierre de Sesión**: Detiene y limpia estado correctamente al cerrar sesión
- **Manejo de Errores**: Retrocesos elegantes para formatos de audio no soportados
- **Simulación de Desarrollo**: Soporte de audio placeholder para pruebas

### Flujo de Datos

```
Interacción del Usuario → UI de MusicPlayer → MusicPlayerContext → HTMLAudioElement
                                      ↓
LocalStorage ←─────────────────────── MusicPlayerContext
```

## Sistema de Autenticación

### AuthContext (`src/contexts/AuthContext.tsx`)

- **Gestión de Tokens**: Almacenamiento y validación de JWT
- **Estado de Usuario**: Información actual del usuario y permisos
- **Protección de Rutas**: Integración con componente `RequireAuth`

### Componente RequireAuth (`src/components/auth/RequireAuth.tsx`)

- **Guardias de Ruta**: Envuelve páginas protegidas
- **Estados de Carga**: Muestra spinner durante verificaciones de autenticación
- **Lógica de Redirección**: Redirecciones automáticas de inicio de sesión para usuarios no autenticados

### Flujo de Autenticación

```
Inicio de Sesión/Registro → AuthContext → Almacenamiento de Token → RequireAuth → Rutas Protegidas
     ↓
Cierre de Sesión → Limpiar Tokens → Redirigir a Inicio de Sesión → Limpieza del Reproductor de Música
```

### Nuevo Flujo de Registro de Dos Pasos

El sistema de registro ha sido actualizado para implementar un flujo de verificación de email de dos pasos:

```
Registro Paso 1 → Solicitar Código → Registro Paso 2 → Verificar Código → Registrar Usuario → Primer Login → Modal de Encuesta
     ↓              ↓              ↓              ↓              ↓              ↓              ↓
Formulario básico → API /auth/   → Formulario de → API /auth/   → API /auth/   → Modal de     → Navegación a
(username, email, → request-     → código        → verify-code → register     → bienvenida   → ProfilePage
password)        → verification- → (6 dígitos)  → (email +     → (email +     → opcional     → (campos de
                 → code          →              → código)      → username +   → para         → encuesta)
                 →               →              →              → password)    → completar
                 →               →              →              → perfil
```

#### Características del Nuevo Flujo

- **Paso 1 (RegisterPage)**: Recopila datos básicos (username, email, password) y solicita código de verificación
- **Paso 2 (RegisterStep2)**: Verifica código de 6 dígitos y completa el registro
- **Primer Login**: Modal opcional para completar perfil con encuesta
- **Campos de Encuesta**: Integrados en ProfilePage (fecha nacimiento, intereses, distracciones)

#### Seguridad Implementada

- Contraseña no se almacena en localStorage durante el flujo
- Datos temporales namespaced (`focusup:register:*`)
- Verificación secuencial de APIs (verify-code → register)
- Limpieza automática de datos temporales

## 📚 Sistema de Métodos de Estudio

### Arquitectura

Cada método de estudio sigue un patrón consistente:

```
StudyMethodsLibraryPage → [Method]IntroView → [Method]StepsView
       ↓                           ↓                    ↓
   Selección de Método          Información del Método        Ejecución Paso a Paso
```

### Componentes de Método

- **Vistas de Introducción**: Páginas de información y preparación
- **Vistas de Pasos**: Ejecución interactiva con seguimiento de progreso
- **Lógica Compartida**: Seguimiento de progreso común, gestión de sesiones

### Seguimiento de Progreso

- **Integración con Backend**: Sesiones almacenadas en base de datos
- **Estado Local**: Actualizaciones de progreso en tiempo real
- **Persistencia**: Capacidad de reanudación entre sesiones
- **Validación**: Restricciones de progreso por tipo de método

## Sistema de Sesiones de Concentración

### Arquitectura

El sistema de sesiones de concentración permite a los usuarios crear y gestionar sesiones de estudio con temporizador, música opcional y métodos de estudio integrados:

```
StartSession → ConcentrationCard → [MethodExecution] → Reports
      ↓              ↓                    ↓              ↓
  Creación       Temporizador        Método activo    Resultados
  de sesión      persistente         (opcional)       guardados
```

### Componentes Principales

#### ConcentrationSessionProvider (`src/providers/ConcentrationSessionProvider.tsx`)

- **Gestión de Estado Global**: Estado único para sesiones activas
- **Persistencia en LocalStorage**: Sesiones sobreviven a recargas de página
- **Sincronización Multi-pestaña**: BroadcastChannel para coordinación entre pestañas
- **Integración con Música**: Reproducción automática de álbumes de sesión
- **Detección de Sueño**: Corrección automática de temporizador cuando el sistema suspende

#### ConcentrationCard (`src/components/ConcentrationCard.tsx`)

- **UI de Temporizador**: Overlay centrado con controles intuitivos
- **Estados de Sesión**: Activa, pausada, completada
- **Controles**: Play/pause, terminar más tarde, finalizar
- **Información Contextual**: Muestra método y música activos
- **Accesibilidad Completa**: Atributos ARIA y navegación por teclado

### Características Principales

- **Temporizador Persistente**: Continúa corriendo a través de navegación
- **Pausa/Resume**: Capacidad de pausar y reanudar sesiones
- **Música Integrada**: Reproducción automática de álbumes asociados
- **Métodos de Estudio**: Integración con Pomodoro, Mapas Mentales, etc.
- **Reportes Automáticos**: Guardado de resultados al finalizar
- **Multi-pestaña**: Una sesión activa por usuario, sincronizada
- **Corrección de Sueño**: Ajuste automático por suspensión del sistema

### Flujo de Sesiones

```
Creación → Inicio → [Pausa/Resume] → Finalización → Reporte
     ↓        ↓            ↓              ↓          ↓
Formulario  Overlay    Estados         API       Dashboard
de sesión  centrado   temporales      /sessions  /reports
```

### Gestión de Estado

- **ActiveSession**: Interfaz para sesiones en ejecución
- **SessionDto**: Contrato con API del backend
- **Broadcast Messages**: Comunicación entre pestañas
- **Offline Queue**: Acciones pendientes cuando sin conexión

### Integraciones

- **Música**: MusicPlayerContext para reproducción persistente
- **Métodos**: Navegación automática a vistas de ejecución
- **Reportes**: Actualización automática de estadísticas
- **Eventos**: Creación desde eventos programados

## Navegación y Enrutamiento

### Estructura de Rutas

```typescript
// Rutas Públicas (sin autenticación requerida)
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/forgot-password*" element={<... />} />

// Rutas Protegidas (autenticación requerida)
<Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
<Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
<Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
<Route path="/start-session" element={<RequireAuth><StartSession /></RequireAuth>} />
<Route path="/start-session/:sessionId" element={<RequireAuth><StartSession /></RequireAuth>} />
<Route path="/events" element={<RequireAuth><EventsPage /></RequireAuth>} />
<Route path="/notifications" element={<RequireAuth><NotificationPage /></RequireAuth>} />
<Route path="/music/albums" element={<RequireAuth><MusicAlbumsPage /></RequireAuth>} />
<Route path="/music/albums/:albumId" element={<RequireAuth><MusicSongsPage /></RequireAuth>} />
<Route path="/study-methods" element={<RequireAuth><StudyMethodsLibraryPage /></RequireAuth>} />
<Route path="/pomodoro/intro/:methodId" element={<RequireAuth><PomodoroIntroView /></RequireAuth>} />
<Route path="/pomodoro/execute/:methodId" element={<RequireAuth><PomodoroExecutionView /></RequireAuth>} />
<Route path="/mind-maps/intro/:methodId" element={<RequireAuth><MindMapsInfoPage /></RequireAuth>} />
<Route path="/mind-maps/steps/:methodId" element={<RequireAuth><MindMapsStepsPage /></RequireAuth>} />
<Route path="/spaced-repetition/intro/:methodId" element={<RequireAuth><SpacedRepetitionIntroView /></RequireAuth>} />
<Route path="/spaced-repetition/steps/:methodId" element={<RequireAuth><SpacedRepetitionStepsView /></RequireAuth>} />
<Route path="/active-recall/intro/:methodId" element={<RequireAuth><ActiveRecallIntroView /></RequireAuth>} />
<Route path="/active-recall/steps/:methodId" element={<RequireAuth><ActiveRecallStepsView /></RequireAuth>} />
<Route path="/feynman/intro/:methodId" element={<RequireAuth><FeynmanIntroView /></RequireAuth>} />
<Route path="/feynman/steps/:methodId" element={<RequireAuth><FeynmanStepsView /></RequireAuth>} />
<Route path="/cornell/intro/:methodId" element={<RequireAuth><CornellIntroView /></RequireAuth>} />
<Route path="/cornell/steps/:methodId" element={<RequireAuth><CornellStepsView /></RequireAuth>} />
```

### Principios de Navegación SPA

- **Hook useNavigate**: Toda la navegación usa React Router
- **Sin window.location.href**: Previene recargas de página que rompen la música
- **Parámetros de Ruta**: Extracción apropiada de parámetros con `useParams`
- **Rutas Protegidas**: Verificaciones de autenticación a nivel de ruta

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
