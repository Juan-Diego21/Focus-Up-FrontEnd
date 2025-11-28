export const API_BASE_URL = "/api/v1";
export const API_ENDPOINTS = {
  HEALTH: "/health",
  USERS: "/users",
  LOGIN: "/users/login",
  LOGOUT: "/users/logout",
  PROFILE: "/users/profile",
  DELETE_ACCOUNT: "/users/delete",
  CHECK_USERNAME: "/users/check-username",
  REQUEST_PASSWORD_RESET: "/users/request-password-reset",
  RESET_PASSWORD_WITH_CODE: "/users/reset-password-with-code",
  // Nuevos endpoints para el flujo de registro de dos pasos según el contrato del backend
  REQUEST_VERIFICATION_CODE: "/auth/request-verification-code",
  VERIFY_CODE: "/auth/verify-code",
  REGISTER: "/auth/register",
  STUDY_METHODS: "/metodos-estudio",
  STUDY_METHODS_DETAILS: "/bibliotecametodosestudio",
  BENEFITS: "/beneficios",
  EVENTS: "/eventos",
  REPORTS: "/reports",
  ACTIVE_METHODS: "/reports/active-methods",
  METHOD_PROGRESS: "/reports/methods",
  SESSION_PROGRESS: "/reports/sessions",
  NOTIFICATIONS_PREFERENCES: "/notificaciones/preferencias",
  NOTIFICATIONS_SCHEDULED: "/notificaciones/programadas",
  // Endpoints de sesiones
  SESSIONS: "/sessions",
  SESSION_BY_ID: "/sessions/:id",
  SESSION_PAUSE: "/sessions/:id/pause",
  SESSION_RESUME: "/sessions/:id/resume",
  SESSION_FINISH_LATER: "/sessions/:id/finish-later",
  SESSION_COMPLETE: "/sessions/:id/complete",
  // Albums para sesiones
  ALBUMS: "/albumes",
  // Música endpoints
  MUSIC_ALBUMS: "/musica/albums",
} as const;
