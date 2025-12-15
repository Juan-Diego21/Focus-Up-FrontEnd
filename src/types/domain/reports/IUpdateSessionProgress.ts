// Interfaz para actualizar progreso de sesiones
export interface IUpdateSessionProgress {
  /** ID de la sesión */
  idSesion: number;
  /** Tiempo acumulado en milisegundos */
  tiempoAcumulado: number;
  /** Estado de la sesión */
  estado: 'pendiente' | 'completada';
  /** Notas de progreso (opcional) */
  notas?: string;
  /** Timestamp de actualización */
  fechaActualizacion: Date;
}