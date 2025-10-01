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
}

interface CardProps {
  method: StudyMethod;
  onViewStepByStep: (method: StudyMethod) => void;
  onAddToSession: (method: StudyMethod) => void;
}

export const Card: React.FC<CardProps> = ({ method, onViewStepByStep, onAddToSession }) => {
  return (
    <div className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333]/50 hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 hover:transform hover:-translate-y-1">
      {/* Header with icon and title */}
      <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-3">
        <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {method.nombre_metodo.charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
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
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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