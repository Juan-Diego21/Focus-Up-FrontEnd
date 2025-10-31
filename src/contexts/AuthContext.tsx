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

  // ✅ Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        const storedUserId = localStorage.getItem("userId");
        const storedUserData = localStorage.getItem("userData");

        try {
          // ✅ Verificar token llamando al endpoint de perfil
          const userProfile = await apiClient.get(API_ENDPOINTS.PROFILE, {
            headers: { Authorization: `Bearer ${token}` },
          }) as User;

          // ✅ Validar que el perfil de usuario tenga ID válido
          if (userProfile && userProfile.id_usuario) {
            setUser(userProfile);
            // ✅ Actualizar datos de usuario almacenados con datos frescos del perfil
            localStorage.setItem("userData", JSON.stringify(userProfile));
          } else {
            // ✅ Limpiar token inválido si falta ID de usuario
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userData");
            setToken(null);
            setUser(null);
          }
        } catch {
          // ✅ Intentar restaurar datos de usuario desde localStorage como respaldo
          if (storedUserData) {
            try {
              const parsedUserData = JSON.parse(storedUserData) as User;
              setUser(parsedUserData);
            } catch {
              // ✅ Crear usuario básico con ID almacenado si falla el parseo
              if (storedUserId) {
                setUser({
                  id_usuario: parseInt(storedUserId),
                  nombre_usuario: "Usuario",
                  correo: "usuario@ejemplo.com",
                  fecha_nacimiento: new Date(),
                });
              } else {
                // ✅ Limpiar datos inválidos
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("userData");
                setToken(null);
                setUser(null);
              }
            }
          } else if (storedUserId) {
            // ✅ Crear usuario básico si no hay datos almacenados pero sí ID
            setUser({
              id_usuario: parseInt(storedUserId),
              nombre_usuario: "Usuario",
              correo: "usuario@ejemplo.com",
              fecha_nacimiento: new Date(),
            });
          } else {
            // ✅ Limpiar token y datos de usuario inválidos
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userData");
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  // ✅ Función para iniciar sesión del usuario
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      // ✅ Transformar credenciales para coincidir con expectativas del backend
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.correo);

      const payload = isEmail
        ? { correo: credentials.correo, contrasena: credentials.password }
        : { nombre_usuario: credentials.correo, contrasena: credentials.password };

      const response = await apiClient.post(API_ENDPOINTS.LOGIN, payload) as AuthResponse;

      if (response.success && response.token && response.user) {
        const newToken = response.token;
        const userData = response.user;

        // ✅ Validar que el usuario tenga ID válido
        if (!userData.id_usuario) {
          throw new Error("ID de usuario inválido en la respuesta");
        }

        // ✅ Almacenar token, ID de usuario y datos completos en localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("userId", userData.id_usuario.toString());
        localStorage.setItem("userData", JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);

        // ✅ Redirigir al dashboard después del login exitoso
        window.location.href = "/dashboard";
      } else {
        throw new Error(response.message || "Inicio de sesión fallido");
      }
    } catch {
      throw new Error("Error al iniciar sesión");
    }
  };

  // ✅ Función para registrar un nuevo usuario
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      // ✅ Transformar datos para coincidir con expectativas del backend
      const payload = {
        nombre_usuario: userData.nombre_usuario,
        correo: userData.correo,
        contrasena: userData.password,
        fecha_nacimiento: userData.fecha_nacimiento.toISOString().split('T')[0], // YYYY-MM-DD
        pais: userData.pais || undefined,
        genero: userData.genero || undefined,
      };

      const response = await apiClient.post(API_ENDPOINTS.USERS, payload) as AuthResponse;

      if (response.success && response.token) {
        const newToken = response.token;

        // ✅ Guardar token en localStorage
        localStorage.setItem("token", newToken);
        setToken(newToken);

        // ✅ Obtener perfil de usuario después del registro
        try {
          const userProfile = await apiClient.get(API_ENDPOINTS.PROFILE, {
            headers: { Authorization: `Bearer ${newToken}` },
          }) as User;
          setUser(userProfile);
        } catch {
          setUser(null);
        }
      } else {
        throw new Error(response.message || "Registro fallido");
      }
    } catch (error: unknown) {
      const apiError = error as { message?: string };
      throw new Error(apiError.message || "Error al registrar usuario");
    }
  };

  // ✅ Función para cerrar sesión del usuario
  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
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

// ✅ Hook personalizado para acceder al contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
