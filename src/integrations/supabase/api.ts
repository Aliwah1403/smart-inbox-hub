import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Document, Role, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export type ProfileRow = {
  id: string;
  full_name: string | null;
  role: Role | null;
};

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

export function mapSupabaseUser(authUser: SupabaseUser, profile: ProfileRow | null): User {
  const email = authUser.email || '';
  const fallbackName = email.includes('@') ? email.split('@')[0] : 'User';

  return {
    id: authUser.id,
    email,
    name: profile?.full_name || fallbackName,
    role: profile?.role || 'staff',
  };
}

function mapDocumentRow(row: DocumentRow, currentUser: User | null, uploaderNameMap: Map<string, string>): Document {
  let uploader = 'Team Member';

  if (currentUser && row.uploader_id === currentUser.id) {
    uploader = currentUser.name;
  } else if (uploaderNameMap.has(row.uploader_id)) {
    uploader = uploaderNameMap.get(row.uploader_id)!;
  }

  return {
    id: row.id,
    filename: row.filename,
    title: row.title,
    uploadDate: new Date(row.upload_date),
    uploader,
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

export function mapDocumentUpdates(updates: Partial<Document>) {
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

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as ProfileRow | null) || null;
}

async function getUploaderNames(uploaderIds: string[]): Promise<Map<string, string>> {
  if (uploaderIds.length === 0) return new Map<string, string>();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', uploaderIds);

  if (error) {
    return new Map<string, string>();
  }

  const map = new Map<string, string>();
  for (const row of data || []) {
    if (row.id && row.full_name) {
      map.set(row.id, row.full_name);
    }
  }
  return map;
}

export async function getDocuments(currentUser: User | null): Promise<Document[]> {
  if (!currentUser) return [];

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('upload_date', { ascending: false });

  if (error) throw error;

  const rows = (data || []) as DocumentRow[];
  const uploaderIds = Array.from(new Set(rows.map((row) => row.uploader_id).filter(Boolean)));
  const uploaderNameMap = await getUploaderNames(uploaderIds);

  return rows.map((row) => mapDocumentRow(row, currentUser, uploaderNameMap));
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function upsertProfileName(userId: string, fullName: string) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, full_name: fullName }, { onConflict: 'id' });

  if (error) throw error;
}

export async function upsertProfileRole(userId: string, role: Role) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, role }, { onConflict: 'id' });

  if (error) throw error;
}

export async function insertDocuments(userId: string, docs: Document[]) {
  if (docs.length === 0) return;

  const payload = docs.map((doc) => ({
    filename: doc.filename,
    title: doc.title,
    upload_date: (doc.uploadDate || new Date()).toISOString(),
    uploader_id: userId,
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
  if (error) throw error;
}

export async function patchDocument(id: string, updates: Partial<Document>) {
  const payload = mapDocumentUpdates(updates);
  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase.from('documents').update(payload).eq('id', id);
  if (error) throw error;
}

export async function removeDocuments(ids: string[]) {
  if (ids.length === 0) return;
  const { error } = await supabase.from('documents').delete().in('id', ids);
  if (error) throw error;
}

export async function bulkPatchDocuments(ids: string[], updates: Record<string, unknown>) {
  if (ids.length === 0) return;
  const { error } = await supabase.from('documents').update(updates).in('id', ids);
  if (error) throw error;
}
