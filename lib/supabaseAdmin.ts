import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

// Server-only Supabase client using the service role key. Bypasses Row Level
// Security — call this only from server components or API routes, never
// from client components.
//
// Lazily created (not at module load) so that builds without the Supabase
// env vars configured (e.g. a fresh Vercel project before secrets are set)
// don't fail at build time — the error only surfaces if this is actually
// called at request time without the env vars present.
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase env vars are not set (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).'
    );
  }

  cached = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return cached;
}
