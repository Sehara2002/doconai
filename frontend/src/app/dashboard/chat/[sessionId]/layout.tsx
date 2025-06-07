// ChatLayout.tsx - Professional Layout
'use client';

import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-[90vh] ">
      

      {/* Main Content */}
      
       
          {children}
      
      
    </div>
  );
};

export default ChatLayout;