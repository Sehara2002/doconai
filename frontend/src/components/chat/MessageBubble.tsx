// MessageBubble.tsx - Enhanced Professional Version
'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';

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
  console.log(message)
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div 
      className={cn('flex group', isOwnMessage ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn('flex max-w-[85%] space-x-3', isOwnMessage ? 'flex-row-reverse space-x-reverse' : '')}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            isOwnMessage 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
              : 'bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-500'
          )}>
            {isOwnMessage ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white dark:text-gray-800" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex flex-col space-y-1">
          <div className={cn(
            'relative px-4 py-3 rounded-2xl shadow-md',
            isOwnMessage 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md' 
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md'
          )}>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap break-words m-0 leading-relaxed">
                {message.content}
              </p>
            </div>

            {/* Message Actions */}
            {!isOwnMessage && (
              <div className={cn(
                'absolute -right-2 top-1/2 transform -translate-y-1/2 flex space-x-1 opacity-0 transition-opacity duration-200',
                showActions && 'opacity-100'
              )}>
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
                {/* <button
                  className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Like message"
                >
                  <ThumbsUp className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Dislike message"
                >
                  <ThumbsDown className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button> */}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={cn(
            'text-xs text-gray-500 dark:text-gray-400 px-2',
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