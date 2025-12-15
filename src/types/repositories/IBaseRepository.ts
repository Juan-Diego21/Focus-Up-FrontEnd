// Interfaz base para repositorios
export interface IBaseRepository<T, TCreate, TUpdate> {
  // Métodos CRUD básicos
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: TCreate): Promise<T>;
  update(id: number, data: TUpdate): Promise<T | null>;
  delete(id: number): Promise<boolean>;

  // Métodos de consulta adicionales
  exists(id: number): Promise<boolean>;
  count(): Promise<number>;
}