/*
  # Chat Assistant Integration

  1. New Tables
    - `users` (if not exists)
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
    - `teams` (already exists)
    - `team_members` (already exists)
    - `team_ai_config` (already exists)
    - `chat_threads`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key)
      - `title` (text)
      - `openai_thread_id` (text, nullable)
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `chat_messages`
      - `id` (uuid, primary key)
      - `thread_id` (uuid, foreign key)
      - `team_id` (uuid, foreign key)
      - `role` (text: user, assistant, system)
      - `content` (text)
      - `meta` (jsonb)
      - `status` (text: pending, streaming, committed, error)
      - `created_by` (uuid, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for team-based access control
    - Exception handling for duplicate policies

  3. Functions
    - `concat_text` for atomic text concatenation during streaming

  4. Test Data
    - Test team configuration
    - Assistant ID setup
*/

-- Create users table if not exists
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

do $$
begin
  begin
    create policy "Users can read own data" on public.users
      for select using (auth.uid() = id);
  exception when duplicate_object then
    null;
  end;
end $$;

-- Ensure teams table exists and has RLS
alter table public.teams enable row level security;

-- Ensure team_members table exists and has RLS  
alter table public.team_members enable row level security;

-- Update team_ai_config RLS policies with exception handling
alter table public.team_ai_config enable row level security;

do $$
begin
  begin
    create policy "Team members can read AI config" on public.team_ai_config
      for select using (
        exists (
          select 1 from public.team_members tm
          where tm.team_id = team_ai_config.team_id
            and tm.user_id = auth.uid()
        )
      );
  exception when duplicate_object then
    null;
  end;

  begin
    create policy "Team members can write AI config" on public.team_ai_config
      for insert with check (
        exists (
          select 1 from public.team_members tm
          where tm.team_id = team_ai_config.team_id
            and tm.user_id = auth.uid()
        )
      );
  exception when duplicate_object then
    null;
  end;
end $$;

-- Create chat_threads table
create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text,
  openai_thread_id text,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add indexes for chat_threads
create index if not exists chat_threads_team_idx on public.chat_threads(team_id);
create index if not exists chat_threads_openai_idx on public.chat_threads(openai_thread_id);
create index if not exists chat_threads_updated_idx on public.chat_threads(updated_at desc);

-- Enable RLS for chat_threads
alter table public.chat_threads enable row level security;

do $$
begin
  begin
    create policy "Team members can read threads" on public.chat_threads
      for select using (
        exists (
          select 1 from public.team_members tm
          where tm.team_id = chat_threads.team_id
            and tm.user_id = auth.uid()
        )
      );
  exception when duplicate_object then
    null;
  end;

  begin
    create policy "Team members can create threads" on public.chat_threads
      for insert with check (
        exists (
          select 1 from public.team_members tm
          where tm.team_id = chat_threads.team_id
            and tm.user_id = auth.uid()
        )
      );
  exception when duplicate_object then
    null;
  end;

  begin
    create policy "Team members can update threads" on public.chat_threads
      for update using (
        exists (
          select 1 from public.team_members tm
          where tm.team_id = chat_threads.team_id
            and tm.user_id = auth.uid()
        )
      );
  exception when duplicate_object then
    null;
  end;
end $$;

-- Create chat_messages table
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null default '',
  meta jsonb not null default '{}',
  status text not null default 'committed' check (status in ('pending', 'streaming', 'committed', 'error')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Add indexes for chat_messages
create index if not exists chat_messages_thread_idx on public.chat_messages(thread_id, created_at);
create index if not exists chat_messages_team_idx on public.chat_messages(team_id, created_at);

-- Enable RLS for chat_messages
alter table public.chat_messages enable row level security;

do $$
begin
  begin
    create policy "Team members can read messages" on public.chat_messages
      for select using (
        exists (
          select 1 from public.team_members tm
          where tm.team_id = chat_messages.team_id
            and tm.user_id = auth.uid()
        )
      );
  exception when duplicate_object then
    null;
  end;

  begin
    create policy "Team members can create messages" on public.chat_messages
      for insert with check (
        exists (
          select 1 from public.team_members tm
          where tm.team_id = chat_messages.team_id
            and tm.user_id = auth.uid()
        )
      );
  exception when duplicate_object then
    null;
  end;

  begin
    create policy "Team members can update messages" on public.chat_messages
      for update using (
        exists (
          select 1 from public.team_members tm
          where tm.team_id = chat_messages.team_id
            and tm.user_id = auth.uid()
        )
      );
  exception when duplicate_object then
    null;
  end;
end $$;

-- Create RPC function for atomic text concatenation during streaming
create or replace function public.concat_text(message_id uuid, chunk text)
returns void
language plpgsql
security definer
as $$
begin
  update public.chat_messages 
  set content = content || chunk
  where id = message_id;
end;
$$;

-- Insert test configuration for the specified team and assistant
do $$
begin
  -- Create test team if not exists
  if not exists (select 1 from public.teams where id = 'c8e68e0b-f9bf-40d1-8340-f59950716040') then
    insert into public.teams (id, name)
    values ('c8e68e0b-f9bf-40d1-8340-f59950716040', 'Test Team');
  end if;

  -- Insert AI config
  insert into public.team_ai_config (team_id, assistant_id)
  values ('c8e68e0b-f9bf-40d1-8340-f59950716040', 'asst_rc6j4qD2IiBS6jq7PcqEHCYm')
  on conflict (team_id) do update set
    assistant_id = excluded.assistant_id;

  -- Add current user to test team if authenticated
  if auth.uid() is not null then
    insert into public.team_members (team_id, user_id, role)
    values ('c8e68e0b-f9bf-40d1-8340-f59950716040', auth.uid(), 'owner')
    on conflict (team_id, user_id) do nothing;
  end if;
end $$;