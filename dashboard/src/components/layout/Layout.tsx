import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CyberDataBackground } from '../ui/CyberDataBackground';
import { useAppContext } from '../../context/AppContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { settings } = useAppContext();

  return (
    <div
      className="flex h-screen text-slate-200 overflow-hidden relative transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-root)' }}
    >
      {/* Interactive Cyber + Data Science Node Network Background */}
      <CyberDataBackground theme={settings.darkMode ? 'dark' : 'light'} />

      {/* Main Layout */}
      <div className="z-10 flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 relative">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
