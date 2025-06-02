// components/chat/ChatInput.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface ChatInputProps<T extends FieldValues> {
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const ChatInput = <T extends FieldValues>({
  name,
  register,
  error,
  placeholder = 'Type a message...',
  onKeyDown,
}: ChatInputProps<T>) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { ref, ...rest } = register(name);

  useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          150
        )}px`;
      }
    };

    adjustHeight();
    
    // Add event listener for input events
    const currentRef = textareaRef.current;
    if (currentRef) {
      currentRef.addEventListener('input', adjustHeight);
      return () => currentRef.removeEventListener('input', adjustHeight);
    }
  }, []);

  return (
    <div className="relative flex-1">
      <textarea
        {...rest}
        ref={(e) => {
          ref(e);
          textareaRef.current = e;
        }}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        className={`w-full px-4 py-3 pr-10 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } dark:bg-gray-800 dark:text-white`}
        rows={1}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default ChatInput;