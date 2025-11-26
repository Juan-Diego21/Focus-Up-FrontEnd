/**
 * Componente de superposición de cuenta regresiva para iniciar sesiones
 *
 * Muestra una cuenta regresiva de 5 a 0 antes de iniciar una sesión de concentración.
 * Incluye accesibilidad completa con aria-live para lectores de pantalla y
 * posibilidad de cancelar la cuenta regresiva.
 *
 * Diseño: Pantalla completa con fondo borroso, centrado y animaciones suaves.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CountdownOverlayProps {
  /** Indica si el overlay está visible */
  isVisible: boolean;
  /** Callback cuando la cuenta regresiva llega a 0 */
  onCountdownComplete: () => void;
  /** Callback cuando el usuario cancela la cuenta regresiva */
  onCancel: () => void;
  /** Título opcional para mostrar durante la cuenta regresiva */
  title?: string;
}

/**
 * Componente CountdownOverlay
 *
 * Maneja la lógica de cuenta regresiva y accesibilidad para iniciar sesiones.
 */
export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  isVisible,
  onCountdownComplete,
  onCancel,
  title = 'Preparándote para la concentración'
}) => {
  const [count, setCount] = useState(5);
  const [isCounting, setIsCounting] = useState(false);

  /**
   * Inicia la cuenta regresiva cuando el overlay se vuelve visible
   */
  useEffect(() => {
    if (isVisible && !isCounting) {
      setCount(5);
      setIsCounting(true);
    } else if (!isVisible) {
      setIsCounting(false);
    }
  }, [isVisible, isCounting]);

  /**
   * Maneja el temporizador de cuenta regresiva
   */
  useEffect(() => {
    if (!isCounting || count <= 0) return;

    const timer = setTimeout(() => {
      if (count === 1) {
        // Cuenta regresiva completada
        setIsCounting(false);
        onCountdownComplete();
      } else {
        setCount(count - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, isCounting, onCountdownComplete]);

  /**
   * Maneja la cancelación de la cuenta regresiva
   */
  const handleCancel = useCallback(() => {
    setIsCounting(false);
    onCancel();
  }, [onCancel]);

  /**
   * Maneja la tecla Escape para cancelar
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleCancel]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="countdown-title"
          aria-describedby="countdown-description"
        >
          {/* Contenedor principal centrado */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative max-w-md mx-auto p-8 text-center"
          >
            {/* Botón de cancelar */}
            <button
              onClick={handleCancel}
              className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Cancelar cuenta regresiva y volver"
              type="button"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Título */}
            <h1
              id="countdown-title"
              className="text-2xl font-bold text-white mb-8"
            >
              {title}
            </h1>

            {/* Número de cuenta regresiva */}
            <motion.div
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mb-8"
            >
              <div
                className="text-8xl font-bold text-white mb-4 select-none"
                aria-live="polite"
                aria-atomic="true"
                role="timer"
                aria-label={`Cuenta regresiva: ${count} segundos restantes`}
              >
                {count}
              </div>

              {/* Indicador visual de progreso */}
              <div className="w-32 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 1, ease: 'linear' }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </motion.div>

            {/* Descripción accesible */}
            <div
              id="countdown-description"
              className="text-gray-300 text-sm"
            >
              La sesión comenzará automáticamente cuando llegue a cero.
              Presiona Escape o el botón X para cancelar.
            </div>

            {/* Instrucciones de teclado */}
            <div className="mt-6 text-xs text-gray-400">
              Presiona <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Esc</kbd> para cancelar
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CountdownOverlay;