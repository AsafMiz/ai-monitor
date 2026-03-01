export type Channel = 'whatsapp' | 'slack' | 'email' | 'web';
export type ConversationStatus = 'active' | 'paused' | 'escalated' | 'closed';
export type SenderType = 'agent' | 'human' | 'system';

export interface Conversation {
  id: string;
  workspace_id: string;
  agent_id: string | null;
  channel: Channel;
  external_contact_id: string | null;
  status: ConversationStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
