// Page.tsx - Enhanced Professional Version
'use client';

import { useEffect, useState } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Loader2, Bot, User, Clock, Hash } from 'lucide-react';

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

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/messages/${sessionId}`);
      setMessageData(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-blue-200 rounded-full animate-ping"></div>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading conversation...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Preparing your AI assistant</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-90px)] flex flex-col">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <span>Active conversation</span>
                <span>•</span>
                <span>{messageData.length} messages</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Hash className="w-4 h-4" />
              <span className="font-mono text-xs">{sessionId.slice(-8)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 min-h-0">
        <ChatInterface 
          sessionId={sessionId} 
          initialMessages={messageData}
          onNewMessage={fetchMessages} 
        />
      </div>
    </div>
  );
};

export default Page;