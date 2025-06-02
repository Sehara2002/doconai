'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Settings, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r bg-white dark:bg-gray-800 min-h-screen hidden md:block">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Lawgan</h1>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  pathname === item.href ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {user && (
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={logout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;