// Interfaz para errores de API
export interface ApiError {
  /** Mensaje descriptivo del error */
  message: string;
  /** Código de estado HTTP */
  statusCode: number;
  /** Tipo de error */
  error: string;
}