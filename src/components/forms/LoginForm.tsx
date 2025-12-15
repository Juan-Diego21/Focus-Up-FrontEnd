// Componente de formulario de login usando React Hook Form + Zod
// Ejemplo de formulario performante con validación automática
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../lib/validationSchemas';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
    mode: 'onChange', // Validación en tiempo real
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        identifier: data.identifier,
        password: data.password,
      });

      reset(); // Limpiar formulario en éxito
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al iniciar sesión';
      onError?.(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campo de identificador (email o username) */}
      <FormField
        label="Email o nombre de usuario"
        error={errors.identifier?.message}
      >
        <Input
          {...register('identifier')}
          placeholder="Ingresa tu email o nombre de usuario"
          disabled={isSubmitting}
          autoComplete="username"
        />
      </FormField>

      {/* Campo de contraseña */}
      <FormField
        label="Contraseña"
        error={errors.password?.message}
      >
        <Input
          type="password"
          {...register('password')}
          placeholder="Ingresa tu contraseña"
          disabled={isSubmitting}
          autoComplete="current-password"
        />
      </FormField>

      {/* Botón de submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting || isLoading}
        disabled={isSubmitting || isLoading}
        className="w-full"
      >
        {isSubmitting || isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
    </form>
  );
};