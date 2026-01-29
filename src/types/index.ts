export type Role = 'admin' | 'staff';

export type DocumentSource = 'manual_upload' | 'scan_to_email' | 'gmail' | 'outlook' | 'whatsapp';

export type DocumentStatus = 'parsed' | 'needs_review' | 'processing';

export type NotificationType = 'document_sync' | 'document_upload' | 'share' | 'whatsapp' | 'system';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
}

export interface Document {
  id: string;
  filename: string;
  title: string;
  uploadDate: Date;
  uploader: string;
  uploaderId: string;
  source: DocumentSource;
  status: DocumentStatus;
  tags: string[];
  category?: string;
  folderId?: string;
  fileSize: number;
  fileType: string;
  aiSummary?: string;
  extractedFields?: Record<string, string>;
  previewUrl?: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'email' | 'cloud_storage' | 'scanner' | 'messaging';
  status: 'connected' | 'not_connected';
  description: string;
  icon: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  actionUrl?: string;
}

export interface NotificationSettings {
  documentSync: { email: boolean; inApp: boolean };
  documentUpload: { email: boolean; inApp: boolean };
  shares: { email: boolean; inApp: boolean };
  whatsappMessages: { email: boolean; inApp: boolean };
  systemUpdates: { email: boolean; inApp: boolean };
}

export interface DocumentFilters {
  search: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags: string[];
  source?: DocumentSource;
  status?: DocumentStatus;
}
