import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/dashboard/SignOutButton';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!admin) {
    redirect('/');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 250px;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 1000;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .sidebar-toggle {
            display: block;
          }
          .main-content {
            margin-left: 0;
            padding-top: 60px;
          }
        }
        @media (min-width: 769px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 250px;
            transform: translateX(0);
          }
          .sidebar-toggle {
            display: none;
          }
          .main-content {
            margin-left: 250px;
          }
        }
      `}</style>

      <Sidebar />

      <div className="main-content" style={{ transition: 'margin-left 0.3s ease' }}>
        <header style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1rem',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}>
            <SignOutButton />
          </div>
        </header>
        <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}