/*
  # Add RLS policies for pulse_configurations

  1. Problem
    - RLS is enabled on `pulse_configurations` but no policies exist
    - All client-side queries return zero rows, causing "Noch keine Generierungen"

  2. Security Changes
    - Add SELECT policy: authenticated users can read their own configurations
    - Add INSERT policy: authenticated users can create their own configurations
    - Add UPDATE policy: authenticated users can update their own configurations
    - Add DELETE policy: authenticated users can delete their own configurations
    - Add service_role full access policy for backend operations
*/

CREATE POLICY "Users can read own pulse configurations"
  ON pulse_configurations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pulse configurations"
  ON pulse_configurations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pulse configurations"
  ON pulse_configurations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pulse configurations"
  ON pulse_configurations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to pulse configurations"
  ON pulse_configurations
  FOR ALL
  TO service_role
  USING (auth.role() = 'service_role');
