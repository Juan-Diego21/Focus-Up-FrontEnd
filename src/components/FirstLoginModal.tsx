import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Componente modal que se muestra después del primer inicio de sesión exitoso
// Ofrece al usuario completar la encuesta de perfil con fondo borroso
interface FirstLoginModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const FirstLoginModal: React.FC<FirstLoginModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
}) => {
  // No renderizar si no está abierto
  if (!isOpen) return null;

  // Manejar tecla Escape para cerrar
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDecline();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onDecline]);

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-[#232323] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#333] relative">
        {/* Botón de cerrar */}
        <button
          onClick={onDecline}
          className="absolute top-4 right-4 p-1 hover:bg-[#333] rounded-full transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <XMarkIcon className="w-6 h-6 text-gray-400" />
        </button>

        {/* Logo */}
        <img
          src="/img/Logo.png"
          alt="Logo de Focus Up"
          className="w-48 mx-auto mb-6"
        />

        {/* Contenido */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">
            ¡Bienvenido a Focus Up!
          </h2>
          <p className="text-gray-300 mb-6 text-lg leading-relaxed">
            Para ofrecerte una mejor experiencia, nos gustaría conocerte un poco más.
            ¿Te gustaría completar tu perfil con información adicional?
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onAccept}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              De acuerdo
            </button>
            <button
              onClick={onDecline}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              No, gracias
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginModal;