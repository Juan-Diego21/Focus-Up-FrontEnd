// Interfaz para servicio de usuarios
import type { IUser } from '../domain/auth';

export interface IUserService {
  // Autenticación
  authenticate(email: string, password: string): Promise<{ user: IUser; token: string }>;
  register(userData: Omit<IUser, 'id_usuario'>): Promise<IUser>;
  logout(userId: number): Promise<void>;

  // Operaciones CRUD
  getUserById(userId: number): Promise<IUser | null>;
  updateUser(userId: number, updates: Partial<IUser>): Promise<IUser | null>;
  deleteUser(userId: number): Promise<boolean>;

  // Operaciones específicas
  changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean>;
  updateProfile(userId: number, profileData: Partial<IUser>): Promise<IUser>;
  getUserStats(userId: number): Promise<{
    totalSessions: number;
    totalTime: number;
    completedMethods: number;
  }>;

  // Validaciones
  isEmailAvailable(email: string): Promise<boolean>;
  isUsernameAvailable(username: string): Promise<boolean>;
  validateCredentials(email: string, password: string): Promise<boolean>;
}