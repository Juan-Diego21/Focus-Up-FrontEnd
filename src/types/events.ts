export interface IEvento {
  // Support both snake_case (database) and camelCase (API) naming conventions
  id_evento?: number;
  idEvento?: number;
  nombre_evento?: string;
  nombreEvento?: string;
  fecha_evento?: string;
  fechaEvento?: string;
  hora_evento?: string;
  horaEvento?: string;
  descripcion_evento?: string;
  descripcionEvento?: string;
  estado?: string | null; // "completado" | "pendiente" | null
  estado_evento?: string | null; // snake_case version
  id_usuario?: number;
  idUsuario?: number;
  id_metodo?: number;
  idMetodo?: number;
  id_album?: number;
  idAlbum?: number;
  fecha_creacion?: string;
  fechaCreacion?: string;
  fecha_actualizacion?: string;
  fechaActualizacion?: string;
  // Index signature for dynamic property access
  [key: string]: any;
}

export interface IEventoCreate {
  nombreEvento: string;       // Required - API expects camelCase
  fechaEvento: string;        // Required - ISO date string (YYYY-MM-DD)
  horaEvento: string;         // Required - HH:MM:SS format
  descripcionEvento?: string;
  idMetodo?: number;          // Optional - method association
  idAlbum?: number;           // Optional - album association
  // Note: id_usuario is extracted from JWT token, not sent in request body
}

export interface IEventoUpdate {
  nombre_evento?: string;
  fecha_evento?: string; // ISO date string (YYYY-MM-DD)
  hora_evento?: string;
  descripcion_evento?: string;
  estado?: string | null; // "completado" | "pendiente" | null
  id_metodo?: number;
  id_album?: number;
}

export interface IEventoStatusUpdate {
  estado: "completado" | "pendiente" | null;
}