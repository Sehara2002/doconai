// components/layout/SessionsSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@/app/dashboard/layout';
import axios from 'axios'
import {toast} from 'sonner'

const SessionsSidebar = ({ 
  onClose,
  setActiveSession
}: { 
  onClose?: () => void;
  setActiveSession: (session: { id: string; title: string } | null) => void;
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
   const { activeSession } = useSessionContext(); // Moved to top level
   const {logout} =useAuth();
  
  const getSessions=async()=>{
    const res=await axios.get('http://localhost:8000/sessions',{withCredentials:true});
    return res.data.sessions;
  }

  const fetchSessions = async () => {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (error) {
        toast.error('Failed to load chat sessions');
        console.error(error);
      } finally {
        setIsLoading(false);
      //   if (mockSessions.length > 0) {
      //   setActiveSession({ id: mockSessions[0].id, title: mockSessions[0].title });
      // }
      }
    };
  useEffect(() => {
    

    fetchSessions();
  }, [setActiveSession]);


  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createNewSession = async() => {
    const newId = Date.now().toString();
    const res = await axios.post('http://localhost:8000/sessions/create',{title:"New legal consultation"},{withCredentials:true})
    
    // setSessions([newSession, ...sessions]);
    // setActiveSession({ id: newId, title: newSession.title });
    // router.push(`/dashboard/chat/${newId}`);
    fetchSessions();
    if (onClose) onClose();
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(sessions.filter(session => session.id !== id));
    
    // Use activeSession from top level
    if (activeSession?.id === id) {
      if (sessions.length > 1) {
        const nextSession = sessions.find(session => session.id !== id);
        if (nextSession) {
          setActiveSession({ id: nextSession.id, title: nextSession.title });
          router.push(`/dashboard/chat/${nextSession.id}`);
        }
      } else {
        setActiveSession(null);
      }
    }
  };

  const handleSessionClick = (session: any) => {
    setActiveSession({ id: session.id, title: session.title });
    router.push(`/dashboard/chat/${session.id}`);
    if (onClose) onClose();
  };

  const handleLogout = async()=>{
    setActiveSession(null);
    await logout();
    router.push('/login');
  }
  return (
    <aside className="w-64 h-full flex flex-col ">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Legal Sessions</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={createNewSession}
              title="Start new session"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={onClose}
              title="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search sessions..."
            className="pl-10 pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <X 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
              onClick={() => setSearchTerm('')}
            />
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredSessions.length > 0 ? (
          <ul className="py-2">
            {filteredSessions.map((session) => (
    <li key={session.id}>
      <div
        onClick={() => handleSessionClick(session)}
        className={`block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 ${
          // Use activeSession from top level
          activeSession?.id === session.id 
            ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-500' 
            : ''
        }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{session.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{session.date}</span>
                        {session.unread > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {session.unread}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-500 hover:text-red-500"
                      onClick={(e) => deleteSession(session.id, e)}
                      title="Delete session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center">
            <p className="text-gray-500">No sessions found</p>
            <Button variant="link" onClick={createNewSession}>
              Start a new session
            </Button>
          </div>
        )}
      </div>
      
      {user && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
              <div>
                <p className="font-medium truncate max-w-[120px]">{user.username}</p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default SessionsSidebar;



