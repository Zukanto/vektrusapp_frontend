/*
  # Chat Assistant Integration

  1. New Tables
    - `team_ai_config`
      - `team_id` (uuid, primary key, references teams)
      - `assistant_id` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Schema Changes
    - Add `openai_thread_id` column to `chat_threads` table
    - Add index for OpenAI thread lookup

  3. Security
    - Enable RLS on `team_ai_config` table
    - Add policies for team members to read/write AI config
    - Maintain existing security model

  4. Helper Functions
    - `concat_text` function for atomic message content updates
    - Optimized for streaming text appends
*/

-- Create team_ai_config table
CREATE TABLE IF NOT EXISTS team_ai_config (
  team_id uuid PRIMARY KEY,
  assistant_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add openai_thread_id to chat_threads if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_threads' AND column_name = 'openai_thread_id'
  ) THEN
    ALTER TABLE chat_threads ADD COLUMN openai_thread_id text;
  END IF;
END $$;

-- Create index for OpenAI thread lookup
CREATE INDEX IF NOT EXISTS chat_threads_openai_idx ON chat_threads(openai_thread_id);

-- Enable RLS on team_ai_config
ALTER TABLE team_ai_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_ai_config
CREATE POLICY "Team members can read AI config"
  ON team_ai_config
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_ai_config.team_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can manage AI config"
  ON team_ai_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_ai_config.team_id 
      AND tm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_ai_config.team_id 
      AND tm.user_id = auth.uid()
    )
  );

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