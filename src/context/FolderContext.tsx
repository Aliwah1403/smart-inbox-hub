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
}

interface FolderContextType {
  folders: Folder[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  addFolder: (name: string, color?: FolderColor) => void;
  renameFolder: (id: string, name: string) => void;
  updateFolderColor: (id: string, color: FolderColor) => void;
  deleteFolder: (id: string) => void;
}

const defaultFolders: Folder[] = [
  { id: 'all', name: 'All Documents', icon: 'FileText', color: 'blue', isSystem: true, documentCount: 0, createdAt: new Date('2024-01-01') },
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
      // Migrate old folders to include color and createdAt
      return parsed.map((f: Folder) => ({
        ...f,
        color: f.color || 'blue',
        createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
      }));
    }
    return defaultFolders;
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('all');

  const saveFolders = (newFolders: Folder[]) => {
    setFolders(newFolders);
    localStorage.setItem('docbox_folders', JSON.stringify(newFolders));
  };

  const addFolder = (name: string, color: FolderColor = 'blue') => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      icon: 'Folder',
      color,
      isSystem: false,
      documentCount: 0,
      createdAt: new Date(),
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
    saveFolders(folders.filter(f => f.id !== id));
    if (selectedFolderId === id) {
      setSelectedFolderId('all');
    }
  };

  return (
    <FolderContext.Provider value={{
      folders,
      selectedFolderId,
      setSelectedFolderId,
      addFolder,
      renameFolder,
      updateFolderColor,
      deleteFolder,
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
