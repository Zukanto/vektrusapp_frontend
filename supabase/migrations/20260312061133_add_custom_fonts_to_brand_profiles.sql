/*
  # Add custom font fields to brand_profiles

  ## Summary
  Extends the `fonts` JSONB column semantics by documenting that it now supports
  three additional optional keys: `heading_custom`, `body_custom`, `accent_custom`.
  These store user-selected Google Fonts overrides, separate from the AI-detected
  font names (`heading`, `body`, `accent`).

  Because the field is stored as JSONB, no schema change is required — new keys are
  simply written into the existing column. This migration records the intent and
  adds a `fonts_edited` boolean flag (mirrors the existing `colors_edited` pattern)
  so other parts of the app can detect whether the user has manually customised fonts.

  ## Changes
  - New column `fonts_edited` (boolean, default false) on `brand_profiles`
  - No destructive changes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_profiles' AND column_name = 'fonts_edited'
  ) THEN
    ALTER TABLE brand_profiles ADD COLUMN fonts_edited boolean DEFAULT false;
  END IF;
END $$;
