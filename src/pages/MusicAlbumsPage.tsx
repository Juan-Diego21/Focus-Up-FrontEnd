import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/ui/Sidebar';
import { MusicPlayer } from '../components/ui/MusicPlayer';
import { getAlbums } from '../utils/musicApi';
import { getAlbumImage } from '../utils/musicUtils';
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <Sidebar currentPage="music" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-12 h-12 border-4 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Cargando álbumes...</h2>
            <p className="text-gray-400">Preparando tu colección musical</p>
          </div>
        </div>
        <MusicPlayer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
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
            <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <Sidebar currentPage="music" />

      {/* Header */}
      <div className="relative z-10 text-center mx-8 px-4 pt-12 pb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">
          Álbumes de Música
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Explora nuestra colección curada de álbumes diseñados para potenciar tu concentración y productividad
        </p>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex justify-center min-h-screen pb-32">
        <main className="w-full max-w-7xl px-6 transition-all ml-64">

          {/* Albums Grid */}
          {albums.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                  <MusicalNoteIcon className="w-12 h-12 text-gray-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🎵</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-3">No hay álbumes disponibles</h3>
              <p className="text-gray-500 text-lg mb-8">Estamos trabajando para traerte nueva música</p>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {albums.map((album, index) => (
                <div
                  key={album.id_album}
                  className="group relative"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  {/* Card glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#333]/50 overflow-hidden hover:border-violet-500/50 transition-all duration-500 hover:transform hover:scale-[1.02] cursor-pointer group/card">
                    {/* Album Cover with overlay */}
                    <div className="relative w-full aspect-square overflow-hidden">
                      <img
                        src={getAlbumImage(album.id_album)}
                        alt={`${album.nombre_album} cover`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

                    </div>

                    {/* Album Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-bold text-xl leading-tight line-clamp-2 group-hover/card:text-violet-300 transition-colors duration-300">
                          {album.nombre_album}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-500/10 text-violet-300 text-xs font-medium rounded-full border border-violet-500/20">
                          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
                          {album.genero}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                        {album.descripcion}
                      </p>

                      {/* Action button */}
                      <button
                        onClick={() => handleAlbumClick(album)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-violet-800 transition-all duration-300 shadow-lg hover:shadow-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] cursor-pointer group/button"
                      >
                        <span>Ver canciones</span>
                        <svg className="w-4 h-4 transition-transform duration-200 group-hover/button:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};