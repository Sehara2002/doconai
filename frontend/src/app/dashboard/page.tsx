// app/dashboard/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSessionContext } from '@/app/dashboard/layout';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const createSession = async (userId: string, setActiveSession: any, router: any) => {
  try {
    const data = {
      user_id: userId,
      title: "New Session"
    };
    
    const res = await axios.post("http://localhost:8000/sessions", data);
    const sessionId = res.data.session_id;
    
    // Set the new session as active
    setActiveSession({ id: sessionId, title: data.title });
    
    // Redirect to the new chat session
    router.push(`/dashboard/chat/${sessionId}`);
  } catch (err) {
    console.error("Failed to create session:", err);
  }
};

export default function DashboardPage() {
  const { setActiveSession } = useSessionContext();
  const router = useRouter();
  const userId = '68393605181b9fb5e3e48e01'; // Replace with actual user ID

  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome to Pentagon Chat</CardTitle>
          <CardDescription>
            Start a new conversation to begin your legal consultation
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-6" />
          
          <Button 
            className="w-full max-w-xs"
            onClick={() => createSession(userId, setActiveSession, router)}
          >
            Start New Conversation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}