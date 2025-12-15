// Hook personalizado para manejar estados de carga de manera consistente
// Facilita el control de indicadores de carga en componentes
import { useState } from 'react';

export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);

  // Función para iniciar carga
  const startLoading = () => setLoading(true);

  // Función para detener carga
  const stopLoading = () => setLoading(false);

  // Función para ejecutar una operación asíncrona con manejo de carga
  const withLoading = async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    startLoading();
    try {
      return await asyncFn();
    } finally {
      stopLoading();
    }
  };

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading,
  };
};