import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../../../shared/components/ui/Sidebar';
import { MusicPlayer } from '../../../components/ui/MusicPlayer';
import { getSongsByAlbumId, getAlbumById } from '../../../utils/musicApi';
import { useMusicPlayer } from '../../../contexts/MusicPlayerContext';
import { getAlbumImage, formatDuration, getArtistName, preloadSongDurations } from '../../../utils/musicUtils';
import type { Song, Album } from '../../../types/api';
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
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-32 right-16 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 left-16 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"></div>
        </div>

        <Sidebar currentPage="music" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-12 h-12 border-4 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Cargando canciones...</h2>
            <p className="text-gray-400">Preparando tu experiencia musical</p>
          </div>
        </div>
        <MusicPlayer />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-32 right-16 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 left-16 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"></div>
        </div>

        <Sidebar currentPage="music" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto border border-red-500/30 shadow-2xl">
                <span className="text-4xl">⚠️</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs">!</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Error al cargar datos</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">{error || 'Álbum no encontrado'}</p>
            <button
              onClick={() => navigate('/music/albums')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a álbumes
            </button>
          </div>
        </div>
        <MusicPlayer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 right-16 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-16 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"></div>
      </div>

      <Sidebar currentPage="music" />

      {/* Main content */}
      <div className="relative z-10 flex justify-center items-center min-h-screen py-8">
        <main className="w-full max-w-6xl px-6 transition-all">

          {/* Back button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/music/albums')}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer group"
            >
              <svg className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Volver a álbumes</span>
            </button>
          </div>

          {/* Album Header */}
          <div className="relative mb-12">
            {/* Header glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-2xl opacity-50"></div>

            <div className="relative bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#333]/50 overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* Album Cover */}
                  <div className="relative flex-shrink-0">
                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-violet-500/20">
                      <img
                        src={getAlbumImage(albumIdNum)}
                        alt={`${album.nombre_album} cover`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <MusicalNoteIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Album Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-300 text-sm font-medium rounded-full border border-violet-500/20 mb-4">
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></span>
                      Álbum
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-3">
                      {album.nombre_album}
                    </h1>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-500/10 text-gray-300 text-sm rounded-full border border-gray-500/20">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {album.genero}
                      </span>
                      <span className="text-gray-400 text-lg">
                        {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
                      </span>
                    </div>

                    <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl">
                      {album.descripcion}
                    </p>

                    <button
                      onClick={handlePlayAlbum}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-lg font-semibold rounded-2xl hover:from-violet-700 hover:to-violet-800 transition-all duration-300 shadow-xl hover:shadow-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] cursor-pointer group"
                    >
                      <PlayIcon className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                      <span>Reproducir álbum</span>
                      <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Songs List */}
          <div className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#333]/50 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-[#333]/50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Canciones</h2>
                <div className="text-gray-400 text-sm">
                  {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
                </div>
              </div>
            </div>

            {songs.length === 0 ? (
              <div className="p-16 text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                    <MusicalNoteIcon className="w-10 h-10 text-gray-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🎵</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-300 mb-3">No hay canciones disponibles</h3>
                <p className="text-gray-500 text-lg">Este álbum aún no tiene canciones</p>
              </div>
            ) : (
              <div className="divide-y divide-[#333]/30">
                {songs.map((song, index) => (
                  <div
                    key={song.id_cancion}
                    className="group relative hover:bg-gradient-to-r hover:from-violet-500/5 hover:to-purple-500/5 transition-all duration-300"
                  >
                    {/* Song item */}
                    <div className="flex items-center gap-6 p-6">
                      {/* Track number / Play button */}
                      <div className="flex-shrink-0 w-12 flex items-center justify-center">
                        <div className="relative">
                          <span className="text-gray-500 text-sm font-medium group-hover:hidden">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <button
                            onClick={() => handlePlaySong(song)}
                            className={`w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-violet-600 hover:scale-110 shadow-lg hover:shadow-violet-500/25 ${
                              isScrolling ? 'transition-none' : ''
                            }`}
                          >
                            <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                          </button>
                        </div>
                      </div>

                      {/* Album Image */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg ring-2 ring-white/10 group-hover:ring-violet-500/30 transition-all duration-300">
                          <img
                            src={getAlbumImage(albumIdNum)}
                            alt={`${album.nombre_album} cover`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate group-hover:text-violet-300 transition-colors duration-300">
                          {song.nombre_cancion}
                        </h3>
                        <p className="text-gray-400 text-sm truncate mt-1">
                          {getArtistName(song)}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="flex-shrink-0 text-right">
                        <span className="text-gray-400 text-sm font-medium px-3 py-1 bg-white/5 rounded-full">
                          {formatDuration(song, songDurations[song.id_cancion])}
                        </span>
                      </div>
                    </div>

                    {/* Hover effect line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
