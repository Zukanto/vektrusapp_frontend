/*
  # User Platform Preferences

  1. New Tables
    - `user_platform_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `platform_id` (text) - e.g., 'instagram', 'linkedin', 'tiktok'
      - `is_expanded` (boolean) - whether platform is expanded in calendar view
      - `is_active` (boolean) - whether platform is actively used
      - `sort_order` (int) - custom sort order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_platform_preferences` table
    - Add policy for users to read their own preferences
    - Add policy for users to insert their own preferences
    - Add policy for users to update their own preferences
    - Add policy for users to delete their own preferences

  3. Indexes
    - Index on user_id for fast lookups
    - Unique constraint on (user_id, platform_id)
*/

CREATE TABLE IF NOT EXISTS user_platform_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform_id text NOT NULL,
  is_expanded boolean DEFAULT true,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform_id)
);

-- Enable RLS
ALTER TABLE user_platform_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can read own platform preferences"
  ON user_platform_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own platform preferences"
  ON user_platform_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own platform preferences"
  ON user_platform_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own platform preferences"
  ON user_platform_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_platform_preferences_user_id ON user_platform_preferences(user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_platform_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_platform_preferences_updated_at
  BEFORE UPDATE ON user_platform_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_platform_preferences_updated_at();