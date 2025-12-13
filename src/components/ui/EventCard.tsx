import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ClockIcon, BookOpenIcon, MusicalNoteIcon, PencilIcon, TrashIcon, CheckIcon, PlayIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
 * Includes button to start focus sessions for past pending events
 */
export const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete, onToggleState }) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

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

    try {
      // Extract date part (remove time if present)
      const datePart = fecha.includes('T') ? fecha.split('T')[0] : fecha;
      // Ensure hora is in HH:MM:SS format
      const timePart = hora.length === 5 ? `${hora}:00` : hora;
      const eventDateTime = new Date(`${datePart}T${timePart}`);
      const now = new Date();
      return eventDateTime < now;
    } catch (error) {
      console.warn('Error parsing event date/time in EventCard:', fecha, hora, error);
      return false;
    }
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
    const hora = getHora();

    if (!fecha || !hora) {
      return { status: 'error', color: 'text-red-400', borderColor: 'border-red-600' };
    }

    try {
      // Extract date part (remove time if present)
      const datePart = fecha.includes('T') ? fecha.split('T')[0] : fecha;
      // Ensure hora is in HH:MM:SS format
      const timePart = hora.length === 5 ? `${hora}:00` : hora;
      const eventDateTime = new Date(`${datePart}T${timePart}`);
      const now = new Date();

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
    } catch (error) {
      console.warn('Error parsing event date/time in getEventStatus:', fecha, hora, error);
      return { status: 'error', color: 'text-red-400', borderColor: 'border-red-600' };
    }
  };

  const { borderColor } = getEventStatus();

  // Generate random accent border color
  const getRandomAccentBorder = () => {
    const colors = ['border-blue-500/50', 'border-purple-500/50', 'border-green-500/50'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const accentBorder = getRandomAccentBorder();

  /**
   * Maneja el inicio de una sesión de concentración desde el evento
   * Navega a la página de inicio de sesión con el eventId como parámetro
   */
  const handleStartFocusSession = () => {
    const eventId = getId();
    if (eventId) {
      navigate(`/start-session?eventId=${eventId}`);
    }
  };

  /**
   * Maneja el click en la tarjeta para mostrar/ocultar acciones
   */
  const handleCardClick = () => {
    if (isPast) {
      setShowActions(!showActions);
    }
  };

  /**
   * Maneja el cierre del modo de acciones
   */
  const handleCloseActions = () => {
    setShowActions(false);
  };

  /**
   * Maneja las acciones de los botones con cierre automático
   */
  const handleAction = (action: () => void) => {
    action();
    setShowActions(false);
  };

  /**
   * Determina si el evento es una sesión de concentración pendiente
   * Un evento es considerado sesión de concentración si tiene método o álbum asociado
   * y está en estado pendiente
   */
  const isPendingFocusSession = () => {
    return isPast && (getIdMetodo() || getIdAlbum()) && getComputedStatus() === 'pendiente';
  };

  return (
    <div
      className={`relative bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 flex flex-col h-full border-2 ${borderColor} ${accentBorder} transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl ring-1 ring-white/5 hover:ring-green-500/20 ${isPast ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      {/* Card Content - fades when actions are shown */}
      <div className={`transition-opacity duration-300 ${showActions ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        {/* Header with title, status, and actions */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className={`text-xl font-bold text-white leading-tight`}>
                {getNombre() || 'Evento sin título'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Time-based status label */}
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

            {/* Event completion status - only show for past events */}
            {isPast && getComputedStatus() && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                getComputedStatus() === "completado"
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  getComputedStatus() === "completado" ? "bg-green-400" : "bg-yellow-400"
                }`}></div>
                {getComputedStatus() === "completado" ? "Completado" : "Pendiente"}
              </div>
            )}
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
          <div className="mt-auto mb-4 pt-4 border-t border-gray-700/50">
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

        {/* Focus Session Button - Only show for pending focus sessions when not in action mode */}
        {isPendingFocusSession() && !showActions && (
          <div className="pt-4 border-t border-gray-700/50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartFocusSession();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              aria-label="Iniciar sesión de concentración programada"
              title="Iniciar la sesión de concentración programada para este evento"
            >
              <PlayIcon className="w-5 h-5" />
              <span>Iniciar Sesión de Concentración</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Overlay - appears when card is clicked */}
      {showActions && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-3 rounded-2xl">
          {/* Close button in upper right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCloseActions();
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 hover:border-gray-500/50 transition-all duration-200 cursor-pointer hover:scale-110"
            aria-label="Cerrar acciones"
          >
            <XMarkIcon className="w-5 h-5 text-gray-300 hover:text-white" />
          </button>

          {/* Centered action buttons - smaller and no background */}
          <div className="flex gap-6 px-4">
            {/* Mark as Completed - Only show if not completed */}
            {getComputedStatus() !== "completado" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onToggleState(event));
                }}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 cursor-pointer hover:scale-110"
                aria-label="Marcar como completado"
                title=""
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  setTimeout(() => {
                    if (target) {
                      target.title = "Marcar este evento como completado";
                    }
                  }, 500);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.title = "";
                }}
              >
                <div className="p-2 rounded-lg bg-gray-500/20 group-hover:bg-green-500/30 transition-all duration-300">
                  <CheckIcon className="w-6 h-6 text-green-400 group-hover:text-green-300 transition-colors" />
                </div>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onEdit(event));
              }}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 cursor-pointer hover:scale-110"
              aria-label="Editar evento"
              title=""
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                setTimeout(() => {
                  if (target) {
                    target.title = "Editar los detalles del evento";
                  }
                }, 500);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.title = "";
              }}
            >
              <div className="p-2 rounded-lg bg-gray-500/20 group-hover:bg-blue-500/30 transition-all duration-300">
                <PencilIcon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => getId() && onDelete(getId()));
              }}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 cursor-pointer hover:scale-110"
              aria-label="Eliminar evento"
              title=""
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                setTimeout(() => {
                  if (target) {
                    target.title = "Eliminar este evento permanentemente";
                  }
                }, 500);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.title = "";
              }}
            >
              <div className="p-2 rounded-lg bg-gray-500/20 group-hover:bg-red-500/30 transition-all duration-300">
                <TrashIcon className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
