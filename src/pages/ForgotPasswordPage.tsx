import React, { useState } from "react";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Lógica para enviar código de verificación
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/forgot-password-code";
    }, 1000);
  };

  return (
    <div className="bg-[#171717] min-h-screen flex items-center justify-center p-5">
      <img
        src="/img/Back.png"
        alt="Volver atrás"
        className="absolute mt-5 ml-5 w-6 h-6 top-2.5 left-2.5 cursor-pointer"
        onClick={() => window.history.back()}
      />

      <div className="w-full max-w-md px-5">
        <div className="bg-[#232323] p-8 rounded-xl shadow-lg text-center">
          <img
            src="/img/Logo.png"
            alt="Logo de Focus Up"
            className="w-72 mx-auto pb-10"
          />

          <form className="space-y-5" onSubmit={handleSubmit}>
            <p className="text-[#fffffff3] text-center mb-10 text-[18px] font-medium">
              Ingresa el correo electrónico asociado a tu cuenta
            </p>

            <div>
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="block w-full bg-[#0690cf] text-white py-3 rounded-lg font-medium hover:bg-[#068fcf9a] transition-colors text-center cursor-pointer disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Continuar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;