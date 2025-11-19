import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";
import { LOCAL_METHOD_ASSETS } from "../utils/methodAssets";
import { CheckCircle, BookOpen, PenTool, FileText } from 'lucide-react';

interface StudyMethod {
  id_metodo: number;
  nombre_metodo: string;
  descripcion: string;
  url_imagen?: string;
  color_hexa?: string;
  beneficios?: Array<{
    id_beneficio: number;
    descripcion_beneficio: string;
  }>;
}

export const CornellIntroView: React.FC = () => {
  const navigate = useNavigate();
  const { methodId } = useParams<{ methodId: string }>();
  const [method, setMethod] = useState<StudyMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);

  // Obtener datos del método de estudio desde la API
  useEffect(() => {
    const fetchMethodData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${apiClient.defaults.baseURL}${API_ENDPOINTS.STUDY_METHODS}/${methodId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          throw new Error("Error al cargar datos del método");
        }

        const methodData = await response.json();
        const method = methodData.data || methodData;
        setMethod(method);
      } catch {
        setError("Error al cargar los datos del método");
      } finally {
        setLoading(false);
      }
    };

    if (methodId) {
      fetchMethodData();
    }
  }, [methodId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center p-5">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando método...</p>
        </div>
      </div>
    );
  }

  if (error || !method) {
    return (
      <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center p-5">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-semibold mb-4">Error al cargar datos</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/study-methods")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            Volver a métodos
          </button>
        </div>
      </div>
    );
  }

  // Usar únicamente colores locales del sistema de assets
  const localAssets = LOCAL_METHOD_ASSETS[method.nombre_metodo];
  const methodColor = localAssets?.color || "#3B82F6";
  const methodImage = localAssets?.image;

  // Manejar inicio del método
  const handleStartMethod = () => {
    navigate(`/cornell/steps/${methodId}`);
  };

  return (
    <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex flex-col items-center justify-start p-5">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/study-methods")}
          className="p-2 bg-none cursor-pointer hover:scale-110 transition-transform"
          aria-label="Volver atrás"
        >
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold" style={{ color: methodColor }}>
          {method.nombre_metodo}
        </h1>
        <div className="w-8"></div>
      </header>

      {/* Contenido principal */}
      <div className="w-full max-w-4xl space-y-8">
        {/* Imagen y descripción principal */}
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            {methodImage ? (
              <>
                {!imageLoaded && (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-700 animate-pulse"></div>
                )}
                <img
                  src={methodImage}
                  alt={`Imagen de ${method.nombre_metodo}`}
                  className={`w-12 h-12 md:w-16 md:h-16 object-contain rounded-full shadow-md shadow-black/40 ${imageLoaded ? 'block' : 'hidden'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".fallback-emoji")) {
                      const emoji = document.createElement("span");
                      emoji.className = "fallback-emoji text-6xl md:text-8xl";
                      emoji.textContent = "📝";
                      parent.appendChild(emoji);
                    }
                  }}
                />
              </>
            ) : (
              <span className="text-6xl md:text-8xl">📝</span>
            )}
          </div>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Organiza tus notas en secciones estructuradas para mejorar la comprensión y la retención de información.
          </p>
        </div>

        {/* Timeline del método Cornell */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            ¿Cómo funciona el Método Cornell?
          </h2>

          <div className="grid gap-6">
            <div
              className="bg-[#232323]/90 p-6 rounded-2xl shadow-lg border"
              style={{ borderColor: `${methodColor}33` }}
            >
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <PenTool className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                <span style={{ color: methodColor }}>
                  1. Tomar notas
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Divide tu página en secciones: área principal para notas, columna izquierda para palabras clave, y parte inferior para el resumen.
              </p>
            </div>

            <div
              className="bg-[#232323]/90 p-6 rounded-2xl shadow-lg border"
              style={{ borderColor: `${methodColor}33` }}
            >
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" style={{ color: 'white' }} />
                <span style={{ color: methodColor }}>
                  2. Palabras clave
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Identifica las ideas principales y palabras clave más importantes. Escríbelas en la columna izquierda.
              </p>
            </div>

            <div
              className="bg-[#232323]/90 p-6 rounded-2xl shadow-lg border"
              style={{ borderColor: `${methodColor}33` }}
            >
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-6 h-6" style={{ color: 'white' }} />
                <span style={{ color: methodColor }}>
                  3. Resumen
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Redacta un resumen breve de 3-5 frases que capture los puntos más importantes de tus notas.
              </p>
            </div>

            <div
              className="bg-[#232323]/90 p-6 rounded-2xl shadow-lg border"
              style={{ borderColor: `${methodColor}33` }}
            >
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-6 h-6" style={{ color: 'white' }} />
                <span style={{ color: methodColor }}>
                  4. Revisión
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Usa las palabras clave para hacer preguntas y revisar el material. Cubre las notas para probar tu memoria.
              </p>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        {method.beneficios && method.beneficios.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-white text-center mb-6">
              Beneficios del Método Cornell
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {method.beneficios.map((beneficio) => (
                <div
                  key={beneficio.id_beneficio}
                  className="bg-[#232323]/90 p-4 rounded-xl border"
                  style={{ borderColor: `${methodColor}20` }}
                >
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {beneficio.descripcion_beneficio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón para iniciar */}
        <div className="text-center mt-10">
          <button
            onClick={handleStartMethod}
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
            style={{
              backgroundColor: methodColor,
              color: 'white',
              boxShadow: `0 10px 15px -3px ${methodColor}30, 0 4px 6px -2px ${methodColor}20`,
            }}
            onMouseEnter={(e) => {
              const darkerColor = methodColor.replace('#', '');
              const r = parseInt(darkerColor.substr(0, 2), 16);
              const g = parseInt(darkerColor.substr(2, 2), 16);
              const b = parseInt(darkerColor.substr(4, 2), 16);
              const darker = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`;
              e.currentTarget.style.backgroundColor = darker;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = methodColor;
            }}
          >
            Comenzar {method.nombre_metodo}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CornellIntroView;