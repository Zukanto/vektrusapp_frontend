/*
  # Add colors_edited column to brand_profiles

  ## Summary
  Adds a boolean column `colors_edited` to the `brand_profiles` table.
  This flag tracks whether the user has manually reviewed and confirmed
  the automatically detected color palette, which feeds into the
  Confidence Section checklist in the Brand Studio.

  ## Changes
  - `brand_profiles.colors_edited` (boolean, default false) — set to true
    when the user manually saves/confirms the color palette in the
    ColorSection editor.

  ## Notes
  - Default is false (not yet manually confirmed)
  - Updated via the existing `updateField` function in BrandResult
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_profiles' AND column_name = 'colors_edited'
  ) THEN
    ALTER TABLE brand_profiles ADD COLUMN colors_edited boolean DEFAULT false;
  END IF;
END $$;
