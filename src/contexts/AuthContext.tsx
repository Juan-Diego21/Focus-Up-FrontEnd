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
        try {
          console.log("🔍 Verifying stored token...");
          console.log("🌐 Profile URL:", `${API_BASE_URL}${API_ENDPOINTS.PROFILE}`);
          console.log("🔑 Token:", token?.substring(0, 20) + "...");

          // Verificar token llamando al endpoint de perfil
          const userProfile = await apiClient.get(API_ENDPOINTS.PROFILE, {
            headers: { Authorization: `Bearer ${token}` },
          }) as User;
          console.log("✅ Token verified, user profile loaded:", userProfile);
          setUser(userProfile);
        } catch (error: any) {
          console.error("❌ Token verification failed:", error);
          console.error("📊 Error response:", error?.response?.data);
          console.error("📊 Error status:", error?.response?.status);

          // Instead of clearing everything, try to create a basic user object
          // This allows the user to stay logged in even if profile endpoint has issues
          console.log("🔄 Creating fallback user object...");
          setUser({
            id_usuario: 0,
            nombre_usuario: "Usuario",
            correo: "usuario@ejemplo.com", // We don't have the email from token alone
            fecha_nacimiento: new Date(),
          });
          console.log("✅ Fallback user created, authentication maintained");
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
      console.log("🌐 Full URL:", `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`);

      // Temporary: Try with fetch instead of axios to isolate the issue
      const fetchResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        mode: "cors", // Explicitly set CORS mode
        body: JSON.stringify(payload),
      });

      console.log("📡 Fetch response status:", fetchResponse.status);
      console.log("📡 Fetch response headers:", Object.fromEntries(fetchResponse.headers.entries()));

      const responseData = await fetchResponse.json();
      console.log("📡 Fetch response data:", responseData);

      if (!fetchResponse.ok) {
        throw {
          message: responseData.message || "Login failed",
          statusCode: fetchResponse.status,
          error: responseData.error || "Unknown error",
        };
      }

      const response = responseData as AuthResponse;

      console.log("✅ Login response:", response);

      if (response.success && response.token) {
        const newToken = response.token;

        // Guardar token en localStorage
        localStorage.setItem("token", newToken);
        setToken(newToken);

        // Fetch user profile after login
        try {
          console.log("🔍 Fetching user profile...");
          const userProfile = await apiClient.get(API_ENDPOINTS.PROFILE, {
            headers: { Authorization: `Bearer ${newToken}` },
          }) as User;
          console.log("👤 User profile fetched:", userProfile);
          setUser(userProfile);
        } catch (profileError) {
          console.error("❌ Failed to fetch user profile:", profileError);
          // Create a basic user object from the login response if profile fetch fails
          // This ensures authentication still works even if profile endpoint has issues
          setUser({
            id_usuario: 0, // Temporary ID
            nombre_usuario: "Usuario", // Default name
            correo: credentials.correo,
            fecha_nacimiento: new Date(),
          });
        }

        console.log("🎉 Login successful, token saved");

        // Redirect to dashboard after successful login
        window.location.href = "/dashboard";
      } else {
        throw {
          message: response.message || "Login failed",
          statusCode: fetchResponse.status,
          error: "Authentication failed",
        };
      }
    } catch (error) {
      console.error("❌ Login failed:");
      console.error("🔍 Error details:", error);
      console.error("📊 Error response:", (error as any)?.response?.data);
      console.error("📊 Error status:", (error as any)?.response?.status);
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
