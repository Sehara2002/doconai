// ChatInterface.tsx - Enhanced Professional Version with Optimistic Updates
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createMessage } from '@/lib/api/chat';
import { useAuth } from '@/lib/context/AuthContext';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import { Loader2, MessageSquare, Sparkles } from 'lucide-react';
import axios from 'axios';

const FormMessageSchema = z.object({
  content: z.string().min(1, { message: 'Message cannot be empty' })
});

type FormData = z.infer<typeof FormMessageSchema>;

interface Message {
  id: string;
  session_id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  isTemporary?: boolean;
}

interface ChatInterfaceProps {
  sessionId: string;
  initialMessages: Message[];
  onNewMessage: () => void;
}

export default function ChatInterface({ 
  sessionId, 
  initialMessages,
  onNewMessage
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [shouldMaintainScroll, setShouldMaintainScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(FormMessageSchema),
    defaultValues: {
      content: ''
    }
  });

  // Only update messages if they're actually different (avoid unnecessary re-renders)
  useEffect(() => {
    const hasChanged = 
      initialMessages.length !== messages.filter(m => !m.isTemporary).length ||
      initialMessages.some((msg, index) => {
        const nonTempMessages = messages.filter(m => !m.isTemporary);
        return !nonTempMessages[index] || nonTempMessages[index].id !== msg.id;
      });

    if (hasChanged) {
      // Preserve temporary messages and add new real messages
      setMessages(prev => {
        const tempMessages = prev.filter(m => m.isTemporary);
        return [...initialMessages, ...tempMessages];
      });
    }
  }, [initialMessages]);

  // Auto-scroll only when new messages arrive or typing indicator shows
  useEffect(() => {
    if (shouldMaintainScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, shouldMaintainScroll]);

  const fetchLatestMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/messages/${sessionId}`);
      const latestMessages = response.data;
      
      // Remove temporary messages and update with real ones
      setMessages(prev => {
        const realMessages = prev.filter(m => !m.isTemporary);
        if (latestMessages.length > realMessages.length) {
          return latestMessages;
        }
        return prev;
      });
      
      setIsTyping(false);
    } catch (error) {
      console.error('Error fetching latest messages:', error);
      setIsTyping(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('You must be logged in to send messages');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempUserMessage: Message = {
      id: tempId,
      session_id: sessionId,
      sender: 'user',
      content: data.content,
      timestamp: new Date().toISOString(),
      isTemporary: true
    };

    try {
      setIsSending(true);
      setShouldMaintainScroll(true);
      
      // Add temporary user message immediately
      setMessages(prev => [...prev, tempUserMessage]);
      reset();

      // Show typing indicator after a brief delay
      setTimeout(() => setIsTyping(true), 500);
      
      // Send message to API
      await createMessage({
        session_id: sessionId,
        sender: 'user',
        content: data.content,
      });
      
      // Fetch updated messages after API call
      setTimeout(fetchLatestMessages, 1500);
      
    } catch (err) {
      toast.error('Message sending failed');
      console.error(err);
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  };

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-4 animate-bounce" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Start a conversation
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Ask me anything! I'm here to help with questions, creative tasks, analysis, and more.
        </p>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-blue-700 dark:text-blue-300">
            💡 Try: "Explain quantum computing in simple terms"
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-purple-700 dark:text-purple-300">
            ✨ Try: "Help me write a creative story"
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-green-700 dark:text-green-300">
            🔍 Try: "Analyze this data for insights"
          </div>
        </div>
      </div>
    </div>
  );

  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 rounded-bl-none">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={message.isTemporary ? 'opacity-70' : ''}>
                <MessageBubble 
                  message={{
                    id: message.id,
                    content: message.content,
                    role: message.sender === 'bot' ? 'assistant' : 'user',
                    created_at: message.timestamp
                  }} 
                />
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <ChatInput
            name="content"
            register={register}
            error={errors.content?.message}
            placeholder="Type your message here..."
            isSending={isSending}
            disabled={isSending || isTyping}
          />
        </form>
      </div>
    </div>
  );
}