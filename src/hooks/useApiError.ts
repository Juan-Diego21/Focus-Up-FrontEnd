// ✅ Hook personalizado para manejar errores de API de manera consistente
import { useState } from 'react';

export const useApiError = () => {
  const [error, setError] = useState<string>('');

  // ✅ Función para manejar errores de API
  const handleError = (err: unknown): string => {
    const apiError = err as { response?: { data?: { error?: string } }; message?: string };
    const errorMessage = apiError?.response?.data?.error || apiError?.message || 'Error desconocido';
    setError(errorMessage);
    return errorMessage;
  };

  // ✅ Función para limpiar errores
  const clearError = () => setError('');

  return {
    error,
    handleError,
    clearError,
  };
};