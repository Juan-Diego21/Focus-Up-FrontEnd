import React, { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

/**
 * Componente de entrada de tiempo flexible que acepta múltiples formatos
 * Soporta: HH, HH:MM, y variantes con AM/PM
 */
interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

/**
 * Convierte diferentes formatos de tiempo a formato 24 horas (HH:MM)
 * @param timeString - Cadena de tiempo en formato flexible
 * @returns Tiempo en formato HH:MM o cadena vacía si es inválido
 */
const convertTo24h = (timeString: string): string => {
  if (!timeString.trim()) return '';

  const cleanInput = timeString.trim().toUpperCase();

  // Patrón para HH:MM AM/PM
  const timeAmPmRegex = /^(\d{1,2}):?(\d{2})?\s*(AM|PM)?$/;
  const match = cleanInput.match(timeAmPmRegex);

  if (!match) return '';

  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const amPm = match[3];

  // Validar minutos
  if (minutes > 59) return '';

  // Convertir AM/PM a 24 horas
  if (amPm) {
    if (amPm === 'AM') {
      if (hours === 12) hours = 0;
    } else { // PM
      if (hours !== 12) hours += 12;
    }
  }

  // Validar horas
  if (hours > 23) return '';

  // Formatear como HH:MM
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Formatea el tiempo para mostrar en el input (conversión inversa limitada)
 * @param time24h - Tiempo en formato HH:MM
 * @returns Tiempo formateado para mostrar
 */
const formatForDisplay = (time24h: string): string => {
  if (!time24h || !time24h.includes(':')) return time24h;

  const [hours, minutes] = time24h.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  placeholder = "Ej: 3, 15:30, 2:00 PM",
  className = "",
  error = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Sincronizar con el valor externo
  useEffect(() => {
    if (value && value !== inputValue) {
      const displayValue = formatForDisplay(value);
      setInputValue(displayValue);
    } else if (!value) {
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Intentar convertir a formato 24h
    const converted = convertTo24h(newValue);
    const valid = !newValue.trim() || converted !== '';

    setIsValid(valid);

    // Solo actualizar el valor padre si es válido
    if (valid) {
      onChange(converted);
    }
  };

  const handleBlur = () => {
    // Al perder el foco, formatear si es válido
    if (inputValue && isValid) {
      const converted = convertTo24h(inputValue);
      if (converted) {
        const displayValue = formatForDisplay(converted);
        setInputValue(displayValue);
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${className} ${
            error || !isValid ? 'border-red-500' : 'border-gray-600'
          }`}
        />
      </div>

      {/* Ayuda para formatos aceptados */}
      <div className="mt-1 text-xs text-gray-500">
        Format: 3, 15:30, 2:00 PM, 14:45
      </div>

      {/* Mensaje de error */}
      {!isValid && inputValue && (
        <p className="mt-1 text-sm text-red-400">
          Formato de hora inválido
        </p>
      )}
    </div>
  );
};

export default TimeInput;