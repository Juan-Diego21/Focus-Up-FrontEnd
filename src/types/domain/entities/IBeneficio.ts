// Interfaz para beneficios de métodos de estudio
export interface IBeneficio {
  /** ID único del beneficio */
  id_beneficio: number;
  /** Descripción del beneficio */
  descripcion_beneficio: string;
  /** ID del método al que pertenece */
  id_metodo?: number;
  /** Fecha de creación */
  fecha_creacion?: Date;
  /** Fecha de actualización */
  fecha_actualizacion?: Date;
}