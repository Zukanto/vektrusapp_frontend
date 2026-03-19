/*
  # Chat Assistant Integration

  1. Database Schema Updates
    - Add `openai_thread_id` to `chat_threads` table
    - Create `team_ai_config` table for assistant configuration
    - Add RPC function for atomic text concatenation
    - Set up proper RLS policies

  2. Security
    - Enable RLS on `team_ai_config` table
    - Add policies for team members to read/write AI config
    - Ensure proper access control for chat operations

  3. Functions
    - `concat_text` RPC for atomic message updates during streaming
*/

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

-- Create index for openai_thread_id
CREATE INDEX IF NOT EXISTS chat_threads_openai_idx ON chat_threads(openai_thread_id);

-- Create team_ai_config table if not exists
CREATE TABLE IF NOT EXISTS team_ai_config (
  team_id uuid PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
  assistant_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on team_ai_config
ALTER TABLE team_ai_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_ai_config
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

CREATE POLICY "Team members can insert AI config"
  ON team_ai_config
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_ai_config.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update AI config"
  ON team_ai_config
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_ai_config.team_id
      AND tm.user_id = auth.uid()
    )
  );

-- Insert test configuration for the specified team
INSERT INTO team_ai_config (team_id, assistant_id)
VALUES ('c8e68e0b-f9bf-40d1-8340-f59950716040', 'asst_rc6j4qD2IiBS6jq7PcqEHCYm')
ON CONFLICT (team_id) DO UPDATE SET
  assistant_id = EXCLUDED.assistant_id;

-- Create atomic text concatenation function
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