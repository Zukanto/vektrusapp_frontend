/*
  # Make post_number nullable with default

  1. Changes
    - Make `post_number` column nullable with default value 1
    - This allows easier manual post creation
    - Pulse-generated posts will have sequential numbers
    - Manual posts will default to 1

  2. Reason
    - Manual posts don't need sequential numbering like pulse posts
    - Reduces required fields when creating manual posts
*/

-- Make post_number nullable with default
ALTER TABLE pulse_generated_content
ALTER COLUMN post_number SET DEFAULT 1;

ALTER TABLE pulse_generated_content
ALTER COLUMN post_number DROP NOT NULL;
