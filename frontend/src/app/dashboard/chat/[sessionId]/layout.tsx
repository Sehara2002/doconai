// ChatLayout.tsx - Professional Layout
'use client';

import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-[90vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      

      {/* Main Content */}
      
       
          {children}
      
      
    </div>
  );
};

export default ChatLayout;