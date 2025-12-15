// Interfaz que representa un método de estudio
export interface IMethod {
  /** ID único del método */
  id_metodo: number;
  /** Título del método */
  titulo: string;
  /** Descripción del método */
  descripcion: string;
  /** URL de la imagen (opcional) */
  url_imagen?: string;
  /** Color en hexadecimal (opcional) */
  color_hexa?: string;
}