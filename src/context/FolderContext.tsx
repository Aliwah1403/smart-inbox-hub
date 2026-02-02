import { createContext, useContext, useState, ReactNode } from 'react';

export type FolderColor = 'blue' | 'pink' | 'yellow' | 'red' | 'green' | 'purple' | 'orange' | 'teal';

export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: FolderColor;
  isSystem: boolean;
  documentCount: number;
  createdAt: Date;
  isQuickAccess?: boolean;
  isTrashed?: boolean;
}

interface FolderContextType {
  folders: Folder[];
  trashedFolders: Folder[];
  quickAccessFolders: Folder[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  addFolder: (name: string, color?: FolderColor) => void;
  renameFolder: (id: string, name: string) => void;
  updateFolderColor: (id: string, color: FolderColor) => void;
  deleteFolder: (id: string) => void;
  restoreFolder: (id: string) => void;
  permanentlyDeleteFolder: (id: string) => void;
  toggleQuickAccess: (id: string) => void;
}

const defaultFolders: Folder[] = [
  { id: 'all', name: 'All Documents', icon: 'FileText', color: 'blue', isSystem: true, documentCount: 0, createdAt: new Date('2024-01-01'), isQuickAccess: true },
  { id: 'invoices', name: 'Invoices', icon: 'Receipt', color: 'green', isSystem: true, documentCount: 12, createdAt: new Date('2024-01-01') },
  { id: 'contracts', name: 'Contracts', icon: 'FileCheck', color: 'purple', isSystem: true, documentCount: 8, createdAt: new Date('2024-01-01') },
  { id: 'reports', name: 'Reports', icon: 'BarChart3', color: 'orange', isSystem: true, documentCount: 15, createdAt: new Date('2024-01-01') },
  { id: 'receipts', name: 'Receipts', icon: 'FileText', color: 'pink', isSystem: true, documentCount: 23, createdAt: new Date('2024-01-01') },
];

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export function FolderProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>(() => {
    const stored = localStorage.getItem('docbox_folders');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((f: Folder) => ({
        ...f,
        color: f.color || 'blue',
        createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
        isQuickAccess: f.isQuickAccess ?? false,
        isTrashed: f.isTrashed ?? false,
      }));
    }
    return defaultFolders;
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('all');

  const saveFolders = (newFolders: Folder[]) => {
    setFolders(newFolders);
    localStorage.setItem('docbox_folders', JSON.stringify(newFolders));
  };

  const activeFolders = folders.filter(f => !f.isTrashed);
  const trashedFolders = folders.filter(f => f.isTrashed);
  const quickAccessFolders = folders.filter(f => f.isQuickAccess && !f.isTrashed);

  const addFolder = (name: string, color: FolderColor = 'blue') => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      icon: 'Folder',
      color,
      isSystem: false,
      documentCount: 0,
      createdAt: new Date(),
      isQuickAccess: false,
      isTrashed: false,
    };
    saveFolders([...folders, newFolder]);
  };

  const renameFolder = (id: string, name: string) => {
    saveFolders(folders.map(f => f.id === id ? { ...f, name } : f));
  };

  const updateFolderColor = (id: string, color: FolderColor) => {
    saveFolders(folders.map(f => f.id === id ? { ...f, color } : f));
  };

  const deleteFolder = (id: string) => {
    // Move to trash instead of permanent delete
    saveFolders(folders.map(f => f.id === id ? { ...f, isTrashed: true, isQuickAccess: false } : f));
    if (selectedFolderId === id) {
      setSelectedFolderId('all');
    }
  };

  const restoreFolder = (id: string) => {
    saveFolders(folders.map(f => f.id === id ? { ...f, isTrashed: false } : f));
  };

  const permanentlyDeleteFolder = (id: string) => {
    saveFolders(folders.filter(f => f.id !== id));
  };

  const toggleQuickAccess = (id: string) => {
    saveFolders(folders.map(f => f.id === id ? { ...f, isQuickAccess: !f.isQuickAccess } : f));
  };

  return (
    <FolderContext.Provider value={{
      folders: activeFolders,
      trashedFolders,
      quickAccessFolders,
      selectedFolderId,
      setSelectedFolderId,
      addFolder,
      renameFolder,
      updateFolderColor,
      deleteFolder,
      restoreFolder,
      permanentlyDeleteFolder,
      toggleQuickAccess,
    }}>
      {children}
    </FolderContext.Provider>
  );
}

export function useFolders() {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error('useFolders must be used within a FolderProvider');
  }
  return context;
}
