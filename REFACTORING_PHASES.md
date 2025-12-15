# Refactorización del Frontend - Fases Principales

## Evaluación de la Propuesta

La propuesta de refactorización es viable y bien estructurada. Promueve una arquitectura modular que mejora la mantenibilidad, escalabilidad y separación de responsabilidades. Se alinea con mejores prácticas de desarrollo en React/TypeScript, facilitando el desarrollo colaborativo y la reutilización de código.

### Sugerencias Objetivas

- **Migración Gradual**: La estructura actual ya tiene cierto nivel de modularidad (ej. components/, hooks/, services/). Realiza la migración de manera incremental para evitar rupturas en el código existente.
- **Uso de InterfacesAPI**: Aprovecha las interfaces en `InterfacesAPI/` para generar los tipos del frontend, asegurando consistencia entre backend y frontend.
- **Testing**: Incluye pruebas unitarias e integración durante cada fase para validar cambios.
- **Documentación**: Actualiza el README o crea documentación para la nueva estructura.
- **Riesgos**: Posibles conflictos de importaciones durante la migración; usa herramientas como ESLint para detectar issues.

## Fases de Refactorización (Ordenadas por Prioridad)

### Fase 1: Reorganización de Tipos (Prioridad Alta - Fundacional)

**Objetivo**: Establecer una base sólida de tipos organizada por dominio.
**Tareas**:

- Crear estructura `src/types/` con subcarpetas `api/`, `domain/`, `ui/`, `shared/`.
- Migrar tipos existentes de `src/types/` a la nueva estructura.
- Generar tipos de frontend basados en `InterfacesAPI/interfaces/`.
- Crear barrel exports (`index.ts`) en cada subcarpeta.
  **Archivos afectados**: `src/types/*`, `InterfacesAPI/interfaces/*`.
  **Tiempo estimado**: 2-3 días.
  **Criterios de éxito**: Todos los tipos importados correctamente sin errores de TypeScript.

### Fase 2: Creación de Shared/ (Prioridad Alta - Recursos Compartidos)

**Objetivo**: Centralizar recursos reutilizables.
**Tareas**:

- Crear `src/shared/` con subcarpetas `components/ui/`, `hooks/`, `services/`, `types/`, `utils/`.
- Mover componentes UI genéricos de `src/components/ui/` a `src/shared/components/ui/`.
- Mover hooks genéricos de `src/hooks/` a `src/shared/hooks/` (ej. `useApi.ts`, `useLoading.ts`).
- Mover servicios compartidos como `apiClient.ts` a `src/shared/services/`.
- Mover utilidades genéricas de `src/utils/` a `src/shared/utils/`.
- Actualizar imports en todo el proyecto.
  **Archivos afectados**: `src/components/ui/*`, `src/hooks/useApi.ts`, `src/hooks/useLoading.ts`, `src/utils/apiClient.ts`, etc.
  **Tiempo estimado**: 3-4 días.
  **Criterios de éxito**: Componentes y hooks compartidos funcionan en múltiples módulos.

### Fase 3: Creación de Módulos - Auth (Prioridad Media-Alta)

**Objetivo**: Modularizar autenticación.
**Tareas**:

- Crear `src/modules/auth/` con subcarpetas `components/`, `hooks/`, `services/`, `types/`, `utils/`.
- Mover componentes de auth de `src/components/auth/` y páginas relacionadas.
- Mover hooks de auth de `src/hooks/useAuth.ts`.
- Mover servicios de auth (si existen) o crear nuevos.
- Crear tipos específicos de auth en `types/`.
- Implementar barrel exports.
  **Archivos afectados**: `src/components/auth/*`, `src/hooks/useAuth.ts`, `src/pages/LoginPage.tsx`, etc.
  **Tiempo estimado**: 2-3 días.
  **Criterios de éxito**: Módulo auth independiente y funcional.

### Fase 4: Creación de Módulos - Music (Prioridad Media-Alta)

**Objetivo**: Modularizar funcionalidad de música.
**Tareas**:

- Crear `src/modules/music/` con subcarpetas.
- Mover `MusicPlayer.tsx`, `AlbumSelectionModal.tsx`, etc. a `components/`.
- Mover hooks relacionados (`useMusic` si existe).
- Mover `musicApi.ts`, `audioService.ts` a `services/`.
- Crear tipos en `types/`.
  **Archivos afectados**: `src/components/MusicPlayer.tsx`, `src/utils/musicApi.ts`, etc.
  **Tiempo estimado**: 2-3 días.
  **Criterios de éxito**: Reproducción de música funcional.

### Fase 5: Creación de Módulos - Sessions (Prioridad Media)

**Objetivo**: Modularizar sesiones de concentración.
**Tareas**:

- Crear `src/modules/sessions/` con subcarpetas.
- Mover `ConcentrationCard.tsx`, `StartSession.tsx`, etc. a `components/`.
- Mover `useConcentrationSession.ts` a `hooks/`.
- Mover `sessionService.ts` a `services/`.
- Crear tipos en `types/`.
  **Archivos afectados**: `src/components/ConcentrationCard/`, `src/hooks/useConcentrationSession.ts`, etc.
  **Tiempo estimado**: 3-4 días.
  **Criterios de éxito**: Sesiones de concentración operativas.

### Fase 6: Creación de Módulos - Study-Methods, Notifications, Events (Prioridad Media-Baja)

**Objetivo**: Completar módulos restantes.
**Tareas**:

- Crear módulos para `study-methods/`, `notifications/`, `events/`.
- Mover componentes, hooks, servicios correspondientes.
- Para study-methods: Incluir `MethodSelectionModal.tsx`, `useMethodExecution.ts`, etc.
- Para notifications: `NotificationToggle.tsx`, `useNotifications.ts`, etc.
- Para events: `EventCard.tsx`, `useEvents.ts`, etc.
  **Archivos afectados**: Varios en `src/components/`, `src/hooks/`, `src/utils/`.
  **Tiempo estimado**: 4-5 días (uno por módulo).
  **Criterios de éxito**: Todos los módulos funcionales e integrados.

### Fase 7: Implementación de Mejores Prácticas (Prioridad Media-Baja)

**Objetivo**: Aplicar patrones y configuraciones avanzadas.
**Tareas**:

- Configurar aliases de rutas en `vite.config.ts` y `tsconfig.json`.
- Implementar barrel exports en todos los módulos.
- Refactorizar componentes a patrón Container/Presentational donde aplique.
- Agregar Error Boundaries por módulo.
- Crear estructura de testing `__tests__/` con subcarpetas unit/, integration/, e2e/.
  **Archivos afectados**: Config files, componentes existentes.
  **Tiempo estimado**: 3-4 días.
  **Criterios de éxito**: Código más limpio, mejor mantenibilidad.

### Fase 8: Limpieza y Optimización Final (Prioridad Baja)

**Objetivo**: Finalizar refactorización.
**Tareas**:

- Eliminar código obsoleto y carpetas vacías.
- Ejecutar pruebas completas.
- Optimizar imports y bundle size.
- Actualizar documentación.
  **Tiempo estimado**: 1-2 días.
  **Criterios de éxito**: Proyecto refactorizado completamente, sin errores.

## Notas Generales

- **Orden de Prioridad**: Basado en dependencias; tipos primero, luego shared, módulos en orden de complejidad.
- **Pruebas**: Ejecuta `npm test` después de cada fase.
- **Commits**: Haz commits por fase para facilitar rollback si es necesario.
- **Equipo**: Si hay múltiples desarrolladores, asigna fases a diferentes personas.

Indícame por cuál fase deseas comenzar.
