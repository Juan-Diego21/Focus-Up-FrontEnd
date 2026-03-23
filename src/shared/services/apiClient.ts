// Cliente HTTP configurado para la aplicación
// Maneja autenticación JWT y errores de API de manera centralizada
import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type { ApiError } from "../../types/api";

const getSafeApiMessage = (statusCode: number): string => {
  if (statusCode >= 500) return "Ocurrió un problema del servidor. Inténtalo nuevamente.";
  if (statusCode === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
  if (statusCode === 403) return "No tienes permisos para realizar esta acción.";
  if (statusCode === 404) return "No se encontró el recurso solicitado.";
  if (statusCode === 429) return "Demasiadas solicitudes. Intenta más tarde.";
  return "No se pudo completar la solicitud.";
};

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const isDev = import.meta.env.DEV;
const useDevProxy = isDev && !!envApiUrl && envApiUrl.startsWith("http");

// Evita dependencia transversal a src/utils/constants que puede formar ciclos de chunks en build.
// En desarrollo, cuando VITE_API_URL es absoluta, se fuerza ruta relativa para usar proxy de Vite y evitar CORS.
const API_BASE_URL = (useDevProxy ? "/api/v1" : envApiUrl || "/api/v1").replace(/\/+$/, "");

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de solicitud para JWT
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejo de errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const statusCode = error.response?.status || 500;
    const backendMessage = error.response?.data?.message;
    const apiError: ApiError = {
      // En desarrollo se conserva detalle del backend para depuración;
      // en producción se abstrae para no filtrar información interna.
      message: import.meta.env.DEV && backendMessage
        ? backendMessage
        : getSafeApiMessage(statusCode),
      statusCode,
      error: error.response?.data?.error || "Unknown error",
    };
    return Promise.reject(apiError);
  }
);

export { apiClient };
