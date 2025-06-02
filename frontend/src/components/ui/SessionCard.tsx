import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    created_at: string;
  };
  isActive: boolean;
  onClick: () => void;
}

export default function SessionCard({ session, isActive, onClick }: SessionCardProps) {
  return (
    <div 
      className={cn(
        'p-3 border rounded-md cursor-pointer transition-colors',
        isActive 
          ? 'bg-blue-50 border-blue-500' 
          : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium truncate">{session.title}</h3>
          <p className="text-xs text-gray-500">
            {formatDate(session.created_at)}
          </p>
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}