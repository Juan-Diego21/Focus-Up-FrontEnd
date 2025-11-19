import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Song } from '../types/api';

// Modos de reproducción
export type PlaybackMode = 'ordered' | 'shuffle' | 'loop-one' | 'loop-all';

interface MusicPlayerState {
  currentSong: Song | null;
  currentAlbum: { id_album: number; nombre_album: string } | null;
  playlist: Song[];
  isPlaying: boolean;
  isShuffling: boolean;
  playbackMode: PlaybackMode;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
}

interface MusicPlayerContextType extends MusicPlayerState {
  // Funciones de control
  playSong: (song: Song) => void;
  playPlaylist: (songs: Song[], startIndex?: number, albumInfo?: { id_album: number; nombre_album: string }) => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  previousSong: () => void;
  setShuffle: (shuffle: boolean) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  addToPlaylist: (song: Song) => void;
  removeFromPlaylist: (index: number) => void;
  reorderPlaylist: (fromIndex: number, toIndex: number) => void;
  clearPlaylist: () => void;

  // Elemento de audio
  audioElement: HTMLAudioElement | null;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

const MUSIC_PLAYER_STORAGE_KEY = 'focusup-music-player';

// Audio element persistente - creado una sola vez y nunca destruido
const audioRef = React.createRef<HTMLAudioElement>();

export const MusicPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado inicial
  const [state, setState] = useState<MusicPlayerState>({
    currentSong: null,
    currentAlbum: null,
    playlist: [],
    isPlaying: false,
    isShuffling: false,
    playbackMode: 'ordered',
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isLoading: false,
  });

  // Fallback progress tracking for external URLs
  useEffect(() => {
    let progressInterval: number | null = null;

    if (state.isPlaying && audioRef.current) {
      // Update progress every 100ms as fallback
      progressInterval = window.setInterval(() => {
        if (audioRef.current && !audioRef.current.paused) {
          setState(prev => ({
            ...prev,
            currentTime: audioRef.current!.currentTime
          }));
        }
      }, 100);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [state.isPlaying]);

  // Cargar estado desde localStorage al montar
  useEffect(() => {
    const savedState = localStorage.getItem(MUSIC_PLAYER_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(prev => ({
          ...prev,
          playlist: parsed.playlist || [],
          playbackMode: parsed.playbackMode || 'ordered',
          volume: parsed.volume ?? 0.7,
        }));
      } catch (error) {
        console.error('Error loading music player state:', error);
      }
    }
  }, []);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    const stateToSave = {
      playlist: state.playlist,
      playbackMode: state.playbackMode,
      volume: state.volume,
    };
    localStorage.setItem(MUSIC_PLAYER_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [state.playlist, state.playbackMode, state.volume]);

  // Crear elemento de audio persistente una sola vez
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.volume;

      // Eventos del audio
      const handleLoadedMetadata = () => {
        setState(prev => ({ ...prev, duration: audioRef.current!.duration, isLoading: false }));
      };

      const handleTimeUpdate = () => {
        setState(prev => ({ ...prev, currentTime: audioRef.current!.currentTime }));
      };

      const handleCanPlay = () => {
        setState(prev => ({ ...prev, isLoading: false }));
      };

      const handleLoadStart = () => {
        setState(prev => ({ ...prev, isLoading: true }));
      };

      const handleEnded = () => {
        handleSongEnd();
      };

      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('loadstart', handleLoadStart);

      // Cleanup function - NO pausar el audio para mantener reproducción persistente
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('loadstart', handleLoadStart);
          // Nota: No llamamos audio.pause() para mantener reproducción persistente
        }
      };
    }
  }, []);

  // Actualizar volumen cuando cambie
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  const handleSongEnd = () => {
    if (state.playbackMode === 'loop-one' && state.currentSong) {
      // Repetir la misma canción
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      // Ir a la siguiente canción
      nextSong();
    }
  };

  const getNextSongIndex = (): number => {
    if (!state.currentSong || state.playlist.length === 0) return -1;

    const currentIndex = state.playlist.findIndex(song => song.id_cancion === state.currentSong!.id_cancion);

    if (state.isShuffling) {
      // Modo aleatorio
      return Math.floor(Math.random() * state.playlist.length);
    } else {
      // Modo ordenado o loop-all
      const nextIndex = (currentIndex + 1) % state.playlist.length;
      return nextIndex;
    }
  };

  const getPreviousSongIndex = (): number => {
    if (!state.currentSong || state.playlist.length === 0) return -1;

    const currentIndex = state.playlist.findIndex(song => song.id_cancion === state.currentSong!.id_cancion);

    if (state.isShuffling) {
      // En modo aleatorio, ir a una canción aleatoria
      return Math.floor(Math.random() * state.playlist.length);
    } else {
      // Modo ordenado
      return currentIndex > 0 ? currentIndex - 1 : state.playlist.length - 1;
    }
  };

  // Función para obtener el tipo MIME basado en la extensión del archivo
  const getMimeType = (url: string): string => {
    if (url.endsWith('.mp3')) return 'audio/mpeg';
    if (url.endsWith('.m4a')) return 'audio/mp4';
    if (url.endsWith('.wav')) return 'audio/wav';
    if (url.endsWith('.ogg')) return 'audio/ogg';
    return 'audio/mpeg'; // Tipo por defecto
  };

  // Función para validar URL de audio
  const validateAudioUrl = (url: string): { isValid: boolean; reason?: string } => {
    if (!url || typeof url !== 'string') {
      return { isValid: false, reason: 'URL vacía o inválida' };
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { isValid: false, reason: 'URL debe comenzar con http:// o https://' };
    }

    // Detectar URLs de placeholder (como tu-proyecto.supabase.co)
    if (url.includes('tu-proyecto.supabase.co') || url.includes('placeholder') || url.includes('example.com')) {
      return { isValid: false, reason: 'URL de placeholder detectada - archivo no disponible' };
    }

    // Verificar extensiones soportadas
    const supportedExtensions = ['.mp3', '.m4a', '.wav', '.ogg'];
    const hasSupportedExtension = supportedExtensions.some(ext => url.toLowerCase().endsWith(ext));

    if (!hasSupportedExtension) {
      return { isValid: false, reason: 'Formato de archivo no soportado' };
    }

    return { isValid: true };
  };

  const playSong = (song: Song) => {
    // Validar URL antes de intentar reproducir
    const validation = validateAudioUrl(song.url_musica);
    if (!validation.isValid) {
      console.error('URL de audio inválida:', song.url_musica, 'Razón:', validation.reason);

      // En modo desarrollo, simular reproducción para URLs de placeholder
      if (validation.reason?.includes('placeholder')) {
        console.log('Modo desarrollo: Simulando reproducción para URL de placeholder');
        simulatePlayback(song);
        return;
      }

      alert(`Error: ${validation.reason}. La canción "${song.nombre_cancion}" no se puede reproducir.`);
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, currentSong: song, isLoading: true }));

    if (audioRef.current) {
      // Limpiar eventos anteriores
      audioRef.current.removeEventListener('error', handleAudioError);
      audioRef.current.addEventListener('error', handleAudioError);

      audioRef.current.src = song.url_musica;
      audioRef.current.load(); // Forzar recarga

      // Set initial duration from database as fallback
      setState(prev => ({ ...prev, duration: song.duracion || 0 }));

      audioRef.current.play().then(() => {
        // Manually set isPlaying since events might not fire for external URLs
        setState(prev => ({ ...prev, isPlaying: true }));
      }).catch(error => {
        console.error('Error reproduciendo canción:', error);
        setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));

        // Mostrar mensaje específico según el tipo de error
        if (error.name === 'NotSupportedError') {
          alert('Error: El formato de audio no es soportado por este navegador.');
        } else {
          alert('Error al reproducir la canción. Intentando la siguiente...');
        }

        // Intentar reproducir la siguiente canción automáticamente
        setTimeout(() => nextSong(), 2000);
      });
    }
  };

  // Función para simular reproducción en modo desarrollo
  const simulatePlayback = (song: Song) => {
    console.log(`🎵 Simulando reproducción: "${song.nombre_cancion}" por ${song.artista}`);

    setState(prev => ({
      ...prev,
      currentSong: song,
      isPlaying: true,
      isLoading: false,
      duration: song.duracion || 180, // 3 minutos por defecto
      currentTime: 0
    }));

    // Simular progreso de la canción
    const interval = setInterval(() => {
      setState(prev => {
        const newTime = prev.currentTime + 1;
        if (newTime >= (prev.duration || 180)) {
          clearInterval(interval);
          // Simular fin de canción
          setTimeout(() => nextSong(), 1000);
          return { ...prev, currentTime: prev.duration || 180, isPlaying: false };
        }
        return { ...prev, currentTime: newTime };
      });
    }, 1000);

    // Limpiar intervalo si se cambia de canción
    setTimeout(() => clearInterval(interval), (song.duracion || 180) * 1000);
  };

  const handleAudioError = (e: Event) => {
    const audio = e.target as HTMLAudioElement;
    console.error('Error cargando archivo de audio:', audio.src);

    setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));

    // Determinar el tipo de error y mostrar mensaje apropiado
    if (audio.error) {
      switch (audio.error.code) {
        case MediaError.MEDIA_ERR_NETWORK:
          alert('Error de red: No se pudo cargar el archivo de audio.');
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          alert('Error: El formato de audio no es soportado.');
          break;
        case MediaError.MEDIA_ERR_ABORTED:
          console.log('Carga de audio cancelada');
          break;
        default:
          alert('Error desconocido al cargar el archivo de audio.');
      }
    }

    // Intentar reproducir la siguiente canción
    setTimeout(() => nextSong(), 3000);
  };

  const playPlaylist = (songs: Song[], startIndex: number = 0, albumInfo?: { id_album: number; nombre_album: string }) => {
    setState(prev => ({
      ...prev,
      playlist: [...songs],
      currentAlbum: albumInfo || null
    }));

    if (songs.length > 0) {
      const startSong = songs[startIndex] || songs[0];
      playSong(startSong);
    }
  };

  const togglePlayPause = () => {
    if (!state.currentSong) return;

    // Si hay un elemento de audio real, usarlo
    if (audioRef.current) {
      if (state.isPlaying) {
        audioRef.current.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      } else {
        audioRef.current.play().then(() => {
          setState(prev => ({ ...prev, isPlaying: true }));
        }).catch(() => {
          setState(prev => ({ ...prev, isPlaying: false }));
        });
      }
    } else {
      // Modo simulado - alternar estado de reproducción
      setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

  const nextSong = () => {
    const nextIndex = getNextSongIndex();
    if (nextIndex >= 0 && state.playlist[nextIndex]) {
      playSong(state.playlist[nextIndex]);
    }
  };

  const previousSong = () => {
    const prevIndex = getPreviousSongIndex();
    if (prevIndex >= 0 && state.playlist[prevIndex]) {
      playSong(state.playlist[prevIndex]);
    }
  };

  const setShuffle = (shuffle: boolean) => {
    setState(prev => ({ ...prev, isShuffling: shuffle }));
  };

  const setPlaybackMode = (mode: PlaybackMode) => {
    setState(prev => ({ ...prev, playbackMode: mode }));
  };

  const setVolume = (volume: number) => {
    setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    } else {
      // Modo simulado
      setState(prev => ({ ...prev, currentTime: Math.max(0, Math.min(time, prev.duration || 0)) }));
    }
  };

  const addToPlaylist = (song: Song) => {
    setState(prev => ({
      ...prev,
      playlist: [...prev.playlist, song]
    }));
  };

  const removeFromPlaylist = (index: number) => {
    setState(prev => {
      const newPlaylist = [...prev.playlist];
      newPlaylist.splice(index, 1);
      return { ...prev, playlist: newPlaylist };
    });
  };

  const reorderPlaylist = (fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newPlaylist = [...prev.playlist];
      const [moved] = newPlaylist.splice(fromIndex, 1);
      newPlaylist.splice(toIndex, 0, moved);
      return { ...prev, playlist: newPlaylist };
    });
  };

  const clearPlaylist = () => {
    setState(prev => ({
      ...prev,
      playlist: [],
      currentSong: null,
      isPlaying: false
    }));

    // No pausar el audio para mantener consistencia con reproducción persistente
    // Solo limpiar la fuente si es necesario
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  const contextValue: MusicPlayerContextType = {
    ...state,
    playSong,
    playPlaylist,
    togglePlayPause,
    nextSong,
    previousSong,
    setShuffle,
    setPlaybackMode,
    setVolume,
    seekTo,
    addToPlaylist,
    removeFromPlaylist,
    reorderPlaylist,
    clearPlaylist,
    audioElement: audioRef.current,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};