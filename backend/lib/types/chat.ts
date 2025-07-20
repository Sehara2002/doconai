export interface Message {
    id: string;
    session_id: string;
    sender: 'user' | 'bot';
    content: string;
    timestamp: string;
    reply_to_id?: string | null;
}

export interface MessageCreate {
    session_id: string;
    sender: 'user' | 'bot';
    content: string;
    reply_to_id?: string | null;
}