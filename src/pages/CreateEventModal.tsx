import React, { useState } from 'react';
import { XMarkIcon, BookOpenIcon, MusicalNoteIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { ChevronDown } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import { Scrollbar } from 'react-scrollbars-custom';
import Swal from 'sweetalert2';
import type { IEventoCreate } from '../types/events';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: IEventoCreate) => Promise<void>;
}

/**
 * Modal para crear nuevos eventos
 * Incluye validación de formulario y botones placeholder para selección de método/álbum
 */
export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    nombreEvento: '',
    fechaEvento: '',
    hours: 1,
    minutes: 0,
    period: 'AM',
    descripcionEvento: '',
  });

  // Temporary input values for free typing
  const [tempHours, setTempHours] = useState('01');
  const [tempMinutes, setTempMinutes] = useState('00');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Reiniciar formulario cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        nombreEvento: '',
        fechaEvento: '',
        hours: 1,
        minutes: 0,
        period: 'AM',
        descripcionEvento: '',
      });
      setTempHours('01');
      setTempMinutes('00');
      setErrors({});
    }
  }, [isOpen]);

  // Hide native date picker indicator
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const eventData: IEventoCreate = {
        nombreEvento: formData.nombreEvento.trim(),
        fechaEvento: new Date(formData.fechaEvento).toISOString().split('T')[0], // Enviar como cadena YYYY-MM-DD
        horaEvento: convertTo24Hour(formData.hours, formData.period), // Convertir a formato HH:MM:00
        descripcionEvento: formData.descripcionEvento.trim() || undefined,
        // idMetodo e idAlbum se establecerán cuando se implementen los botones placeholder
        // id_usuario se extrae automáticamente del token JWT
      };

      await onSave(eventData);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error creando evento:', error);

      // Mostrar error con SweetAlert2 en español
      let errorMessage = 'Error desconocido al crear el evento';

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: 'Error al crear el evento',
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

  // Manejadores de botones placeholder (solo UI)
  const handleAddMethod = () => {
    // TODO: Implementar modal de selección de método
    console.log('Botón añadir método clickeado - placeholder');
  };

  const handleAddAlbum = () => {
    // TODO: Implementar modal de selección de álbum
    console.log('Botón añadir álbum clickeado - placeholder');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232323] rounded-2xl shadow-2xl w-full max-w-lg border border-[#333] max-h-[90vh] min-h-[600px] flex flex-col">
        <Scrollbar
          style={{ flex: 1, minHeight: 0 }}
          thumbYProps={{
            renderer: (props: any) => {
              const { elementRef, ...restProps } = props;
              return (
                <div
                  {...restProps}
                  ref={elementRef}
                  style={{
                    ...restProps.style,
                    background: '#374151',
                    borderRadius: '4px',
                    border: '1px solid #1a1a1a',
                  }}
                />
              );
            },
          }}
          trackYProps={{
            renderer: (props: any) => {
              const { elementRef, ...restProps } = props;
              return (
                <div
                  {...restProps}
                  ref={elementRef}
                  style={{
                    ...restProps.style,
                    background: '#1a1a1a',
                    borderRadius: '4px',
                    width: '8px',
                  }}
                />
              );
            },
          }}
        >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-semibold text-white">Crear Nuevo Evento</h2>
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
            <label htmlFor="nombreEvento" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Evento *
            </label>
            <input
              type="text"
              id="nombreEvento"
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
            <label htmlFor="fechaEvento" className="block text-sm font-medium text-gray-300 mb-2">
              Fecha *
            </label>
            <div className="relative">
              <input
                type="date"
                id="fechaEvento"
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
                  const input = document.getElementById('fechaEvento') as HTMLInputElement;
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
                    value={tempHours}
                    onChange={(e) => {
                      // Allow completely free typing without restrictions
                      setTempHours(e.target.value);
                    }}
                    onBlur={() => {
                      // Validate and convert on blur
                      const numValue = parseInt(tempHours) || 0;
                      if (numValue < 1 || numValue > 12) {
                        setFormData(prev => ({ ...prev, hours: 1 }));
                        setTempHours('01');
                      } else {
                        setFormData(prev => ({ ...prev, hours: numValue }));
                        setTempHours(numValue.toString().padStart(2, '0'));
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white text-left pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="HH"
                  />
                  <Listbox value={formData.hours} onChange={(value) => {
                    setFormData(prev => ({ ...prev, hours: value }));
                    setTempHours(value.toString().padStart(2, '0'));
                  }}>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Listbox.Button className="p-1 rounded hover:bg-gray-700">
                        <ChevronDown className="w-5 h-5 text-gray-400 pointer-events-none" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute bottom-full mb-1 -left-6 z-50 w-20 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-40 focus:outline-none">
                        <Scrollbar
                          style={{ height: '160px' }}
                          thumbYProps={{
                            renderer: (props: any) => {
                              const { elementRef, ...restProps } = props;
                              return (
                                <div
                                  {...restProps}
                                  ref={elementRef}
                                  style={{
                                    ...restProps.style,
                                    background: '#6b7280',
                                    borderRadius: '3px',
                                    border: '1px solid #374151',
                                  }}
                                />
                              );
                            },
                          }}
                          trackYProps={{
                            renderer: (props: any) => {
                              const { elementRef, ...restProps } = props;
                              return (
                                <div
                                  {...restProps}
                                  ref={elementRef}
                                  style={{
                                    ...restProps.style,
                                    background: '#374151',
                                    borderRadius: '3px',
                                    width: '6px',
                                  }}
                                />
                              );
                            },
                          }}
                        >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                          <Listbox.Option
                            key={hour}
                            value={hour}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 px-3 text-center transition-all duration-150 ${
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
                        </Scrollbar>
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
                    value={tempMinutes}
                    onChange={(e) => {
                      // Allow completely free typing without restrictions
                      setTempMinutes(e.target.value);
                    }}
                    onBlur={() => {
                      // Validate and convert on blur
                      const numValue = parseInt(tempMinutes) || 0;
                      if (numValue < 0 || numValue > 59) {
                        setFormData(prev => ({ ...prev, minutes: 0 }));
                        setTempMinutes('00');
                      } else {
                        setFormData(prev => ({ ...prev, minutes: numValue }));
                        setTempMinutes(numValue.toString().padStart(2, '0'));
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white text-left pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="MM"
                  />
                  <Listbox value={formData.minutes} onChange={(value) => {
                    setFormData(prev => ({ ...prev, minutes: value }));
                    setTempMinutes(value.toString().padStart(2, '0'));
                  }}>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Listbox.Button className="p-1 rounded hover:bg-gray-700">
                        <ChevronDown className="w-5 h-5 text-gray-400 pointer-events-none" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute bottom-full mb-1 -left-6 z-50 w-20 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-40 focus:outline-none">
                        <Scrollbar
                          style={{ height: '160px' }}
                          thumbYProps={{
                            renderer: (props: any) => {
                              const { elementRef, ...restProps } = props;
                              return (
                                <div
                                  {...restProps}
                                  ref={elementRef}
                                  style={{
                                    ...restProps.style,
                                    background: '#6b7280',
                                    borderRadius: '3px',
                                    border: '1px solid #374151',
                                  }}
                                />
                              );
                            },
                          }}
                          trackYProps={{
                            renderer: (props: any) => {
                              const { elementRef, ...restProps } = props;
                              return (
                                <div
                                  {...restProps}
                                  ref={elementRef}
                                  style={{
                                    ...restProps.style,
                                    background: '#374151',
                                    borderRadius: '3px',
                                    width: '6px',
                                  }}
                                />
                              );
                            },
                          }}
                        >
                          {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                            <Listbox.Option
                              key={minute}
                              value={minute}
                              className={({ active }) =>
                                `cursor-pointer select-none relative py-2 px-3 text-center transition-all duration-150 ${
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
                        </Scrollbar>
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
                    <Listbox.Options className="absolute bottom-full mb-1 left-0 z-50 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                      {[
                        { value: "AM", label: "AM" },
                        { value: "PM", label: "PM" }
                      ].map((period) => (
                        <Listbox.Option
                          key={period.value}
                          value={period.value}
                          className={({ active }) =>
                            `cursor-pointer select-none relative py-2 px-4 text-center transition-all duration-150 ${
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
            <label htmlFor="descripcionEvento" className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              id="descripcionEvento"
              value={formData.descripcionEvento}
              onChange={(e) => handleInputChange('descripcionEvento', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe tu evento (opcional)"
            />
          </div>

          {/* Placeholder Buttons */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Asociar elementos (opcional)</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddMethod}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <BookOpenIcon className="w-4 h-4" />
                Añadir método
              </button>
              <button
                type="button"
                onClick={handleAddAlbum}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                <MusicalNoteIcon className="w-4 h-4" />
                Añadir sonido
              </button>
            </div>
          </div>
        </form>
        </Scrollbar>

        {/* Modal Footer */}
        <div className="flex gap-3 p-6 border-t border-[#333] flex-shrink-0">
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
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creando...
              </>
            ) : (
              'Crear Evento'
            )}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#232323] rounded-2xl shadow-2xl w-full max-w-md border border-[#333] p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">¡Evento creado exitosamente!</h3>
              <p className="text-gray-400">Tu evento ha sido guardado correctamente.</p>
            </div>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                onClose();
              }}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEventModal;