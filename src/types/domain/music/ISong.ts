// Interfaz que representa una canción
export interface ISong {
  /** ID único de la canción */
  id_cancion: number;
  /** Nombre de la canción */
  nombre_cancion: string;
  /** Artista de la canción (opcional) */
  artista_cancion?: string;
  /** Categoría de la canción */
  categoria: string;
  /** URL de la música */
  url_musica: string;
  /** ID del álbum al que pertenece */
  id_album: number;
  /** Duración en segundos (opcional) */
  duracion?: number;
}