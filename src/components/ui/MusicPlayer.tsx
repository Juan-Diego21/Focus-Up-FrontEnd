import React, { useState } from 'react';
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
  MusicalNoteIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useMusicPlayer, type PlaybackMode } from '../../contexts/MusicPlayerContext';

// Función auxiliar para obtener imagen del álbum
const getAlbumImage = (albumName: string) => {
  const name = albumName.toLowerCase();
  if (name.includes('lofi') || name.includes('lorem')) {
    return '/img/Album_Lofi.png';
  }
  if (name.includes('relaxing') || name.includes('instrumental') || name.includes('relajante')) {
    return '/img/Album_Instrumental.png';
  }
  if (name.includes('nature') || name.includes('naturaleza')) {
    return '/img/Album_Naturaleza.png';
  }
  return '/img/fondo-album.png'; // imagen de respaldo
};

// Función auxiliar para obtener el nombre del artista
const getArtistName = (song: any): string => {
  return song.artista || song.artist_song || 'Artista desconocido';
};

export const MusicPlayer: React.FC = () => {
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
  } = useMusicPlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Si no hay canción actual, no mostrar el reproductor
  if (!currentSong) {
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
        className={`fixed bottom-0 z-40 transition-transform duration-300 ${
          isExpanded
            ? 'left-1/2 transform -translate-x-1/2 w-11/12 max-w-4xl h-20 bg-[#232323]/95 backdrop-blur-md border border-[#333] rounded-2xl p-5'
            : 'right-0 w-20 h-20'
        }`}
      >
        {/* Toggle Button - Positioned on left edge when expanded, right edge when collapsed */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`absolute top-1/2 transform -translate-y-1/2 z-50 bg-[#232323] rounded-full p-1 border border-[#333] hover:bg-[#2a2a2a] transition-colors cursor-pointer shadow-lg ${
            isExpanded ? '-left-3' : 'right-1'
          }`}
          title={isExpanded ? 'Ocultar reproductor' : 'Mostrar reproductor'}
        >
          {isExpanded ? (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Player Controls - Only visible when expanded */}
        {isExpanded && (
          <div className="flex items-center justify-between h-full">
          {/* Song Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={currentAlbum ? getAlbumImage(currentAlbum.nombre_album) : '/img/fondo-album.png'}
                alt="Portada del álbum"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/img/fondo-album.png';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-medium truncate text-sm">
                {currentSong.nombre_cancion}
              </h4>
              <p className="text-gray-400 text-xs truncate">
                {getArtistName(currentSong)}
              </p>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
            {/* Playback Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={previousSong}
                className="text-gray-400 hover:text-violet-400 hover:scale-110 transition-all duration-200 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-5"
                disabled={playlist.length <= 1}
              >
                <BackwardIcon className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                disabled={isLoading}
                className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer mt-5" 
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="text-gray-400 hover:text-violet-400 hover:scale-110 transition-all duration-200 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-5"
                disabled={playlist.length <= 1}
              >
                <ForwardIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-2 w-full mb-4">
              <span className="text-xs text-gray-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="flex-1 h-2 bg-purple-900/50 rounded-full appearance-none cursor-pointer slider-thumb-purple"
                style={{
                  background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${(currentTime / (duration || 100)) * 100}%, #581c87 ${(currentTime / (duration || 100)) * 100}%, #581c87 100%)`
                }}
              />
              <span className="text-xs text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3 flex-1 justify-end">
            {/* Shuffle */}
            <button
              onClick={() => setShuffle(!isShuffling)}
              className={`hover:scale-110 transition-all duration-200 p-1 rounded cursor-pointer ${
                isShuffling
                  ? 'text-violet-400 hover:text-violet-300'
                  : 'text-gray-400 hover:text-violet-400'
              }`}
              title={isShuffling ? 'Desactivar reproducción aleatoria' : 'Activar reproducción aleatoria'}
            >
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </button>

            {/* Playback Mode */}
            <button
              onClick={togglePlaybackMode}
              className="text-gray-400 hover:text-violet-400 hover:scale-110 transition-all duration-200 p-1 rounded cursor-pointer"
              title={`Modo: ${playbackMode === 'ordered' ? 'Ordenado' : playbackMode === 'loop-all' ? 'Repetir todo' : playbackMode === 'loop-one' ? 'Repetir una' : 'Aleatorio'}`}
            >
              {getPlaybackModeIcon()}
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                className="text-gray-400 hover:text-violet-400 hover:scale-110 transition-all duration-200 p-1 rounded cursor-pointer"
              >
                {volume === 0 ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-purple-900/50 rounded-full appearance-none cursor-pointer slider-thumb-purple"
                style={{
                  background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${volume * 100}%, #581c87 ${volume * 100}%, #581c87 100%)`
                }}
              />
            </div>

            {/* Queue */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="text-gray-400 hover:text-violet-400 hover:scale-110 transition-all duration-200 p-1 rounded cursor-pointer"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-[#232323] w-full max-h-[70vh] rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">
                Cola de reproducción ({playlist.length})
              </h3>
              <button
                onClick={() => setShowQueue(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {playlist.map((song, index) => (
                <div
                  key={`${song.id_cancion}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-move hover:bg-[#2a2a2a] transition-colors group ${
                    song.id_cancion === currentSong.id_cancion ? 'bg-[#2a2a2a] border-l-4 border-cyan-500' : ''
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="flex flex-col space-y-1 text-gray-500 group-hover:text-gray-300 transition-colors">
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                  </div>

                  <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={currentAlbum && song.id_album === currentAlbum.id_album
                        ? getAlbumImage(currentAlbum.nombre_album)
                        : '/img/fondo-album.png'}
                      alt="Portada del álbum"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/img/fondo-album.png';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {song.nombre_cancion}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {song.artista}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromPlaylist(index)}
                    className="text-gray-400 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Eliminar de la cola"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </>
  );
};