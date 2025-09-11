export type Role = 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
}

export type Provider = 'llm' | 'backend';
export type Mode = 'sql' | 'chat';
