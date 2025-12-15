// Interfaz para configuración de métodos de estudio
export interface IStudyMethodConfig {
  /** ID único de la configuración */
  id: number;
  /** ID del método de estudio */
  idMetodo: number;
  /** ID del usuario */
  idUsuario: number;
  /** Configuración específica del método */
  configuracion: Record<string, any>;
  /** Indica si está activa */
  activa: boolean;
  /** Fecha de creación */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
}