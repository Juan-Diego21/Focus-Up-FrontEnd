import React, { useState } from 'react';
import { XMarkIcon, BookOpenIcon, MusicalNoteIcon, CalendarDaysIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ChevronDown } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import { Scrollbar } from 'react-scrollbars-custom';
import Swal from 'sweetalert2';
import type { IEventoCreate } from '../../../types/events';
import { MethodSelectionModal } from '../../../components/MethodSelectionModal';
import { AlbumSelectionModal } from '../../../components/AlbumSelectionModal';

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
    tipoEvento: 'concentracion' as 'normal' | 'concentracion', // Default to concentration session
  });

  // Temporary input values for free typing
  const [tempHours, setTempHours] = useState('01');
  const [tempMinutes, setTempMinutes] = useState('00');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Modal states for method and album selection
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);

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
        tipoEvento: 'concentracion',
      });
      setTempHours('01');
      setTempMinutes('00');
      setSelectedMethod(null);
      setSelectedAlbum(null);
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

      // Check if the full date and time is in the future
      const eventDateTimeString = `${formData.fechaEvento}T${convertTo24Hour(formData.hours, formData.period)}`;
      const eventDateTime = new Date(eventDateTimeString);
      const now = new Date();

      if (eventDateTime <= now) {
        newErrors.fechaEvento = 'No se pueden crear eventos en el pasado. Para eventos del mismo día, la hora debe ser futura.';
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
        tipoEvento: formData.tipoEvento,
        // Solo incluir método y álbum si es una sesión de concentración
        ...(formData.tipoEvento === 'concentracion' && {
          idMetodo: selectedMethod?.id_metodo,
          idAlbum: selectedAlbum?.id_album,
        }),
        // id_usuario se extrae automáticamente del token JWT
      };

      await onSave(eventData);

      // Show small, non-intrusive success message and close modal after
      Swal.fire({
        title: '¡Evento creado!',
        text: 'Tu evento ha sido guardado correctamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#232323',
        color: '#ffffff',
        iconColor: '#22C55E',
        didClose: () => {
          onClose();
        },
      });
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

  // Manejadores de selección de método y álbum
  const handleAddMethod = () => {
    setIsMethodModalOpen(true);
  };

  const handleAddAlbum = () => {
    setIsAlbumModalOpen(true);
  };

  const handleMethodSelect = (method: any) => {
    setSelectedMethod(method);
    setIsMethodModalOpen(false);
  };

  const handleAlbumSelect = (album: any) => {
    setSelectedAlbum(album);
    setIsAlbumModalOpen(false);
  };

  const handleRemoveMethod = () => {
    setSelectedMethod(null);
  };

  const handleRemoveAlbum = () => {
    setSelectedAlbum(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg border border-green-500/20 max-h-[90vh] min-h-[600px] flex flex-col ring-1 ring-white/10">
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
        <div className="flex items-center justify-between p-8 border-b border-green-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl border border-green-500/30">
              <CalendarDaysIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Crear Nuevo Evento</h2>
              <p className="text-gray-400 text-sm">Programa tu próxima sesión de estudio o evento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-xl bg-gray-500/10 hover:bg-red-500/20 border border-gray-500/20 hover:border-red-500/40 transition-all duration-200 cursor-pointer hover:scale-105"
            aria-label="Cerrar modal"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Event Name */}
          <div className="space-y-3">
            <label htmlFor="nombreEvento" className="block text-sm font-semibold text-gray-200">
              Nombre del Evento <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="nombreEvento"
                value={formData.nombreEvento}
                onChange={(e) => handleInputChange('nombreEvento', e.target.value)}
                className={`w-full px-4 py-3 bg-gradient-to-r from-[#1a1a1a] to-[#232323] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.nombreEvento
                    ? 'border-red-500/50 focus:ring-red-500/50 bg-red-500/5'
                    : 'border-gray-600/50 focus:ring-green-500/50 focus:border-green-500/50'
                }`}
                placeholder="Ej: Sesión de estudio matutina"
              />
              {errors.nombreEvento && (
                <div className="absolute -bottom-6 left-0 flex items-center gap-2 text-red-400 text-sm">
                  <span className="text-xs">⚠️</span>
                  {errors.nombreEvento}
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-3">
            <label htmlFor="fechaEvento" className="block text-sm font-semibold text-gray-200">
              Fecha del Evento <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <CalendarDaysIcon className="w-5 h-5 text-green-400" />
              </div>
              <input
                type="date"
                id="fechaEvento"
                value={formData.fechaEvento}
                onChange={(e) => handleInputChange('fechaEvento', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-gradient-to-r from-[#1a1a1a] to-[#232323] border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer date-input-custom ${
                  errors.fechaEvento
                    ? 'border-red-500/50 focus:ring-red-500/50 bg-red-500/5'
                    : 'border-gray-600/50 focus:ring-green-500/50 focus:border-green-500/50'
                }`}
                style={{
                  colorScheme: 'dark'
                }}
              />
              {errors.fechaEvento && (
                <div className="absolute -bottom-6 left-0 flex items-center gap-2 text-red-400 text-sm">
                  <span className="text-xs">⚠️</span>
                  {errors.fechaEvento}
                </div>
              )}
            </div>
          </div>

          {/* Time */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-200">
              Hora del Evento <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
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
          <div className="space-y-3">
            <label htmlFor="descripcionEvento" className="block text-sm font-semibold text-gray-200">
              Descripción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="descripcionEvento"
              value={formData.descripcionEvento}
              onChange={(e) => handleInputChange('descripcionEvento', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#1a1a1a] to-[#232323] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 resize-none"
              placeholder="Describe tu evento (opcional)"
            />
          </div>

          {/* Session Type Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-semibold text-gray-200">
                Tipo de Evento
              </label>
              <button
                type="button"
                onClick={() => {
                  Swal.fire({
                    title: 'Tipos de Evento',
                    html: `
                      <div class="text-left space-y-4">
                        <div>
                          <h3 class="font-semibold text-blue-400 mb-2">📅 Evento Normal</h3>
                          <p class="text-sm text-gray-300">Un evento de calendario estándar sin funcionalidades de concentración. Solo recordatorios y organización básica.</p>
                        </div>
                        <div>
                          <h3 class="font-semibold text-purple-400 mb-2">🎯 Sesión de Concentración</h3>
                          <p class="text-sm text-gray-300">Una sesión programada con temporizador, métodos de estudio y música ambiental. Se integra con el sistema de concentración para maximizar la productividad.</p>
                        </div>
                      </div>
                    `,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#22C55E',
                    background: '#232323',
                    color: '#ffffff',
                    customClass: {
                      popup: 'rounded-2xl',
                    },
                  });
                }}
                className="p-1 rounded-full bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 hover:text-gray-300 transition-all duration-200 cursor-pointer"
                title="Información sobre tipos de evento"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#1a1a1a] to-[#232323] border border-gray-600/50 rounded-xl cursor-pointer hover:border-green-500/50 transition-all duration-200">
                <input
                  type="radio"
                  name="tipoEvento"
                  value="concentracion"
                  checked={formData.tipoEvento === 'concentracion'}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoEvento: e.target.value as 'concentracion' }))}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 focus:ring-green-500 focus:ring-2"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Sesión de Concentración</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Recomendado</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">Incluye temporizador, métodos de estudio y música ambiental</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#1a1a1a] to-[#232323] border border-gray-600/50 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all duration-200">
                <input
                  type="radio"
                  name="tipoEvento"
                  value="normal"
                  checked={formData.tipoEvento === 'normal'}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoEvento: e.target.value as 'normal' }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Evento Normal</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">Solo recordatorio de calendario básico</p>
                </div>
              </label>
            </div>
          </div>

          {/* Concentration Session Options */}
          {formData.tipoEvento === 'concentracion' && (
            <>
              {/* Method and Album Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent flex-1"></div>
                  <p className="text-sm text-gray-400 font-medium px-3">Configuración de concentración</p>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent flex-1"></div>
                </div>

                {/* Method Selection */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleAddMethod}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#1a1a1a]/70 to-[#232323]/70 border-2 border-dashed border-blue-500/30 rounded-xl text-left hover:border-blue-500/60 hover:bg-blue-500/5 transition-all duration-300 cursor-pointer group"
                    aria-haspopup="dialog"
                    aria-expanded={isMethodModalOpen}
                    aria-label="Seleccionar método de estudio"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-700/20 flex items-center justify-center group-hover:from-blue-600/30 group-hover:to-blue-700/30 transition-all duration-200 border border-blue-500/20">
                        <BookOpenIcon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white mb-1">
                          {selectedMethod ? selectedMethod.nombre_metodo : 'Seleccionar método'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {selectedMethod ? 'Método de estudio seleccionado' : 'Método de estudio (opcional)'}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Album Selection */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleAddAlbum}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#1a1a1a]/70 to-[#232323]/70 border-2 border-dashed border-purple-500/30 rounded-xl text-left hover:border-purple-500/60 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer group"
                    aria-haspopup="dialog"
                    aria-expanded={isAlbumModalOpen}
                    aria-label="Seleccionar álbum de música"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-700/20 flex items-center justify-center group-hover:from-purple-600/30 group-hover:to-purple-700/30 transition-all duration-200 border border-purple-500/20">
                        <MusicalNoteIcon className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white mb-1">
                          {selectedAlbum ? selectedAlbum.nombre_album : 'Seleccionar álbum'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {selectedAlbum ? 'Álbum de música seleccionado' : 'Música de fondo (opcional)'}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Selected Items Display */}
                {(selectedMethod || selectedAlbum) && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-3">
                      {selectedMethod && (
                        <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
                            <BookOpenIcon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-white">{selectedMethod.nombre_metodo}</span>
                          <button
                            type="button"
                            onClick={handleRemoveMethod}
                            className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-1 hover:bg-red-500/20 rounded-lg"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {selectedAlbum && (
                        <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center">
                            <MusicalNoteIcon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-white">{selectedAlbum.nombre_album}</span>
                          <button
                            type="button"
                            onClick={handleRemoveAlbum}
                            className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-1 hover:bg-red-500/20 rounded-lg"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </form>
        </Scrollbar>

        {/* Modal Footer */}
        <div className="flex gap-4 p-8 border-t border-green-500/20 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-600/20 to-gray-700/20 hover:from-gray-600/30 hover:to-gray-700/30 border border-gray-500/30 hover:border-gray-500/50 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-105 shadow-lg hover:shadow-green-500/25"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando...</span>
              </>
            ) : (
              <>
                <CalendarDaysIcon className="w-5 h-5" />
                <span>Crear Evento</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modals de selección */}
      <MethodSelectionModal
        isOpen={isMethodModalOpen}
        onClose={() => setIsMethodModalOpen(false)}
        onSelect={handleMethodSelect}
        selectedMethod={selectedMethod}
      />

      <AlbumSelectionModal
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        onSelect={handleAlbumSelect}
        selectedAlbum={selectedAlbum}
      />

    </div>
  );
};

export default CreateEventModal;
