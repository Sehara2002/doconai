// ChatInterface.tsx - Minimalist Professional Version
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
import { MessageCircle } from 'lucide-react';
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

  useEffect(() => {
    const hasChanged = 
      initialMessages.length !== messages.filter(m => !m.isTemporary).length ||
      initialMessages.some((msg, index) => {
        const nonTempMessages = messages.filter(m => !m.isTemporary);
        return !nonTempMessages[index] || nonTempMessages[index].id !== msg.id;
      });

    if (hasChanged) {
      setMessages(prev => {
        const tempMessages = prev.filter(m => m.isTemporary);
        return [...initialMessages, ...tempMessages];
      });
    }
  }, [initialMessages]);

  useEffect(() => {
    if (shouldMaintainScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, shouldMaintainScroll]);

  const fetchLatestMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/messages/${sessionId}`);
      const latestMessages = response.data;
      
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
      
      setMessages(prev => [...prev, tempUserMessage]);
      reset();
      setTimeout(() => setIsTyping(true), 500);
      
      await createMessage({
        session_id: sessionId,
        sender: 'user',
        content: data.content,
      });
      
      setTimeout(fetchLatestMessages, 1500);
      
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
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-100  rounded-full flex items-center justify-center">
          <MessageCircle className="w-8 h-8 " />
        </div>
        <h3 className="text-lg font-medium text-gray-900  mb-2">
          Start a conversation
        </h3>
        <p className="text-gray-500  text-sm">
          Send a message to begin chatting with the AI assistant.
        </p>
      </div>
    </div>
  );

  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-center space-x-2 bg-gray-100  rounded-lg px-3 py-2">
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-xs text-gray-500 ">Typing...</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-200 ">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={message.isTemporary ? 'opacity-60' : ''}>
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
      <div className="border-t border-gray-200  bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <ChatInput
            name="content"
            register={register}
            error={errors.content?.message}
            placeholder="Type your message..."
            isSending={isSending}
            disabled={isSending || isTyping}
          />
        </form>
      </div>
    </div>
  );
}