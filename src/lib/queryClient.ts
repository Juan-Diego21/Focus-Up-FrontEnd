// Configuración de TanStack Query para gestión de datos
// Cliente de queries optimizado para la aplicación
import { QueryClient } from '@tanstack/react-query';

// Configuración del cliente de queries
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran frescos
      staleTime: 5 * 60 * 1000, // 5 minutos

      // Tiempo que los datos permanecen en caché (gcTime en v5+)
      gcTime: 10 * 60 * 1000, // 10 minutos

      // Reintentos automáticos en caso de error
      retry: (failureCount, error: any) => {
        // No reintentar en errores de autenticación
        if (error?.statusCode === 401 || error?.statusCode === 403) {
          return false;
        }
        // Reintentar hasta 3 veces para otros errores
        return failureCount < 3;
      },

      // Refetch automático cuando la ventana recupera foco
      refetchOnWindowFocus: false,

      // Refetch automático cuando se reconecta a internet
      refetchOnReconnect: true,
    },
    mutations: {
      // Reintentos para mutaciones
      retry: 1,

      // Callback cuando una mutación falla
      onError: (error: any) => {
        console.error('Mutation error:', error);
      },
    },
  },
});