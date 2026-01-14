import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { MobileHeader } from './MobileHeader';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <MobileHeader />
        
        <main className="flex-1 overflow-auto pb-24 lg:pb-6">
          {children}
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}
