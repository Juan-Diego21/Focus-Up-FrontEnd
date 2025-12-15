// Componente reutilizable para layout de páginas
// Proporciona estructura consistente con sidebar opcional
import React from 'react';

interface PageLayoutProps {
  // Título opcional de la página
  title?: string;
  // Contenido principal de la página
  children: React.ReactNode;
  // Clases CSS adicionales
  className?: string;
  // Indica si mostrar sidebar
  showSidebar?: boolean;
  // Contenido del sidebar
  sidebar?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  children,
  className = '',
  showSidebar = false,
  sidebar,
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter ${className}`}>
      {showSidebar && sidebar}
      <div className="flex justify-center items-center min-h-screen">
        <main className="w-full max-w-7xl p-6 md:p-10 transition-all">
          {title && (
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-white mb-4 tracking-tight text-center bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text">
                {title}
              </h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};