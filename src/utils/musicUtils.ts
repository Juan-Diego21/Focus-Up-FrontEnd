import type { Song } from '../types/api';

/**
 * Maps album ID to corresponding image path
 * @param albumId - The ID of the album (number or string)
 * @returns The image path for the album
 */
export const getAlbumImage = (albumId: any): string => {
  if (!albumId) {
    console.warn('Album ID is undefined, using fallback image');
    return '/img/fondo-album.png';
  }

  const id = typeof albumId === 'string' ? parseInt(albumId, 10) : albumId;

  console.log(`Resolving image for album ID: ${id}`);

  // Deterministic mapping based on album ID
  switch (id) {
    case 1:
      return '/img/Album_Lofi.png';
    case 2:
      return '/img/Album_Naturaleza.png';
    case 3:
      return '/img/Album_Instrumental.png';
    default:
      console.warn(`Unknown album ID: ${id}, using fallback image`);
      return '/img/fondo-album.png';
  }
};

/**
 * Formats duration in seconds to MM:SS format
 * @param song - The song object containing duration
 * @param cachedDuration - Optional cached duration from metadata
 * @returns Formatted duration string
 */
export const formatDuration = (song: Song, cachedDuration?: number): string => {
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
export const getArtistName = (song: Song): string => {
  return song.artista_cancion || 'Artista desconocido';
};

/**
 * Preloads song durations concurrently using Promise.all
 * @param songsList - Array of songs to preload durations for
 * @returns Promise resolving to duration map
 */
export const preloadSongDurations = async (songsList: Song[]): Promise<Record<number, number>> => {
  const durations: Record<number, number> = {};

  // Create promises for concurrent loading
  const durationPromises = songsList.map(async (song) => {
    try {
      const audio = new Audio();
      audio.preload = 'metadata';

      const duration = await new Promise<number>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);

        audio.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          resolve(audio.duration);
        });

        audio.addEventListener('error', () => {
          clearTimeout(timeout);
          reject(new Error('Error loading metadata'));
        });

        audio.src = song.url_musica;
      });

      durations[song.id_cancion] = duration;
    } catch (error) {
      // Use database duration as fallback
      durations[song.id_cancion] = song.duracion || 0;
      console.warn(`Failed to preload duration for song ${song.id_cancion}:`, error);
    }
  });

  // Wait for all promises to complete
  await Promise.all(durationPromises);

  return durations;
};