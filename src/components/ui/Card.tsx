import React from "react";

interface Benefit {
  id_beneficio: number;
  descripcion_beneficio: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

interface StudyMethod {
  id_metodo: number;
  nombre_metodo: string;
  descripcion: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  beneficios: Benefit[];
  url_imagen?: string;
  color_hexa?: string;
}

interface CardProps {
  method: StudyMethod;
  onViewStepByStep: (method: StudyMethod) => void;
  onAddToSession: (method: StudyMethod) => void;
}

// Componente Card para mostrar métodos de estudio
export const Card: React.FC<CardProps> = ({ method, onViewStepByStep, onAddToSession }) => {
  // Aplicar color dinámico del método o usar azul por defecto
  const methodColor = method.color_hexa || '#0690cf';

  return (
    <div
      className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333]/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl"
      style={{
        '--method-color': methodColor,
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${methodColor}20`,
      } as React.CSSProperties}
      // Efectos hover para mejorar la interactividad
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${methodColor}40, 0 0 20px ${methodColor}10`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${methodColor}20`;
      }}
    >
      {/* Header with image and title */}
      <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-3">
        <div className="w-10 h-10 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
          {method.url_imagen ? (
            <img
              src={method.url_imagen}
              alt={`Imagen de ${method.nombre_metodo}`}
              className="w-full h-full object-cover"
              // Fallback a letra inicial si la imagen falla
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-white font-bold text-lg">${method.nombre_metodo.charAt(0).toUpperCase()}</span>`;
                  parent.style.background = `linear-gradient(135deg, ${methodColor}, ${methodColor}dd)`;
                  parent.classList.add('flex', 'items-center', 'justify-center');
                }
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
              style={{ background: `linear-gradient(135deg, ${methodColor}, ${methodColor}dd)` }}
            >
              {method.nombre_metodo.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h2
          className="text-xl font-semibold text-white bg-clip-text"
          style={{
            background: `linear-gradient(90deg, ${methodColor}, ${methodColor}dd)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {method.nombre_metodo}
        </h2>
      </div>

      {/* Description */}
      <div className="mb-4 border-b border-gray-700 pb-3">
        <p className="text-gray-200 text-base leading-relaxed">{method.descripcion}</p>
      </div>

      {/* Benefits */}
      <div className="mb-6 flex-1">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Beneficios</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
          {Array.isArray(method.beneficios) && method.beneficios.length > 0 ? (
            method.beneficios.map((benefit) => (
              <li key={benefit.id_beneficio} className="leading-relaxed">
                {benefit.descripcion_beneficio || 'Beneficio no disponible'}
              </li>
            ))
          ) : (
            <li className="leading-relaxed text-gray-500">No hay beneficios disponibles</li>
          )}
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => onViewStepByStep(method)}
          className="flex-1 px-4 py-2.5 text-white rounded-lg font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          style={{
            backgroundColor: methodColor,
            boxShadow: `0 10px 15px -3px ${methodColor}30, 0 4px 6px -2px ${methodColor}20`,
          }}
          // Efectos hover para el botón principal
          onMouseEnter={(e) => {
            const darkerColor = methodColor.replace('#', '');
            const r = parseInt(darkerColor.substr(0, 2), 16);
            const g = parseInt(darkerColor.substr(2, 2), 16);
            const b = parseInt(darkerColor.substr(4, 2), 16);
            const darker = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`;
            e.currentTarget.style.backgroundColor = darker;
            e.currentTarget.style.boxShadow = `0 20px 25px -5px ${methodColor}40, 0 10px 10px -5px ${methodColor}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = methodColor;
            e.currentTarget.style.boxShadow = `0 10px 15px -3px ${methodColor}30, 0 4px 6px -2px ${methodColor}20`;
          }}
        >
          Ver paso a paso
        </button>
        <button
          onClick={() => onAddToSession(method)}
          className="flex-1 px-4 py-2.5 bg-gray-700 text-gray-100 rounded-lg font-semibold hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Añadir a sesión
        </button>
      </div>
    </div>
  );
};

export default Card; 