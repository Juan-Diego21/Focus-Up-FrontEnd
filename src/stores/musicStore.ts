// Store de Zustand para gestión del estado de música
// Reemplaza MusicPlayerContext con mejor performance y selectores
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ISong, IPlayerState } from '../types/domain/music';

interface MusicState extends IPlayerState {
  // Elemento de audio único (única instancia)
  audioElement: HTMLAudioElement | null;

  // Acciones
  initializeAudio: () => void;
  play: (song?: ISong) => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  seekTo: (time: number) => void;
  loadPlaylist: (songs: ISong[]) => void;
  cleanup: () => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentSong: undefined,
      playlist: [],
      currentIndex: -1,
      isPlaying: false,
      volume: 0.8,
      isShuffle: false,
      isRepeat: false,
      currentTime: 0,
      duration: 0,
      audioElement: null,

      // Inicializar elemento de audio único
      initializeAudio: () => {
        const { audioElement } = get();
        if (!audioElement) {
          const audio = new Audio();
          audio.volume = get().volume;

          // Event listeners
          audio.addEventListener('loadedmetadata', () => {
            set({ duration: audio.duration });
          });

          audio.addEventListener('timeupdate', () => {
            set({ currentTime: audio.currentTime });
          });

          audio.addEventListener('ended', () => {
            const state = get();
            if (state.isRepeat) {
              audio.currentTime = 0;
              audio.play();
            } else {
              get().next();
            }
          });

          audio.addEventListener('error', (e) => {
            console.error('Error de audio:', e);
            set({ isPlaying: false });
          });

          set({ audioElement: audio });
        }
      },

      // Reproducir canción
      play: (song) => {
        const { audioElement, playlist, currentIndex } = get();

        if (!audioElement) return;

        if (song) {
          // Buscar índice de la canción en playlist
          const index = playlist.findIndex(s => s.id_cancion === song.id_cancion);
          if (index !== -1) {
            set({ currentSong: song, currentIndex: index });
            audioElement.src = song.url_musica;
            audioElement.play().catch(console.error);
            set({ isPlaying: true });
          }
        } else {
          // Reanudar canción actual
          audioElement.play().catch(console.error);
          set({ isPlaying: true });
        }
      },

      // Pausar reproducción
      pause: () => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.pause();
          set({ isPlaying: false });
        }
      },

      // Siguiente canción
      next: () => {
        const { playlist, currentIndex, isShuffle } = get();
        if (playlist.length === 0) return;

        let nextIndex: number;
        if (isShuffle) {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } else {
          nextIndex = (currentIndex + 1) % playlist.length;
        }

        const nextSong = playlist[nextIndex];
        get().play(nextSong);
      },

      // Canción anterior
      previous: () => {
        const { playlist, currentIndex } = get();
        if (playlist.length === 0) return;

        const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
        const prevSong = playlist[prevIndex];
        get().play(prevSong);
      },

      // Cambiar volumen
      setVolume: (volume) => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.volume = volume;
        }
        set({ volume });
      },

      // Toggle shuffle
      toggleShuffle: () => {
        set((state) => ({ isShuffle: !state.isShuffle }));
      },

      // Toggle repeat
      toggleRepeat: () => {
        set((state) => ({ isRepeat: !state.isRepeat }));
      },

      // Buscar a tiempo específico
      seekTo: (time) => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.currentTime = time;
          set({ currentTime: time });
        }
      },

      // Cargar playlist
      loadPlaylist: (songs) => {
        set({ playlist: songs, currentIndex: songs.length > 0 ? 0 : -1 });
      },

      // Limpiar recursos
      cleanup: () => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.pause();
          audioElement.src = '';
          audioElement.removeAttribute('src');
        }
        set({
          audioElement: null,
          currentSong: undefined,
          playlist: [],
          currentIndex: -1,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
        });
      },
    }),
    {
      name: 'music-store',
      partialize: (state) => ({
        volume: state.volume,
        isShuffle: state.isShuffle,
        isRepeat: state.isRepeat,
        playlist: state.playlist,
        currentIndex: state.currentIndex,
      }),
    }
  )
);