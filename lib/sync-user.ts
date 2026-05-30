import 'server-only';

import { currentUser } from '@clerk/nextjs/server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export class UserSyncDatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserSyncDatabaseError';
  }
}

export async function syncCurrentUserToDatabase() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const primaryEmail = user.primaryEmailAddress?.emailAddress ?? null;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
  const now = new Date().toISOString();
  const supabaseAdmin = createSupabaseAdminClient();

  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(
      {
        clerk_user_id: user.id,
        email: primaryEmail,
        first_name: user.firstName,
        last_name: user.lastName,
        full_name: user.fullName ?? fullName,
        image_url: user.imageUrl,
        updated_at: now,
        last_sign_in_at: now,
      },
      { onConflict: 'clerk_user_id' },
    )
    .select()
    .single();

  if (error) {
    const missingUsersTable =
      error.code === 'PGRST205' ||
      error.message.toLowerCase().includes("could not find the table 'public.users'");

    if (missingUsersTable) {
      throw new UserSyncDatabaseError('The public.users table does not exist in Supabase yet. Run the users migration SQL in your Supabase project, then reload this page.');
    }

    throw new UserSyncDatabaseError(`Supabase user sync failed: ${error.message}`);
  }

  return data;
}
