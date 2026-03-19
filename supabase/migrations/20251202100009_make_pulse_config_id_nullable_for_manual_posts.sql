/*
  # Make pulse_config_id nullable for manual posts

  1. Changes
    - Make `pulse_config_id` column nullable in `pulse_generated_content` table
    - This allows manual posts (created directly in calendar) to exist without a pulse configuration
    - Pulse-generated posts will still have a pulse_config_id
    - Manual posts will have pulse_config_id = NULL and source = 'manual'

  2. Security
    - No changes to RLS policies
    - Users can still only access their own posts via user_id check
*/

-- Make pulse_config_id nullable
ALTER TABLE pulse_generated_content
ALTER COLUMN pulse_config_id DROP NOT NULL;
