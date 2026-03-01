export interface Agent {
  id: string;
  workspace_id: string;
  name: string;
  role: string;
  backstory: string | null;
  goal: string | null;
  personality_traits: Record<string, unknown>;
  tools: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentCreate {
  workspace_id: string;
  name: string;
  role: string;
  backstory?: string;
  goal?: string;
  personality_traits?: Record<string, unknown>;
  tools?: string[];
}

export interface AgentUpdate {
  name?: string;
  role?: string;
  backstory?: string;
  goal?: string;
  personality_traits?: Record<string, unknown>;
  tools?: string[];
  is_active?: boolean;
}
