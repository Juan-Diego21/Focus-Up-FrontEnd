import React from "react";
import { Sidebar } from "../components/ui/Sidebar";

interface StudyMethod {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  icon: string;
  gradient: string;
}

const studyMethods: StudyMethod[] = [
  {
    id: "pomodoro",
    title: "Método Pomodoro",
    description: "Técnica de gestión del tiempo. Divide el tiempo de estudio en intervalos de trabajo y descanso.",
    benefits: ["Mejora la productividad", "Aumenta la concentración", "Reduce la fatiga mental"],
    icon: "/img/Pomodoro.png",
    gradient: "from-blue-900/60 to-blue-800/40"
  },
  {
    id: "mind-maps",
    title: "Mapas Mentales",
    description: "Organiza visualmente las ideas. Crea mapas mentales para conectar ideas clave.",
    benefits: ["Facilita el aprendizaje significativo", "Ayuda a visualizar conceptos", "Fomenta la creatividad"],
    icon: "/img/Mentales.png",
    gradient: "from-purple-900/60 to-purple-800/40"
  },
  {
    id: "spaced-repetition",
    title: "Repaso Espaciado",
    description: "Reforzamiento a largo plazo. Revisa la información en intervalos regulares.",
    benefits: ["Mejora la retención a largo plazo", "Evita el olvido rápido", "Optimiza el tiempo de estudio"],
    icon: "/img/RepasoEspaciado.png",
    gradient: "from-green-900/60 to-green-800/40"
  },
  {
    id: "active-recall",
    title: "Práctica Activa",
    description: "Aprende haciendo. Pon a prueba tu conocimiento respondiendo preguntas o resolviendo problemas.",
    benefits: ["Profundiza la comprensión", "Fortalece la memoria", "Desarrolla habilidades prácticas"],
    icon: "/img/Practica.png",
    gradient: "from-yellow-900/60 to-yellow-800/40"
  },
  {
    id: "feynman",
    title: "Método Feynman",
    description: "Aprender explicando. Intenta explicar el tema como si se lo enseñaras a alguien más.",
    benefits: ["Identifica lagunas en la comprensión", "Fortalece el aprendizaje", "Mejora la comunicación"],
    icon: "/img/feiman.png",
    gradient: "from-pink-900/60 to-pink-800/40"
  },
  {
    id: "cornell",
    title: "Método Cornell",
    description: "Notas efectivas. Toma notas de manera estructurada. Facilita el repaso y la comprensión.",
    benefits: ["Mejora la organización", "Facilita el repaso", "Aumenta la claridad al estudiar"],
    icon: "/img/notas-adhesivas.png",
    gradient: "from-gray-800/80 to-gray-700/60"
  }
];

export const StudyMethodsLibraryPage: React.FC = () => {
  const handleViewStepByStep = (method: StudyMethod) => {
    console.log(`Viewing step by step for ${method.title}`);
    // TODO: Implement step by step view
  };

  const handleAddToSession = (method: StudyMethod) => {
    console.log(`Adding ${method.title} to concentration session`);
    // TODO: Implement add to session functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
      <Sidebar currentPage="study-methods" />

      <div className="flex justify-center items-center min-h-screen">
        <main className="w-full max-w-6xl p-6 md:p-10 transition-all">
          <h1 className="text-3xl font-bold text-white mb-10 tracking-tight text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text">
            Biblioteca de Métodos de Estudio
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyMethods.map((method) => (
              <div
                key={method.id}
                className={`flex flex-col h-full rounded-lg shadow-lg p-6 bg-gradient-to-br ${method.gradient} border border-gray-800 backdrop-blur-md`}
              >
                <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-3">
                  <img
                    src={method.icon}
                    alt={method.title}
                    className="w-10 h-10 rounded bg-gray-900/60 p-1"
                  />
                  <h2 className="text-xl font-semibold text-white">{method.title}</h2>
                </div>

                <div className="mb-4 border-b border-gray-700 pb-3">
                  <p className="text-gray-200 text-base">{method.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Beneficios</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    {method.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleViewStepByStep(method)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                  >
                    Ver paso a paso
                  </button>
                  <button
                    onClick={() => handleAddToSession(method)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg font-semibold hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                  >
                    Añadir a sesión
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudyMethodsLibraryPage;