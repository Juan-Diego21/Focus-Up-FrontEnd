import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/user";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // Verificar token llamando al endpoint de perfil
          const userProfile = await apiClient.get(API_ENDPOINTS.PROFILE, {
            headers: { Authorization: `Bearer ${token}` },
          }) as User;
          setUser(userProfile);
        } catch {
          // Token inválido, limpiar almacenamiento
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.LOGIN,
        credentials
      ) as AuthResponse;

      const { token: newToken, user: userData } = response;

      // Guardar token en localStorage
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      // Transform data to match backend expectations
      const payload = {
        nombre_usuario: userData.nombre_usuario,
        correo: userData.correo,
        contrasena: userData.password,
        fecha_nacimiento: userData.fecha_nacimiento.toISOString().split('T')[0], // YYYY-MM-DD
        pais: userData.pais || undefined,
        genero: userData.genero || undefined,
      };

      const response = await apiClient.post(
        API_ENDPOINTS.USERS,
        payload
      ) as AuthResponse;

      const { token: newToken, user: userDataResponse } = response;

      // Guardar token en localStorage
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userDataResponse);
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
