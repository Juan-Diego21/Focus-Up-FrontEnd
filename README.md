# Focus Up Frontend

Frontend SPA de Focus Up construido con React + TypeScript + Vite. Este documento esta pensado como guia tecnica de estudio para cualquier desarrollador (incluyendo aprendices) que quiera entender, mantener y escalar el proyecto.

## 1. Objetivo del frontend

La aplicacion resuelve flujos de productividad y estudio:

- autenticacion y registro
- sesiones de concentracion
- metodos de estudio guiados (pomodoro y otros)
- musica de apoyo durante sesiones
- eventos y recordatorios
- reportes de progreso
- perfil de usuario

## 2. Stack tecnico

Base:

- React 19
- TypeScript
- Vite 7
- React Router DOM
- Tailwind CSS

Estado y datos:

- TanStack React Query (cache de datos remotos)
- React Context (estado global de auth, musica y sesiones)

HTTP y utilidades:

- Axios (cliente principal centralizado)
- Fetch nativo (en algunos servicios legacy)
- SweetAlert2
- Framer Motion

Calidad:

- ESLint (flat config)
- Vitest + Testing Library (tests en carpetas de modulo e integracion)

## 3. Arquitectura actual: `modules + shared`

La arquitectura sigue separacion por dominio:

- `src/modules`: funcionalidad de negocio por modulo (auth, sessions, study-methods, etc).
- `src/shared`: piezas reutilizables transversales (ui, hooks, servicios, providers, utilidades).
- `src/types`: contratos y tipos de datos.
- `src/lib`: infraestructura base (query client, schemas).

### 3.1 Flujo de alto nivel

```text
main.tsx
  -> monta providers globales
  -> renderiza App.tsx
      -> define rutas (publicas/protegidas)
      -> carga paginas por lazy loading
          -> cada pagina usa hooks/servicios/shared
              -> servicios llaman API backend
```

### 3.2 Regla mental rapida

- Si es especifico de un dominio: va en `modules/<dominio>`.
- Si es reutilizable por varios dominios: va en `shared`.
- Si es contrato de datos: va en `types`.

## 4. Estructura de carpetas y responsabilidades

### Raiz del proyecto

- `public/`: recursos estaticos publicos.
- `dist/`: salida del build de produccion.
- `staticwebapp.config.json`: fallback SPA para despliegue estatico.
- `vite.config.js`: bundling, alias, proxy dev y code splitting.
- `tailwind.config.js` + `postcss.config.js`: pipeline de estilos.
- `tsconfig*.json`: configuracion TypeScript.

### `src/`

- `main.tsx`: punto de entrada. Monta `QueryClientProvider`, `MusicPlayerProvider`, `BrowserRouter`, `AuthProvider`, `ConcentrationSessionProvider`, y renderiza `App`, `MusicPlayer` y `SessionsUI`.
- `App.tsx`: mapa de rutas y proteccion de rutas con `RequireAuth`. Carga paginas con `lazy` + `Suspense`.
- `index.css` / `App.css`: estilos globales base.
- `integration/`: pruebas de flujos completos (registro, sesiones).
- `lib/`: infraestructura comun (`queryClient`, schemas).
- `types/`: tipos y contratos TypeScript.

### `src/modules/`

Cada modulo contiene su API publica con `index.ts` y organiza `pages`, `components`, `hooks`, `contexts` segun necesidad.

- `auth/`
  - Login, registro, recuperacion de password, guard de rutas.
  - Expone `AuthProvider`, `useAuth`, `RequireAuth`.
- `dashboard/`
  - Pantalla principal del usuario autenticado.
- `events/`
  - Vista de eventos y modales de crear/editar evento.
- `landing/`
  - Vista publica inicial.
- `music/`
  - Paginas de albumes y canciones.
- `notifications/`
  - Configuracion de notificaciones.
- `profile/`
  - Gestion de perfil de usuario.
- `reports/`
  - Reportes de metodos y sesiones.
- `sessions/`
  - Inicio de sesion de concentracion + UI flotante persistente.
- `study-methods/`
  - Biblioteca y ejecucion de metodos de estudio.
  - Incluye servicio de sesion/metodo (`methodSessionService`).

### `src/shared/`

Zona transversal reusable. Debe ser la base comun de la app.

- `components/`
  - Componentes reutilizables.
  - `components/ui/`: primitives y widgets visuales (`Button`, `Card`, `Timer`, `Sidebar`, etc).
- `config/`
  - Constantes globales (`API_BASE_URL`, `API_ENDPOINTS`).
- `contexts/`
  - Contextos globales compartidos (`MusicPlayerContext`).
- `hooks/`
  - Hooks reutilizables (`useApi`, `useEvents`, `useNotifications`, etc).
- `providers/`
  - Providers de estado global complejo (`ConcentrationSessionProvider`).
- `services/`
  - Integraciones HTTP y servicios de dominio transversal (`apiClient`, `sessionService`, `reportsService`, etc).
- `utils/`
  - Funciones utilitarias, mappers, sincronizacion multi-tab y cola offline.
- `index.ts`
  - Barrel export central de shared.

### `src/types/`

Contratos TypeScript:

- `api.ts`: contratos API usados por varios modulos.
- `domain/`: tipos por dominio (auth, sessions, study-methods, etc).
- `ui/`, `utils/`, `services/`, `repositories/`, `shared/`, `middleware/`: contratos de soporte y arquitectura.
- `index.ts`: export central de tipos.

## 5. Como interactuan las capas

Direccion recomendada de dependencias:

```text
modules/*  --> shared/*
modules/*  --> types/*
shared/*   --> types/*
App/main   --> modules + shared + lib
```

Reglas practicas:

- Un modulo no deberia depender internamente de otro modulo (evita acoplamiento cruzado).
- `shared` no deberia importar desde `modules`.
- Los tipos deben vivir en `types`, no duplicarse en paginas o servicios.
- Los accesos HTTP deben pasar por servicios (`shared/services` o `modules/<x>/services`).

## 6. Routing y carga diferida

- `BrowserRouter` habilita SPA.
- `App.tsx` define rutas publicas y protegidas.
- `RequireAuth` protege vistas autenticadas.
- `lazy` + `Suspense` divide bundle por rutas y mejora carga inicial.
- `staticwebapp.config.json` reescribe rutas a `index.html` para evitar 404 al refrescar.

## 7. Estado global y datos remotos

Estado global principal:

- `AuthProvider`: sesion de usuario, token y estado de autenticacion.
- `MusicPlayerProvider`: reproductor global persistente.
- `ConcentrationSessionProvider`: sesion activa, pausa/reanudar/completar, persistencia local, multi-tab y soporte offline.

Datos remotos:

- `QueryClientProvider` configura cache y reintentos globales de React Query.
- `shared/services/apiClient.ts` centraliza Axios:
  - base URL por entorno
  - inyeccion de JWT en requests
  - normalizacion de errores API

Nota tecnica:

- Hay servicios legacy que usan `fetch` directamente (`eventsApi`, `notificationsApi`), mientras que otros usan Axios. Funciona, pero a futuro conviene estandarizar en un solo cliente.

## 8. Configuracion de entorno

Requisitos:

- Node.js 18+
- npm

Variables:

```env
VITE_API_URL=https://api.example.com/api/v1
```

Comportamiento:

- En desarrollo, si `VITE_API_URL` es absoluta (`http...`), Vite usa proxy para `/api` y reduce problemas de CORS.
- En produccion se consume la URL configurada.

## 9. Comandos de trabajo diario

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Tests:

- El repo tiene tests con Vitest y Testing Library en:
  - `src/integration`
  - `src/modules/auth/pages/*.test.tsx`
  - `src/shared/services/*.test.ts`
  - `src/shared/utils/*.test.ts`
- Si quieres ejecutarlos manualmente:

```bash
npx vitest run
```

## 10. Convenciones del proyecto

- Arquitectura por modulo + capa shared.
- Exports publicos via `index.ts` (barrel exports).
- Tipado estricto con TypeScript.
- Alias principales en TS: `@/*`, `@modules/*`, `@shared/*`, `@types`.
- Se mantiene compatibilidad con algunos alias legacy en `vite.config.js`.

## 11. Ruta sugerida de estudio (onboarding)

Para entender el sistema de forma progresiva:

1. Leer `src/main.tsx` y `src/App.tsx`.
2. Revisar `src/shared/config/constants.ts` y `src/shared/services/apiClient.ts`.
3. Estudiar `src/modules/auth` para flujo de autenticacion.
4. Estudiar `src/shared/providers/ConcentrationSessionProvider.tsx`.
5. Revisar `src/modules/study-methods` y `src/modules/sessions`.
6. Cerrar con tests de `src/integration`.

## 12. Glosario tecnico (explicado simple)

- SPA: aplicacion web de una sola pagina. Cambia vistas sin recargar todo el navegador.
- Provider: componente que expone estado/funciones globales a sus hijos.
- Context: mecanismo de React para compartir estado sin prop drilling.
- Hook: funcion reutilizable de React para encapsular logica.
- Lazy loading: cargar codigo solo cuando se necesita.
- Code splitting: dividir el bundle en chunks mas pequenos.
- Bundle: archivo compilado que se envia al navegador.
- Chunk: parte del bundle final.
- DTO: objeto de transferencia de datos entre frontend y backend.
- Mapper: funcion que transforma datos (ejemplo: snake_case <-> camelCase).
- Interceptor: logica que se ejecuta antes/despues de cada request HTTP.
- CORS: politica del navegador para controlar peticiones entre dominios distintos.
- Proxy de desarrollo: puente local de Vite para redirigir peticiones API.
- Cache: almacenamiento temporal para evitar llamadas repetidas al backend.
- Stale time: tiempo durante el cual React Query considera frescos los datos.
- GC time: tiempo que React Query mantiene datos sin uso antes de limpiarlos.
- Offline queue: cola local de acciones que se sincronizan cuando vuelve internet.
- Multi-tab sync: sincronizacion de estado entre varias pestanas del navegador.

## 13. Estado actual de la arquitectura

Veredicto tecnico resumido:

- La base `modules + shared` esta bien encaminada y ya operativa.
- El proyecto tiene separacion clara por dominio y buenos puntos de entrada.
- Aun existen detalles por homogenizar (cliente HTTP unico y limpieza de alias legacy), pero no bloquean el desarrollo.

En otras palabras: es una arquitectura valida para crecer, siempre que se mantengan las reglas de dependencia descritas arriba.
