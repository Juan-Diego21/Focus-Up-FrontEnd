export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error: string;
}

// Music Module Types
export interface Album {
  id_album: number;
  nombre_album: string;
  genero: string;
  descripcion: string;
  url_imagen?: string;
}

export interface Song {
  id_cancion: number;
  nombre_cancion: string;
  artista_cancion?: string;
  categoria: string;
  url_musica: string;
  id_album: number;
  duracion?: number; // En segundos
}

// Notification Module Types
export interface NotificationSettings {
  idUsuario?: number;
  eventos: boolean;
  metodosPendientes: boolean;
  sesionesPendientes: boolean;
  motivacion: boolean;
}

export interface UpcomingNotification {
  id: number;
  titulo: string;
  tipo: 'evento' | 'metodo' | 'sesion' | 'motivacion';
  fecha_hora: string; // ISO string
  id_metodo?: number;
  id_album?: number;
  descripcion?: string;
}

export interface NotificationConfigUpdate {
  tipo: keyof NotificationSettings;
  enabled: boolean;
}


