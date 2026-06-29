create extension if not exists vector;
create extension if not exists pgcrypto; -- for gen_random_uuid()

create table users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique
);

create table workspaces (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    name text not null,
    created_at timestamptz default now()
);

create table documents (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    filename text not null,
    file_hash text not null,
    uploaded_at timestamptz default now(),
    unique (workspace_id, file_hash) -- enforces idempotent re-upload
);

create table chunks (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    document_id uuid not null references documents(id) on delete cascade,
    chunk_text text not null,
    chunk_index int not null,         -- position within the document, useful for citations
    embedding vector(768),
    created_at timestamptz default now()
);

-- speeds up the workspace-scoped similarity search
create index on chunks using hnsw (embedding vector_cosine_ops);
-- speeds up plain workspace_id filtering / joins
create index on chunks (workspace_id);
create index on documents (workspace_id);

create table tasks (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    title text not null,
    created_at timestamptz default now()
);

create table messages (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    citations jsonb,                  -- e.g. [{document_id, chunk_id, filename}]
    created_at timestamptz default now()
);

create table tool_calls (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    message_id uuid references messages(id) on delete set null,
    tool_name text not null,
    arguments jsonb not null,
    result jsonb,
    status text not null check (status in ('success', 'error')),
    error_message text,
    created_at timestamptz default now()
);

create index on tasks (workspace_id);
create index on messages (workspace_id);
create index on tool_calls (workspace_id);