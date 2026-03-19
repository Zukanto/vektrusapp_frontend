/*
  # Create brand_profiles table (safe version)

  ## Summary
  Creates the brand_profiles table for AI-analyzed brand identity data.
  Uses IF NOT EXISTS and DO blocks for safe idempotent execution.
*/

CREATE TABLE IF NOT EXISTS brand_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url text,
  logo_dark_url text,
  logo_storage_path text,
  colors jsonb DEFAULT '{}',
  fonts jsonb DEFAULT '{}',
  slogan text DEFAULT '',
  visual_style text DEFAULT '',
  tonality jsonb DEFAULT '{}',
  design_dna jsonb DEFAULT '{}',
  reference_images jsonb DEFAULT '[]',
  style_summary text DEFAULT '',
  prompt_guidelines text DEFAULT '',
  confidence jsonb DEFAULT '{}',
  onboarding_status text NOT NULL DEFAULT 'pending',
  extraction_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'brand_profiles' AND policyname = 'Users can read own brand profile'
  ) THEN
    CREATE POLICY "Users can read own brand profile"
      ON brand_profiles FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'brand_profiles' AND policyname = 'Users can insert own brand profile'
  ) THEN
    CREATE POLICY "Users can insert own brand profile"
      ON brand_profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'brand_profiles' AND policyname = 'Users can update own brand profile'
  ) THEN
    CREATE POLICY "Users can update own brand profile"
      ON brand_profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'brand_profiles' AND policyname = 'Users can delete own brand profile'
  ) THEN
    CREATE POLICY "Users can delete own brand profile"
      ON brand_profiles FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
