// ChatInterface.tsx - Enhanced Professional Version
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

const FormMessageSchema = z.object({
  content: z.string().min(1, { message: 'Message cannot be empty' })
});

type FormData = z.infer<typeof FormMessageSchema>;

interface ChatInterfaceProps {
  sessionId: string;
  initialMessages: {
    id: string;
    session_id: string;
    sender: 'user' | 'bot';
    content: string;
    timestamp: string;
  }[];
  onNewMessage: () => void;
}

export default function ChatInterface({ 
  sessionId, 
  initialMessages,
  onNewMessage
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('You must be logged in to send messages');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      session_id: sessionId,
      sender: 'user' as const,
      content: data.content,
      timestamp: new Date().toISOString(),
    };

    try {
      setIsSending(true);
      setMessages(prev => [...prev, tempMessage]);
      reset();

      // Show typing indicator
      setIsTyping(true);
      
      // Send message to API
      await createMessage({
        session_id: sessionId,
        sender: 'user',
        content: data.content,
      });
      
      // Simulate AI thinking time
      setTimeout(() => {
        setIsTyping(false);
        onNewMessage();
      }, 1500);
      
    } catch (err) {
      toast.error('Message sending failed');
      console.error(err);
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
              <MessageBubble 
                key={message.id} 
                message={{
                  id: message.id,
                  content: message.content,
                  role: message.sender === 'bot' ? 'assistant' : 'user',
                  created_at: message.timestamp
                }} 
              />
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