import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Document, User } from '@/types';
import { bulkPatchDocuments, getDocuments, insertDocuments, patchDocument, removeDocuments } from '@/integrations/supabase/api';
import { queryKeys } from '@/lib/queryKeys';

export function useDocumentsQuery(currentUser: User | null) {
  return useQuery({
    queryKey: queryKeys.documents.list(currentUser?.id),
    queryFn: () => getDocuments(currentUser),
    enabled: !!currentUser,
  });
}

export function useAddDocumentsMutation(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docs: Document[]) => {
      if (!userId) throw new Error('Missing user id');
      return insertDocuments(userId, docs);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useUpdateDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Document> }) => patchDocument(id, updates),
    onSuccess: async (_data, vars) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.byId(vars.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useDeleteDocumentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => removeDocuments(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useMoveDocumentsToFolderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentIds, folderId }: { documentIds: string[]; folderId: string }) =>
      bulkPatchDocuments(documentIds, { folder_id: folderId === 'all' ? null : folderId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useToggleStarDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isStarred }: { id: string; isStarred: boolean }) =>
      patchDocument(id, { isStarred: !isStarred }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useTrashDocumentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      bulkPatchDocuments(ids, {
        is_trashed: true,
        is_starred: false,
        trashed_at: new Date().toISOString(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

export function useRestoreDocumentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      bulkPatchDocuments(ids, {
        is_trashed: false,
        trashed_at: null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}
