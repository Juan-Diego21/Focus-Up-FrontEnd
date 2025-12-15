// Hook genérico para manejar llamadas a API
// Proporciona estado de carga, error y datos para operaciones asíncronas
import { useState, useCallback } from "react";
import type { ApiError } from "../../types/api";

interface UseApiState<T> {
  // Datos de respuesta
  data: T | null;
  // Indica si está cargando
  loading: boolean;
  // Error de API si ocurre
  error: ApiError | null;
}

export const useApi = <T>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Ejecuta una llamada a API
  const execute = useCallback(async (apiCall: Promise<T>) => {
    setState({ data: null, loading: true, error: null });

    try {
      const data = await apiCall;
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      setState({ data: null, loading: false, error: apiError });
      throw error;
    }
  }, []);

  // Reinicia el estado
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};