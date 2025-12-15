// Interfaz que representa un álbum de música
export interface IAlbum {
  /** ID único del álbum */
  id_album: number;
  /** Nombre del álbum */
  nombre_album: string;
  /** Género musical */
  genero: string;
  /** Descripción del álbum */
  descripcion: string;
  /** URL de la imagen del álbum (opcional) */
  url_imagen?: string;
}