'use client';

import { useState, useEffect } from 'react';
import { getSessions, createSession, ChatSession } from '@/lib/api/chat';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SessionCreateSchema } from '@/lib/validation/schemas';
import { z } from 'zod';
import { toast } from 'sonner';
import SessionCard from '@/components/ui/SessionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon } from '@radix-ui/react-icons';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type FormData = z.infer<typeof SessionCreateSchema>;

export default function ChatSessionList({ 
  onSelectSession,
  currentSessionId 
}: { 
  onSelectSession: (id: string) => void;
  currentSessionId?: string;
}) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(SessionCreateSchema),
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (error) {
        toast.error('Failed to load chat sessions');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleCreateSession = async (data: FormData) => {
    try {
      const newSession = await createSession(data.title);
      setSessions([newSession, ...sessions]);
      onSelectSession(newSession.id);
      setShowCreateForm(false);
      reset();
      toast.success('New chat session created');
    } catch (error) {
      toast.error('Failed to create session');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Lawgan</h1>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Chat Sessions</h2>
        <Button 
          size="sm" 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          New
        </Button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleSubmit(handleCreateSession)} className="space-y-3 mb-4">
          <Input
            placeholder="Session title"
            {...register('title')}
            error={errors.title?.message}
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Create</Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No chat sessions found</p>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isActive={session.id === currentSessionId}
              onClick={() => onSelectSession(session.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

