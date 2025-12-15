// Modal para selección de método de estudio
// Muestra tarjetas de métodos disponibles usando datos locales de methodAssets.ts
// Permite selección visual con indicadores de estado y navegación por teclado
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { LOCAL_METHOD_ASSETS } from '../../../utils/methodAssets';

interface MethodData {
  id_metodo: number;
  nombre_metodo: string;
  descripcion?: string;
  color: string;
  image: string;
}

interface MethodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: MethodData) => void;
  selectedMethod?: MethodData | null;
}

/**
 * Convierte los activos locales de métodos en datos estructurados para el modal
 * Usa methodAssets.ts como fuente canónica de colores e imágenes
 */
const getAvailableMethods = (): MethodData[] => {
  return Object.entries(LOCAL_METHOD_ASSETS).map(([name, assets], index) => ({
    id_metodo: index + 1,
    nombre_metodo: name,
    descripcion: getMethodDescription(name),
    color: assets.color,
    image: assets.image
  }));
};

/**
 * Proporciona descripciones locales para métodos cuando no están disponibles en la API
 */
const getMethodDescription = (methodName: string): string => {
  const descriptions: Record<string, string> = {
    'Método Pomodoro': 'Técnica de gestión de tiempo con intervalos de trabajo y descanso',
    'Mapas Mentales': 'Organización visual de ideas y conceptos',
    'Repaso Espaciado': 'Técnica de memorización con intervalos crecientes',
    'Práctica Activa': 'Aprendizaje mediante aplicación práctica de conocimientos',
    'Método Feynman': 'Explicación de conceptos en términos simples',
    'Método Cornell': 'Sistema de toma de notas estructurado'
  };
  return descriptions[methodName] || 'Método de estudio avanzado';
};

export const MethodSelectionModal: React.FC<MethodSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedMethod
}) => {
  const [methods] = useState<MethodData[]>(getAvailableMethods());
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Resetear selección al abrir modal
  useEffect(() => {
    if (isOpen) {
      const currentIndex = selectedMethod
        ? methods.findIndex(m => m.id_metodo === selectedMethod.id_metodo)
        : -1;
      setSelectedIndex(currentIndex);
    }
  }, [isOpen, selectedMethod, methods]);

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
          if (selectedIndex >= 0 && selectedIndex < methods.length) {
            onSelect(methods[selectedIndex]);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(methods.length - 1, prev + 1));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, methods, onClose, onSelect]);

  const handleSelect = (method: MethodData) => {
    onSelect(method);
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
            aria-labelledby="method-modal-title"
            aria-describedby="method-modal-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#333]/50">
              <div>
                <h2 id="method-modal-title" className="text-2xl font-bold text-white">
                  Seleccionar Método de Estudio
                </h2>
                <p id="method-modal-description" className="text-gray-400 mt-1">
                  Elige el método que usarás durante tu sesión de concentración
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

            {/* Contenido - Grid de métodos */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {methods.map((method, index) => {
                  const isSelected = selectedMethod?.id_metodo === method.id_metodo;
                  const isFocused = selectedIndex === index;

                  return (
                    <motion.button
                      key={method.id_metodo}
                      onClick={() => handleSelect(method)}
                      className={`
                        group relative p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer
                        ${isSelected
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-[#333]/50 bg-[#1a1a1a]/50 hover:border-[#444]/70 hover:bg-[#1a1a1a]/70'
                        }
                        ${isFocused ? 'ring-2 ring-blue-500/50' : ''}
                      `}
                      style={{
                        '--method-color': method.color,
                      } as React.CSSProperties}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onFocus={() => setSelectedIndex(index)}
                      aria-pressed={isSelected}
                      aria-describedby={`method-${method.id_metodo}-description`}
                    >
                      {/* Indicador de selección */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* Imagen del método */}
                      <div className="flex items-center justify-center mb-3">
                        <div className="relative">
                          <img
                            src={method.image}
                            alt={method.nombre_metodo}
                            className="w-16 h-16 object-contain rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.fallback-icon')) {
                                const icon = document.createElement('div');
                                icon.className = 'fallback-icon w-16 h-16 rounded-lg bg-gray-600 flex items-center justify-center';
                                icon.innerHTML = '📚';
                                parent.appendChild(icon);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Información del método */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: method.color }}
                          />
                          <h3 className="font-semibold text-white text-sm">
                            {method.nombre_metodo}
                          </h3>
                        </div>
                        <p
                          id={`method-${method.id_metodo}-description`}
                          className="text-xs text-gray-400 leading-relaxed"
                        >
                          {method.descripcion}
                        </p>
                      </div>

                      {/* Efecto hover */}
                      <div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                        style={{ backgroundColor: method.color }}
                      />
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
                Usa las flechas ↑↓ para navegar, Enter para seleccionar, Escape para cerrar
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};