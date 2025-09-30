import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Focus Up</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Hola, {user?.nombre_usuario}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Bienvenido a Focus Up!
            </h2>
            <p className="text-gray-600">
              Esta es tu área personal. Aquí podrás gestionar tu productividad y
              concentración.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">Tu información</h3>
                <p>
                  <strong>Email:</strong> {user?.correo}
                </p>
                <p>
                  <strong>País:</strong> {user?.pais || "No especificado"}
                </p>
                <p>
                  <strong>Género:</strong> {user?.genero || "No especificado"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
