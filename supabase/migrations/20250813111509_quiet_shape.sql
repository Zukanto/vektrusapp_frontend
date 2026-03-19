/*
  # Chat Assistant Integration with OpenAI

  1. New Tables
    - Updates `team_ai_config` with proper RLS policies using exception handling
    - Adds `openai_thread_id` to `chat_threads` for thread persistence
    - Adds `concat_text` RPC function for atomic text updates during streaming

  2. Test Data
    - Configures team `c8e68e0b-f9bf-40d1-8340-f59950716040` with assistant `asst_rc6j4qD2IiBS6jq7PcqEHCYm`
    - Sets up test user in team_members

  3. Security
    - RLS policies for team-based access control with exception handling
    - Secure assistant configuration per team

  4. Functions
    - `concat_text` for atomic message content updates during streaming
*/

-- Enable RLS on team_ai_config and create policies with exception handling
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

-- Add openai_thread_id to chat_threads if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'chat_threads' and column_name = 'openai_thread_id'
  ) then
    alter table public.chat_threads add column openai_thread_id text;
    create index if not exists chat_threads_openai_idx on public.chat_threads(openai_thread_id);
  end if;
end $$;

-- Add user_id to chat_messages if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'chat_messages' and column_name = 'user_id'
  ) then
    alter table public.chat_messages add column user_id uuid references auth.users(id);
  end if;
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
insert into public.team_ai_config (team_id, assistant_id)
values ('c8e68e0b-f9bf-40d1-8340-f59950716040', 'asst_rc6j4qD2IiBS6jq7PcqEHCYm')
on conflict (team_id) do update set
  assistant_id = excluded.assistant_id;

-- Create test user and team member if not exists
do $$
begin
  -- Insert test user into team_members if not exists
  if not exists (
    select 1 from public.team_members 
    where team_id = 'c8e68e0b-f9bf-40d1-8340-f59950716040'
  ) then
    -- We'll use the current authenticated user or create a placeholder
    insert into public.team_members (team_id, user_id, role)
    select 'c8e68e0b-f9bf-40d1-8340-f59950716040', auth.uid(), 'owner'
    where auth.uid() is not null;
  end if;
end $$;