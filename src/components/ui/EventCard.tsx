import React from 'react';
import { CalendarIcon, ClockIcon, BookOpenIcon, MusicalNoteIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { IEvento } from '../../types/events';
import { formatLocalDateReadable } from '../../utils/dateUtils';

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
  onToggleState: (event: IEvento) => void;
}

/**
 * Individual event card component
 * Displays event details with edit and delete actions
 * Supports both camelCase and snake_case property naming
 */
export const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete, onToggleState }) => {
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
  const getEstado = () => getProperty('estado', 'estado_evento') as string | null;
  const getIdMetodo = () => getProperty('id_metodo', 'idMetodo') as number;
  const getIdAlbum = () => getProperty('id_album', 'idAlbum') as number;

  // Check if event time has passed
  const isPast = (() => {
    const fecha = getFecha();
    const hora = getHora();
    if (!fecha || !hora) return false;

    const eventDateTime = new Date(`${fecha.split('T')[0]}T${hora}`);
    const now = new Date();

    return eventDateTime < now;
  })();

  // Compute status for display (only show when past)
  const getComputedStatus = () => {
    if (!isPast) return null;

    const estado = getEstado();
    if (estado) return estado;

    // If no explicit status but past, show as pending
    return "pendiente";
  };

  // Format date for display without timezone conversion
  const eventDateRaw = getFecha();
  const dateString = eventDateRaw && eventDateRaw.includes('T') ? eventDateRaw.split('T')[0] : eventDateRaw;
  const formattedDate = formatLocalDateReadable(dateString);

  const formatTime = (time: string) => {
    return formatTime12Hour(time);
  };

  // Calculate event status with safe date parsing
  const getEventStatus = () => {
    const fecha = getFecha();
    if (!fecha) {
      return { status: 'error', color: 'text-red-400', borderColor: 'border-red-600' };
    }
    let eventDate: Date;
    try {
      if (fecha.length === 10) {
        eventDate = new Date(fecha + 'T00:00:00');
      } else {
        eventDate = new Date(fecha);
      }
    } catch {
      return { status: 'error', color: 'text-red-400', borderColor: 'border-red-600' };
    }
    if (!eventDate || isNaN(eventDate.getTime())) {
      return { status: 'error', color: 'text-red-400', borderColor: 'border-red-600' };
    }

    const now = new Date();
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

  const { borderColor } = getEventStatus();

  // Generate random accent border color
  const getRandomAccentBorder = () => {
    const colors = ['border-blue-500/50', 'border-purple-500/50', 'border-green-500/50'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const accentBorder = getRandomAccentBorder();

  return (
    <div
      className={`bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 flex flex-col h-full border-2 ${borderColor} ${accentBorder} transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl ring-1 ring-white/5 hover:ring-green-500/20`}
    >
      {/* Header with title and status */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className={`text-xl font-bold text-white mb-2 leading-tight`}>
            {getNombre() || 'Evento sin título'}
          </h3>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            getEventStatus().status === 'today' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
            getEventStatus().status === 'upcoming' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
            'bg-gray-500/20 text-gray-300 border border-gray-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              getEventStatus().status === 'today' ? 'bg-green-400 animate-pulse' :
              getEventStatus().status === 'upcoming' ? 'bg-blue-400' :
              'bg-gray-400'
            }`}></div>
            {getEventStatus().status === 'today' ? 'Hoy' :
             getEventStatus().status === 'upcoming' ? 'Próximo' :
             'Pasado'}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(event)}
            className="p-2.5 rounded-xl bg-gray-500/10 hover:bg-blue-500/20 border border-gray-500/20 hover:border-blue-500/40 transition-all duration-200 cursor-pointer hover:scale-105"
            aria-label="Editar evento"
          >
            <PencilIcon className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
          </button>
          <button
            onClick={() => getId() && onDelete(getId())}
            className="p-2.5 rounded-xl bg-gray-500/10 hover:bg-red-500/20 border border-gray-500/20 hover:border-red-500/40 transition-all duration-200 cursor-pointer hover:scale-105"
            aria-label="Eliminar evento"
          >
            <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Date and time */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-500/10 rounded-xl border border-gray-500/20">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <CalendarIcon className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Fecha</p>
            <p className="text-white font-medium">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-500/10 rounded-xl border border-gray-500/20">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <ClockIcon className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Hora</p>
            <p className="text-white font-medium">{formatTime(getHora())}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      {getDescripcion() && (
        <div className="mb-6 flex-1">
          <div className="p-4 bg-gradient-to-r from-gray-500/10 to-gray-500/5 rounded-xl border border-gray-500/20">
            <p className="text-gray-200 text-sm leading-relaxed">
              {getDescripcion()}
            </p>
          </div>
        </div>
      )}

      {/* Associated items */}
      {(getIdMetodo() || getIdAlbum()) && (
        <div className="mt-auto pt-4 border-t border-gray-700/50">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Elementos asociados</p>
          <div className="flex flex-wrap gap-2">
            {getIdMetodo() && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30">
                <BookOpenIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300 font-medium">Método</span>
              </div>
            )}
            {getIdAlbum() && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30">
                <MusicalNoteIcon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">Música</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Badge and Button - Only show when event time has passed */}
      {isPast && (
        <div className="flex space-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl border ${
                getComputedStatus() === "completado"
                  ? "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-500/30"
                  : "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-yellow-500/30"
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  getComputedStatus() === "completado" ? "bg-green-400" : "bg-yellow-400"
                }`}></div>
                {getComputedStatus() === "completado" ? "Completado" : "Pendiente"}
              </div>
            </div>

            {/* Status Toggle Button */}
            <button
              onClick={() => onToggleState(event)}
              className={`inline-flex space-between gap-2 px-3 py-2 ml-1 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer hover:scale-105 ${
                getEstado() === "completado"
                  ? "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg hover:shadow-yellow-500/25"
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-green-500/25"
              }`}
              aria-label={getEstado() === "completado" ? "Marcar como pendiente" : "Marcar como completado"}
              aria-pressed={getEstado() === "completado"}
            >
              <CheckIcon className="w-4 h-4" />
              <span>{getEstado() === "completado" ? "Pendiente" : "Completado"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;