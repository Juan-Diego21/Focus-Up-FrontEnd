// Interfaz para items individuales de reportes
export interface IReportItem {
  /** ID único del item */
  id: number;
  /** Título o nombre del item */
  titulo: string;
  /** Valor numérico del item */
  valor: number;
  /** Unidad de medida (opcional) */
  unidad?: string;
  /** Categoría del item */
  categoria: string;
  /** Fecha asociada al item */
  fecha: Date;
}