import React, { useState, useRef } from "react";

export const ForgotPasswordCodePage: React.FC = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Manejar cambios en los inputs del código
  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Solo permitir un dígito por input

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Mover al siguiente input automáticamente
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejar teclas de navegación
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      alert("Por favor ingresa el código completo de 6 dígitos");
      return;
    }

    setLoading(true);

    // Guardar el código en localStorage para usarlo en el siguiente paso
    localStorage.setItem("resetCode", fullCode);

    // Redirigir al siguiente paso
    window.location.href = "/forgot-password-reset";
  };

  return (
    <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center p-5">
      <button
        onClick={() => window.history.back()}
        className="absolute top-5 left-5 p-2 bg-none cursor-pointer"
        aria-label="Volver atrás"
      >
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="w-full max-w-md px-5">
        <div className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md p-8 rounded-xl shadow-2xl text-center border border-[#333]/50">
          <img
            src="/img/Logo.png"
            alt="Logo de Focus Up"
            className="w-48 mx-auto pb-6"
          />

          <form className="space-y-6" onSubmit={handleSubmit}>
            <p className="text-gray-100 text-center mb-8 text-lg font-medium">
              Hemos enviado un código de verificación a tu correo para poder restablecer tu contraseña
            </p>

            <div className="flex justify-center gap-2 mb-8">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value.replace(/[^0-9]/g, ""))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl border-2 border-blue-500 rounded-lg bg-[#232323] text-white focus:outline-none focus:border-white"
                  maxLength={1}
                  required
                  aria-label={`Dígito ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? "Verificando..." : "Continuar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordCodePage;
