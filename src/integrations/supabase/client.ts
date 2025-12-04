import { createClient } from '@supabase/supabase-js';

interface ImportMetaEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  // add other env variables here as needed
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Fallback para valores padrão se não existirem
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Criar cliente com configuração que não bloqueia a aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});