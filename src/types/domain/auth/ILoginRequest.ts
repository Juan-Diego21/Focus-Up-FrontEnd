// Interfaz para la solicitud de login
export interface ILoginRequest {
  /** Email del usuario o nombre de usuario */
  identifier: string;
  /** Contraseña en texto plano */
  password: string;
}