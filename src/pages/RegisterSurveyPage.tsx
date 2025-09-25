import React from "react";

export const RegisterSurveyPage: React.FC = () => {
  return (
    <div className="bg-[#171717] min-h-screen flex items-center justify-center font-inter p-5">
      <img
        src="/img/Back.png"
        alt="Volver atrás"
        className="absolute mt-5 ml-5 w-6 h-6 top-2.5 left-2.5 cursor-pointer"
        onClick={() => window.history.back()}
      />

      <div className="w-full max-w-md px-5">
        <div className="bg-[#232323] p-8 rounded-xl shadow-lg text-center">
          {/* Logo */}
          <img
            src="/img/Logo.png"
            alt="Logo de Focus Up"
            className="w-72 mx-auto pb-0"
          />

          <h1 className="text-[20px] font-semibold m-4 text-white pb-3">
            ¡Para mejorar tu experiencia nos gustaría que nos ayudaras llenando
            la siguiente encuesta!
          </h1>

          {/* Botones */}
          <div className="flex justify-around">
            {/* Botón Continuar */}
            <a
              href="/register-survey-full"
              className="w-30 px-7 bg-[#0690cf] text-white py-3 rounded-lg font-medium hover:bg-[#068fcf9a] transition cursor-pointer text-center block"
            >
              Continuar
            </a>

            {/* Botón Saltar */}
            <a
              href="/dashboard"
              className="w-30 px-7 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition cursor-pointer text-center block"
            >
              No, gracias
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RegisterSurveyPage;