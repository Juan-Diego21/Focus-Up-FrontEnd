/**
 * Utilidades de validación para formularios
 * Contiene expresiones regulares y funciones de validación reutilizables
 */

// Expresiones regulares para validación de campos
export const usernameRegex = /^[a-zA-Z0-9_-]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida un nombre de usuario según las reglas del sistema
 * @param username - El nombre de usuario a validar
 * @returns Mensaje de error o null si es válido
 */
export const validateUsername = (username: string): string | null => {
  if (username.length < 3) {
    return "El nombre de usuario debe tener al menos 3 caracteres";
  }
  if (!usernameRegex.test(username)) {
    return "El nombre de usuario solo puede contener letras, números, guion bajo y guion";
  }
  return null;
};

/**
 * Valida una contraseña según las reglas del sistema
 * @param password - La contraseña a validar
 * @returns Mensaje de error o null si es válida
 */
export const validatePassword = (password: string): string | null => {
  if (!passwordRegex.test(password)) {
    return "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números";
  }
  return null;
};

/**
 * Valida un correo electrónico
 * @param email - El correo electrónico a validar
 * @returns Mensaje de error o null si es válido
 */
export const validateEmail = (email: string): string | null => {
  if (!emailRegex.test(email)) {
    return "Por favor ingresa un correo electrónico válido";
  }
  return null;
};

/**
 * Valida una fecha de nacimiento
 * @param date - La fecha a validar
 * @returns Mensaje de error o null si es válida
 */
export const validateDateOfBirth = (date: Date): string | null => {
  const today = new Date();
  const minAge = 13; // Edad mínima razonable
  const maxAge = 120; // Edad máxima razonable

  if (date > today) {
    return "La fecha de nacimiento no puede ser en el futuro";
  }

  const age = today.getFullYear() - date.getFullYear();
  if (age < minAge) {
    return `Debes tener al menos ${minAge} años`;
  }

  if (age > maxAge) {
    return `La edad no puede ser mayor a ${maxAge} años`;
  }

  return null;
};
