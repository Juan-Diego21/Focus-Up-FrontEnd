# 🎵 Focus-Up Frontend

Una aplicación moderna de React TypeScript para la gestión de métodos de estudio con reproducción de música persistente global. Construida con Vite, React Router y Tailwind CSS.

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/                    # Componentes de UI reutilizables
│   │   ├── Button.tsx        # Componente genérico de botón
│   │   ├── Card.tsx          # Componente de diseño de tarjeta
│   │   ├── LoadingSpinner.tsx # Indicador de carga
│   │   ├── MusicPlayer.tsx   # UI del reproductor de música global
│   │   ├── ProgressCircle.tsx # Indicador de progreso circular
│   │   ├── Sidebar.tsx       # Barra lateral de navegación
│   │   └── Timer.tsx         # Componente de temporizador de estudio
│   ├── auth/                 # Componentes de autenticación
│   │   ├── RequireAuth.tsx   # Wrapper de protección de rutas
│   │   └── LoginPage.tsx     # Formulario de inicio de sesión
│   └── ui/                   # Componentes de UI adicionales
│       └── FinishLaterModal.tsx # Modal de pausa de sesión
├── contexts/                 # Proveedores de contexto de React
│   ├── AuthContext.tsx       # Estado de autenticación de usuario
│   └── MusicPlayerContext.tsx # Estado global del reproductor de música
├── hooks/                    # Hooks personalizados de React
├── pages/                    # Componentes de página (rutas)
│   ├── DashboardPage.tsx     # Panel principal
│   ├── StudyMethodsLibraryPage.tsx # Selección de métodos
│   ├── MusicAlbumsPage.tsx   # Biblioteca de música
│   ├── MusicSongsPage.tsx    # Vista de canciones del álbum
│   ├── ProfilePage.tsx       # Perfil de usuario
│   ├── ReportsPage.tsx       # Reportes de estudio
│   ├── SurveyPage.tsx        # Encuesta inicial
│   ├── LoginPage.tsx         # Autenticación
│   ├── RegisterPage.tsx      # Registro de usuario
│   ├── ForgotPassword*.tsx   # Recuperación de contraseña
│   ├── ConfirmationPage.tsx  # Confirmación de correo electrónico
│   └── [Method]IntroView.tsx # Introducciones de métodos de estudio
│   └── [Method]StepsView.tsx # Ejecución de métodos de estudio
├── types/                    # Definiciones de tipos TypeScript
│   ├── api.ts               # Tipos de respuestas de API
│   └── user.ts              # Tipos de datos de usuario
├── utils/                   # Funciones de utilidad
│   ├── apiClient.ts         # Cliente HTTP Axios
│   ├── constants.ts         # Constantes de la aplicación
│   ├── methodAssets.ts      # Configuraciones de métodos de estudio
│   ├── methodStatus.ts      # Utilidades de progreso de métodos
│   └── musicApi.ts          # Funciones de API de música
├── App.tsx                  # Componente principal con enrutamiento
├── main.tsx                 # Punto de entrada de la aplicación
└── index.css                # Estilos globales
```

## 🏗️ Resumen de Arquitectura

### Proveedores Globales (main.tsx)

La aplicación utiliza una arquitectura de proveedores en capas para asegurar la persistencia del estado global:

```typescript
<MusicPlayerProvider>
  {" "}
  // 🎵 Estado global de música (persistente)
  <BrowserRouter>
    {" "}
    // 🧭 Enrutamiento SPA
    <StrictMode>
      {" "}
      // ⚛️ Verificaciones de desarrollo de React
      <AuthProvider>
        {" "}
        // 👤 Autenticación de usuario
        <App /> // 📱 Aplicación principal
        <MusicPlayer /> // 🎵 UI de música global (condicional)
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
   - Crítico para la persistencia de música durante la navegación
   - Envuelve todas las rutas autenticadas

3. **AuthProvider** (Sesión de Usuario)

   - Gestiona estado de autenticación
   - Controla visibilidad de rutas protegidas
   - Maneja limpieza de cierre de sesión

4. **MusicPlayer UI** (Componente Global)
   - Se renderiza condicionalmente basado en autenticación
   - Posicionado globalmente (fijo en la parte inferior)
   - Solo visible cuando el usuario está autenticado

## 🎵 Arquitectura del Reproductor de Música

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

- ✅ **Reproducción Persistente**: Continúa a través de toda la navegación de páginas
- ✅ **Instancia Única de Audio**: Sin fugas de memoria o elementos duplicados
- ✅ **Integración de Autenticación**: Solo visible para usuarios conectados
- ✅ **Limpieza de Cierre de Sesión**: Detiene y limpia estado correctamente al cerrar sesión
- ✅ **Manejo de Errores**: Retrocesos elegantes para formatos de audio no soportados
- ✅ **Simulación de Desarrollo**: Soporte de audio placeholder para pruebas

### Flujo de Datos

```
Interacción del Usuario → UI de MusicPlayer → MusicPlayerContext → HTMLAudioElement
                                      ↓
LocalStorage ←─────────────────────── MusicPlayerContext
```

## 🔐 Sistema de Autenticación

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
                →               →              →              →              → perfil
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

## 🧭 Navegación y Enrutamiento

### Estructura de Rutas

```typescript
// Rutas Públicas (sin autenticación requerida)
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/forgot-password*" element={<... />} />

// Rutas Protegidas (autenticación requerida)
<Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
<Route path="/music/*" element={<RequireAuth><... /></RequireAuth>} />
<Route path="/study-methods" element={<RequireAuth><... /></RequireAuth>} />
<Route path="/pomodoro/*" element={<RequireAuth><... /></RequireAuth>} />
<Route path="/mind-maps/*" element={<RequireAuth><... /></RequireAuth>} />
// ... otras rutas de métodos
```

### Principios de Navegación SPA

- ✅ **Hook useNavigate**: Toda la navegación usa React Router
- ✅ **Sin window.location.href**: Previene recargas de página que rompen la música
- ✅ **Parámetros de Ruta**: Extracción apropiada de parámetros con `useParams`
- ✅ **Rutas Protegidas**: Verificaciones de autenticación a nivel de ruta

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
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
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

---

**🎵 ¡Feliz estudio con música persistente!**
