// Interfaz para repositorio de usuarios
import type { IUser } from '../domain/auth';
import type { IBaseRepository } from './IBaseRepository';

export interface IUserRepository extends IBaseRepository<
  IUser,
  Omit<IUser, 'id_usuario'>,
  Partial<Omit<IUser, 'id_usuario'>>
> {
  // Métodos específicos de usuarios
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  updatePassword(userId: number, hashedPassword: string): Promise<boolean>;
  updateLastLogin(userId: number): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
}