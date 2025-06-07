// ChatInput.tsx - Enhanced Professional Version
'use client';

import React, { useRef, useEffect } from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { Loader2, Send, Paperclip, Smile } from 'lucide-react';

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
        <div className="flex items-center justify-center space-x-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-shadow duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={disabled}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 min-h-0">
            <textarea
              {...rest}
              ref={(e) => {
                ref(e);
                textareaRef.current = e;
              }}
              className="w-full py-3 bg-transparent border-none resize-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={placeholder}
              rows={1}
              disabled={disabled}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Emoji Button */}
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={disabled}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || isSending}
            className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm px-3 animate-shake">{error}</p>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-400 dark:text-gray-500 px-3">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}