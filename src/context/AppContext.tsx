import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Document, Role } from '@/types';
import { mockDocuments, mockUsers } from '@/data/mockData';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  documents: Document[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  setUserRole: (role: Role) => void;
  addDocuments: (docs: Document[]) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocuments: (ids: string[]) => void;
  moveDocumentsToFolder: (documentIds: string[], folderId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  useEffect(() => {
    // Check for stored auth state
    const storedUser = localStorage.getItem('docbox_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock authentication - accept any password
    const foundUser = mockUsers.find(u => u.email === email) || {
      id: 'new-user',
      email,
      name: email.split('@')[0],
      role: 'staff' as Role,
    };
    
    setUser(foundUser);
    localStorage.setItem('docbox_user', JSON.stringify(foundUser));
    return true;
  };

  const signup = async (email: string, _password: string, name: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'staff',
    };
    
    setUser(newUser);
    localStorage.setItem('docbox_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('docbox_user');
  };

  const setUserRole = (role: Role) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('docbox_user', JSON.stringify(updatedUser));
    }
  };

  const addDocuments = (docs: Document[]) => {
    setDocuments(prev => [...docs, ...prev]);
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => 
      prev.map(doc => doc.id === id ? { ...doc, ...updates } : doc)
    );
  };

  const deleteDocuments = (ids: string[]) => {
    setDocuments(prev => prev.filter(doc => !ids.includes(doc.id)));
  };

  const moveDocumentsToFolder = (documentIds: string[], folderId: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        documentIds.includes(doc.id)
          ? { ...doc, folderId: folderId === 'all' ? undefined : folderId }
          : doc
      )
    );
  };

  return (
    <AppContext.Provider value={{
      user,
      isAuthenticated: !!user,
      documents,
      login,
      signup,
      logout,
      setUserRole,
      addDocuments,
      updateDocument,
      deleteDocuments,
      moveDocumentsToFolder,
    }}>
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
