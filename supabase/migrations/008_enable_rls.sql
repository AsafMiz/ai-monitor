-- Enable Row Level Security on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is a member of a workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = ws_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Workspaces: members can view, only owner can update/delete
CREATE POLICY "Members can view workspaces"
    ON workspaces FOR SELECT
    USING (is_workspace_member(id));

CREATE POLICY "Authenticated users can create workspaces"
    ON workspaces FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update workspaces"
    ON workspaces FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete workspaces"
    ON workspaces FOR DELETE
    USING (auth.uid() = owner_id);

-- Workspace members: members can view, owners/admins can manage
CREATE POLICY "Members can view workspace members"
    ON workspace_members FOR SELECT
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Owners can manage workspace members"
    ON workspace_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = workspace_members.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('owner', 'admin')
        )
    );

-- Allow users to insert themselves as owner (for workspace creation flow)
CREATE POLICY "Users can add themselves as owner"
    ON workspace_members FOR INSERT
    WITH CHECK (user_id = auth.uid() AND role = 'owner');

-- Agents: workspace members can CRUD
CREATE POLICY "Members can view agents"
    ON agents FOR SELECT
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create agents"
    ON agents FOR INSERT
    WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Members can update agents"
    ON agents FOR UPDATE
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can delete agents"
    ON agents FOR DELETE
    USING (is_workspace_member(workspace_id));

-- Conversations: workspace members can access
CREATE POLICY "Members can view conversations"
    ON conversations FOR SELECT
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Members can update conversations"
    ON conversations FOR UPDATE
    USING (is_workspace_member(workspace_id));

-- Messages: accessible if user is member of the conversation's workspace
CREATE POLICY "Members can view messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND is_workspace_member(c.workspace_id)
        )
    );

CREATE POLICY "Members can create messages"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND is_workspace_member(c.workspace_id)
        )
    );

-- Document embeddings: workspace members can access
CREATE POLICY "Members can view embeddings"
    ON document_embeddings FOR SELECT
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Members can create embeddings"
    ON document_embeddings FOR INSERT
    WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Members can delete embeddings"
    ON document_embeddings FOR DELETE
    USING (is_workspace_member(workspace_id));
