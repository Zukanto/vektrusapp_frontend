/*
  # Create Vision Projects Table

  1. New Tables
    - `vision_projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product` (text) - Product name
      - `purpose` (text) - Purpose of the visual (organic_post, paid_ad, story_reel, product_visual)
      - `target_audience` (text, nullable) - Target audience description
      - `description` (text) - User's creative brief
      - `advanced_notes` (text, nullable) - Additional notes
      - `style` (text, nullable) - Visual style preference
      - `mood` (text, nullable) - Mood/tone preference
      - `output_type` (text) - Type of output (image, image_video)
      - `video_length` (int, nullable) - Video length in seconds (5, 10, 15)
      - `format` (text) - Aspect ratio (9:16, 1:1, 16:9)
      - `model_preference` (text) - Preferred AI model (auto, nano, sora)
      - `status` (text) - Current status (draft, queued, generating, completed, error)
      - `generated_prompt` (text, nullable) - AI-generated detailed prompt
      - `error_message` (text, nullable) - Error details if failed
      - `platform` (text, nullable) - Target platform
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `vision_reference_images`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to vision_projects)
      - `url` (text) - Image URL
      - `thumbnail` (text) - Thumbnail URL
      - `is_main` (boolean) - Is this the main reference
      - `role` (text, nullable) - Image role (product_focus, lifestyle, packaging)
      - `created_at` (timestamptz)

    - `vision_results`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to vision_projects)
      - `type` (text) - Result type (image, video)
      - `url` (text) - Result URL
      - `thumbnail` (text) - Thumbnail URL
      - `duration` (int, nullable) - Video duration in seconds
      - `is_variant` (boolean) - Is this a variant
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own projects
*/

-- Create vision_projects table
CREATE TABLE IF NOT EXISTS vision_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('organic_post', 'paid_ad', 'story_reel', 'product_visual')),
  target_audience text,
  description text NOT NULL,
  advanced_notes text,
  style text CHECK (style IN ('realistic', 'cinematic', 'clean_studio', 'ugc_style')),
  mood text CHECK (mood IN ('energetic', 'trustworthy', 'luxurious', 'everyday')),
  output_type text NOT NULL CHECK (output_type IN ('image', 'image_video')),
  video_length int CHECK (video_length IN (5, 10, 15)),
  format text NOT NULL CHECK (format IN ('9:16', '1:1', '16:9')),
  model_preference text NOT NULL CHECK (model_preference IN ('auto', 'nano', 'sora')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'generating', 'completed', 'error')),
  generated_prompt text,
  error_message text,
  platform text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vision_reference_images table
CREATE TABLE IF NOT EXISTS vision_reference_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES vision_projects(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  thumbnail text NOT NULL,
  is_main boolean DEFAULT false,
  role text CHECK (role IN ('product_focus', 'lifestyle', 'packaging')),
  created_at timestamptz DEFAULT now()
);

-- Create vision_results table
CREATE TABLE IF NOT EXISTS vision_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES vision_projects(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  url text NOT NULL,
  thumbnail text NOT NULL,
  duration int,
  is_variant boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vision_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_results ENABLE ROW LEVEL SECURITY;

-- Policies for vision_projects
CREATE POLICY "Users can view own vision projects"
  ON vision_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vision projects"
  ON vision_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vision projects"
  ON vision_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vision projects"
  ON vision_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for vision_reference_images
CREATE POLICY "Users can view reference images of own projects"
  ON vision_reference_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vision_projects
      WHERE vision_projects.id = vision_reference_images.project_id
      AND vision_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reference images for own projects"
  ON vision_reference_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vision_projects
      WHERE vision_projects.id = vision_reference_images.project_id
      AND vision_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reference images of own projects"
  ON vision_reference_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vision_projects
      WHERE vision_projects.id = vision_reference_images.project_id
      AND vision_projects.user_id = auth.uid()
    )
  );

-- Policies for vision_results
CREATE POLICY "Users can view results of own projects"
  ON vision_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vision_projects
      WHERE vision_projects.id = vision_results.project_id
      AND vision_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create results for own projects"
  ON vision_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vision_projects
      WHERE vision_projects.id = vision_results.project_id
      AND vision_projects.user_id = auth.uid()
    )
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_vision_projects_user_id ON vision_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_projects_status ON vision_projects(status);
CREATE INDEX IF NOT EXISTS idx_vision_reference_images_project_id ON vision_reference_images(project_id);
CREATE INDEX IF NOT EXISTS idx_vision_results_project_id ON vision_results(project_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vision_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_vision_projects_updated_at ON vision_projects;
CREATE TRIGGER trigger_update_vision_projects_updated_at
  BEFORE UPDATE ON vision_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_vision_projects_updated_at();
