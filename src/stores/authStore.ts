// Store de Zustand para gestión de autenticación
// Reemplaza AuthContext con mejor performance y persistencia
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser, ILoginRequest, IRegisterRequest } from '../types/domain/auth';

interface AuthState {
  // Estado de autenticación
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Acciones
  login: (credentials: ILoginRequest) => Promise<void>;
  register: (userData: IRegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<IUser>) => Promise<void>;
  refreshToken: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Login
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            throw new Error('Credenciales inválidas');
          }

          const data = await response.json();

          if (data.success) {
            set({
              user: data.data.user,
              token: data.data.token,
              isAuthenticated: true,
              isLoading: false,
            });

            // Guardar token en localStorage para interceptores
            localStorage.setItem('token', data.data.token);
          } else {
            throw new Error(data.message || 'Error en login');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Registro
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            throw new Error('Error en registro');
          }

          const data = await response.json();

          if (data.success) {
            // Después del registro, hacer login automático
            await get().login({
              identifier: userData.correo,
              password: userData.contrasena,
            });
          } else {
            throw new Error(data.message || 'Error en registro');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Actualizar perfil
      updateProfile: async (userData) => {
        const { token } = get();
        if (!token) throw new Error('No autenticado');

        set({ isLoading: true });
        try {
          const response = await fetch('/api/v1/users', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            throw new Error('Error actualizando perfil');
          }

          const data = await response.json();

          if (data.success) {
            set((state) => ({
              user: { ...state.user!, ...data.data },
              isLoading: false,
            }));
          } else {
            throw new Error(data.message || 'Error actualizando perfil');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Refresh token (para mantener sesión activa)
      refreshToken: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set({ token: data.data.token });
              localStorage.setItem('token', data.data.token);
            }
          }
        } catch (error) {
          // Si falla refresh, hacer logout
          get().logout();
        }
      },

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);