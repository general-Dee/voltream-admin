'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/product', label: 'Products' },
  { href: '/dashboard/order', label: 'Orders' },
  { href: '/dashboard/customer', label: 'Customers' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => setOpen(!open);
  const closeSidebar = () => setOpen(false);

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1001,
          background: '#f97316',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
          cursor: 'pointer',
          fontSize: '20px',
          color: 'white',
        }}
      >
        ☰
      </button>

      <aside className={`sidebar ${open ? 'open' : ''}`} style={{ backgroundColor: 'white', borderRight: '1px solid #e5e7eb' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '24px', paddingLeft: '8px' }}>
            Voltream Admin
          </div>
          <nav>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  marginBottom: '4px',
                  borderRadius: '6px',
                  backgroundColor: pathname === item.href ? '#f97316' : 'transparent',
                  color: pathname === item.href ? 'white' : '#374151',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {open && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        />
      )}
    </>
  );
}