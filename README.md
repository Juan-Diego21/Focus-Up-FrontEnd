# 🎯 Focus Up Frontend

> **Aplicación React TypeScript** para gestión de métodos de estudio con **música persistente global** 🎵

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Una aplicación moderna construida con **arquitectura modular por dominios**, **type safety completo** y **mejores prácticas de desarrollo**. Diseñada para mejorar la concentración y productividad mediante métodos de estudio interactivos, temporizadores persistentes y reproducción de música ininterrumpida.

## 📁 Estructura del Proyecto

```
src/
├── modules/              # 🏗️ Arquitectura modular por dominios
│   ├── auth/            # 🔐 Autenticación
│   ├── music/           # 🎵 Reproductor de música
│   ├── sessions/        # ⏱️ Sesiones de concentración
│   └── study-methods/   # 📚 Métodos de estudio
├── shared/              # 🔄 Recursos compartidos
│   ├── components/ui/   # 🎨 Componentes reutilizables
│   ├── hooks/          # 🪝 Hooks genéricos
│   ├── services/       # 🌐 APIs y clientes
│   └── utils/          # 🛠️ Utilidades comunes
├── types/              # 📝 TypeScript organizado
├── stores/             # 🗂️ Estado global (Zustand)
├── lib/                # 📚 Configuraciones y schemas
└── pages/              # 📄 Páginas de la aplicación
```

## 🏗️ Arquitectura

### 🎯 Principios de Diseño

- **🏛️ Modular por Dominios**: Cada módulo encapsula un dominio de negocio completo
- **🔒 Type Safety Total**: TypeScript estricto con tipos organizados
- **🔄 Estado Global Eficiente**: Zustand para manejo de estado complejo
- **🎵 Música Persistente**: Un único elemento de audio que sobrevive a la navegación
- **📱 Responsive Design**: Interfaz adaptativa para todos los dispositivos

### 🔧 Tecnologías Principales

|    Categoría     |          Tecnologías          |
| :--------------: | :---------------------------: |
|   **Frontend**   |  React 18, TypeScript, Vite   |
|    **Estado**    |    Zustand, React Context     |
|   **Estilos**    |     Tailwind CSS, PostCSS     |
| **Formularios**  |     React Hook Form, Zod      |
| **Enrutamiento** |        React Router v6        |
| **HTTP Client**  |             Axios             |
|   **Testing**    | Vitest, React Testing Library |
|    **Build**     |    Vite, ESLint, Prettier     |

### 🎨 Características de UI/UX

- **🌙 Tema Oscuro**: Diseño moderno con tema oscuro por defecto
- **♿ Accesibilidad**: Atributos ARIA y navegación por teclado
- **📱 Mobile First**: Optimizado para dispositivos móviles
- **⚡ Performance**: Componentes optimizados y carga lazy
- **🎯 Feedback Visual**: Estados de carga, errores y confirmaciones claras

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
