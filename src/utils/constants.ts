export const API_BASE_URL = "/api/v1";
export const API_ENDPOINTS = {
  HEALTH: "/health",
  USERS: "/users",
  LOGIN: "/users/login",
  PROFILE: "/users/profile",
  DELETE_ACCOUNT: "/users/delete",
  REQUEST_PASSWORD_RESET: "/users/request-password-reset",
  RESET_PASSWORD_WITH_CODE: "/users/reset-password-with-code",
  STUDY_METHODS: "/metodos-estudio",
  BENEFITS: "/beneficios",
  EVENTS: "/eventos",
} as const;
