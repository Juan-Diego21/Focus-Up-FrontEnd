// Tipos para campos de formulario
export interface IFormField {
  /** Nombre del campo */
  name: string;
  /** Tipo del campo */
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  /** Etiqueta del campo */
  label: string;
  /** Placeholder */
  placeholder?: string;
  /** Valor por defecto */
  defaultValue?: any;
  /** Indica si es requerido */
  required?: boolean;
  /** Opciones para select */
  options?: { value: string; label: string }[];
  /** Validación personalizada */
  validation?: (value: any) => string | null;
}

export interface IFormFields {
  [key: string]: IFormField;
}