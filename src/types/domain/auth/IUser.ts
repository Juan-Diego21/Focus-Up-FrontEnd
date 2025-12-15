// Interfaz que representa un usuario en el dominio del frontend
export interface IUser {
  /** ID único del usuario */
  id_usuario: number;
  /** Nombre de usuario */
  nombre_usuario: string;
  /** Correo electrónico */
  correo: string;
  /** País de residencia (opcional) */
  pais?: string;
  /** Género del usuario (opcional) */
  genero?: string;
  /** Fecha de nacimiento */
  fecha_nacimiento: Date;
  /** Horario favorito de estudio (opcional) */
  horario_fav?: string;
  /** IDs de intereses del usuario (opcional) */
  intereses?: number[];
  /** IDs de distracciones del usuario (opcional) */
  distracciones?: number[];
  /** ID del objetivo de estudio (opcional) */
  objetivo?: number;
  /** Versión del token para invalidación de sesiones (opcional) */
  tokenVersion?: number;
}