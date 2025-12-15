// Interfaz para actualizar progreso de métodos
export interface IUpdateMethodProgress {
  /** ID del método activo */
  idMetodoActivo: number;
  /** Nuevo progreso (0-100) */
  progreso: number;
  /** Estado del método */
  estado: 'activo' | 'pausado' | 'completado';
  /** Notas adicionales (opcional) */
  notas?: string;
  /** Timestamp de actualización */
  fechaActualizacion: Date;
}