import React, { useState, useEffect } from 'react';
import { PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Sidebar } from '../components/ui/Sidebar';
import { EventCard } from '../components/ui/EventCard';
import { CreateEventModal } from './CreateEventModal';
import { EditEventModal } from './EditEventModal';
import { useEvents } from '../hooks/useEvents';
import type { IEvento, IEventoCreate, IEventoUpdate } from '../types/events';
import Swal from 'sweetalert2';

/**
 * Componente principal de la página de eventos
 * Muestra todos los eventos del usuario en una cuadrícula con funcionalidad de creación
 */
export const EventsPage: React.FC = () => {
  const { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useEvents();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvento | null>(null);

  // Cargar eventos al montar el componente
  useEffect(() => {
    console.log('EventsPage: Loading events...');
    fetchEvents().then(() => {
      console.log('EventsPage: Events loaded, current events:', events);
      console.log('EventsPage: First event sample:', events[0]);
      console.log('EventsPage: Events length:', events.length);
    });
  }, []); // Remover fetchEvents de dependencias para prevenir bucle infinito

  // Manejar creación de un nuevo evento
  const handleCreateEvent = async (eventData: IEventoCreate) => {
    await createEvent(eventData);
    // Refresh events to ensure the new event appears in the UI
    await fetchEvents();
  };

  // Manejar edición de un evento
  const handleEditEvent = (event: IEvento) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  // Manejar eliminación de un evento
  const handleDeleteEvent = async (eventId: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar evento?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      background: '#232323',
      color: '#ffffff',
    });

    if (result.isConfirmed) {
      try {
        await deleteEvent(eventId);

        Swal.fire({
          title: 'Eliminado',
          text: 'El evento ha sido eliminado correctamente',
          icon: 'success',
          confirmButtonColor: '#22C55E',
          background: '#232323',
          color: '#ffffff',
        });
      } catch (error) {
        console.error('Error eliminando evento:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el evento',
          icon: 'error',
          confirmButtonColor: '#EF4444',
          background: '#232323',
          color: '#ffffff',
        });
      }
    }
  };

  // Manejar guardado de edición de evento
  const handleUpdateEvent = async (eventId: number, eventData: IEventoUpdate) => {
    await updateEvent(eventId, eventData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
      <Sidebar currentPage="events" />

      <div className="flex justify-center items-start min-h-screen py-8 pt-16">
        <main className="w-full max-w-7xl px-4 md:px-6 lg:px-8 transition-all">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="flex items-center text-4xl font-bold text-white mb-4 tracking-tight">
                  <CalendarIcon className="w-8 h-8 md:w-10 md:h-10 mr-4 text-green-400" />
                  Mis Eventos
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl">
                  Programa sesiones de concentración y mantén tu rutina de estudio organizada
                </p>
              </div>

              {/* Botón FAB para crear evento */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex justify-center aling-center text-center fixed bottom-6 right-6 md:relative md:bottom-auto md:right-auto md:mb-0 p-4 md:p-3 bg-green-600 hover:bg-green-700 text-white rounded-full md:rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 cursor-pointer transform hover:scale-105 md:transform-none"
                aria-label="Crear nuevo evento"
              >
                <PlusIcon className="w-6 h-6 md:w-5 md:h-5" />
                <span className="hidden md:inline ml-5 font-medium">Crear Evento</span>
              </button>
            </div>
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Cargando eventos...</p>
              </div>
            </div>
          )}

          {/* Estado de error */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-white text-xl font-semibold mb-2">Error al cargar eventos</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={fetchEvents}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 cursor-pointer"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {/* Cuadrícula de eventos */}
          {!loading && !error && (
            <>
              {events.length === 0 ? (
                /* Estado vacío */
                <div className="text-center py-12">
                  <div className="text-gray-500 text-6xl mb-4">
                    <CalendarIcon className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">No tienes eventos programados</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Crea tu primer evento para organizar mejor tus sesiones de estudio y mantener una rutina consistente.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Crear primer evento
                  </button>
                </div>
              ) : (
                /* Cuadrícula de eventos */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {events
                    .filter((event) => {
                      const isValid = event && typeof event === 'object' &&
                        (event.id_evento || event.idEvento) &&
                        (event.nombre_evento || event.nombreEvento);
                      if (!isValid) {
                        console.log('EventsPage: Filtering out invalid event:', event);
                      }
                      return isValid;
                    })
                    .map((event) => {
                      const eventId = event.id_evento || event.idEvento;
                      const eventName = event.nombre_evento || event.nombreEvento;
                      console.log('EventsPage: Rendering event:', eventId, eventName);
                      return (
                        <EventCard
                          key={`event-${eventId}`}
                          event={event}
                          onEdit={handleEditEvent}
                          onDelete={handleDeleteEvent}
                        />
                      );
                    })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateEvent}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEvent(null);
        }}
        onSave={handleUpdateEvent}
        event={selectedEvent}
      />
    </div>
  );
};

export default EventsPage;