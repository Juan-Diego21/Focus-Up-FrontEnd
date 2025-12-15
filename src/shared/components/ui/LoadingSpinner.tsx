// Componente de spinner de carga genérico
// Muestra un indicador de carga animado con diferentes tamaños
import React from "react";

interface LoadingSpinnerProps {
  // Tamaño del spinner
  size?: "sm" | "md" | "lg";
  // Clases CSS adicionales
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  // Clases para diferentes tamaños
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      />
    </div>
  );
};