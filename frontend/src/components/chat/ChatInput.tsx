// ChatInput.tsx - Minimalist Professional Version
'use client';

import React, { useRef, useEffect } from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { Loader2, Send } from 'lucide-react';

interface ChatInputProps<T extends FieldValues> {
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  isSending?: boolean;
}

export default function ChatInput<T extends FieldValues>({
  name,
  register,
  error,
  placeholder = 'Type a message...',
  onKeyDown,
  disabled = false,
  isSending = false,
}: ChatInputProps<T>) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { ref, ...rest } = register(name);

  useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    };

    const el = textareaRef.current;
    if (el) {
      el.addEventListener('input', adjustHeight);
      return () => el.removeEventListener('input', adjustHeight);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form && !disabled) {
        form.requestSubmit();
      }
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex items-end space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-gray-900 dark:focus-within:border-gray-300 transition-colors">
          {/* Text Input */}
          <div className="flex-1 min-h-0">
            <textarea
              {...rest}
              ref={(e) => {
                ref(e);
                textareaRef.current = e;
              }}
              className="w-full p-3 bg-transparent border-none resize-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={placeholder}
              rows={1}
              disabled={disabled}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || isSending}
            className="m-1 p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm px-1">{error}</p>
      )}
    </div>
  );
}