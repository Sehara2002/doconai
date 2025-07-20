// Updated validation schema
import { z } from 'zod';

// For creating a message (like MessageCreate in Python)
export const MessageSchema = z.object({
  session_id: z.string(),
  sender: z.enum(['user', 'bot']),
  content: z.string().min(1, { message: 'Message cannot be empty' }),
  reply_to_id: z.string().optional(),
});

// For form validation (only content field)
export const FormMessageSchema = z.object({
  content: z.string().min(1, { message: 'Message cannot be empty' })
});

export type MessageFormData = z.infer<typeof MessageSchema>;
export type FormData = z.infer<typeof FormMessageSchema>;