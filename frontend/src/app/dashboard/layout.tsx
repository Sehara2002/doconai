'use client'

import { ReactNode, useState, createContext, useContext } from 'react';
import { AuthProvider } from '@/lib/context/AuthContext';
import Header from '@/components/layout/Header';
import SessionsSidebar from '@/components/layout/SessionSidebar';
import { Toaster } from 'sonner';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/lib/context/AuthContext'

// Create session context
type SessionContextType = {
  activeSession: { id: string; title: string } | null;
  setActiveSession: (session: { id: string; title: string } | null) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<{ id: string; title: string } | null>(null);
  const { user,isAuthenticated, loading } = useAuth() 

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner/>
      </div>
    )
  }


  return (
    <AuthProvider>
      <SessionContext.Provider value={{ activeSession, setActiveSession }}>
        <div className="flex h-screen bg-gray-50 ">
          {/* Mobile sidebar toggle button */}
          <div className="md:hidden fixed top-4 left-4 z-50">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Sessions Sidebar */}
          <div 
            className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out bg-white ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 md:static md:flex`}
          >
            <SessionsSidebar 
              onClose={() => setIsSidebarOpen(false)} 
              setActiveSession={setActiveSession}
            />
          </div>
          
          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 z-30  md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main content area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            
            <main className="flex-1 ">
              {children}
            </main>
          </div>
          
          <Toaster position="top-right" />
        </div>
      </SessionContext.Provider>
    </AuthProvider>
  );
}