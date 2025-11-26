/**
 * Componente de botón atrás consistente usado en todas las páginas de la aplicación
 * Implementa navegación consistente y confirmación de descarte de cambios sin guardar
 * Sigue el patrón UX establecido en otras páginas de la aplicación
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
  /**
   * Texto opcional para el botón (por defecto "Atrás")
   */
  text?: string;
  /**
   * Función opcional para confirmar navegación cuando hay cambios sin guardar
   * Si retorna false, la navegación se cancela
   */
  onBeforeNavigate?: () => boolean | Promise<boolean>;
  /**
   * Clases CSS adicionales para personalización
   */
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  text = 'Atrás',
  onBeforeNavigate,
  className = ''
}) => {
  const navigate = useNavigate();

  /**
   * Maneja la navegación hacia atrás con confirmación opcional
   * Implementa el patrón consistente de UX en la aplicación
   */
  const handleBack = async () => {
    // Verificar si hay lógica de confirmación personalizada
    if (onBeforeNavigate) {
      const shouldNavigate = await onBeforeNavigate();
      if (!shouldNavigate) return;
    }

    // Navegar hacia atrás en el historial del navegador
    navigate(-1);
  };

  return (
    <button
      onClick={handleBack}
      className={`
        inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white
        hover:bg-[#333]/50 rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:text-white
        ${className}
      `}
      aria-label={`Volver ${text.toLowerCase()}`}
    >
      <ArrowLeftIcon className="w-5 h-5" />
      <span className="font-medium">{text}</span>
    </button>
  );
};