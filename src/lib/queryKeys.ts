export const queryKeys = {
  auth: {
    session: () => ['auth', 'session'] as const,
    profile: (userId?: string) => ['auth', 'profile', userId ?? 'none'] as const,
  },
  documents: {
    all: ['documents'] as const,
    list: (userId?: string) => ['documents', 'list', userId ?? 'none'] as const,
    trashed: (userId?: string) => ['documents', 'trashed', userId ?? 'none'] as const,
    byId: (id: string) => ['documents', 'byId', id] as const,
  },
};
