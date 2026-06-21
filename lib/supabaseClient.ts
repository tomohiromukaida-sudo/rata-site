import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser/client-side Supabase client. Uses the public anon key only —
// never expose the service role key here.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
