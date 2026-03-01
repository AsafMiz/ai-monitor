-- Document embeddings for RAG (Retrieval-Augmented Generation)
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for vector similarity search
CREATE INDEX idx_document_embeddings_workspace ON document_embeddings(workspace_id);
CREATE INDEX idx_document_embeddings_agent ON document_embeddings(agent_id);

-- HNSW index for fast approximate nearest neighbor search
CREATE INDEX idx_document_embeddings_vector ON document_embeddings
    USING hnsw (embedding vector_cosine_ops);
