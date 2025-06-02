// components/layout/Header.tsx
'use client';

import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessionContext } from '@/app/dashboard/layout';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { activeSession } = useSessionContext();
  const pathname = usePathname();

  const getTitle = () => {
    if (activeSession) {
      console.log(activeSession.title)
      return activeSession.title;
    }
    
    if (pathname === '/dashboard') {
      return 'Dashboard';
    }
    
    if (pathname.startsWith('/dashboard/chat')) {
      return 'Chat Session';
    }
    
    return 'Pentagon Chat';
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold truncate max-w-[200px] md:max-w-md">
            {getTitle()}
          </h1>
        </div>
        
        
      </div>
    </header>
  );
};

export default Header;