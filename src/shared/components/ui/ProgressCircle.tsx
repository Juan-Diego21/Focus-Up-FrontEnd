import React from "react";

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  getTextByPercentage?: (pct: number) => string;
  getColorByPercentage?: (pct: number) => string;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = 140,
  strokeWidth = 10,
  backgroundColor = "#9CA3AF",
  getTextByPercentage,
  getColorByPercentage
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Default color function
  const defaultGetColorByPercentage = (pct: number): string => {
    if (pct === 0) return backgroundColor;
    if (pct < 100) return "#FACC15"; // Amarillo para en proceso
    return "#22C55E"; // Verde para completado
  };

  // Default text function
  const defaultGetTextByPercentage = (pct: number): string => {
    if (pct === 0) return "Sin empezar";
    if (pct < 100) return "En proceso";
    return "Completado";
  };

  // Use custom functions if provided, otherwise use defaults
  const colorFunction = getColorByPercentage || defaultGetColorByPercentage;
  const textFunction = getTextByPercentage || defaultGetTextByPercentage;

  const currentColor = percentage === 0 ? backgroundColor : colorFunction(percentage);

  return (
    <div className="flex flex-col items-center relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Círculo de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Círculo de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={currentColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease'
          }}
        />
      </svg>

      {/* Porcentaje en el centro */}
      <div
        className="absolute text-2xl font-bold select-none top-[65px] left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ color: currentColor }}
      >
        {percentage}%
      </div>

      {/* Texto descriptivo */}
      <div
        className="text-lg mt-3"
        style={{ color: backgroundColor }}
      >
        {textFunction(percentage)}
      </div>
    </div>
  );
};

export default ProgressCircle;