/*
  # Chat Assistant Integration

  1. New Tables
    - `users` (if not exists)
    - `teams` (already exists)
    - `team_members` (already exists)
    - `team_ai_config`
    - `chat_threads`
    - `chat_messages`

  2. Security
    - Enable RLS on all tables
    - Add policies for team-based access control

  3. Functions
    - `concat_text` for atomic text concatenation during streaming
*/

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data" ON public.users
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- Create team_ai_config table
CREATE TABLE IF NOT EXISTS public.team_ai_config (
  team_id uuid PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  assistant_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.team_ai_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_ai_config' 
    AND policyname = 'Team members can read AI config'
  ) THEN
    CREATE POLICY "Team members can read AI config" ON public.team_ai_config
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.team_id = team_ai_config.team_id
            AND tm.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_ai_config' 
    AND policyname = 'Team members can write AI config'
  ) THEN
    CREATE POLICY "Team members can write AI config" ON public.team_ai_config
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.team_id = team_ai_config.team_id
            AND tm.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create chat_threads table
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title text,
  openai_thread_id text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_threads_team_idx ON public.chat_threads(team_id);
CREATE INDEX IF NOT EXISTS chat_threads_openai_idx ON public.chat_threads(openai_thread_id);
CREATE INDEX IF NOT EXISTS chat_threads_updated_idx ON public.chat_threads(updated_at DESC);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_threads' 
    AND policyname = 'Team members can read threads'
  ) THEN
    CREATE POLICY "Team members can read threads" ON public.chat_threads
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.team_id = chat_threads.team_id
            AND tm.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_threads' 
    AND policyname = 'Team members can create threads'
  ) THEN
    CREATE POLICY "Team members can create threads" ON public.chat_threads
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.team_id = chat_threads.team_id
            AND tm.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_threads' 
    AND policyname = 'Team members can update threads'
  ) THEN
    CREATE POLICY "Team members can update threads" ON public.chat_threads
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.team_id = chat_threads.team_id
            AND tm.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL DEFAULT '',
  meta jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'committed' CHECK (status IN ('pending', 'streaming', 'committed', 'error')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_thread_idx ON public.chat_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS chat_messages_team_idx ON public.chat_messages(team_id, created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' 
    AND policyname = 'Team members can read messages'
  ) THEN
    CREATE POLICY "Team members can read messages" ON public.chat_messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.team_id = chat_messages.team_id
            AND tm.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' 
    AND policyname = 'Team members can create messages'
  ) THEN
    CREATE POLICY "Team members can create messages" ON public.chat_messages
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.team_id = chat_messages.team_id
            AND tm.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' 
    AND policyname = 'Team members can update messages'
  ) THEN
    CREATE POLICY "Team members can update messages" ON public.chat_messages
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.team_id = chat_messages.team_id
            AND tm.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create RPC function for atomic text concatenation
CREATE OR REPLACE FUNCTION public.concat_text(message_id uuid, chunk text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.chat_messages 
  SET content = content || chunk
  WHERE id = message_id;
END;
$$;

-- Create test team and configuration
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.teams WHERE id = 'c8e68e0b-f9bf-40d1-8340-f59950716040') THEN
    INSERT INTO public.teams (id, name)
    VALUES ('c8e68e0b-f9bf-40d1-8340-f59950716040', 'Test Team');
  END IF;

  INSERT INTO public.team_ai_config (team_id, assistant_id)
  VALUES ('c8e68e0b-f9bf-40d1-8340-f59950716040', 'asst_rc6j4qD2IiBS6jq7PcqEHCYm')
  ON CONFLICT (team_id) DO UPDATE SET
    assistant_id = EXCLUDED.assistant_id;

  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES ('c8e68e0b-f9bf-40d1-8340-f59950716040', auth.uid(), 'owner')
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;
END $$;
