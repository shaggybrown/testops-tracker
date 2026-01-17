import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { ClientProvider } from '@/components/ClientProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'TestOps Tracker',
  description: 'Test operations planning and tracking',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProvider>
          <AppShell>{children}</AppShell>
        </ClientProvider>
      </body>
    </html>
  );
}
