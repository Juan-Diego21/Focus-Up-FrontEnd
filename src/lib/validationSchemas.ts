// Schemas de validación con Zod para formularios
// Validaciones robustas y reutilizables para toda la aplicación
import { z } from 'zod';

// Schema para login
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'El email o nombre de usuario es requerido')
    .max(255, 'El identificador es demasiado largo'),

  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .max(255, 'La contraseña es demasiado larga'),
});

// Schema para registro
export const registerSchema = z.object({
  nombre_usuario: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario es demasiado largo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guion bajo y guion'),

  correo: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido')
    .max(255, 'El correo es demasiado largo'),

  contrasena: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(255, 'La contraseña es demasiado larga')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe incluir mayúsculas, minúsculas y números'
    ),

  confirmarContrasena: z
    .string()
    .min(1, 'Confirma tu contraseña'),

  fecha_nacimiento: z
    .date('La fecha de nacimiento es requerida')
    .refine((date) => {
      const today = new Date();
      const minAge = 13;
      const maxAge = 120;
      const age = today.getFullYear() - date.getFullYear();
      return age >= minAge && age <= maxAge;
    }, 'Debes tener entre 13 y 120 años'),

  pais: z
    .string()
    .optional(),

  genero: z
    .enum(['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'])
    .optional(),

  horario_fav: z
    .string()
    .optional(),

  intereses: z
    .array(z.number())
    .min(1, 'Selecciona al menos un interés')
    .max(10, 'No puedes seleccionar más de 10 intereses')
    .optional(),

  distracciones: z
    .array(z.number())
    .min(1, 'Selecciona al menos una distracción')
    .max(10, 'No puedes seleccionar más de 10 distracciones')
    .optional(),
}).refine((data) => data.contrasena === data.confirmarContrasena, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContrasena'],
});

// Schema para actualización de perfil
export const updateProfileSchema = z.object({
  nombre_usuario: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario es demasiado largo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guion bajo y guion')
    .optional(),

  correo: z
    .string()
    .email('Ingresa un correo electrónico válido')
    .max(255, 'El correo es demasiado largo')
    .optional(),

  pais: z
    .string()
    .optional(),

  genero: z
    .enum(['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'])
    .optional(),

  horario_fav: z
    .string()
    .optional(),

  intereses: z
    .array(z.number())
    .min(1, 'Selecciona al menos un interés')
    .max(10, 'No puedes seleccionar más de 10 intereses')
    .optional(),

  distracciones: z
    .array(z.number())
    .min(1, 'Selecciona al menos una distracción')
    .max(10, 'No puedes seleccionar más de 10 distracciones')
    .optional(),
});

// Schema para creación de sesión
export const createSessionSchema = z.object({
  title: z
    .string()
    .max(100, 'El título es demasiado largo')
    .optional(),

  description: z
    .string()
    .max(500, 'La descripción es demasiado larga')
    .optional(),

  type: z
    .enum(['rapid', 'scheduled'], {
      message: 'El tipo de sesión es requerido',
    }),

  methodId: z
    .number()
    .positive('ID de método inválido')
    .optional(),

  albumId: z
    .number()
    .positive('ID de álbum inválido')
    .optional(),

  eventId: z
    .number()
    .positive('ID de evento inválido')
    .optional(),
});

// Schema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'La contraseña actual es requerida'),

  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(255, 'La contraseña es demasiado larga')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe incluir mayúsculas, minúsculas y números'
    ),

  confirmNewPassword: z
    .string()
    .min(1, 'Confirma la nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
});

// Tipos inferidos de los schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type CreateSessionFormData = z.infer<typeof createSessionSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;