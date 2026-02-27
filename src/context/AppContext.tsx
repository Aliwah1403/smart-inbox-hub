import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Document, Role, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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

type DocumentRow = {
  id: string;
  filename: string;
  title: string;
  upload_date: string;
  uploader_id: string;
  source: Document['source'];
  status: Document['status'];
  tags: string[] | null;
  category: string | null;
  folder_id: string | null;
  file_size: number;
  file_type: string;
  ai_summary: string | null;
  extracted_fields: Record<string, string> | null;
  storage_path: string | null;
  preview_url: string | null;
  is_starred: boolean | null;
  is_trashed: boolean | null;
  trashed_at: string | null;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function mapSupabaseUser(authUser: SupabaseUser, profile: { full_name: string | null; role: Role | null } | null): User {
  const email = authUser.email || '';
  const fallbackName = email.includes('@') ? email.split('@')[0] : 'User';

  return {
    id: authUser.id,
    email,
    name: profile?.full_name || fallbackName,
    role: profile?.role || 'staff',
  };
}

function mapDocumentRow(row: DocumentRow, currentUser: User | null): Document {
  const fallbackUploader = row.uploader_id === currentUser?.id ? currentUser.name : 'Team Member';

  return {
    id: row.id,
    filename: row.filename,
    title: row.title,
    uploadDate: new Date(row.upload_date),
    uploader: fallbackUploader,
    uploaderId: row.uploader_id,
    source: row.source,
    status: row.status,
    tags: row.tags || [],
    category: row.category || undefined,
    folderId: row.folder_id || undefined,
    fileSize: row.file_size,
    fileType: row.file_type,
    aiSummary: row.ai_summary || undefined,
    extractedFields: row.extracted_fields || undefined,
    storagePath: row.storage_path || undefined,
    previewUrl: row.preview_url || undefined,
    isStarred: row.is_starred || false,
    isTrashed: row.is_trashed || false,
    trashedAt: row.trashed_at ? new Date(row.trashed_at) : undefined,
  };
}

function mapDocumentUpdates(updates: Partial<Document>) {
  const payload: Record<string, unknown> = {};

  if (updates.filename !== undefined) payload.filename = updates.filename;
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.uploadDate !== undefined) payload.upload_date = updates.uploadDate.toISOString();
  if (updates.source !== undefined) payload.source = updates.source;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.category !== undefined) payload.category = updates.category || null;
  if (updates.folderId !== undefined) payload.folder_id = updates.folderId || null;
  if (updates.fileSize !== undefined) payload.file_size = updates.fileSize;
  if (updates.fileType !== undefined) payload.file_type = updates.fileType;
  if (updates.aiSummary !== undefined) payload.ai_summary = updates.aiSummary || null;
  if (updates.extractedFields !== undefined) payload.extracted_fields = updates.extractedFields || null;
  if (updates.storagePath !== undefined) payload.storage_path = updates.storagePath || null;
  if (updates.previewUrl !== undefined) payload.preview_url = updates.previewUrl || null;
  if (updates.isStarred !== undefined) payload.is_starred = updates.isStarred;
  if (updates.isTrashed !== undefined) payload.is_trashed = updates.isTrashed;
  if (updates.trashedAt !== undefined) payload.trashed_at = updates.trashedAt ? updates.trashedAt.toISOString() : null;

  return payload;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const resolveUploaderNames = useCallback(async (rows: DocumentRow[]) => {
    const uploaderIds = Array.from(new Set(rows.map((row) => row.uploader_id).filter(Boolean)));
    if (uploaderIds.length === 0) {
      return new Map<string, string>();
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', uploaderIds);

    if (error) {
      // If RLS is restrictive, fallback labels are used.
      return new Map<string, string>();
    }

    const nameMap = new Map<string, string>();
    for (const profile of data || []) {
      if (profile.id && profile.full_name) {
        nameMap.set(profile.id, profile.full_name);
      }
    }
    return nameMap;
  }, []);

  const loadDocuments = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setAllDocuments([]);
      return;
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('Failed to load documents', error.message);
      return;
    }

    const rows = (data || []) as DocumentRow[];
    const uploaderNameMap = await resolveUploaderNames(rows);
    const mapped = rows.map((row) => {
      const doc = mapDocumentRow(row, currentUser);
      if (row.uploader_id === currentUser.id) {
        doc.uploader = currentUser.name;
      } else if (uploaderNameMap.has(row.uploader_id)) {
        doc.uploader = uploaderNameMap.get(row.uploader_id)!;
      }
      return doc;
    });
    setAllDocuments(mapped);
  }, [resolveUploaderNames]);

  const resolveUserFromSession = useCallback(async (session: Session | null): Promise<User | null> => {
    const authUser = session?.user;
    if (!authUser) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      console.warn('Failed to load profile, using defaults:', error.message);
    }

    return mapSupabaseUser(
      authUser,
      (profile as { full_name: string | null; role: Role | null } | null) || null,
    );
  }, []);

  useEffect(() => {
    let mounted = true;

    const syncSession = async (session: Session | null) => {
      const resolvedUser = await resolveUserFromSession(session);
      if (!mounted) return;

      setUser(resolvedUser);
      await loadDocuments(resolvedUser);
      if (mounted) {
        setIsAuthLoading(false);
      }
    };

    supabase.auth
      .getSession()
      .then(({ data }) => syncSession(data.session))
      .catch((error) => {
        console.error('Failed to read auth session', error);
        if (mounted) setIsAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadDocuments, resolveUserFromSession]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`documents-live-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        async () => {
          await loadDocuments(user);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadDocuments]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login failed:', error.message);
      return false;
    }
    return true;
  };

  const signup = async (_email: string, _password: string, _name: string): Promise<boolean> => {
    console.warn('Signup is disabled. Accounts are admin-created.');
    return false;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
    }
  };

  const setUserRole = async (role: Role) => {
    if (!user) return;

    const { error } = await supabase.from('profiles').update({ role }).eq('id', user.id);
    if (error) {
      console.error('Failed to update role', error.message);
      return;
    }

    setUser((prev) => (prev ? { ...prev, role } : prev));
  };

  const updateProfile = async (fullName: string): Promise<boolean> => {
    if (!user) return false;

    const sanitizedName = fullName.trim();
    if (!sanitizedName) return false;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: sanitizedName })
      .eq('id', user.id);

    if (error) {
      console.error('Failed to update profile', error.message);
      return false;
    }

    const nextUser = { ...user, name: sanitizedName };
    setUser(nextUser);
    await loadDocuments(nextUser);
    return true;
  };

  const addDocuments = async (docs: Document[]) => {
    if (!user || docs.length === 0) return;

    const payload = docs.map((doc) => ({
      filename: doc.filename,
      title: doc.title,
      upload_date: (doc.uploadDate || new Date()).toISOString(),
      uploader_id: user.id,
      source: doc.source,
      status: doc.status,
      tags: doc.tags || [],
      category: doc.category || null,
      folder_id: doc.folderId || null,
      file_size: doc.fileSize,
      file_type: doc.fileType || 'application/octet-stream',
      ai_summary: doc.aiSummary || null,
      extracted_fields: doc.extractedFields || null,
      storage_path: doc.storagePath || null,
      preview_url: doc.previewUrl || null,
      is_starred: doc.isStarred || false,
      is_trashed: doc.isTrashed || false,
      trashed_at: doc.trashedAt ? doc.trashedAt.toISOString() : null,
    }));

    const { error } = await supabase.from('documents').insert(payload);
    if (error) {
      console.error('Failed to add documents', error.message);
      return;
    }

    await loadDocuments(user);
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    const payload = mapDocumentUpdates(updates);
    if (Object.keys(payload).length === 0 || !user) return;

    const { error } = await supabase.from('documents').update(payload).eq('id', id);
    if (error) {
      console.error('Failed to update document', error.message);
      return;
    }

    await loadDocuments(user);
  };

  const deleteDocuments = async (ids: string[]) => {
    if (!user || ids.length === 0) return;

    const { error } = await supabase.from('documents').delete().in('id', ids);
    if (error) {
      console.error('Failed to delete documents', error.message);
      return;
    }

    await loadDocuments(user);
  };

  const moveDocumentsToFolder = async (documentIds: string[], folderId: string) => {
    if (!user || documentIds.length === 0) return;

    const { error } = await supabase
      .from('documents')
      .update({ folder_id: folderId === 'all' ? null : folderId })
      .in('id', documentIds);

    if (error) {
      console.error('Failed to move documents', error.message);
      return;
    }

    await loadDocuments(user);
  };

  const toggleStarDocument = async (id: string) => {
    if (!user) return;

    const document = allDocuments.find((doc) => doc.id === id);
    if (!document) return;

    const { error } = await supabase
      .from('documents')
      .update({ is_starred: !document.isStarred })
      .eq('id', id);

    if (error) {
      console.error('Failed to toggle star', error.message);
      return;
    }

    await loadDocuments(user);
  };

  const trashDocuments = async (ids: string[]) => {
    if (!user || ids.length === 0) return;

    const { error } = await supabase
      .from('documents')
      .update({
        is_trashed: true,
        is_starred: false,
        trashed_at: new Date().toISOString(),
      })
      .in('id', ids);

    if (error) {
      console.error('Failed to trash documents', error.message);
      return;
    }

    await loadDocuments(user);
  };

  const restoreDocuments = async (ids: string[]) => {
    if (!user || ids.length === 0) return;

    const { error } = await supabase
      .from('documents')
      .update({
        is_trashed: false,
        trashed_at: null,
      })
      .in('id', ids);

    if (error) {
      console.error('Failed to restore documents', error.message);
      return;
    }

    await loadDocuments(user);
  };

  const permanentlyDeleteDocuments = async (ids: string[]) => {
    await deleteDocuments(ids);
  };

  const activeDocuments = useMemo(() => allDocuments.filter((doc) => !doc.isTrashed), [allDocuments]);
  const starredDocuments = useMemo(
    () => allDocuments.filter((doc) => doc.isStarred && !doc.isTrashed),
    [allDocuments],
  );
  const trashedDocuments = useMemo(() => allDocuments.filter((doc) => doc.isTrashed), [allDocuments]);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthLoading,
        documents: activeDocuments,
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
