import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/user";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS, API_BASE_URL } from "../utils/constants";

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
        const storedUserId = localStorage.getItem("userId");
        const storedUserData = localStorage.getItem("userData");

        try {
          console.log("🔍 Verifying stored token...");
          console.log("🌐 Profile URL:", `${API_BASE_URL}${API_ENDPOINTS.PROFILE}`);
          console.log("🔑 Token:", token?.substring(0, 20) + "...");

          // Verificar token llamando al endpoint de perfil
          const userProfile = await apiClient.get(API_ENDPOINTS.PROFILE, {
            headers: { Authorization: `Bearer ${token}` },
          }) as User;
          console.log("✅ Token verified, user profile loaded:", userProfile);

          // Ensure userId is present and valid
          if (userProfile && userProfile.id_usuario) {
            setUser(userProfile);
            // Update stored user data with fresh profile data
            localStorage.setItem("userData", JSON.stringify(userProfile));
            console.log("👤 User set with ID:", userProfile.id_usuario);
          } else {
            console.error("❌ User profile missing id_usuario");
            // Clear invalid token
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userData");
            setToken(null);
            setUser(null);
          }
        } catch (error: any) {
          console.error("❌ Token verification failed:", error);
          console.error("📊 Error response:", error?.response?.data);
          console.error("📊 Error status:", error?.response?.status);

          // Try to restore user data from localStorage as fallback
          if (storedUserData) {
            try {
              const parsedUserData = JSON.parse(storedUserData) as User;
              console.log("🔄 Restoring user data from localStorage:", parsedUserData);
              setUser(parsedUserData);
              console.log("✅ User data restored from localStorage");
            } catch (parseError) {
              console.error("❌ Failed to parse stored user data:", parseError);
              // Fallback to basic user with stored userId
              if (storedUserId) {
                console.log("🔄 Creating fallback user with stored userId:", storedUserId);
                setUser({
                  id_usuario: parseInt(storedUserId),
                  nombre_usuario: "Usuario",
                  correo: "usuario@ejemplo.com",
                  fecha_nacimiento: new Date(),
                });
                console.log("✅ Fallback user created with stored userId");
              } else {
                // Clear invalid data
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("userData");
                setToken(null);
                setUser(null);
                console.log("🧹 Cleared invalid token and user data");
              }
            }
          } else if (storedUserId) {
            // No stored user data, but have userId - create basic user
            console.log("🔄 Creating fallback user with stored userId:", storedUserId);
            setUser({
              id_usuario: parseInt(storedUserId),
              nombre_usuario: "Usuario",
              correo: "usuario@ejemplo.com",
              fecha_nacimiento: new Date(),
            });
            console.log("✅ Fallback user created with stored userId");
          } else {
            // Clear invalid token and user data
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userData");
            setToken(null);
            setUser(null);
            console.log("🧹 Cleared invalid token and user data");
          }
        }
      } else {
        console.log("ℹ️ No stored token found");
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      // Transform credentials to match backend expectations
      // Backend expects: "correo" for email, "nombre_usuario" for username, "contrasena" for password
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.correo);

      const payload = isEmail
        ? { correo: credentials.correo, contrasena: credentials.password }
        : { nombre_usuario: credentials.correo, contrasena: credentials.password };

      console.log("🔍 Login attempt:");
      console.log("📧 Input:", credentials.correo);
      console.log("📝 Is Email:", isEmail);
      console.log("📦 Payload being sent:", payload);

      // Use axios consistently with the rest of the application
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, payload) as AuthResponse;

      console.log("✅ Login response:", response);

      if (response.success && response.token && response.user) {
        const newToken = response.token;
        const userData = response.user;

        // Validar que el usuario tenga id_usuario válido
        if (!userData.id_usuario) {
          throw {
            message: "ID de usuario inválido",
            statusCode: 400,
            error: "Invalid user ID in response",
          };
        }

        // Store token, userId, and complete user data in localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("userId", userData.id_usuario.toString());
        localStorage.setItem("userData", JSON.stringify(userData));
        setToken(newToken);

        // Set user data directly from login response
        console.log("👤 Setting user from login response:", userData);
        setUser(userData);

        console.log("🎉 Login successful, token and user data saved");

        // Redirect to dashboard after successful login
        window.location.href = "/dashboard";
      } else {
        throw {
          message: response.message || "Login failed",
          statusCode: 400,
          error: "Authentication failed",
        };
      }
    } catch (error: any) {
      console.error("❌ Login failed:");
      console.error("🔍 Error details:", error);
      console.error("📊 Error response:", error?.response?.data);
      console.error("📊 Error status:", error?.response?.status);
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

      if (response.success && response.token) {
        const newToken = response.token;

        // Guardar token en localStorage
        localStorage.setItem("token", newToken);
        setToken(newToken);

        // Fetch user profile after registration
        try {
          const userProfile = await apiClient.get(API_ENDPOINTS.PROFILE, {
            headers: { Authorization: `Bearer ${newToken}` },
          }) as User;
          setUser(userProfile);
        } catch (profileError) {
          console.error("Failed to fetch user profile after registration:", profileError);
          setUser(null);
        }
      } else {
        throw {
          message: response.message || "Registration failed",
          statusCode: 400,
          error: "Registration failed",
        };
      }
    } catch (error) {
      throw error;
    }
  };

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
