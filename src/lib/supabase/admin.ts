
import { createClient } from '@supabase/supabase-js';

/**
 * Super-user Supabase client using Service Role Key.
 * ONLY for server-side administrative operations.
 * Bypasses RLS (Row Level Security).
 */
export const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase admin credentials missing (URL or SERVICE_ROLE_KEY)');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
