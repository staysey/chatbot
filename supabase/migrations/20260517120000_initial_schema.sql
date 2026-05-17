-- Chatbot initial schema (matches server API usage).
-- Apply: supabase db push  (remote)  or  supabase db reset  (local)

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  last_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  chat_id uuid not null references public.chats (id) on delete cascade,
  sender text not null,
  content text not null default '',
  attachments jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index chats_user_updated_idx
  on public.chats (user_id, updated_at desc);

create index messages_chat_created_idx
  on public.messages (chat_id, created_at);

create index messages_user_chat_idx
  on public.messages (user_id, chat_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger chats_set_updated_at
  before update on public.chats
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security (Realtime on client uses user JWT; API uses service role)
-- ---------------------------------------------------------------------------

alter table public.chats enable row level security;
alter table public.messages enable row level security;

create policy "Users can read own chats"
  on public.chats
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read own messages"
  on public.messages
  for select
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter table public.chats replica identity full;
alter table public.messages replica identity full;

alter publication supabase_realtime add table public.chats;
alter publication supabase_realtime add table public.messages;

-- ---------------------------------------------------------------------------
-- Storage (message attachments; server uploads via service role)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('message-files', 'message-files', true)
on conflict (id) do nothing;
