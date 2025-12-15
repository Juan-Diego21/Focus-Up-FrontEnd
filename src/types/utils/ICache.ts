// Interfaz para sistema de caché
export interface ICache<T = any> {
  // Operaciones básicas
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;

  // Operaciones avanzadas
  getMany(keys: string[]): Promise<(T | null)[]>;
  setMany(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void>;
  deleteMany(keys: string[]): Promise<boolean[]>;
  getKeys(pattern?: string): Promise<string[]>;

  // Estadísticas y mantenimiento
  size(): Promise<number>;
  stats(): Promise<{
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
  }>;
}