'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      style={{
        padding: '6px 12px',
        backgroundColor: '#f97316',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ea580c')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
    >
      Sign Out
    </button>
  );
}
