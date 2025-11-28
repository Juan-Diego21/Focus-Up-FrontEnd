import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterPage } from "./RegisterPage";
import { apiClient } from "../utils/apiClient";

// Mock de las dependencias
vi.mock("../utils/apiClient");
vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => vi.fn(),
}));

const mockApiClient = apiClient as any;

describe("RegisterPage", () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("debe renderizar el formulario de registro correctamente", () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Verificar que los campos principales estén presentes
    expect(screen.getByLabelText(/Nombre de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Siguiente/i })).toBeInTheDocument();
  });

  it("debe mostrar errores de validación para campos vacíos", async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole("button", { name: /Siguiente/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Todos los campos obligatorios deben estar completos.")).toBeInTheDocument();
    });
  });

  it("debe validar el formato del email", async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const submitButton = screen.getByRole("button", { name: /Siguiente/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Por favor ingresa un correo electrónico válido.")).toBeInTheDocument();
    });
  });

  it("debe validar que las contraseñas coincidan", async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "different123" } });

    const submitButton = screen.getByRole("button", { name: /Siguiente/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
    });
  });

  it("debe enviar la solicitud de verificación de código correctamente", async () => {
    mockApiClient.post.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), {
      target: { value: "Password123!" },
    });

    const submitButton = screen.getByRole("button", { name: /Siguiente/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith("/api/v1/auth/request-verification-code", {
        email: "test@example.com",
        password: "Password123!",
      });
    });

    // Verificar que los datos se guardaron en localStorage
    expect(localStorage.getItem("focusup:register:username")).toBe("testuser");
    expect(localStorage.getItem("focusup:register:email")).toBe("test@example.com");
  });

  it("debe manejar errores de la API correctamente", async () => {
    mockApiClient.post.mockRejectedValueOnce({
      response: { data: { error: "Error al enviar código" } },
    });

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), {
      target: { value: "Password123!" },
    });

    const submitButton = screen.getByRole("button", { name: /Siguiente/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Error al enviar código")).toBeInTheDocument();
    });
  });
});