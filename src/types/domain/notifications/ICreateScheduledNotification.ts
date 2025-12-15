// Interfaz para crear notificaciones programadas
export interface ICreateScheduledNotification {
  /** ID del usuario destinatario */
  idUsuario: number;
  /** Título de la notificación */
  titulo: string;
  /** Mensaje de la notificación */
  mensaje: string;
  /** Tipo de notificación */
  tipo: 'evento' | 'metodo' | 'sesion' | 'motivacion';
  /** Fecha y hora programada */
  fechaProgramada: Date;
  /** ID del elemento relacionado (evento, método, etc.) */
  idRelacionado?: number;
  /** Datos adicionales (opcional) */
  metadata?: Record<string, any>;
}