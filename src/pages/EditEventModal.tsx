import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { ChevronDown } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import Swal from 'sweetalert2';
import type { IEvento, IEventoUpdate } from '../types/events';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventId: number, data: IEventoUpdate) => Promise<void>;
  event: IEvento | null;
}

/**
 * Modal para editar eventos existentes
 * Incluye validación de formulario y campos pre-poblados
 */
export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  event
}) => {
  const [formData, setFormData] = useState({
    nombreEvento: '',
    fechaEvento: '',
    hours: 1,
    minutes: 0,
    period: 'AM',
    descripcionEvento: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper functions to access event properties
  const getProperty = (snakeCase: string, camelCase: string) => {
    if (!event) return '';
    return event[snakeCase] || event[camelCase] || '';
  };

  const getId = () => {
    if (!event) return 0;
    return event.id_evento || event.idEvento || 0;
  };

  // Convert 24h time to 12h format for editing
  const convertTo12Hour = (time24h: string) => {
    if (!time24h) return { hours: 1, minutes: 0, period: 'AM' };

    const [hours24, minutes] = time24h.split(':').map(Number);
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;

    return { hours: hours12, minutes: minutes || 0, period };
  };

  // Populate form when event changes
  useEffect(() => {
    if (event && isOpen) {
      const timeData = convertTo12Hour(getProperty('hora_evento', 'horaEvento'));

      setFormData({
        nombreEvento: getProperty('nombre_evento', 'nombreEvento'),
        fechaEvento: getProperty('fecha_evento', 'fechaEvento'),
        hours: timeData.hours,
        minutes: timeData.minutes,
        period: timeData.period,
        descripcionEvento: getProperty('descripcion_evento', 'descripcionEvento'),
      });
      setErrors({});
    }
  }, [event, isOpen]);

  // Hide native date picker indicator and add custom scrollbar
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input[type="date"].date-input-custom::-webkit-calendar-picker-indicator {
        opacity: 0;
        cursor: pointer;
      }
      input[type="date"].date-input-custom::-webkit-inner-spin-button,
      input[type="date"].date-input-custom::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Custom scrollbar for EditEventModal */
      .edit-event-modal-scroll::-webkit-scrollbar {
        width: 8px;
      }
      .edit-event-modal-scroll::-webkit-scrollbar-track {
        background: #1a1a1a;
        border-radius: 4px;
      }
      .edit-event-modal-scroll::-webkit-scrollbar-thumb {
        background: #374151;
        border-radius: 4px;
        border: 1px solid #1a1a1a;
      }
      .edit-event-modal-scroll::-webkit-scrollbar-thumb:hover {
        background: #4b5563;
      }
      .edit-event-modal-scroll::-webkit-scrollbar-thumb:active {
        background: #6b7280;
      }

      /* Firefox scrollbar */
      .edit-event-modal-scroll {
        scrollbar-width: thin;
        scrollbar-color: #374151 #1a1a1a;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Validación del formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombreEvento.trim()) {
      newErrors.nombreEvento = 'El nombre del evento es requerido';
    }

    if (!formData.fechaEvento) {
      newErrors.fechaEvento = 'La fecha del evento es requerida';
    } else {
      const eventDate = new Date(formData.fechaEvento);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        newErrors.fechaEvento = 'La fecha no puede ser anterior a hoy';
      }
    }

    // Validar que se haya seleccionado una hora válida
    if (formData.hours < 1 || formData.hours > 12) {
      newErrors.horaEvento = 'La hora debe estar entre 1 y 12';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Convertir hora de 12h a 24h formato
  const convertTo24Hour = (hours: number, period: string): string => {
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${formData.minutes.toString().padStart(2, '0')}:00`;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !event) {
      return;
    }

    setLoading(true);
    try {
      const eventData: IEventoUpdate = {
        nombre_evento: formData.nombreEvento.trim(),
        fecha_evento: new Date(formData.fechaEvento).toISOString().split('T')[0], // Enviar como cadena YYYY-MM-DD
        hora_evento: convertTo24Hour(formData.hours, formData.period), // Convertir a formato HH:MM:00
        descripcion_evento: formData.descripcionEvento.trim() || undefined,
        // id_metodo e id_album se establecerán cuando se implementen los botones placeholder
      };

      await onSave(getId(), eventData);
      onClose();
    } catch (error: any) {
      console.error('Error editando evento:', error);

      // Mostrar error con SweetAlert2 en español
      let errorMessage = 'Error desconocido al editar el evento';

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: 'Error al editar el evento',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444',
        background: '#232323',
        color: '#ffffff',
        iconColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario comienza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232323] rounded-2xl shadow-2xl w-full max-w-lg border border-[#333] max-h-[90vh] overflow-y-auto edit-event-modal-scroll">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-semibold text-white">Editar Evento</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Event Name */}
          <div>
            <label htmlFor="edit-nombreEvento" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Evento *
            </label>
            <input
              type="text"
              id="edit-nombreEvento"
              value={formData.nombreEvento}
              onChange={(e) => handleInputChange('nombreEvento', e.target.value)}
              className={`w-full px-3 py-2 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombreEvento ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Ej: Sesión de estudio matutina"
            />
            {errors.nombreEvento && (
              <p className="mt-1 text-sm text-red-400">{errors.nombreEvento}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="edit-fechaEvento" className="block text-sm font-medium text-gray-300 mb-2">
              Fecha *
            </label>
            <div className="relative">
              <input
                type="date"
                id="edit-fechaEvento"
                value={formData.fechaEvento}
                onChange={(e) => handleInputChange('fechaEvento', e.target.value)}
                className={`w-full pl-4 pr-10 py-2 bg-[#1a1a1a] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer date-input-custom ${
                  errors.fechaEvento ? 'border-red-500' : 'border-gray-600'
                }`}
                style={{
                  colorScheme: 'dark'
                }}
              />
              <CalendarDaysIcon
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white cursor-pointer"
                onClick={() => {
                  const input = document.getElementById('edit-fechaEvento') as HTMLInputElement;
                  if (input && input.showPicker) {
                    input.showPicker();
                  }
                }}
              />
            </div>
            {errors.fechaEvento && (
              <p className="mt-1 text-sm text-red-400">{errors.fechaEvento}</p>
            )}
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hora *
            </label>
            <div className="grid grid-cols-3 gap-6">
              {/* Hours */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2">Horas</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.hours}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Allow empty input for clearing
                      if (inputValue === '') {
                        setFormData(prev => ({ ...prev, hours: 1 }));
                        return;
                      }
                      // Only allow numeric input
                      const numericValue = inputValue.replace(/\D/g, '');
                      if (numericValue === '') {
                        setFormData(prev => ({ ...prev, hours: 1 }));
                        return;
                      }
                      const numValue = parseInt(numericValue);
                      // Allow intermediate values during typing (like "2" before "20")
                      if (numValue >= 0 && numValue <= 99) {
                        setFormData(prev => ({ ...prev, hours: numValue }));
                      }
                    }}
                    onBlur={() => {
                      // Validate on blur - ensure valid hour range
                      if (formData.hours < 1 || formData.hours > 12) {
                        setFormData(prev => ({ ...prev, hours: 1 }));
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white text-left pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="HH"
                  />
                  <Listbox value={formData.hours} onChange={(value) => setFormData(prev => ({ ...prev, hours: value }))}>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Listbox.Button className="p-1 rounded hover:bg-gray-700">
                        <ChevronDown className="w-5 h-5 text-gray-400 pointer-events-none" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                          <Listbox.Option
                            key={hour}
                            value={hour}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 pl-4 pr-4 text-center transition-all duration-150 ${
                                active ? 'bg-gray-700 text-white' : 'text-gray-200'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {hour.toString().padStart(2, '0')}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>

              {/* Minutes */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2">Minutos</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.minutes.toString().padStart(2, '0')}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Allow empty input for clearing
                      if (inputValue === '') {
                        setFormData(prev => ({ ...prev, minutes: 0 }));
                        return;
                      }
                      // Only allow numeric input
                      const numericValue = inputValue.replace(/\D/g, '');
                      if (numericValue === '') {
                        setFormData(prev => ({ ...prev, minutes: 0 }));
                        return;
                      }
                      const numValue = parseInt(numericValue);
                      // Allow intermediate values during typing (like "3" before "30")
                      if (numValue >= 0 && numValue <= 99) {
                        setFormData(prev => ({ ...prev, minutes: numValue }));
                      }
                    }}
                    onBlur={() => {
                      // Validate on blur - ensure valid minute range
                      if (formData.minutes < 0 || formData.minutes > 59) {
                        setFormData(prev => ({ ...prev, minutes: 0 }));
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white text-left pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="MM"
                  />
                  <Listbox value={formData.minutes} onChange={(value) => setFormData(prev => ({ ...prev, minutes: value }))}>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Listbox.Button className="p-1 rounded hover:bg-gray-700">
                        <ChevronDown className="w-5 h-5 text-gray-400 pointer-events-none" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                          <Listbox.Option
                            key={minute}
                            value={minute}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 pl-4 pr-4 text-center transition-all duration-150 ${
                                active ? 'bg-gray-700 text-white' : 'text-gray-200'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {minute.toString().padStart(2, '0')}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>

              {/* AM/PM */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2">AM/PM</label>
                <Listbox value={formData.period} onChange={(value) => setFormData(prev => ({ ...prev, period: value }))}>
                  <div className="relative">
                    <Listbox.Button className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white text-left pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                      <span className="block truncate">
                        {formData.period || "AM/PM"}
                      </span>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                      {[
                        { value: "AM", label: "AM" },
                        { value: "PM", label: "PM" }
                      ].map((period) => (
                        <Listbox.Option
                          key={period.value}
                          value={period.value}
                          className={({ active }) =>
                            `cursor-pointer select-none relative py-2 pl-4 pr-4 text-center transition-all duration-150 ${
                              active ? 'bg-gray-700 text-white' : 'text-gray-200'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                {period.label}
                              </span>
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
            </div>
            {errors.horaEvento && (
              <p className="mt-1 text-sm text-red-400">{errors.horaEvento}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-descripcionEvento" className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              id="edit-descripcionEvento"
              value={formData.descripcionEvento}
              onChange={(e) => handleInputChange('descripcionEvento', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe tu evento (opcional)"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex gap-3 p-6 border-t border-[#333]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;