// Interfaz que representa un reporte de sesión
export interface ISessionReport {
  /** ID único del reporte */
  idReporte: number;
  /** ID de la sesión */
  idSesion: number;
  /** ID del usuario */
  idUsuario: number;
  /** Nombre de la sesión */
  nombreSesion: string;
  /** Descripción de la sesión */
  descripcion: string;
  /** Estado de la sesión */
  estado: 'pendiente' | 'completado';
  /** Tiempo total en ms */
  tiempoTotal: number;
  /** Información del método asociado (opcional) */
  metodoAsociado?: {
    idMetodo: number;
    nombreMetodo: string;
  };
  /** Información del álbum asociado (opcional) */
  albumAsociado?: {
    idAlbum: number;
    nombreAlbum: string;
  };
  /** Fecha de creación */
  fechaCreacion: string;
}