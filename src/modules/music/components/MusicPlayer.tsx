// Componente principal del reproductor de música
// Gestiona la reproducción, controles y cola de canciones
import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  QueueListIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useMusicPlayer, type PlaybackMode } from '../../../contexts/MusicPlayerContext';
import { useAuth } from '../../../modules/auth';
import { getAlbumImage, getArtistName } from '../../../shared/utils/musicUtils';

export const MusicPlayer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    currentSong,
    currentAlbum,
    playlist,
    isPlaying,
    isShuffling,
    playbackMode,
    currentTime,
    duration,
    volume,
    isLoading,
    togglePlayPause,
    nextSong,
    previousSong,
    setShuffle,
    setPlaybackMode,
    setVolume,
    seekTo,
    removeFromPlaylist,
    reorderPlaylist,
    playPlaylist,
  } = useMusicPlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Restaurar música de sesión reanudada
  useEffect(() => {
    const resumeData = localStorage.getItem('focusup:resume-album-songs');
    if (resumeData) {
      try {
        const { albumId, songs, albumName } = JSON.parse(resumeData);
        console.log('Restaurando música de sesión reanudada:', albumName);

        // Reemplazar playlist con las canciones de la sesión
        playPlaylist(songs, 0, { id_album: albumId, nombre_album: albumName });

        // Limpiar los datos de reanudación
        localStorage.removeItem('focusup:resume-album-songs');
      } catch (error) {
        console.error('Error restaurando música de sesión:', error);
        localStorage.removeItem('focusup:resume-album-songs');
      }
    }
  }, [playPlaylist]);

  // Calcular si hay canción siguiente/anterior disponible
  const currentIndex = currentSong ? playlist.findIndex(song => song.id_cancion === currentSong.id_cancion) : -1;
  const hasNextSong = currentIndex >= 0 && (
    playbackMode === 'loop-all' ||
    isShuffling ||
    (playbackMode === 'ordered' && currentIndex < playlist.length - 1)
  );
  const hasPreviousSong = currentIndex >= 0 && (
    playbackMode === 'loop-all' ||
    isShuffling ||
    (playbackMode === 'ordered' && currentIndex > 0)
  );

  // Si no está autenticado o no hay canción actual, no mostrar el reproductor
  if (!isAuthenticated || !currentSong) {
    console.log('[MusicPlayer] Hidden - authenticated:', isAuthenticated, 'song:', !!currentSong);
    return null;
  }


  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seekTo(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
  };

  const togglePlaybackMode = () => {
    const modes: PlaybackMode[] = ['ordered', 'loop-all', 'loop-one'];
    const currentIndex = modes.indexOf(playbackMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];

    setPlaybackMode(nextMode);
  };

  const getPlaybackModeIcon = () => {
    switch (playbackMode) {
      case 'ordered':
        return <ArrowPathIcon className="w-5 h-5" />;
      case 'loop-all':
        return <ArrowPathIcon className="w-5 h-5 text-green-400" />;
      case 'loop-one':
        return <ArrowPathIcon className="w-5 h-5 text-blue-400" />;
      default:
        return <ArrowPathIcon className="w-5 h-5" />;
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderPlaylist(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <>
      {/* Custom styles for sliders */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .slider-thumb-purple::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #3b82f6;
            border: 2px solid #ffffff;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .slider-thumb-purple::-webkit-slider-thumb:hover {
            background: #2563eb;
            transform: scale(1.1);
          }

          .slider-thumb-purple::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #3b82f6;
            border: 2px solid #ffffff;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .slider-thumb-purple::-moz-range-thumb:hover {
            background: #2563eb;
          }
        `
      }} />

      {/* Sliding Player Bar */}
      <div
        className={`fixed bottom-0 z-40 transition-all duration-300 ${
          isExpanded
            ? 'left-1/2 transform -translate-x-1/2 w-11/12 max-w-4xl h-24 bg-gradient-to-br from-[#232323]/98 to-[#1a1a1a]/98 backdrop-blur-xl rounded-3xl p-6 shadow-2xl'
            : 'right-4 bottom-4 w-20 h-20'
        }`}
      >
        {/* Toggle Button - Positioned on left edge when expanded, right edge when collapsed */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`absolute top-1/2 transform -translate-y-1/2 z-50 bg-gradient-to-br from-[#232323] to-[#1a1a1a] rounded-full p-2 border border-[#333]/60 hover:border-violet-500/50 backdrop-blur-md transition-all duration-300 cursor-pointer shadow-xl hover:shadow-violet-500/25 ${
            isExpanded ? '-left-4' : 'right-2'
          }`}
          title={isExpanded ? 'Ocultar reproductor' : 'Mostrar reproductor'}
        >
          {isExpanded ? (
            <ChevronRightIcon className="w-4 h-4 text-gray-400 hover:text-violet-400 transition-colors" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4 text-gray-400 hover:text-violet-400 transition-colors" />
          )}
        </button>

        {/* Player Controls - Only visible when expanded */}
        {isExpanded && (
          <div className="flex items-center justify-between h-full">
          {/* Song Info */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg ring-2 ring-violet-500/20">
                <img
                  src={getAlbumImage(currentAlbum?.id_album || currentSong?.id_album)}
                  alt="Portada del álbum"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Animated playing indicator */}
              {isPlaying && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-semibold truncate text-base hover:text-violet-300 transition-colors cursor-pointer">
                {currentSong.nombre_cancion}
              </h4>
              <p className="text-gray-400 text-sm truncate hover:text-gray-300 transition-colors cursor-pointer">
                {getArtistName(currentSong)}
              </p>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex flex-col items-center space-y-3 flex-1 max-w-md">
            {/* Playback Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={previousSong}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-violet-400  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-110"
                disabled={!hasPreviousSong}
              >
                <BackwardIcon className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlayPause}
                disabled={isLoading}
                className="w-11 h-11 mt-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-full flex items-center justify-center hover:scale-105 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-lg hover:shadow-violet-500/25"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6 ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-violet-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-110"
                disabled={!hasNextSong}
              >
                <ForwardIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-3 w-full mb-1">
              <span className="text-sm text-gray-400 font-medium min-w-[40px] text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleProgressChange}
                  className="w-full h-2 bg-gray-700/50 rounded-full appearance-none cursor-pointer slider-thumb-purple hover:bg-gray-600/50 transition-colors"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / (duration || 100)) * 100}%, #374151 ${(currentTime / (duration || 100)) * 100}%, #374151 100%)`
                  }}
                />

              </div>
              <span className="text-sm text-gray-400 font-medium min-w-[40px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            {/* Shuffle */}
            <button
              onClick={() => setShuffle(!isShuffling)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer hover:scale-110 ${
                isShuffling
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-gray-400 hover:text-violet-400'
              }`}
              title={isShuffling ? 'Desactivar reproducción aleatoria' : 'Activar reproducción aleatoria'}
            >
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </button>

            {/* Playback Mode */}
            <button
              onClick={togglePlaybackMode}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-violet-400 transition-all duration-200 cursor-pointer hover:scale-110"
              title={`Modo: ${playbackMode === 'ordered' ? 'Ordenado' : playbackMode === 'loop-all' ? 'Repetir todo' : playbackMode === 'loop-one' ? 'Repetir una' : 'Aleatorio'}`}
            >
              {getPlaybackModeIcon()}
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-violet-400 transition-all duration-200 cursor-pointer hover:scale-110"
              >
                {volume === 0 ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </button>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-2 bg-gray-700/50 rounded-full appearance-none cursor-pointer slider-thumb-purple hover:bg-gray-600/50 transition-colors"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                  }}
                />
              </div>
            </div>

            {/* Queue */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-violet-400 transition-all duration-200 cursor-pointer hover:scale-110"
              title="Ver cola de reproducción"
            >
              <QueueListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        )}

      </div>

     {/* Queue Modal */}
     {showQueue && (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end animate-in fade-in duration-300">
         <div className="bg-gradient-to-br from-[#232323]/98 to-[#1a1a1a]/98 w-full max-h-[75vh] rounded-t-3xl border-t border-[#333]/60 shadow-2xl overflow-hidden">
           <div className="p-8">
             <div className="flex items-center justify-between mb-6">
               <div>
                 <h3 className="text-white text-2xl font-bold mb-1">
                   Cola de reproducción
                 </h3>
                 <p className="text-gray-400 text-sm">
                   {playlist.length} {playlist.length === 1 ? 'canción' : 'canciones'}
                 </p>
               </div>
               <button
                 onClick={() => setShowQueue(false)}
                 className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 cursor-pointer"
               >
                 <XMarkIcon className="w-6 h-6" />
               </button>
             </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {playlist.map((song, index) => (
                <div
                  key={`${song.id_cancion}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex items-center space-x-4 p-4 rounded-xl cursor-move hover:bg-gradient-to-r hover:from-violet-500/5 hover:to-purple-500/5 transition-all duration-200 group ${
                    song.id_cancion === currentSong.id_cancion ? 'bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-l-4 border-violet-500' : ''
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="flex flex-col space-y-1 text-gray-500 group-hover:text-violet-400 transition-colors">
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                  </div>

                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg ring-1 ring-white/10">
                    <img
                      src={getAlbumImage(song.id_album)}
                      alt="Portada del álbum"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-base font-medium truncate group-hover:text-violet-300 transition-colors">
                      {song.nombre_cancion}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      {getArtistName(song)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromPlaylist(index)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Eliminar de la cola"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
           </div>
         </div>
       </div>
     )}

    </>
  );
};