import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MobileNav from '../components/MobileNav';

export const metadata: Metadata = {
  title: 'RegreT — Personal Life OS',
  description: 'Personal knowledge vault, activity timeline, consistency engine, and project studio.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <Header />
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto overflow-y-auto">
            {children}
          </main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
