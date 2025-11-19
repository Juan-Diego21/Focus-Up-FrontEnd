import { apiClient } from "./apiClient";
import type { Album, Song } from "../types/api";

// Endpoints base para música
const MUSIC_BASE = "/musica";

/**
 * Obtiene todos los álbumes disponibles
 */
export const getAlbums = async (): Promise<Album[]> => {
  const response = await apiClient.get(`${MUSIC_BASE}/albums`);
  return response.data || [];
};

/**
 * Obtiene un álbum específico por ID
 */
export const getAlbumById = async (id: number): Promise<Album | null> => {
  const response = await apiClient.get(`${MUSIC_BASE}/albums/${id}`);
  return response.data || null;
};

/**
 * Obtiene álbumes por nombre (búsqueda)
 */
export const getAlbumsByName = async (name: string): Promise<Album[]> => {
  const response = await apiClient.get(`${MUSIC_BASE}/albums/nombre/${encodeURIComponent(name)}`);
  return response.data || [];
};

/**
 * Obtiene todas las canciones disponibles
 */
export const getSongs = async (): Promise<Song[]> => {
  const response = await apiClient.get(MUSIC_BASE);
  return response.data || [];
};

/**
 * Obtiene una canción específica por ID
 */
export const getSongById = async (id: number): Promise<Song | null> => {
  const response = await apiClient.get(`${MUSIC_BASE}/${id}`);
  return response.data || null;
};

/**
 * Obtiene canciones por nombre (búsqueda)
 */
export const getSongsByName = async (name: string): Promise<Song[]> => {
  const response = await apiClient.get(`${MUSIC_BASE}/nombre/${encodeURIComponent(name)}`);
  return response.data || [];
};

/**
 * Filtra canciones por ID de álbum (utilidad del lado cliente)
 */
export const getSongsByAlbumId = (songs: Song[], albumId: number): Song[] => {
  return songs.filter(song => song.id_album === albumId);
};