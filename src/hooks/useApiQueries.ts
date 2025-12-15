// Hooks personalizados que usan React Query para llamadas a API
// Reemplazan la lógica manual de fetching con caché inteligente
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IUser, IAlbum, ISong, IMethod, ISession } from '../types';

// Keys para queries (para invalidación consistente)
export const queryKeys = {
  user: ['user'] as const,
  albums: ['albums'] as const,
  album: (id: number) => ['albums', id] as const,
  songs: (albumId: number) => ['albums', albumId, 'songs'] as const,
  methods: ['methods'] as const,
  sessions: ['sessions'] as const,
  session: (id: string) => ['sessions', id] as const,
};

// Hook para obtener perfil de usuario
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: async (): Promise<IUser> => {
      const response = await fetch('/api/v1/users/profile');
      if (!response.ok) {
        throw new Error('Error al obtener perfil de usuario');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para actualizar perfil de usuario con optimistic updates
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<IUser>): Promise<IUser> => {
      const response = await fetch('/api/v1/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar perfil');
      }

      return response.json();
    },
    // Optimistic update: actualizar UI inmediatamente
    onMutate: async (newUserData) => {
      // Cancelar queries pendientes para evitar sobrescritura
      await queryClient.cancelQueries({ queryKey: queryKeys.user });

      // Snapshot del estado anterior para rollback en caso de error
      const previousUser = queryClient.getQueryData(queryKeys.user);

      // Optimistic update: aplicar cambios inmediatamente en UI
      queryClient.setQueryData(queryKeys.user, (oldUser: IUser | undefined) => {
        if (!oldUser) return oldUser;
        return { ...oldUser, ...newUserData };
      });

      // Retornar contexto para rollback si es necesario
      return { previousUser };
    },
    // En caso de error, hacer rollback
    onError: (_err, _newUserData, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.user, context.previousUser);
      }
    },
    // Siempre refetch después para asegurar consistencia
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
};

// Hook para obtener álbumes
export const useAlbums = () => {
  return useQuery({
    queryKey: queryKeys.albums,
    queryFn: async (): Promise<IAlbum[]> => {
      const response = await fetch('/api/v1/albums');
      if (!response.ok) {
        throw new Error('Error al obtener álbumes');
      }
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutos (datos relativamente estáticos)
  });
};

// Hook para obtener canciones de un álbum
export const useAlbumSongs = (albumId: number) => {
  return useQuery({
    queryKey: queryKeys.songs(albumId),
    queryFn: async (): Promise<ISong[]> => {
      const response = await fetch(`/api/v1/albums/${albumId}/songs`);
      if (!response.ok) {
        throw new Error('Error al obtener canciones del álbum');
      }
      return response.json();
    },
    enabled: !!albumId, // Solo ejecutar si hay albumId
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener métodos de estudio
export const useStudyMethods = () => {
  return useQuery({
    queryKey: queryKeys.methods,
    queryFn: async (): Promise<IMethod[]> => {
      const response = await fetch('/api/v1/methods');
      if (!response.ok) {
        throw new Error('Error al obtener métodos de estudio');
      }
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutos (muy estáticos)
  });
};

// Hook para obtener sesiones del usuario
export const useUserSessions = () => {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: async (): Promise<ISession[]> => {
      const response = await fetch('/api/v1/sessions');
      if (!response.ok) {
        throw new Error('Error al obtener sesiones');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para crear sesión
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: {
      title?: string;
      description?: string;
      type: 'rapid' | 'scheduled';
      eventId?: number;
      methodId?: number;
      albumId?: number;
    }): Promise<ISession> => {
      const response = await fetch('/api/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error('Error al crear sesión');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar lista de sesiones para refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
};

// Hook para actualizar sesión
export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      updates
    }: {
      sessionId: string;
      updates: Partial<ISession>
    }): Promise<ISession> => {
      const response = await fetch(`/api/v1/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar sesión');
      }

      return response.json();
    },
    onSuccess: (updatedSession) => {
      // Actualizar sesión específica en cache
      queryClient.setQueryData(
        queryKeys.session(updatedSession.idSesion.toString()),
        updatedSession
      );

      // Invalidar lista de sesiones
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
};