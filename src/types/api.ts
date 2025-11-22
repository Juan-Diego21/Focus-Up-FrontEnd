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

// Session Module Types
export interface SessionDto {
  sessionId: string;
  title: string;
  description?: string;
  type: 'rapid' | 'scheduled';
  eventId?: number;
  methodId?: number;
  albumId?: number;
  startTime: string; // ISO string
  pausedAt?: string; // ISO string cuando está pausada
  accumulatedMs: number; // Mantenido localmente, sobreescrito por servidor
  isRunning: boolean;
  estado: 'pending' | 'completed'; // Campo del servidor
  createdAt: string;
  updatedAt: string;
  elapsedInterval?: string;
  elapsedMs: number; // Valor autoritativo del servidor
}

export interface SessionCreateDto {
  title: string; // Sin userId - viene del JWT
  description?: string;
  type: 'rapid' | 'scheduled';
  eventId?: number;
  methodId?: number;
  albumId?: number;
}

export interface SessionUpdateDto {
  status?: 'active' | 'paused' | 'completed';
  accumulatedMs?: number;
  pausedAt?: string;
}

export interface SessionFilters {
  type?: 'rapid' | 'scheduled';
  status?: 'active' | 'paused' | 'completed';
  dateFrom?: string;
  dateTo?: string;
}

// Estado de sesión activo en el frontend
export interface ActiveSession {
  sessionId: string;
  title: string;
  description?: string;
  type: 'rapid' | 'scheduled';
  eventId?: number;
  methodId?: number;
  albumId?: number;
  startTime: string; // ISO string
  pausedAt?: string; // ISO string cuando está pausada
  accumulatedMs: number; // Mantenido localmente
  isRunning: boolean;
  status: 'active' | 'paused' | 'completed'; // Estado del cliente
  isLate?: boolean; // Para sesiones programadas
  serverEstado: 'pending' | 'completed'; // Estado del servidor
  elapsedMs: number; // Del servidor
  persistedAt: string; // Para política de expiración
}

// Tipos para métodos de estudio
export interface StudyMethod {
  id_metodo: number;
  titulo: string;
  descripcion: string;
  url_imagen?: string;
  color_hexa?: string;
}


