import React from 'react';
import { CalendarIcon, ClockIcon, BookOpenIcon, MusicalNoteIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { IEvento } from '../../types/events';

/**
 * Convierte una hora en formato 24h (HH:MM) a formato 12h (HH:MM AM/PM)
 */
const formatTime12Hour = (time24h: string): string => {
  if (!time24h) return '';

  const [hours, minutes] = time24h.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time24h;

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

interface EventCardProps {
  event: IEvento;
  onEdit: (event: IEvento) => void;
  onDelete: (eventId: number) => void;
}

/**
 * Individual event card component
 * Displays event details with edit and delete actions
 * Supports both camelCase and snake_case property naming
 */
export const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  // Early return if event is invalid
  if (!event || typeof event !== 'object') {
    return null;
  }

  // Helper functions to access properties with fallback naming conventions
  const getProperty = (snakeCase: string, camelCase: string) => {
    return event[snakeCase] || event[camelCase];
  };

  const getId = () => getProperty('id_evento', 'idEvento') as number;
  const getNombre = () => getProperty('nombre_evento', 'nombreEvento') as string;
  const getFecha = () => getProperty('fecha_evento', 'fechaEvento') as string;
  const getHora = () => getProperty('hora_evento', 'horaEvento') as string;
  const getDescripcion = () => getProperty('descripcion_evento', 'descripcionEvento') as string;
  const getIdMetodo = () => getProperty('id_metodo', 'idMetodo') as number;
  const getIdAlbum = () => getProperty('id_album', 'idAlbum') as number;

  // Safely parse date from string - supports both YYYY-MM-DD and ISO formats
  const parseEventDate = () => {
    try {
      const fecha = getFecha();
      if (!fecha) return null;

      // Handle YYYY-MM-DD format
      if (fecha.length === 10) {
        return new Date(fecha + 'T00:00:00');
      }
      // Handle ISO format or other date strings
      return new Date(fecha);
    } catch (error) {
      console.log('EventCard: Error parsing date:', getFecha(), error);
      return null;
    }
  };

  // Format date and time for display
  const formatDate = () => {
    const date = parseEventDate();
    if (!date) return 'Fecha inválida';

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return formatTime12Hour(time);
  };

  // Calculate event status with safe date parsing
  const getEventStatus = () => {
    const eventDate = parseEventDate();
    if (!eventDate) {
      return { status: 'error', color: 'text-red-400', borderColor: 'border-red-600' };
    }

    const now = new Date();
    const fecha = getFecha();
    const hora = getHora();

    if (!fecha || !hora) {
      return { status: 'error', color: 'text-red-400', borderColor: 'border-red-600' };
    }

    // Create event date with time
    const eventDateTime = new Date(`${fecha.split('T')[0]}T${hora}`);

    if (isNaN(eventDateTime.getTime())) {
      return { status: 'error', color: 'text-red-400', borderColor: 'border-red-600' };
    }

    if (eventDateTime < now) {
      return { status: 'past', color: 'text-gray-400', borderColor: 'border-gray-600' };
    } else if (eventDateTime.toDateString() === now.toDateString()) {
      return { status: 'today', color: 'text-green-400', borderColor: 'border-green-500' };
    } else {
      return { status: 'upcoming', color: 'text-blue-400', borderColor: 'border-blue-500' };
    }
  };

  const { color, borderColor } = getEventStatus();

  return (
    <div
      className={`bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border ${borderColor} transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl`}
    >
      {/* Header with title and status */}
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-xl font-semibold text-white flex-1 ${color}`}>
          {getNombre() || 'Evento sin título'}
        </h3>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(event)}
            className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
            aria-label="Editar evento"
          >
            <PencilIcon className="w-4 h-4 text-gray-400 hover:text-blue-400" />
          </button>
          <button
            onClick={() => getId() && onDelete(getId())}
            className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
            aria-label="Eliminar evento"
          >
            <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Date and time */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-gray-300">
          <CalendarIcon className="w-4 h-4" />
          <span className="text-sm">{formatDate()}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <ClockIcon className="w-4 h-4" />
          <span className="text-sm">{formatTime(getHora())}</span>
        </div>
      </div>

      {/* Description */}
      {getDescripcion() && (
        <div className="mb-4 flex-1">
          <p className="text-gray-200 text-sm leading-relaxed">
            {getDescripcion()}
          </p>
        </div>
      )}

      {/* Associated items */}
      {(getIdMetodo() || getIdAlbum()) && (
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            {getIdMetodo() && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-lg">
                <BookOpenIcon className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400">Método asociado</span>
              </div>
            )}
            {getIdAlbum() && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-lg">
                <MusicalNoteIcon className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-400">Álbum asociado</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;