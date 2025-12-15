// Interfaz para datos de reportes
export interface IReportData {
  /** ID único del reporte */
  id: number;
  /** Tipo de reporte */
  tipo: 'session' | 'method' | 'user';
  /** Datos del reporte */
  datos: Record<string, any>;
  /** Fecha de generación */
  fechaGeneracion: Date;
  /** ID del usuario propietario */
  idUsuario: number;
}