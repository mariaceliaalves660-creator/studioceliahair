// Mock Supabase client - não faz requisições HTTP reais para evitar erro 401
// Retorna sempre respostas vazias/nulas de forma síncrona

const mockSupabaseClient = {
  from: (table: string) => ({
    select: (columns?: string) => Promise.resolve({ data: [], error: null }),
    insert: (data: any) => Promise.resolve({ data: null, error: null }),
    update: (data: any) => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    eq: (column: string, value: any) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      update: (data: any) => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signIn: (credentials: any) => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File) => Promise.resolve({ data: { path }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://mock-storage.local/${path}` } }),
      download: (path: string) => Promise.resolve({ data: null, error: null }),
      remove: (paths: string[]) => Promise.resolve({ data: null, error: null }),
    }),
  },
};

export const supabase = mockSupabaseClient as any;