'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/product', label: 'Products' },
    { href: '/dashboard/order', label: 'Orders' },
    { href: '/dashboard/customer', label: 'Customers' }
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav style={{ display: 'flex', gap: '1.5rem' }}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: isActive(item.href) ? '#f97316' : '#374151',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isActive(item.href)) e.currentTarget.style.color = '#f97316';
          }}
          onMouseLeave={(e) => {
            if (!isActive(item.href)) e.currentTarget.style.color = '#374151';
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
