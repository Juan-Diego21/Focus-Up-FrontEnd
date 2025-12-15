// Hooks personalizados para formularios usando React Hook Form + Zod
// Formularios performantes con validación automática
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  createSessionSchema,
  changePasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type UpdateProfileFormData,
  type CreateSessionFormData,
  type ChangePasswordFormData,
} from '../lib/validationSchemas';

// Hook para formulario de login
export const useLoginForm = () => {
  return useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
    mode: 'onChange', // Validación en tiempo real
  });
};

// Hook para formulario de registro
export const useRegisterForm = () => {
  return useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre_usuario: '',
      correo: '',
      contrasena: '',
      confirmarContrasena: '',
      fecha_nacimiento: undefined,
      pais: '',
      genero: undefined,
      horario_fav: '',
      intereses: [],
      distracciones: [],
    },
    mode: 'onChange',
  });
};

// Hook para formulario de actualización de perfil
export const useUpdateProfileForm = (initialData?: Partial<UpdateProfileFormData>) => {
  return useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      nombre_usuario: initialData?.nombre_usuario || '',
      correo: initialData?.correo || '',
      pais: initialData?.pais || '',
      genero: initialData?.genero,
      horario_fav: initialData?.horario_fav || '',
      intereses: initialData?.intereses || [],
      distracciones: initialData?.distracciones || [],
    },
    mode: 'onChange',
  });
};

// Hook para formulario de creación de sesión
export const useCreateSessionForm = () => {
  return useForm<CreateSessionFormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'rapid',
      methodId: undefined,
      albumId: undefined,
      eventId: undefined,
    },
    mode: 'onChange',
  });
};

// Hook para formulario de cambio de contraseña
export const useChangePasswordForm = () => {
  return useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'onChange',
  });
};