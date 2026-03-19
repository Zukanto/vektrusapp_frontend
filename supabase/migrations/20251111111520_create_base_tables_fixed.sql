/*
  # Create Base Tables for Chat System
  
  1. Tables Created:
    - teams: Team management
    - team_members: User-Team relationships
  
  2. Security:
    - RLS enabled on all tables
    - Team-based access control
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create team_members table first
CREATE TABLE IF NOT EXISTS public.team_members (
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Now create policies that reference team_members
CREATE POLICY "Team members can view their teams"
  ON public.teams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their team memberships"
  ON public.team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage team memberships"
  ON public.team_members
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
