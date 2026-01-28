import { createContext, useContext, useState, ReactNode } from 'react';

export interface Folder {
  id: string;
  name: string;
  icon: string;
  isSystem: boolean;
  documentCount: number;
}

interface FolderContextType {
  folders: Folder[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  addFolder: (name: string) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
}

const defaultFolders: Folder[] = [
  { id: 'all', name: 'All Documents', icon: 'FileText', isSystem: true, documentCount: 0 },
  { id: 'invoices', name: 'Invoices', icon: 'Receipt', isSystem: true, documentCount: 12 },
  { id: 'contracts', name: 'Contracts', icon: 'FileCheck', isSystem: true, documentCount: 8 },
  { id: 'reports', name: 'Reports', icon: 'BarChart3', isSystem: true, documentCount: 15 },
  { id: 'receipts', name: 'Receipts', icon: 'FileText', isSystem: true, documentCount: 23 },
];

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export function FolderProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>(() => {
    const stored = localStorage.getItem('docbox_folders');
    return stored ? JSON.parse(stored) : defaultFolders;
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('all');

  const saveFolders = (newFolders: Folder[]) => {
    setFolders(newFolders);
    localStorage.setItem('docbox_folders', JSON.stringify(newFolders));
  };

  const addFolder = (name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      icon: 'Folder',
      isSystem: false,
      documentCount: 0,
    };
    saveFolders([...folders, newFolder]);
  };

  const renameFolder = (id: string, name: string) => {
    saveFolders(folders.map(f => f.id === id ? { ...f, name } : f));
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
