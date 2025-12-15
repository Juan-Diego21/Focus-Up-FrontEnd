// Interfaz que representa una sesión de concentración
export interface ISession {
  /** ID único de la sesión */
  idSesion: number;
  /** ID del usuario propietario */
  idUsuario: number;
  /** Título opcional */
  titulo?: string;
  /** Descripción opcional */
  descripcion?: string;
  /** Estado de la sesión */
  estado: 'pendiente' | 'completada';
  /** Tipo de sesión */
  tipo: 'rapid' | 'scheduled';
  /** ID del evento asociado (opcional) */
  idEvento?: number;
  /** ID del método de estudio (opcional) */
  idMetodo?: number;
  /** ID del álbum de música (opcional) */
  idAlbum?: number;
  /** Tiempo transcurrido en formato HH:MM:SS */
  tiempoTranscurrido: string;
  /** Fecha de creación */
  fechaCreacion: Date;
  /** Fecha de actualización */
  fechaActualizacion: Date;
  /** Fecha de última interacción */
  ultimaInteraccion: Date;
}