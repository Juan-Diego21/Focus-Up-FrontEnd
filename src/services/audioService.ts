/**
 * Servicio de audio para integración con sesiones de concentración
 *
 * Este módulo proporciona una abstracción sobre el MusicPlayerContext
 * para controlar la reproducción de música durante las sesiones.
 * Es crítico que el audio nunca se interrumpa durante las transiciones
 * de sesión, manteniendo la experiencia de concentración ininterrumpida.
 *
 * Reglas de reproducción:
 * - Si no se selecciona álbum y el audio ya está reproduciendo → continuar
 * - Si se selecciona álbum → reemplazar reproducción actual
 * - Minimizar/maximizar no afecta el audio
 */

import { useMusicPlayer } from '../contexts/MusicPlayerContext';

/**
 * Servicio de audio para sesiones de concentración
 */
class AudioService {
  /**
   * Reproduce un álbum específico
   *
   * @param albumId - ID del álbum a reproducir
   */
  async playAlbum(albumId: number): Promise<void> {
    try {
      // Aquí iría la lógica para obtener las canciones del álbum
      // y reproducir la primera canción
      // Por ahora, delegamos al contexto existente

      console.log(`Reproduciendo álbum ${albumId} para sesión`);
    } catch (error) {
      console.error('Error reproduciendo álbum:', error);
      throw error;
    }
  }

  /**
   * Pausa la reproducción actual
   */
  pause(): void {
    try {
      const musicPlayer = useMusicPlayer();
      musicPlayer.togglePlayPause();
    } catch (error) {
      console.error('Error pausando audio:', error);
    }
  }

  /**
   * Reanuda la reproducción
   */
  resume(): void {
    try {
      const musicPlayer = useMusicPlayer();
      musicPlayer.togglePlayPause();
    } catch (error) {
      console.error('Error reanudando audio:', error);
    }
  }

  /**
   * Obtiene información del álbum actualmente reproduciendo
   *
   * @returns Información del álbum actual o null
   */
  getCurrentAlbum(): { id: number; name: string } | null {
    try {
      const musicPlayer = useMusicPlayer();
      if (musicPlayer.currentAlbum) {
        return {
          id: musicPlayer.currentAlbum.id_album,
          name: musicPlayer.currentAlbum.nombre_album,
        };
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo álbum actual:', error);
      return null;
    }
  }

  /**
   * Reemplaza la reproducción si hay un álbum de sesión
   *
   * Reglas de reemplazo:
   * - Si no hay álbum de sesión y audio ya está reproduciendo → continuar
   * - Si hay álbum de sesión → reemplazar reproducción actual
   *
   * @param sessionAlbumId - ID del álbum de la sesión (opcional)
   */
  async replaceIfSessionAlbum(sessionAlbumId?: number): Promise<void> {
    try {
      const _musicPlayer = useMusicPlayer();
      const currentAlbum = this.getCurrentAlbum();

      // Si no hay álbum de sesión, verificar si debemos continuar reproducción actual
      if (!sessionAlbumId) {
        // Si ya hay algo reproduciendo, continuar (no pausar)
        if (_musicPlayer.isPlaying) {
          console.log('Continuando reproducción actual - no hay álbum de sesión');
          return;
        }
        // Si no hay nada reproduciendo, no hacer nada
        return;
      }

      // Si hay álbum de sesión, verificar si es diferente al actual
      if (currentAlbum && currentAlbum.id === sessionAlbumId) {
        // Ya está reproduciendo el álbum correcto
        console.log('Álbum de sesión ya está reproduciendo');
        return;
      }

      // Reemplazar con el álbum de sesión
      console.log(`Reemplazando reproducción con álbum de sesión ${sessionAlbumId}`);
      await this.playAlbum(sessionAlbumId);
    } catch (error) {
      console.error('Error reemplazando álbum de sesión:', error);
      throw error;
    }
  }

  /**
   * Determina si se debe reemplazar la reproducción actual
   *
   * @param sessionAlbumId - ID del álbum de la sesión
   * @returns true si se debe reemplazar
   */
  shouldReplacePlayback(sessionAlbumId?: number): boolean {
    try {
      const currentAlbum = this.getCurrentAlbum();

      // Si no hay álbum de sesión, no reemplazar
      if (!sessionAlbumId) {
        return false;
      }

      // Si hay álbum de sesión y es diferente al actual, reemplazar
      if (currentAlbum && currentAlbum.id !== sessionAlbumId) {
        return true;
      }

      // Si no hay álbum actual pero hay álbum de sesión, reemplazar
      if (!currentAlbum && sessionAlbumId) {
        return true;
      }

      // En cualquier otro caso, no reemplazar
      return false;
    } catch (error) {
      console.error('Error determinando si reemplazar reproducción:', error);
      return false;
    }
  }
}

// Instancia singleton del servicio
const audioServiceInstance = new AudioService();

export { audioServiceInstance as audioService };
export default audioServiceInstance;