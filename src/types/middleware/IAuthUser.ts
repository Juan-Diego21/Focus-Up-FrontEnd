// Interfaz para usuario autenticado en middleware
import type { IUser } from '../domain/auth';

export interface IAuthUser extends IUser {
  /** Token JWT del usuario */
  token?: string;
  /** Versión del token para invalidación */
  tokenVersion?: number;
  /** Timestamp de último login */
  lastLogin?: Date;
  /** Roles del usuario (si aplica) */
  roles?: string[];
  /** Permisos específicos */
  permissions?: string[];
}