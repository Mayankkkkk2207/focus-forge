import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SupabaseAdminConfigError } from '@/lib/supabase-admin';
import { syncCurrentUserToDatabase, UserSyncDatabaseError } from '@/lib/sync-user';

export const dynamic = 'force-dynamic';

export default async function SyncUserPage() {
  try {
    const syncedUser = await syncCurrentUserToDatabase();

    if (!syncedUser) {
      redirect('/sign-in');
    }
  } catch (error) {
    if (error instanceof SupabaseAdminConfigError || error instanceof UserSyncDatabaseError) {
      return <SyncSetupError message={error.message} />;
    }

    return <SyncSetupError message="User sync failed unexpectedly. Check the Supabase configuration and users table migration." />;
  }

  redirect('/');
}

function SyncSetupError({ message }: { message: string }) {
  return (
    <main style={styles.container}>
      <section style={styles.panel}>
        <p style={styles.kicker}>Database setup needed</p>
        <h1 style={styles.title}>User sync is not configured yet.</h1>
        <p style={styles.message}>{message}</p>
        <p style={styles.copy}>
          Open Supabase SQL Editor and run the migration from <code style={styles.code}>supabase/migrations/20260530190000_create_users.sql</code>. Then reload this page while signed in.
        </p>
        <div style={styles.actions}>
          <Link href="/" style={styles.primaryLink}>
            Go home
          </Link>
          <Link href="/sign-in" style={styles.secondaryLink}>
            Sign in again
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09090b',
    color: '#fafafa',
    padding: '2rem',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  panel: {
    width: '100%',
    maxWidth: '620px',
    border: '1px solid #27272a',
    borderRadius: '8px',
    backgroundColor: '#18181b',
    padding: '2rem',
  },
  kicker: {
    margin: '0 0 0.75rem',
    color: '#38bdf8',
    fontSize: '0.875rem',
    fontWeight: 700,
  },
  title: {
    margin: '0 0 1rem',
    fontSize: '1.75rem',
    lineHeight: 1.2,
  },
  message: {
    margin: '0 0 1rem',
    color: '#fca5a5',
    lineHeight: 1.6,
  },
  copy: {
    margin: '0 0 1.5rem',
    color: '#a1a1aa',
    lineHeight: 1.6,
  },
  code: {
    borderRadius: '4px',
    backgroundColor: '#27272a',
    color: '#fafafa',
    padding: '0.125rem 0.375rem',
    wordBreak: 'break-word',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  primaryLink: {
    borderRadius: '8px',
    backgroundColor: '#38bdf8',
    color: '#09090b',
    fontWeight: 700,
    padding: '0.75rem 1rem',
    textDecoration: 'none',
  },
  secondaryLink: {
    borderRadius: '8px',
    border: '1px solid #3f3f46',
    color: '#fafafa',
    fontWeight: 700,
    padding: '0.75rem 1rem',
    textDecoration: 'none',
  },
};
