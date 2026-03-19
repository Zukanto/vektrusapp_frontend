/*
  # Extend Users Table for Profile Management

  1. Changes to `users` table
    - Add `auth_user_id` (UUID) - Foreign key to auth.users
    - Add `first_name` (TEXT) - User's first name
    - Add `last_name` (TEXT) - Optional last name
    - Add `company_name` (TEXT) - Company/organization name
    - Add `role` (TEXT) - User's role/job title
    - Add `website` (TEXT) - Optional website URL
    - Add `bio` (TEXT) - Optional user bio (max 500 chars)
    - Add `avatar_url` (TEXT) - Optional avatar/profile picture URL
    - Add `updated_at` (TIMESTAMPTZ) - Last update timestamp

  2. Security
    - Update RLS policies for profile access
    - Users can view own profile
    - Users can update own profile

  3. Notes
    - Existing users table will be extended
    - No data loss, only adding new columns
    - All new columns are nullable for backward compatibility
*/

-- Add new columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN last_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN company_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users ADD COLUMN role text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'website'
  ) THEN
    ALTER TABLE public.users ADD COLUMN website text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.users ADD COLUMN bio text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.users ADD COLUMN avatar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create index on auth_user_id for faster lookups
CREATE INDEX IF NOT EXISTS users_auth_user_id_idx ON public.users(auth_user_id);

-- Update RLS policies
DO $$
BEGIN
  -- Drop old policy if exists
  DROP POLICY IF EXISTS "Users can read own data" ON public.users;

  -- Create new policy for reading own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users'
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = auth_user_id OR auth.uid() = id);
  END IF;

  -- Create policy for updating own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users'
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = auth_user_id OR auth.uid() = id)
      WITH CHECK (auth.uid() = auth_user_id OR auth.uid() = id);
  END IF;

  -- Create policy for inserting own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users'
    AND policyname = 'Users can create own profile'
  ) THEN
    CREATE POLICY "Users can create own profile" ON public.users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = auth_user_id OR auth.uid() = id);
  END IF;
END $$;

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, first_name, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    now()
  )
  ON CONFLICT (email) DO NOTHING;
  RETURN new;
END;
$$;

-- Create trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();