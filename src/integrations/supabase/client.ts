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

// Fallback para valores seguros
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.dummy';

// Criar cliente desabilitado se não houver credenciais reais
const hasValidCredentials = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: hasValidCredentials ? {} : { 'X-Client-Info': 'disabled' }
  }
});