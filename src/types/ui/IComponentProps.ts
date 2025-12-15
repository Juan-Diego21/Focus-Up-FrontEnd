// Tipos comunes para props de componentes
export interface IComponentProps {
  /** Clase CSS adicional */
  className?: string;
  /** ID del elemento */
  id?: string;
  /** Estilos inline */
  style?: React.CSSProperties;
  /** Hijos del componente */
  children?: React.ReactNode;
}