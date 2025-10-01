import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/ui/Sidebar";
import { Card } from "../components/ui/Card";

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


export const StudyMethodsLibraryPage: React.FC = () => {
  console.log("StudyMethodsLibraryPage component rendered");

  const [studyMethods, setStudyMethods] = useState<StudyMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch study methods and their benefits
  useEffect(() => {
    const fetchStudyMethods = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch all study methods
        const methodsResponse = await fetch("http://localhost:3001/api/v1/metodos-estudio");
        if (!methodsResponse.ok) {
          throw new Error("Error al cargar métodos de estudio");
        }
        const apiResponse = await methodsResponse.json();
        console.log("API Response for methods:", apiResponse);

        // Extract the data array from the response - more robust approach
        const methods: StudyMethod[] = apiResponse?.data || [];

        console.log("Extracted methods:", methods);
        console.log("Methods length:", methods.length);

        if (methods.length === 0) {
          console.warn("No study methods received from API. Full response:", apiResponse);
        }

        // For each method, fetch its benefits
        const methodsWithBenefits = await Promise.all(
          methods.map(async (method) => {
            try {
              console.log(`Fetching benefits for method ${method.id_metodo}`);
              const benefitsResponse = await fetch(
                `http://localhost:3001/api/v1/metodos-estudio/${method.id_metodo}/beneficios`
              );
              if (benefitsResponse.ok) {
                const benefits = await benefitsResponse.json();
                console.log(`Benefits for method ${method.id_metodo}:`, benefits);
                return { ...method, beneficios: Array.isArray(benefits) ? benefits : [] };
              } else {
                console.warn(`Failed to fetch benefits for method ${method.id_metodo}, status: ${benefitsResponse.status}`);
                // If benefits fetch fails, return method with empty benefits
                return { ...method, beneficios: [] };
              }
            } catch (error) {
              console.error(`Error fetching benefits for method ${method.id_metodo}:`, error);
              return { ...method, beneficios: [] };
            }
          })
        );

        console.log("Final methods with benefits:", methodsWithBenefits);
        setStudyMethods(methodsWithBenefits);
      } catch (err) {
        console.error("Error fetching study methods:", err);
        setError("Error al cargar los métodos de estudio. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudyMethods();
  }, []);

  const handleViewStepByStep = (method: StudyMethod) => {
    console.log(`Viewing step by step for ${method.nombre_metodo}`);
    // TODO: Implement step by step view navigation
  };

  const handleAddToSession = (method: StudyMethod) => {
    console.log(`Adding ${method.nombre_metodo} to concentration session`);
    // TODO: Implement add to session functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
        <Sidebar currentPage="study-methods" />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Cargando métodos de estudio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
        <Sidebar currentPage="study-methods" />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-semibold mb-4">Error al cargar datos</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 cursor-pointer"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  try {
    console.log("Rendering StudyMethodsLibraryPage with:", { loading, error, studyMethodsLength: studyMethods.length });

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
        <Sidebar currentPage="study-methods" />

        <div className="flex justify-center items-center min-h-screen">
          <main className="w-full max-w-7xl p-6 md:p-10 transition-all">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-white mb-4 tracking-tight text-center bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text">
                Biblioteca de Métodos de Estudio
              </h1>
              <p className="text-gray-400 text-center text-lg max-w-2xl mx-auto">
                Descubre técnicas probadas para mejorar tu concentración y eficiencia en el estudio
              </p>
            </div>

            {studyMethods.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-6xl mb-4">📚</div>
                <h3 className="text-white text-xl font-semibold mb-2">No hay métodos disponibles</h3>
                <p className="text-gray-400">Los métodos de estudio estarán disponibles pronto.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {studyMethods.map((method) => (
                  <Card
                    key={method.id_metodo}
                    method={method}
                    onViewStepByStep={handleViewStepByStep}
                    onAddToSession={handleAddToSession}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    );
  } catch (renderError) {
    console.error("Error rendering StudyMethodsLibraryPage:", renderError);
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error de Renderizado</h1>
          <p>Hubo un error al cargar la página. Revisa la consola para más detalles.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
};

export default StudyMethodsLibraryPage;