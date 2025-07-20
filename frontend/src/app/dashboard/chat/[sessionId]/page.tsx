// Page.tsx - Minimalist Professional Version
'use client';

import { useEffect, useState, useCallback } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Loader2, MessageCircle, Hash } from 'lucide-react';

interface ApiMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
}

const Page = () => {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [messageData, setMessageData] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchMessages = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTime < 1000) {
      return;
    }

    try {
      if (force) setLoading(true);
      
      const response = await axios.get(`http://localhost:8000/messages/${sessionId}`);
      
      setMessageData(prevData => {
        const newData = response.data;
        if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
          return newData;
        }
        return prevData;
      });
      
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (force) setLoading(false);
    }
  }, [sessionId, lastFetchTime]);

  const handleNewMessage = useCallback(() => {
    fetchMessages(false);
  }, [fetchMessages]);

  useEffect(() => {
    fetchMessages(true);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        <div className="text-center">
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-90px)] flex flex-col bg-white">
      {/* Minimalist Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white " />
            </div>
            <div>
              <h2 className="font-medium text-gray-900 ">Chat</h2>
              <p className="text-sm text-gray-500 ">
                {messageData.length} messages
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Hash className="w-3 h-3" />
            <span className="font-mono">{sessionId.slice(-8)}</span>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 min-h-0">
        <ChatInterface 
          sessionId={sessionId} 
          initialMessages={messageData}
          onNewMessage={handleNewMessage} 
        />
      </div>
    </div>
  );
};

export default Page;