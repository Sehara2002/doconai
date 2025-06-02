// app/dashboard/chat/[sessionId]/page.tsx
'use client';

import { useEffect } from 'react';
import { useSessionContext } from '@/app/dashboard/layout';
import ChatInterface from '@/components/chat/ChatInterface';
import { useParams } from 'next/navigation'; // Add this import

export default function ChatPage() {
  const { activeSession, setActiveSession } = useSessionContext();
  const params = useParams(); // Get params from hook
  const sessionId = params.sessionId as string; // Cast to string

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

  return (
    <div className="h-full flex flex-col">
      {sessionId ? <ChatInterface sessionId={sessionId} /> : <p>Loading session...</p>}
    </div>
  );
}