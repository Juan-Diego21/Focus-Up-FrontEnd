export interface User {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  pais?: string;
  genero?: string;
  fecha_nacimiento: Date;
}

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  nombre_usuario: string;
  fecha_nacimiento: Date;
  pais?: string;
  genero?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
