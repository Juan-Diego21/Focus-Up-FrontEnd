// Configuración para modales
export interface IModalConfig {
  /** Indica si el modal está abierto */
  isOpen: boolean;
  /** Título del modal */
  title: string;
  /** Contenido del modal */
  content?: React.ReactNode;
  /** Texto del botón de confirmación */
  confirmText?: string;
  /** Texto del botón de cancelación */
  cancelText?: string;
  /** Función al confirmar */
  onConfirm?: () => void;
  /** Función al cancelar */
  onCancel?: () => void;
  /** Indica si muestra el botón de cerrar */
  showCloseButton?: boolean;
  /** Tamaño del modal */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}