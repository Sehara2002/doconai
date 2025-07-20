import { Message, MessageCreate } from '@/lib/types/chat';

const API_BASE_URL = '/api/messages';

export async function getMessages(
    sessionId: string, 
    skip: number = 0, 
    limit: number = 100
): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/${sessionId}?skip=${skip}&limit=${limit}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }
    
    return response.json();
}

export async function createMessage(message: MessageCreate): Promise<Message> {
    const response = await fetch(`${API_BASE_URL}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(message),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create message');
    }
    
    return response.json();
}

export async function updateMessage(
    messageId: string,
    message: MessageCreate
): Promise<Message> {
    const response = await fetch(`${API_BASE_URL}/${messageId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(message),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update message');
    }
    
    return response.json();
}

export async function deleteMessage(messageId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${messageId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete message');
    }
}