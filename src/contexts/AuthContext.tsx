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
  logout: () => Promise<void>;
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
        const storedUserData = localStorage.getItem("userData");

        // Intentar restaurar datos de usuario desde localStorage
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData) as User;
            // Validar que el usuario tenga ID válido
            if (parsedUserData && parsedUserData.id_usuario) {
              setUser(parsedUserData);
            } else {
              // Limpiar datos inválidos si falta ID de usuario
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              localStorage.removeItem("userData");
              setToken(null);
              setUser(null);
            }
          } catch {
            // Limpiar datos inválidos si falla el parseo
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userData");
            setToken(null);
            setUser(null);
          }
        } else {
          // Limpiar token si no hay datos de usuario almacenados
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  // Función para iniciar sesión del usuario
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      // Transformar credenciales para coincidir con expectativas del backend
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.correo);

      const payload = isEmail
        ? { correo: credentials.correo, contrasena: credentials.password }
        : { nombre_usuario: credentials.correo, contrasena: credentials.password };

      const response = await apiClient.post(API_ENDPOINTS.LOGIN, payload) as AuthResponse;

      if (response.success && response.token && response.user) {
        const newToken = response.token;
        const userData = response.user;

        // Validar que el usuario tenga ID válido
        if (!userData.id_usuario) {
          throw new Error("ID de usuario inválido en la respuesta");
        }

        // Almacenar token, ID de usuario y datos completos en localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("userId", userData.id_usuario.toString());
        localStorage.setItem("userData", JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);

        // Redirigir al dashboard después del login exitoso
        window.location.href = "/dashboard";
      } else {
        throw new Error(response.message || "Inicio de sesión fallido");
      }
    } catch {
      throw new Error("Error al iniciar sesión");
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      // Transformar datos para coincidir con expectativas del backend
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

        // Guardar token en localStorage
        localStorage.setItem("token", newToken);
        setToken(newToken);

        // Usuario registrado exitosamente, redirigir a la siguiente página
        // Los datos del usuario se obtendrán desde el login posterior
      } else {
        throw new Error(response.message || "Registro fallido");
      }
    } catch (error: unknown) {
      const apiError = error as { message?: string };
      throw new Error(apiError.message || "Error al registrar usuario");
    }
  };

  // Función para cerrar sesión del usuario
  const logout = async (): Promise<void> => {
    try {
      // Verificar si hay una sesión activa y finalizarla antes del logout
      const activeSessionData = localStorage.getItem("focusup:activeSession");
      if (activeSessionData) {
        try {
          const activeSession = JSON.parse(activeSessionData);
          if (activeSession && activeSession.sessionId) {
            // Intentar finalizar la sesión como "terminar más tarde"
            console.log("Finalizando sesión activa antes del logout:", activeSession.sessionId);
            // Nota: No podemos usar el sessionService aquí porque requiere el contexto de sesión
            // La sesión se mantendrá en estado "pending" y podrá reanudarse después del login
          }
        } catch (sessionError) {
          console.warn("Error al procesar sesión activa durante logout:", sessionError);
        }
      }

      // Obtener token actual para la solicitud de logout
      const currentToken = localStorage.getItem("token");

      if (currentToken) {
        // Realizar solicitud POST al endpoint de logout del backend con timeout
        const logoutPromise = apiClient.post(API_ENDPOINTS.LOGOUT, {}, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        // Agregar timeout de 5 segundos para evitar que el logout se quede colgado
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Logout timeout')), 5000);
        });

        await Promise.race([logoutPromise, timeoutPromise]);
      }
    } catch (error) {
      // En caso de error (token expirado o inválido), continuar con el logout local
      console.warn("Error al hacer logout en el backend:", error);
    } finally {
      // Limpiar datos locales independientemente del resultado de la API
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userData");
      // Nota: Mantener la sesión activa en localStorage para que pueda reanudarse después del login
      setToken(null);
      setUser(null);

      // Redirigir al login después del logout
      window.location.href = "/login";
    }
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

// Hook personalizado para acceder al contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
