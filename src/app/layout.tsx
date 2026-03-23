import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voltream Admin',
  description: 'Admin dashboard for Voltream',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}