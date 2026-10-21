-- PlaceGraph durable store (optional). Run in Supabase SQL editor.
-- This creates the table and enables Row Level Security with open policies
-- so that the publishable (anon) key can read and write.
-- For production with sensitive data, tighten these policies.

create table if not exists placegraph_documents (
  id text primary key,
  kind text not null check (kind in ('project', 'analysis')),
  workspace_id text,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists placegraph_documents_kind_ws
  on placegraph_documents (kind, workspace_id);

create index if not exists placegraph_documents_updated
  on placegraph_documents (updated_at desc);

-- Enable Row Level Security
alter table placegraph_documents enable row level security;

-- Allow anon key to SELECT (read projects and analyses)
create policy "anon_select" on placegraph_documents
  for select using (true);

-- Allow anon key to INSERT (create new projects/analyses)
create policy "anon_insert" on placegraph_documents
  for insert with check (true);

-- Allow anon key to UPDATE (upsert via merge-duplicates)
create policy "anon_update" on placegraph_documents
  for update using (true);

-- Grant to anon role
grant select, insert, update on placegraph_documents to anon;
grant select, insert, update on placegraph_documents to authenticated;
