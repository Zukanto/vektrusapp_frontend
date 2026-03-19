/*
  # Create Media Files Table for Image Generation
  
  1. New Table:
    - media_files: Stores generated images from n8n workflow
      - id (uuid, primary key)
      - user_id (text) - matches with auth user
      - filename (text)
      - file_type (text) - e.g., "image/png"
      - public_url (text) - direct URL to Supabase Storage
      - storage_path (text)
      - generated_by (text) - e.g., "dalle"
      - generation_prompt (text)
      - created_at (timestamp)
      - updated_at (timestamp)
  
  2. Security:
    - RLS enabled
    - Users can only see their own images
    - Public URLs are accessible without auth
*/

CREATE TABLE IF NOT EXISTS public.media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  filename text NOT NULL,
  file_type text NOT NULL,
  public_url text NOT NULL,
  storage_path text NOT NULL,
  generated_by text NOT NULL DEFAULT 'dalle',
  generation_prompt text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_files_user_idx ON public.media_files(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS media_files_created_idx ON public.media_files(created_at DESC);

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own media files"
  ON public.media_files
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own media files"
  ON public.media_files
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Service role can insert media files"
  ON public.media_files
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update media files"
  ON public.media_files
  FOR UPDATE
  TO service_role
  USING (true);
