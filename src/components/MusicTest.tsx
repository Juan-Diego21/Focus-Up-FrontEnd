import React from 'react';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

export const MusicTest: React.FC = () => {
  const { playSong, togglePlayPause, isPlaying, currentSong } = useMusicPlayer();

  // Create test songs with URLs
  const testSongs = [
    {
      id_cancion: 1,
      nombre_cancion: 'Test Audio 1',
      artista: 'Test Artist',
      url_musica: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      duracion: 180,
      categoria: 'Test',
      id_album: 1
    },
    {
      id_cancion: 2,
      nombre_cancion: 'Test Audio 2',
      artista: 'Test Artist',
      url_musica: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav',
      duracion: 180,
      categoria: 'Test',
      id_album: 1
    },
    {
      id_cancion: 3,
      nombre_cancion: 'Test Audio 3',
      artista: 'Test Artist',
      url_musica: 'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav',
      duracion: 180,
      categoria: 'Test',
      id_album: 1
    },
  ];

  const handlePlaySong = (song: any) => {
    playSong(song);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Global Music Player Test</h2>

      <div className="space-y-3">
        <div className="text-sm text-gray-600">
          <strong>Status:</strong> {isPlaying ? 'Playing' : 'Paused'}
        </div>

        {currentSong && (
          <div className="text-sm text-gray-600">
            <strong>Current Song:</strong> {currentSong.nombre_cancion}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-medium">Test Songs:</h3>
          {testSongs.map((song, index) => (
            <button
              key={index}
              onClick={() => handlePlaySong(song)}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Play {song.nombre_cancion}
            </button>
          ))}
        </div>

        <button
          onClick={togglePlayPause}
          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          disabled={!currentSong}
        >
          {isPlaying ? 'Pause' : 'Resume'}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>The floating music player should appear in the bottom-right corner when audio is playing.</p>
        <p>Navigate between pages - the music should continue playing!</p>
      </div>
    </div>
  );
};