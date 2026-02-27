import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Document, Role, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapSupabaseUser, ProfileRow } from '@/integrations/supabase/api';
import { queryKeys } from '@/lib/queryKeys';
import {
  useLoginMutation,
  useLogoutMutation,
  useProfileQuery,
  useSessionQuery,
  useSetRoleMutation,
  useUpdateProfileMutation,
} from '@/hooks/queries/useAuthQueries';
import {
  useAddDocumentsMutation,
  useDeleteDocumentsMutation,
  useDocumentsQuery,
  useMoveDocumentsToFolderMutation,
  useRestoreDocumentsMutation,
  useToggleStarDocumentMutation,
  useTrashDocumentsMutation,
  useUpdateDocumentMutation,
} from '@/hooks/queries/useDocumentQueries';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  documents: Document[];
  starredDocuments: Document[];
  trashedDocuments: Document[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUserRole: (role: Role) => Promise<void>;
  updateProfile: (fullName: string) => Promise<boolean>;
  addDocuments: (docs: Document[]) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocuments: (ids: string[]) => Promise<void>;
  moveDocumentsToFolder: (documentIds: string[], folderId: string) => Promise<void>;
  toggleStarDocument: (id: string) => Promise<void>;
  trashDocuments: (ids: string[]) => Promise<void>;
  restoreDocuments: (ids: string[]) => Promise<void>;
  permanentlyDeleteDocuments: (ids: string[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const sessionQuery = useSessionQuery();
  const authUser = sessionQuery.data?.user || null;

  const profileQuery = useProfileQuery(authUser?.id);

  const user = authUser ? mapSupabaseUser(authUser, (profileQuery.data as ProfileRow | null) || null) : null;

  const documentsQuery = useDocumentsQuery(user);
  const allDocuments = documentsQuery.data || [];

  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const setRoleMutation = useSetRoleMutation(user?.id);
  const updateProfileMutation = useUpdateProfileMutation(user?.id);

  const addDocumentsMutation = useAddDocumentsMutation(user?.id);
  const updateDocumentMutation = useUpdateDocumentMutation();
  const deleteDocumentsMutation = useDeleteDocumentsMutation();
  const moveDocumentsMutation = useMoveDocumentsToFolderMutation();
  const toggleStarMutation = useToggleStarDocumentMutation();
  const trashDocumentsMutation = useTrashDocumentsMutation();
  const restoreDocumentsMutation = useRestoreDocumentsMutation();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      queryClient.setQueryData(queryKeys.auth.session(), session);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`documents-live-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, async () => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const signup = async (_email: string, _password: string, _name: string): Promise<boolean> => {
    console.warn('Signup is disabled. Accounts are admin-created.');
    return false;
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const setUserRole = async (role: Role) => {
    try {
      await setRoleMutation.mutateAsync(role);
    } catch (error) {
      console.error('Failed to update role', error);
    }
  };

  const updateProfile = async (fullName: string): Promise<boolean> => {
    const sanitizedName = fullName.trim();
    if (!sanitizedName) return false;

    try {
      await updateProfileMutation.mutateAsync(sanitizedName);
      return true;
    } catch (error) {
      console.error('Failed to update profile', error);
      return false;
    }
  };

  const addDocuments = async (docs: Document[]) => {
    try {
      await addDocumentsMutation.mutateAsync(docs);
    } catch (error) {
      console.error('Failed to add documents', error);
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      await updateDocumentMutation.mutateAsync({ id, updates });
    } catch (error) {
      console.error('Failed to update document', error);
    }
  };

  const deleteDocuments = async (ids: string[]) => {
    try {
      await deleteDocumentsMutation.mutateAsync(ids);
    } catch (error) {
      console.error('Failed to delete documents', error);
    }
  };

  const moveDocumentsToFolder = async (documentIds: string[], folderId: string) => {
    try {
      await moveDocumentsMutation.mutateAsync({ documentIds, folderId });
    } catch (error) {
      console.error('Failed to move documents', error);
    }
  };

  const toggleStarDocument = async (id: string) => {
    const doc = allDocuments.find((item) => item.id === id);
    if (!doc) return;

    try {
      await toggleStarMutation.mutateAsync({ id, isStarred: !!doc.isStarred });
    } catch (error) {
      console.error('Failed to toggle star', error);
    }
  };

  const trashDocuments = async (ids: string[]) => {
    try {
      await trashDocumentsMutation.mutateAsync(ids);
    } catch (error) {
      console.error('Failed to trash documents', error);
    }
  };

  const restoreDocuments = async (ids: string[]) => {
    try {
      await restoreDocumentsMutation.mutateAsync(ids);
    } catch (error) {
      console.error('Failed to restore documents', error);
    }
  };

  const permanentlyDeleteDocuments = async (ids: string[]) => {
    await deleteDocuments(ids);
  };

  const documents = allDocuments.filter((doc) => !doc.isTrashed);
  const starredDocuments = allDocuments.filter((doc) => doc.isStarred && !doc.isTrashed);
  const trashedDocuments = allDocuments.filter((doc) => doc.isTrashed);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthLoading: sessionQuery.isLoading,
        documents,
        starredDocuments,
        trashedDocuments,
        login,
        signup,
        logout,
        setUserRole,
        updateProfile,
        addDocuments,
        updateDocument,
        deleteDocuments,
        moveDocumentsToFolder,
        toggleStarDocument,
        trashDocuments,
        restoreDocuments,
        permanentlyDeleteDocuments,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
