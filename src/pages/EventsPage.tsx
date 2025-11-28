import React, { useState, useEffect } from 'react';
import { PlusIcon, CalendarIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/ui/Sidebar';
import { EventCard } from '../components/ui/EventCard';
import { CreateEventModal } from './CreateEventModal';
import { EditEventModal } from './EditEventModal';
import { useEvents } from '../hooks/useEvents';
import { eventsApi } from '../utils/eventsApi';
import type { IEvento, IEventoCreate, IEventoUpdate } from '../types/events';
import Swal from 'sweetalert2';

/**
 * Componente principal de la página de eventos
 * Muestra todos los eventos del usuario en una cuadrícula con funcionalidad de creación
 */
export const EventsPage: React.FC = () => {
  const { events: hookEvents, loading, error, fetchEvents, createEvent, updateEvent, optimisticDelete } = useEvents();
  const [events, setEvents] = useState<IEvento[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvento | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Sync local events state with hook events
  useEffect(() => {
    setEvents(hookEvents);
  }, [hookEvents]);

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

  // Manejar eliminación de un evento con UI optimista
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
        // Optimistic deletion: remove from UI immediately to prevent reloads and audio interruptions
        await optimisticDelete(eventId);

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
          text: 'No se pudo eliminar el evento. Se ha revertido el cambio.',
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

  // Filtrar eventos según el filtro seleccionado
  const getFilteredEvents = () => {
    if (filter === 'all') return events;

    return events.filter(event => {
      const fecha = event.fecha_evento || event.fechaEvento;
      const hora = event.hora_evento || event.horaEvento;

      // Improved date parsing - handle various date formats
      let isPast = false;
      if (fecha && hora) {
        try {
          // Extract date part (remove time if present)
          const datePart = fecha.includes('T') ? fecha.split('T')[0] : fecha;
          // Ensure hora is in HH:MM:SS format
          const timePart = hora.length === 5 ? `${hora}:00` : hora;
          const eventDateTime = new Date(`${datePart}T${timePart}`);
          const now = new Date();
          isPast = eventDateTime < now;
        } catch (error) {
          console.warn('Error parsing event date/time:', fecha, hora, error);
          // If parsing fails, assume it's not past
          isPast = false;
        }
      }

      if (!isPast) return false; // Only show events that have passed

      const status = event.estado || event.estado_evento;

      if (filter === 'completed') {
        return status === 'completado';
      } else if (filter === 'pending') {
        // An event is pending if explicitly marked as 'pendiente' OR has no status (null/undefined) and is past
        return status === 'pendiente' || status === null || status === undefined;
      }

      return true;
    });
  };

  // Manejar cambio de estado del evento (completado/pendiente)
  const handleToggleEventState = async (event: IEvento) => {
    const eventId = event.id_evento || event.idEvento;
    if (!eventId) return;

    const currentStatus = event.estado || event.estado_evento;
    const newStatus = currentStatus === "completado" ? "pendiente" : "completado";

    // Optimistic update - update local state immediately
    const previousEvents = [...events];
    setEvents(prev => prev.map(e =>
      (e.id_evento || e.idEvento) === eventId
        ? { ...e, estado: newStatus }
        : e
    ));

    try {
      // Call appropriate API endpoint
      if (newStatus === "completado") {
        await eventsApi.markEventCompleted(eventId);
      } else {
        await eventsApi.markEventPending(eventId);
      }

      // Show success alert
      Swal.fire({
        title: 'Evento actualizado correctamente',
        text: `El evento ha sido marcado como ${newStatus === "completado" ? "completado" : "pendiente"}`,
        icon: 'success',
        confirmButtonColor: '#22C55E',
        background: '#232323',
        color: '#ffffff',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (error) {
      // Revert optimistic update on failure
      setEvents(previousEvents);

      console.error('Error updating event status:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estado del evento',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        background: '#232323',
        color: '#ffffff',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-80 h-80 bg-green-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      <Sidebar currentPage="events" />

      <div className="relative z-10 flex justify-center items-start min-h-screen py-8 pt-16">
        <main className="w-full max-w-7xl px-4 md:px-6 lg:px-8 transition-all">
          {/* Header Section */}
          <div className="relative mb-16">
            {/* Header glow effect */}
            <div className="absolute -inset-8 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 rounded-3xl blur-2xl opacity-50"></div>

            <div className="relative">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent mb-6 leading-tight">
                    Mis Eventos
                  </h1>
                  <p className="text-gray-300 text-xl leading-relaxed max-w-2xl">
                    Programa sesiones de concentración y mantén tu rutina de estudio organizada
                    con eventos personalizados.
                  </p>

                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-300 rounded-full border border-green-500/20">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Organización Efectiva
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/20">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      Rutina Consistente
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-300 rounded-full border border-teal-500/20">
                      <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                      Productividad Mejorada
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Filter Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="p-3 bg-gradient-to-br from-[#232323]/80 to-[#1a1a1a]/80 backdrop-blur-md text-white rounded-xl border border-[#333]/60 hover:border-green-500/50 transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg hover:shadow-green-500/25"
                      aria-label="Filtrar eventos"
                    >
                      <FunnelIcon className="w-5 h-5" />
                    </button>

                    {/* Filter Options with Animation */}
                    <AnimatePresence>
                      {showFilters && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-12 w-48 bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-xl shadow-2xl border border-green-500/20 py-2 z-10"
                        >
                          <button
                            onClick={() => { setFilter('all'); setShowFilters(false); }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-green-500/10 transition-colors cursor-pointer rounded-lg mx-0 ${
                              filter === 'all' ? 'text-green-400 bg-green-500/20' : 'text-white'
                            }`}
                          >
                            Todos los eventos
                          </button>
                          <button
                            onClick={() => { setFilter('pending'); setShowFilters(false); }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-yellow-500/10 transition-colors cursor-pointer rounded-lg mx-0 ${
                              filter === 'pending' ? 'text-yellow-400 bg-yellow-500/20' : 'text-white'
                            }`}
                          >
                            Pendientes
                          </button>
                          <button
                            onClick={() => { setFilter('completed'); setShowFilters(false); }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-500/10 transition-colors cursor-pointer rounded-lg mx-0 ${
                              filter === 'completed' ? 'text-blue-400 bg-blue-500/20' : 'text-white'
                            }`}
                          >
                            Completados
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Create Event Button */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-1"
                    aria-label="Crear nuevo evento"
                  >
                    <PlusIcon className="w-6 h-6" />
                    <span className="font-medium">Crear Evento</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Cargando eventos...</h2>
                <p className="text-gray-400">Organizando tu calendario de estudio</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto border border-red-500/30 shadow-2xl">
                    <span className="text-4xl">⚠️</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs">!</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Error al cargar eventos</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>
                <button
                  onClick={fetchEvents}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Intentar de nuevo
                </button>
              </div>
            </div>
          )}

          {/* Cuadrícula de eventos */}
          {!loading && !error && (
            <>
              {events.length === 0 ? (
                /* Empty State */
                <div className="flex justify-center items-center py-20">
                  <div className="text-center max-w-lg mx-auto">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto border border-green-500/30 shadow-2xl">
                        <CalendarIcon className="w-12 h-12 text-green-400" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <PlusIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                      No tienes eventos programados
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                      Crea tu primer evento para organizar mejor tus sesiones de estudio
                      y mantener una rutina consistente de concentración.
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-1"
                    >
                      <PlusIcon className="w-6 h-6" />
                      <span>Crear primer evento</span>
                      <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                /* Events Grid */
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-3xl blur-xl"></div>
                  <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getFilteredEvents()
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
                          onToggleState={handleToggleEventState}
                        />
                      );
                    })}
                  </div>
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