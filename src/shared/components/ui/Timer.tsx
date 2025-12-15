// Componente de temporizador reutilizable
// Muestra un temporizador con controles para iniciar, pausar y reiniciar
import React, { useState, useEffect, useRef } from "react";

interface TimerProps {
  // Minutos iniciales del temporizador
  initialMinutes: number;
  // Callback cuando el temporizador llega a cero
  onComplete?: () => void;
  // Color del temporizador
  color?: string;
}

export const Timer: React.FC<TimerProps> = ({ initialMinutes, onComplete, color = "#ef4444" }) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Formatear tiempo como MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  // Iniciar temporizador
  const startTimer = () => {
    if (!isRunning && seconds > 0) {
      setIsRunning(true);
    }
  };

  // Pausar temporizador
  const pauseTimer = () => {
    setIsRunning(false);
  };

  // Reiniciar temporizador
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(initialMinutes * 60);
    setHasCompleted(false);
  };

  // Efecto para manejar el conteo del temporizador
  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds]);

  // Efecto separado para llamar onComplete después de que el estado se haya actualizado
  useEffect(() => {
    if (hasCompleted && onComplete) {
      onComplete();
      setHasCompleted(false); // Reset para evitar llamadas múltiples
    }
  }, [hasCompleted, onComplete]);

  return (
    <div className="flex items-center justify-between">
      <span
        className="text-3xl font-bold"
        style={{ color }}
      >
        {formatTime(seconds)}
      </span>
      <div className="space-x-3">
        <button
          onClick={resetTimer}
          className="px-3 py-1 rounded-lg font-medium transition-all duration-200 hover:transform hover:scale-105"
          style={{
            backgroundColor: `${color}E6`, // 90% opacity
            color: 'white'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = color}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${color}E6`}
        >
          Reiniciar
        </button>
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="px-3 py-1 rounded-lg font-medium transition-all duration-200 hover:transform hover:scale-105"
          style={{
            backgroundColor: `${color}E6`, // 90% opacity
            color: 'white'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = color}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${color}E6`}
        >
          {isRunning ? 'Pausar' : seconds === initialMinutes * 60 ? 'Iniciar' : 'Reanudar'}
        </button>
      </div>
    </div>
  );
};