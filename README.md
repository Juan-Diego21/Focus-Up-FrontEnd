# Focus Up Frontend

Aplicacion web en React + TypeScript para gestion de estudio, sesiones de concentracion y musica de fondo durante la navegacion.

## Refactor Mobile-First (Marzo 2026)

Se realizo un refactor por modulos y vistas para priorizar experiencia movil sin degradar escritorio.

### Modulos ajustados

- Sesiones de concentracion
- Biblioteca de metodos de estudio
- Musica (albumes y canciones)
- Eventos y recordatorios
- Reportes y analiticas
- Perfil de usuario
- Landing page
- Navegacion base (sidebar y layout compartido)

### Decisiones de arquitectura responsive

- Se eliminaron restricciones globales heredadas (`#root` con `max-width` y `padding`) que forzaban comportamientos no responsivos.
- Se normalizo la base para prevenir overflow horizontal con reglas globales en `html`, `body` y `#root`.
- Se ajustaron layouts a `mobile-first` usando `px`/`py` fluidos y escalado tipografico por breakpoints.
- Se redujo el uso de offsets rigidos en desktop (`ml-64`) que provocaban recortes en movil.
- Se mejoro el sidebar para movil con area tactil mayor, cierre por overlay y cierre automatico al navegar.

### Accesibilidad y contraste

- Se subio contraste en textos secundarios y subtitulos para mejorar lectura en exteriores.
- Se ajusto jerarquia visual de titulos en pantallas pequenas (evitando escalas excesivas).
- Se incrementaron alturas minimas en botones clave para interaccion tactil (`min-h`).

### Correccion funcional incluida

- Eliminacion de cuenta:
  - primero limpia estado de autenticacion (`logout`)
  - luego redirige estrictamente a `/` con `replace: true`
  - evita rutas anidadas y reduce riesgo de bucles de navegacion

### Integridad de escritorio preservada

- Se mantuvo comportamiento funcional y visual en desktop.
- Los cambios se enfocaron en responsive y accesibilidad sin remover features ni alterar logica de backend.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- React Query
- Tailwind CSS

## Requisitos

- Node.js 18 o superior
- npm
- Backend disponible en una URL valida

## Instalacion

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raiz (puedes copiar `.env.example`):

```env
VITE_API_URL=https://api.example.com/api/v1
```

## Ejecutar en desarrollo

```bash
npm run dev
```

## Scripts disponibles

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de produccion
npm run preview          # Preview del build
npm run lint             # Lint del proyecto
```

## Estructura principal

```text
src/
  modules/       # Modulos por dominio (auth, music, sessions, study-methods, etc.)
  pages/         # Paginas globales
  components/    # Componentes compartidos/legacy
  contexts/      # Contextos globales (auth, music)
  providers/     # Providers de estado complejo
  stores/        # Zustand stores
  services/      # Servicios de API y logica de negocio
  shared/        # Recursos reutilizables
  types/         # Tipos TypeScript
  utils/         # Utilidades
```

## Enrutamiento SPA

El proyecto usa `BrowserRouter` y tiene fallback configurado en `staticwebapp.config.json`:

- Reescribe rutas a `/index.html`
- Excluye `/assets/*`, `/images/*` y `/favicon.ico`

Esto evita errores 404 al recargar rutas internas en despliegues estaticos.

## Build y despliegue

```bash
npm run build
```

La salida se genera en `dist/`.

## Notas

- La URL del backend depende de `VITE_API_URL`.
- Si falla autenticacion o carga de datos, revisa primero el valor de `.env` y la disponibilidad del backend.
