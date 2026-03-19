/*
  # Create design_templates table (safe version)

  ## Summary
  Creates the design_templates table for storing AI-generated design templates
  per user after brand analysis. Uses IF NOT EXISTS for idempotency.

  ## New Tables
  - `design_templates`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to auth.users)
    - `name` (text)
    - `description` (text)
    - `platform` (text)
    - `aspect_ratio` (text)
    - `template_type` (text)
    - `preview_url` (text)
    - `is_active` (boolean)
    - `is_default` (boolean)
    - `created_at` / `updated_at` (timestamptz)

  ## Security
  - RLS enabled with per-user policies
*/

CREATE TABLE IF NOT EXISTS design_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  platform text DEFAULT '',
  aspect_ratio text DEFAULT '1:1',
  template_type text DEFAULT '',
  preview_url text DEFAULT '',
  is_active boolean DEFAULT false,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS design_templates_user_id_idx ON design_templates(user_id);
CREATE INDEX IF NOT EXISTS design_templates_is_default_idx ON design_templates(user_id, is_default);

ALTER TABLE design_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'design_templates' AND policyname = 'Users can view own templates'
  ) THEN
    CREATE POLICY "Users can view own templates"
      ON design_templates FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'design_templates' AND policyname = 'Users can insert own templates'
  ) THEN
    CREATE POLICY "Users can insert own templates"
      ON design_templates FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'design_templates' AND policyname = 'Users can update own templates'
  ) THEN
    CREATE POLICY "Users can update own templates"
      ON design_templates FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'design_templates' AND policyname = 'Users can delete own templates'
  ) THEN
    CREATE POLICY "Users can delete own templates"
      ON design_templates FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
