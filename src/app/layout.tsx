import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MobileNav from '../components/MobileNav';
import SmoothScroll from '../components/SmoothScroll';

export const metadata: Metadata = {
  title: 'RegreT OS — Personal Life Operating System',
  description: 'Clean Bento Life OS: knowledge vault, activity timeline, consistency engine, and project studio.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas text-foreground antialiased min-h-screen flex flex-col md:flex-row selection:bg-lime selection:text-lime-ink">
        <SmoothScroll>
          <div className="flex w-full min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
              <Header />
              <main className="flex-1 p-4 md:p-7 lg:p-8 max-w-[1440px] w-full mx-auto">
                {children}
              </main>
            </div>
            <MobileNav />
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
