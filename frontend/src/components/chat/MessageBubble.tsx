// MessageBubble.tsx - Minimalist Professional Version
'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils/utils';
import { MessageCircle, User, Copy } from 'lucide-react';
import { useState } from 'react';
import { formatText } from '@/lib/utils/formatBiography';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    created_at: string;
  };
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isOwnMessage = message.role === 'user';
  const [showActions, setShowActions] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div 
      className={cn('flex group', isOwnMessage ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn('flex max-w-[80%] space-x-3', isOwnMessage ? 'flex-row-reverse space-x-reverse' : '')}>
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center',
            isOwnMessage 
              ? 'bg-gray-200 dark:bg-gray-700' 
              : 'bg-gray-900 dark:bg-white'
          )}>
            {isOwnMessage ? (
              <User className="w-3 h-3 text-gray-600 dark:text-gray-300" />
            ) : (
              <MessageCircle className="w-3 h-3 text-white dark:text-gray-900" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex flex-col space-y-1">
          <div className={cn(
            'relative px-3 py-2 rounded-lg',
            isOwnMessage 
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
          )}>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {formatText(message.content)}
            </p>

            {/* Copy Button */}
            {!isOwnMessage && (
              <button
                onClick={copyToClipboard}
                className={cn(
                  'absolute -right-8 top-1/2 transform -translate-y-1/2 p-1.5 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100',
                  showActions && 'opacity-100'
                )}
                title="Copy message"
              >
                <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* Timestamp */}
          <div className={cn(
            'text-xs text-gray-400 px-1',
            isOwnMessage ? 'text-right' : 'text-left'
          )}>
            {format(new Date(message.created_at), 'h:mm a')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;