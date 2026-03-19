/*
  # Create chat_feedback table for tracking message ratings

  1. New Tables
    - `chat_feedback`
      - `id` (uuid, primary key)
      - `message_id` (uuid, references chat_messages.id)
      - `session_id` (uuid, references chat_threads.id)
      - `user_id` (uuid, references auth.users.id)
      - `rating` (text, only 'up' or 'down')
      - `message_content` (text, nullable - snapshot of AI answer)
      - `user_query` (text, nullable - snapshot of user question before)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - Index on user_id and message_id for fast lookups
    - Index on session_id for loading all feedbacks for a session

  3. Security
    - Enable RLS on `chat_feedback` table
    - Add policies for users to manage their own feedback
*/

CREATE TABLE IF NOT EXISTS chat_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  session_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating text NOT NULL CHECK (rating IN ('up', 'down')),
  message_content text,
  user_query text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_feedback_user_message ON chat_feedback(user_id, message_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_session ON chat_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_user ON chat_feedback(user_id);

ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
  ON chat_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON chat_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON chat_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON chat_feedback
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
