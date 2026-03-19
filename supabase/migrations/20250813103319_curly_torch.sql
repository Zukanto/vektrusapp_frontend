/*
  # Chat Assistant Integration
  1. New Tables
    - `team_ai_config`
      - `team_id` (uuid, primary key, references teams)
      - `assistant_id` (text, not null)
      - `created_at` (timestamp)
  2. Schema Changes
    - Add `openai_thread_id` column to `chat_threads` table
    - Add index for OpenAI thread lookups
  3. Security
    - Enable RLS on `team_ai_config` table
    - Add policies for team members to read/write AI config
    - Maintain existing security model
  4. Functions
    - `concat_text` RPC for atomic text appending during streaming
*/

-- Create team AI configuration table
CREATE TABLE IF NOT EXISTS team_ai_config (
  team_id uuid PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
  assistant_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add OpenAI thread ID to chat threads if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_threads' AND column_name = 'openai_thread_id'
  ) THEN
    ALTER TABLE chat_threads ADD COLUMN openai_thread_id text;
  END IF;
END $$;

-- Add index for OpenAI thread lookups
CREATE INDEX IF NOT EXISTS chat_threads_openai_idx ON chat_threads(openai_thread_id);

-- Enable RLS on team AI config
ALTER TABLE team_ai_config ENABLE ROW LEVEL SECURITY;

-- IDEMPOTENT POLICY CREATION - Fixed version
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "team_ai_cfg_read" ON team_ai_config;
  DROP POLICY IF EXISTS "team_ai_cfg_write" ON team_ai_config;
  
  -- Policy for reading AI config (team members only)
  CREATE POLICY "team_ai_cfg_read"
    ON team_ai_config
    FOR SELECT
    TO public
    USING (
      EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.team_id = team_ai_config.team_id 
        AND tm.user_id = auth.uid()
      )
    );

  -- Policy for writing AI config (team members only)
  CREATE POLICY "team_ai_cfg_write"
    ON team_ai_config
    FOR INSERT
    TO public
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.team_id = team_ai_config.team_id 
        AND tm.user_id = auth.uid()
      )
    );
    
END $$;

-- Atomic text concatenation function for streaming
CREATE OR REPLACE FUNCTION concat_text(id uuid, chunk text)
RETURNS text 
LANGUAGE plpgsql 
AS $$
DECLARE 
  new_content text;
BEGIN
  UPDATE chat_messages
  SET content = content || chunk
  WHERE chat_messages.id = concat_text.id
  RETURNING content INTO new_content;
  
  RETURN new_content;
END;
$$;