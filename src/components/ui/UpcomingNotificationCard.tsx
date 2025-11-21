import React from 'react';
import { CalendarIcon, BellIcon, BookOpenIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import type { UpcomingNotification } from '../../types/api';
import { formatLocalDateReadable } from '../../utils/dateUtils';

interface UpcomingNotificationCardProps {
  notification: UpcomingNotification;
}

const formatTime12Hour = (time24h: string): string => {
  if (!time24h) return '';

  const [hours, minutes] = time24h.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time24h;

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const getTypeIcon = (tipo: string) => {
  switch (tipo) {
    case 'evento':
      return CalendarIcon;
    case 'metodo':
      return BookOpenIcon;
    case 'sesion':
      return BellIcon;
    case 'motivacion':
      return BellIcon;
    default:
      return BellIcon;
  }
};

const getTypeLabel = (tipo: string) => {
  switch (tipo) {
    case 'evento':
      return 'Evento';
    case 'metodo':
      return 'Método de estudio';
    case 'sesion':
      return 'Sesión de concentración';
    case 'motivacion':
      return 'Motivación semanal';
    default:
      return 'Notificación';
  }
};

const getTypeColor = (tipo: string) => {
  switch (tipo) {
    case 'evento':
      return 'text-blue-400';
    case 'metodo':
      return 'text-purple-400';
    case 'sesion':
      return 'text-green-400';
    case 'motivacion':
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
};

export const UpcomingNotificationCard: React.FC<UpcomingNotificationCardProps> = ({ notification }) => {
  const IconComponent = getTypeIcon(notification.tipo);
  const typeLabel = getTypeLabel(notification.tipo);
  const typeColor = getTypeColor(notification.tipo);

  // Parse date and time
  const fechaHora = notification.fecha_hora || '';
  const dateString = fechaHora.split('T')[0];
  const timeString = fechaHora.split('T')[1]?.split('.')[0] || '';

  const formattedDate = formatLocalDateReadable(dateString);
  const formattedTime = formatTime12Hour(timeString);

  return (
    <div className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333] transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl">
      {/* Header with title and type */}
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-xl font-semibold text-white flex-1 ${typeColor}`}>
          {notification.titulo}
        </h3>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${typeColor} bg-current/20`}>
          <IconComponent className="w-3 h-3" />
          <span className="text-xs font-medium">{typeLabel}</span>
        </div>
      </div>

      {/* Date and time */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-gray-300">
          <CalendarIcon className="w-4 h-4" />
          <span className="text-sm">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <BellIcon className="w-4 h-4" />
          <span className="text-sm">{formattedTime}</span>
        </div>
      </div>

      {/* Description */}
      {notification.descripcion && (
        <div className="mb-4 flex-1">
          <p className="text-gray-200 text-sm leading-relaxed">
            {notification.descripcion}
          </p>
        </div>
      )}

      {/* Associated items */}
      {(notification.id_metodo || notification.id_album) && (
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            {notification.id_metodo && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-lg">
                <BookOpenIcon className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-400">Método asociado</span>
              </div>
            )}
            {notification.id_album && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-lg">
                <MusicalNoteIcon className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400">Álbum asociado</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingNotificationCard;