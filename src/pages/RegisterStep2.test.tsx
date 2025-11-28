import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterStep2 } from "./RegisterStep2";
import { apiClient } from "../utils/apiClient";

// Mock de las dependencias
vi.mock("../utils/apiClient");
vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: { password: "testpassword" } }),
}));

const mockApiClient = apiClient as any;

describe("RegisterStep2", () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    vi.clearAllMocks();

    // Configurar datos en localStorage
    localStorage.setItem("focusup:register:email", "test@example.com");
    localStorage.setItem("focusup:register:username", "testuser");
  });

  it("debe renderizar el formulario de verificación de código", () => {
    render(
      <BrowserRouter>
        <RegisterStep2 />
      </BrowserRouter>
    );

    expect(screen.getByText(/Hemos enviado un código/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Verificar y Registrarme/i })).toBeInTheDocument();
  });

  it("debe mostrar error si el código no tiene 6 dígitos", async () => {
    render(
      <BrowserRouter>
        <RegisterStep2 />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole("button", { name: /Verificar y Registrarme/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Por favor ingresa el código completo de 6 dígitos")).toBeInTheDocument();
    });
  });

  it("debe completar el registro exitosamente", async () => {
    mockApiClient.post.mockResolvedValueOnce({}); // verify-code
    mockApiClient.post.mockResolvedValueOnce({}); // register

    render(
      <BrowserRouter>
        <RegisterStep2 />
      </BrowserRouter>
    );

    // Ingresar código de 6 dígitos
    const inputs = screen.getAllByDisplayValue("");
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: (index + 1).toString() } });
    });

    const submitButton = screen.getByRole("button", { name: /Verificar y Registrarme/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith("/api/v1/auth/verify-code", {
        email: "test@example.com",
        codigo: "123456",
      });
      expect(mockApiClient.post).toHaveBeenCalledWith("/api/v1/auth/register", {
        email: "test@example.com",
        username: "testuser",
        password: "testpassword",
      });
    });

    // Verificar que se limpió localStorage
    expect(localStorage.getItem("focusup:register:email")).toBeNull();
    expect(localStorage.getItem("focusup:register:username")).toBeNull();
    expect(localStorage.getItem("focusup:firstLogin")).toBe("true");
  });
});