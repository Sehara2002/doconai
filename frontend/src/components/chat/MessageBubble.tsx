'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
  };
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { user } = useAuth();
  const isOwnMessage = message.sender === user?.id;

  return (
    <div className={cn(
      'flex mb-4',
      isOwnMessage ? 'justify-end' : 'justify-start'
    )}>
      <div className="flex flex-col max-w-[80%]">
        <div className={cn(
          'px-4 py-2 rounded-2xl',
          isOwnMessage 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'
        )}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div className={cn(
          'text-xs mt-1',
          isOwnMessage ? 'text-right text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'
        )}>
          {format(new Date(message.timestamp), 'h:mm a')}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;