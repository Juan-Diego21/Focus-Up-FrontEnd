/**
 * Modal para selección de álbum de música
 * Muestra tres tarjetas de álbum fijo usando imágenes locales de public/img
 * Permite selección visual con indicadores de estado y navegación por teclado
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

interface AlbumData {
  id_album: number;
  nombre_album: string;
  descripcion: string;
  image: string;
}

interface AlbumSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (album: AlbumData) => void;
  selectedAlbum?: AlbumData | null;
}

/**
 * Datos fijos de álbumes disponibles
 * Usa imágenes locales de public/img como especificado en los requerimientos
 * Facilita extensión futura para más álbumes manteniendo estructura consistente
 */
const getAvailableAlbums = (): AlbumData[] => {
  return [
    {
      id_album: 1,
      nombre_album: 'Instrumental',
      descripcion: 'Música instrumental relajante para concentración profunda',
      image: '/img/Album_Instrumental.png'
    },
    {
      id_album: 2,
      nombre_album: 'Lofi',
      descripcion: 'Beats suaves y melódicos para mantener el foco',
      image: '/img/Album_Lofi.png'
    },
    {
      id_album: 3,
      nombre_album: 'Naturaleza',
      descripcion: 'Sonidos de la naturaleza para un ambiente tranquilo',
      image: '/img/Album_Naturaleza.png'
    }
  ];
};

export const AlbumSelectionModal: React.FC<AlbumSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedAlbum
}) => {
  const [albums] = useState<AlbumData[]>(getAvailableAlbums());
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Resetear selección al abrir modal
  useEffect(() => {
    if (isOpen) {
      const currentIndex = selectedAlbum
        ? albums.findIndex(a => a.id_album === selectedAlbum.id_album)
        : -1;
      setSelectedIndex(currentIndex);
    }
  }, [isOpen, selectedAlbum, albums]);

  // Manejo de navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < albums.length) {
            onSelect(albums[selectedIndex]);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(albums.length - 1, prev + 1));
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();
          // Para layout de grid, permitir navegación vertical limitada
          const newIndex = e.key === 'ArrowUp'
            ? Math.max(0, selectedIndex - 3)
            : Math.min(albums.length - 1, selectedIndex + 3);
          setSelectedIndex(newIndex);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, albums, onClose, onSelect]);

  const handleSelect = (album: AlbumData) => {
    onSelect(album);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay con backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-1 md:inset-2 lg:inset-4 bg-[#232323] rounded-2xl shadow-2xl z-50 overflow-hidden max-w-4xl mx-auto my-2 md:my-4 lg:my-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="album-modal-title"
            aria-describedby="album-modal-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#333]/50">
              <div>
                <h2 id="album-modal-title" className="text-2xl font-bold text-white">
                  Seleccionar Álbum de Música
                </h2>
                <p id="album-modal-description" className="text-gray-400 mt-1">
                  Elige el álbum que te ayudará a mantener la concentración
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#333]/50 rounded-lg transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido - Grid de álbumes */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {albums.map((album, index) => {
                  const isSelected = selectedAlbum?.id_album === album.id_album;
                  const isFocused = selectedIndex === index;

                  return (
                    <motion.button
                      key={album.id_album}
                      onClick={() => handleSelect(album)}
                      className={`
                        group relative overflow-hidden rounded-xl transition-all duration-200 text-left cursor-pointer
                        ${isSelected
                          ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20'
                          : 'hover:shadow-lg hover:shadow-purple-500/10'
                        }
                        ${isFocused ? 'ring-2 ring-purple-500/50' : ''}
                      `}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onFocus={() => setSelectedIndex(index)}
                      aria-pressed={isSelected}
                      aria-describedby={`album-${album.id_album}-description`}
                    >
                      {/* Portada del álbum */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={album.image}
                          alt={`Portada del álbum ${album.nombre_album}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-album')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'fallback-album w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center';
                              fallback.innerHTML = `
                                <div class="text-center">
                                  <div class="text-4xl mb-2">🎵</div>
                                  <div class="text-white font-semibold">${album.nombre_album}</div>
                                </div>
                              `;
                              parent.appendChild(fallback);
                            }
                          }}
                        />

                        {/* Overlay de selección - ahora cubre toda la tarjeta */}
                        <div className={`
                          absolute inset-0 bg-purple-500/80 flex items-center justify-center transition-opacity duration-200
                          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'}
                        `}>
                          <div className="text-center">
                            {isSelected ? (
                              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                <CheckIcon className="w-8 h-8 text-white" />
                              </div>
                            ) : (
                              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                <MusicalNoteIcon className="w-8 h-8 text-white" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Indicador de selección en esquina */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckIcon className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Información del álbum - ahora también tiene hover effect */}
                      <div className="p-4 bg-[#1a1a1a]/90 backdrop-blur-sm group-hover:bg-[#1a1a1a]/95 transition-colors duration-200">
                        <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-purple-200 transition-colors duration-200">
                          {album.nombre_album}
                        </h3>
                        <p
                          id={`album-${album.id_album}-description`}
                          className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-200"
                        >
                          {album.descripcion}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer con acciones */}
            <div className="flex items-center justify-between p-4 border-t border-[#333]/50">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-400 hover:text-white hover:bg-[#333]/50 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <div className="text-sm text-gray-500">
                Usa las flechas para navegar, Enter para seleccionar, Escape para cerrar
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};