import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/ui/Sidebar';
import { MusicPlayer } from '../components/ui/MusicPlayer';
import { getSongsByAlbumId, getAlbumById } from '../utils/musicApi';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { getAlbumImage, formatDuration, getArtistName, preloadSongDurations } from '../utils/musicUtils';
import type { Song, Album } from '../types/api';
import { PlayIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

export const MusicSongsPage: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [songDurations, setSongDurations] = useState<Record<number, number>>({});
  const [isScrolling, setIsScrolling] = useState(false);
  const { playSong, playPlaylist } = useMusicPlayer();
  const navigate = useNavigate();

  // Get album ID from URL params
  const { albumId } = useParams<{ albumId: string }>();
  const albumIdNum = parseInt(albumId || '0');

  // Manejar eventos de scroll para evitar flickering de botones
  useEffect(() => {
    let scrollTimer: number;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch album details and songs concurrently
        const [albumData, albumSongs] = await Promise.all([
          getAlbumById(albumIdNum),
          getSongsByAlbumId(albumIdNum)
        ]);

        setAlbum(albumData);

        // Sort songs by ID ascending (consider moving to backend)
        const sortedSongs = albumSongs.sort((a, b) => a.id_cancion - b.id_cancion);
        setSongs(sortedSongs);

        // Preload song durations concurrently
        const durations = await preloadSongDurations(albumSongs);
        setSongDurations(durations);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar las canciones');
      } finally {
        setLoading(false);
      }
    };

    if (albumIdNum > 0) {
      fetchData();
    }
  }, [albumIdNum]);

  const handlePlaySong = (song: Song) => {
    // Find the index of the clicked song in the album
    const songIndex = songs.findIndex(s => s.id_cancion === song.id_cancion);
    if (songIndex >= 0 && album) {
      playPlaylist(songs, songIndex, { id_album: album.id_album, nombre_album: album.nombre_album });
    } else {
      playSong(song);
    }
  };

  const handlePlayAlbum = () => {
    if (songs.length > 0 && album) {
      playPlaylist(songs, 0, { id_album: album.id_album, nombre_album: album.nombre_album });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717]">
        <Sidebar currentPage="music" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Cargando canciones...</p>
          </div>
        </div>
        <MusicPlayer />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717]">
        <Sidebar currentPage="music" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-semibold mb-4">Error al cargar datos</h2>
            <p className="text-gray-400 mb-6">{error || 'Álbum no encontrado'}</p>
            <button
              onClick={() => navigate('/music/albums')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 cursor-pointer"
            >
              Volver a álbumes
            </button>
          </div>
        </div>
        <MusicPlayer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717]">
      <Sidebar currentPage="music" />

      {/* Main content */}
      <div className="flex justify-center items-center min-h-screen py-4">
        <main className="w-full max-w-6xl px-4 transition-all">
        {/* Back button */}
        <div className="text-center mb-6">
          <button
            onClick={() => navigate('/music/albums')}
            className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white transition-colors mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a álbumes
          </button>
        </div>

        {/* Album Header */}
        <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-xl shadow-2xl p-8 mb-8">
          <div className="flex items-center gap-8">
            {/* Album Cover */}
            <div className="w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={getAlbumImage(albumIdNum)}
                alt={`${album.nombre_album} cover`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Album Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{album.nombre_album}</h1>
              <p className="text-gray-400 text-lg mb-4">Género: {album.genero}</p>
              <p className="text-gray-300 mb-6 max-w-2xl">{album.descripcion}</p>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-gray-400">{songs.length} canciones</span>
              </div>

              <button
                onClick={handlePlayAlbum}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-lg font-semibold rounded-xl hover:from-violet-700 hover:to-violet-800 transition-all shadow-lg hover:shadow-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 flex items-center gap-3 cursor-pointer"
              >
                <PlayIcon className="w-6 h-6" />
                Reproducir álbum
              </button>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[#333]">
            <h2 className="text-xl font-semibold text-white">Canciones</h2>
          </div>

          {songs.length === 0 ? (
            <div className="p-12 text-center">
              <MusicalNoteIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay canciones en este álbum</h3>
              <p className="text-gray-500">Este álbum aún no tiene canciones disponibles</p>
            </div>
          ) : (
            <div className="divide-y divide-[#333]">
              {songs.map((song) => (
                <div
                  key={song.id_cancion}
                  className="flex items-center gap-4 p-4 hover:bg-[#2a2a2a] transition-colors group"
                >
                  {/* Fixed Play Button */}
                  <button
                    onClick={() => handlePlaySong(song)}
                    className={`w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 ${
                      isScrolling ? 'transition-none' : 'hover:bg-violet-600 transition-colors'
                    }`}
                  >
                    <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                  </button>

                  {/* Album Image */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getAlbumImage(albumIdNum)}
                      alt={`${album.nombre_album} cover`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{song.nombre_cancion}</h3>
                  </div>

                  {/* Artist */}
                  <div className="text-gray-400 text-sm w-35 text-right truncate">
                    {getArtistName(song)}
                  </div>

                  {/* Duration */}
                  <div className="text-gray-400 text-sm w-16 text-right">
                    {formatDuration(song, songDurations[song.id_cancion])}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};