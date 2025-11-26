import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/ui/Sidebar';
import { MusicPlayer } from '../components/ui/MusicPlayer';
import { getAlbums } from '../utils/musicApi';
import type { Album } from '../types/api';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';

export const MusicAlbumsPage: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getAlbums();
        setAlbums(data);
      } catch (err) {
        console.error('Error fetching albums:', err);
        setError('Error al cargar los álbumes');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  const handleAlbumClick = (album: Album) => {
    navigate(`/music/albums/${album.id_album}`);
  };

  const getAlbumImage = (albumGenre: string | undefined) => {
    if (!albumGenre) return '/img/fondo-album.png'; // fallback for undefined/null

    // Map album genres to specific images as requested
    switch (albumGenre.toLowerCase().trim()) {
      case 'lofi':
        return '/img/Album_Lofi.png';
      case 'naturaleza':
        return '/img/Album_Naturaleza.png';
      case 'relajante':
        return '/img/Album_Instrumental.png';
      default:
        console.warn(`Unknown album genre: ${albumGenre}`);
        return '/img/fondo-album.png'; // fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717]">
        <Sidebar currentPage="music" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Cargando álbumes...</p>
          </div>
        </div>
        <MusicPlayer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717]">
        <Sidebar currentPage="music" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-semibold mb-4">Error al cargar datos</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717]">
      <Sidebar currentPage="music" />

      {/* Header */}
      <div className="text-center mx-8 px-4 pt-8">
        <h1 className="text-3xl font-bold text-white mb-2">Álbumes de Música</h1>
        <p className="text-gray-400">Explora nuestra colección de álbumes para potenciar tu concentración</p>
      </div>

      {/* Main content */}
        <div className="flex justify-center min-h-screen py-8">
          <main className="w-full max-w-7xl px-6 transition-all ml-64">

        {/* Albums Grid */}
        {albums.length === 0 ? (
          <div className="text-center py-12">
            <MusicalNoteIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay álbumes disponibles</h3>
            <p className="text-gray-500">Vuelve más tarde para explorar nueva música</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-auto">
            {albums.map((album) => (
              <div
                key={album.id_album}
                className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col hover:shadow-violet-500/10 hover:border-violet-500/30 border border-[#333]/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
              >
                {/* Album Cover */}
                <div className="w-full aspect-square rounded-lg mb-4 overflow-hidden">
                  <img
                    src={getAlbumImage(album.genero)}
                    alt={`${album.nombre_album} cover`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Album Info */}
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                    {album.nombre_album}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Género: {album.genero}
                  </p>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {album.descripcion}
                  </p>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => handleAlbumClick(album)}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-sm font-semibold rounded-lg hover:from-violet-700 hover:to-violet-800 transition-all shadow-lg hover:shadow-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 cursor-pointer"
                >
                  Ver canciones
                </button>
              </div>
            ))}
          </div>
        )}
        </main>
      </div>
    </div>
  );
};