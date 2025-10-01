import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, loading, user, token } = useAuth();

  console.log("🔐 RequireAuth check:");
  console.log("⏳ Loading:", loading);
  console.log("🔑 Token exists:", !!token);
  console.log("👤 User exists:", !!user);
  console.log("✅ Is authenticated:", isAuthenticated);

  if (loading) {
    console.log("⏳ Showing loading spinner...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("❌ User not authenticated, showing login required...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso requerido
          </h1>
          <p className="text-gray-600 mb-4">
            Debes iniciar sesión para acceder a esta página.
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al login
          </a>
        </div>
      </div>
    );
  }

  console.log("✅ User authenticated, rendering protected content...");
  return <>{children}</>;
};
