// Interfaz que representa el estado del reproductor de música
import type { ISong } from './ISong';

export interface IPlayerState {
  /** Canción actualmente reproduciéndose (opcional) */
  currentSong?: ISong;
  /** Lista de reproducción actual */
  playlist: ISong[];
  /** Índice de la canción actual en la lista */
  currentIndex: number;
  /** Indica si está reproduciendo */
  isPlaying: boolean;
  /** Volumen actual (0-1) */
  volume: number;
  /** Indica si está en modo aleatorio */
  isShuffle: boolean;
  /** Indica si está en repetición */
  isRepeat: boolean;
  /** Tiempo actual de reproducción en segundos */
  currentTime: number;
  /** Duración total de la canción en segundos */
  duration: number;
}