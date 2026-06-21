import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

// Browser/client-side Supabase client. Uses the public anon key only —
// never expose the service role key here.
//
// Lazily created so a missing env var doesn't throw at import time (e.g.
// during a build before secrets are configured).
export function getSupabaseClient(): SupabaseClient {
  if (cached) return cached;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase env vars are not set (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).'
    );
  }

  cached = createClient(supabaseUrl, supabaseAnonKey);
  return cached;
}
