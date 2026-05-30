import 'server-only';

import { createClient } from '@supabase/supabase-js';

export class SupabaseAdminConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseAdminConfigError';
  }
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new SupabaseAdminConfigError('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.');
  }

  if (!supabaseServiceRoleKey) {
    throw new SupabaseAdminConfigError('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
