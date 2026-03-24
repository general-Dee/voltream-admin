import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      redirect('/dashboard');
    } else {
      redirect('/login');
    }
  } catch (err: any) {
    // If the error is a redirect, let Next.js handle it
    if (err.digest === 'NEXT_REDIRECT') {
      throw err;
    }
    console.error('Root page error:', err);
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Error loading page</h1>
        <pre style={{ color: 'red' }}>{err.message || 'Unknown error'}</pre>
        <p>Check environment variables: <a href="/api/check-env">/api/check-env</a></p>
      </div>
    );
  }
}