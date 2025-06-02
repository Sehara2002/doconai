// components/chat/ChatInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSchema } from '@/lib/validation/schemas';
import { z } from 'zod';
import { toast } from 'sonner';
import { createMessage, getMessages, Message } from '@/lib/api/chat';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';

type FormData = z.infer<typeof MessageSchema>;

export default function ChatInterface({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(MessageSchema),
    defaultValues: {
      content: ''
    }
  });

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await getMessages(sessionId);
        setMessages(data);
      } catch (error) {
        toast.error('Failed to load messages');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Add user message immediately for better UX
      const tempId = Date.now().toString();
      setMessages(prev => [...prev, {
        id: tempId,
        content: data.content,
        role: 'user',
        session_id: sessionId,
        created_at: new Date().toISOString()
      }]);
      
      reset();
      
      // Send to API and replace with actual response
      const newMessage = await createMessage(sessionId, data.content);
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== tempId),
        newMessage
      ]);
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">No messages yet</h3>
            <p className="text-gray-500 mt-2">
              Start a conversation by sending your first message
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="border-t p-4 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <ChatInput 
            name="content"
            register={register}
            error={errors.content?.message}
            placeholder="Type a legal question..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}