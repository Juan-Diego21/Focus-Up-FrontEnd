# Focus Up Frontend

Aplicacion web en React + TypeScript para gestion de estudio, sesiones de concentracion y musica de fondo durante la navegacion.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- React Query
- Tailwind CSS
- Storybook

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
npm run storybook        # Storybook en local
npm run build-storybook  # Build estatico de Storybook
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
