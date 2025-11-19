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
  artista?: string;
  artist_song?: string; // Alternative field name from backend
  categoria: string;
  url_musica: string;
  id_album: number;
  duracion?: number; // in seconds
}


