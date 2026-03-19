/*
  # Fix handle_new_user trigger to include company_name

  ## Problem
  The trigger `handle_new_user` only saves `first_name` from the auth metadata,
  but not `company_name`. The client-side insert then fails silently because
  the row already exists (ON CONFLICT DO NOTHING).

  ## Fix
  Update the trigger function to also read `company_name` from `raw_user_meta_data`
  and save it to the users table on signup.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, first_name, company_name, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'company_name', ''),
    now()
  )
  ON CONFLICT (email) DO UPDATE SET
    company_name = COALESCE(EXCLUDED.company_name, public.users.company_name);
  RETURN new;
END;
$$;
