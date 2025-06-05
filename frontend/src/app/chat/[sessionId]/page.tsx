'use client';

import { useEffect } from 'react';
import { useSessionContext } from '@/app/dashboard/layout';
import ChatInterface from '@/components/chat/ChatInterface';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { activeSession, setActiveSession } = useSessionContext();
  const params = useParams();
  const sessionId = params.sessionId as string;

  useEffect(() => {
    if (sessionId) {
      if (!activeSession || activeSession.id !== sessionId) {
        setActiveSession({
          id: sessionId,
          title: `Session ${sessionId.slice(0, 8)}...`
        });
      }
    }
  }, [sessionId, activeSession, setActiveSession]);

  if (!sessionId) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ChatInterface sessionId={sessionId} />
    </div>
  );
}