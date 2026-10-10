import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MobileNav from '../components/MobileNav';
import SmoothScroll from '../components/SmoothScroll';
import GlobalShortcuts from '../components/GlobalShortcuts';

export const metadata: Metadata = {
  title: 'Personal OS — Private Life Archive & Digital Workspace',
  description: 'A private digital workspace mixed with a personal life archive. Record what happened, revisit your life over time, and understand your consistency.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D12] text-[#F0F6FC] antialiased min-h-screen flex flex-col md:flex-row selection:bg-blue-600/30 selection:text-blue-200">
        <SmoothScroll>
          <div className="flex w-full min-h-screen bg-[#090D12]">
            <GlobalShortcuts />
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
              <Header />
              <main className="flex-1 p-4 md:p-6 lg:p-7 max-w-[1400px] w-full mx-auto">
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
