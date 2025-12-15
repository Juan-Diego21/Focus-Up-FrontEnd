// Utilidades para manejo de música
// Funciones para obtener imágenes de álbumes, formatear duraciones y nombres de artistas
import type { ISong } from '../../types/domain/music';

/**
 * Maps album ID to corresponding image path
 * @param albumId - The ID of the album (number or string)
 * @returns The image path for the album
 */
export const getAlbumImage = (albumId: any): string => {
  if (!albumId) {
    // Se eliminó console.warn para mantener código limpio en producción
    return '/img/fondo-album.png';
  }

  const id = typeof albumId === 'string' ? parseInt(albumId, 10) : albumId;

  // Se eliminó console.log para mantener código limpio en producción

  // Deterministic mapping based on album ID
  switch (id) {
    case 1:
      return '/img/Album_Lofi.png';
    case 2:
      return '/img/Album_Naturaleza.png';
    case 3:
      return '/img/Album_Instrumental.png';
    default:
      // Se eliminó console.warn para mantener código limpio en producción
      return '/img/fondo-album.png';
  }
};

/**
 * Formats duration in seconds to MM:SS format
 * @param song - The song object containing duration
 * @param cachedDuration - Optional cached duration from metadata
 * @returns Formatted duration string
 */
export const formatDuration = (song: ISong, cachedDuration?: number): string => {
  // Use cached duration if available
  if (cachedDuration !== undefined && cachedDuration > 0) {
    const mins = Math.floor(cachedDuration / 60);
    const secs = Math.floor(cachedDuration % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Fallback to database duration
  if (song.duracion && song.duracion > 0) {
    const mins = Math.floor(song.duracion / 60);
    const secs = Math.floor(song.duracion % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Default for unknown duration
  return '--:--';
};

/**
 * Extracts artist name from song, with fallback
 * @param song - The song object
 * @returns The artist name or default
 */
export const getArtistName = (song: ISong): string => {
  return song.artista_cancion || 'Artista desconocido';
};

/**
 * Preloads song durations concurrently using Promise.all
 * @param songsList - Array of songs to preload durations for
 * @returns Promise resolving to duration map
 */
export const preloadSongDurations = async (songsList: ISong[]): Promise<Record<number, number>> => {
  const durations: Record<number, number> = {};

  // Create promises for concurrent loading with reduced timeout for better UX
  const durationPromises = songsList.map(async (song) => {
    try {
      // Skip invalid URLs
      if (!song.url_musica || typeof song.url_musica !== 'string') {
        // Se eliminó console.warn para mantener código limpio en producción
        durations[song.id_cancion] = song.duracion || 0;
        return;
      }

      // Skip placeholder URLs
      if (song.url_musica.includes('placeholder') ||
          song.url_musica.includes('example.com') ||
          song.url_musica.includes('tu-proyecto.supabase.co')) {
        // Se eliminó console.log para mantener código limpio en producción
        durations[song.id_cancion] = song.duracion || 0;
        return;
      }

      const audio = new Audio();
      audio.preload = 'metadata';

      const duration = await new Promise<number>((resolve, reject) => {
        // Reduced timeout for better user experience
        const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);

        audio.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          // Validate duration is reasonable (not NaN, Infinity, or 0)
          const validDuration = audio.duration && isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
          resolve(validDuration);
        });

        audio.addEventListener('error', (e) => {
          clearTimeout(timeout);
          reject(new Error(`Audio load error: ${e.message || 'Unknown error'}`));
        });

        // Handle abort/error cases
        audio.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Audio loading aborted'));
        });

        audio.src = song.url_musica;
      });

      durations[song.id_cancion] = duration;
    } catch (error) {
      // Use database duration as fallback - don't log as error since it's expected for some URLs
      durations[song.id_cancion] = song.duracion || 0;
      // Se eliminó console.debug para mantener código limpio en producción
    }
  });

  // Wait for all promises to complete - use Promise.allSettled to ensure all complete even if some fail
  await Promise.allSettled(durationPromises);

  return durations;
};