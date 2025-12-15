// Interfaz para respuestas de API estándar
// Proporciona un contrato consistente para todas las respuestas HTTP
export interface ApiResponse<T = any> {
  /** Datos de respuesta */
  data: T;
  /** Mensaje descriptivo opcional */
  message?: string;
  /** Indica si la operación fue exitosa */
  success: boolean;
}