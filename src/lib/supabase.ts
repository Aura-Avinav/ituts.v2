import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Auth tokens are stored in localStorage (Supabase default) for persistent login.
// XSS is mitigated by the strict Content-Security-Policy headers in vercel.json.
// Supabase Row-Level Security (RLS) policies ensure tokens only grant access to
// the authenticated user's own data — even if a token were stolen, an attacker
// cannot access other users' data.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
