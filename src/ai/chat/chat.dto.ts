import { ChatInput } from '../../lib/types';

export interface ChatInputWithAction extends ChatInput {
  action: 'create' | 'read' | 'update' | 'delete';
  type: 'appointment' | 'task' | 'user' | 'sale' | 'company';
  apiKey: string;
}

export interface ChatInputWithOptionalAction extends ChatInput {
  action?: 'create' | 'read' | 'update' | 'delete';
  type?: 'appointment' | 'task' | 'user' | 'sale' | 'company';
  apiKey: string;
}
