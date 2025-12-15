// Interfaz para crear un método activo en reportes
export interface ICreateActiveMethod {
  /** ID del método de estudio */
  idMetodo: number;
  /** ID del usuario */
  idUsuario: number;
  /** Fecha de inicio del método */
  fechaInicio: Date;
  /** Configuración específica del método (opcional) */
  configuracion?: Record<string, any>;
}