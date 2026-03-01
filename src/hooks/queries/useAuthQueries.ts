import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Role } from '@/types';
import { getProfile, getSession, signIn, signOut, upsertProfileName, upsertProfileRole } from '@/integrations/supabase/api';
import { queryKeys } from '@/lib/queryKeys';

export function useSessionQuery() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: getSession,
    initialData: null,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useProfileQuery(userId?: string) {
  return useQuery({
    queryKey: queryKeys.auth.profile(userId),
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signIn(email, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useUpdateProfileMutation(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fullName: string) => {
      if (!userId) throw new Error('Missing user id');
      return upsertProfileName(userId, fullName);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(userId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useSetRoleMutation(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: Role) => {
      if (!userId) throw new Error('Missing user id');
      return upsertProfileRole(userId, role);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(userId) });
    },
  });
}
