import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are provided
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Using localStorage fallback mode.');
  console.warn('To enable cloud sync, create a .env file with:');
  console.warn('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.warn('VITE_SUPABASE_ANON_KEY=your-anon-key');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// Helper to check if Supabase is enabled
export const isSupabaseEnabled = () => supabase !== null;