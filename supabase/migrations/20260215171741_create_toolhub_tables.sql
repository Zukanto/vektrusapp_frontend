/*
  # Create Tool Hub Tables

  1. New Tables
    - `tips` - Beta tips and tricks shown in the Tool Hub carousel
      - `id` (uuid, primary key)
      - `title` (text, not null) - Tip headline
      - `content` (text, not null) - Tip description
      - `related_tool` (text) - Which tool this tip relates to (e.g. 'Chat', 'Pulse')
      - `is_active` (boolean, default true) - Whether tip is visible
      - `sort_order` (integer, default 0) - Display ordering
      - `created_at` (timestamptz)

    - `roadmap_items` - Development roadmap items for beta transparency
      - `id` (uuid, primary key)
      - `title` (text, not null) - Feature/task title
      - `tool` (text) - Related tool name
      - `status` (text, not null) - One of: done, in_progress, planned
      - `sort_order` (integer, default 0) - Display ordering
      - `created_at` (timestamptz)

    - `feedback_tickets` - User bug reports and feature requests
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - Who submitted
      - `type` (text, not null) - 'bug' or 'feature'
      - `title` (text, not null) - Ticket title
      - `description` (text, not null) - Detailed description
      - `tool` (text) - Which tool this relates to
      - `severity` (text) - Bug severity: hint, minor, blocking (null for features)
      - `status` (text, default 'open') - open, acknowledged, in_progress, resolved, declined
      - `vote_count` (integer, default 0) - Cached vote count
      - `admin_response` (text) - Admin reply
      - `created_at` (timestamptz)

    - `feedback_votes` - Vote tracking for feedback tickets
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references feedback_tickets)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - Unique constraint on (ticket_id, user_id)

  2. Security
    - RLS enabled on all tables
    - tips and roadmap_items: authenticated users can SELECT
    - feedback_tickets: authenticated users can SELECT all, INSERT own
    - feedback_votes: authenticated users can SELECT all, INSERT/DELETE own
    - vote_count auto-updated via trigger

  3. Indexes
    - tips: sort_order, is_active
    - roadmap_items: sort_order, status
    - feedback_tickets: type, vote_count, user_id
    - feedback_votes: ticket_id, user_id (unique)
*/

-- Tips table
CREATE TABLE IF NOT EXISTS tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  related_tool text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active tips"
  ON tips FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_tips_sort ON tips (sort_order);
CREATE INDEX IF NOT EXISTS idx_tips_active ON tips (is_active);

-- Roadmap items table
CREATE TABLE IF NOT EXISTS roadmap_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tool text DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT roadmap_status_check CHECK (status IN ('done', 'in_progress', 'planned'))
);

ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read roadmap"
  ON roadmap_items FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_roadmap_sort ON roadmap_items (sort_order);
CREATE INDEX IF NOT EXISTS idx_roadmap_status ON roadmap_items (status);

-- Feedback tickets table
CREATE TABLE IF NOT EXISTS feedback_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  tool text DEFAULT 'Allgemein',
  severity text,
  status text DEFAULT 'open',
  vote_count integer DEFAULT 0,
  admin_response text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT feedback_type_check CHECK (type IN ('bug', 'feature')),
  CONSTRAINT feedback_status_check CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'declined')),
  CONSTRAINT feedback_severity_check CHECK (severity IS NULL OR severity IN ('hint', 'minor', 'blocking'))
);

ALTER TABLE feedback_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all tickets"
  ON feedback_tickets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create own tickets"
  ON feedback_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback_tickets (type);
CREATE INDEX IF NOT EXISTS idx_feedback_votes ON feedback_tickets (vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback_tickets (user_id);

-- Feedback votes table
CREATE TABLE IF NOT EXISTS feedback_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES feedback_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_vote UNIQUE (ticket_id, user_id)
);

ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all votes"
  ON feedback_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert own votes"
  ON feedback_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own votes"
  ON feedback_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_votes_ticket ON feedback_votes (ticket_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON feedback_votes (user_id);

-- Trigger to auto-update vote_count on feedback_tickets
CREATE OR REPLACE FUNCTION update_ticket_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feedback_tickets SET vote_count = vote_count + 1 WHERE id = NEW.ticket_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feedback_tickets SET vote_count = vote_count - 1 WHERE id = OLD.ticket_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_vote_count'
  ) THEN
    CREATE TRIGGER trigger_update_vote_count
    AFTER INSERT OR DELETE ON feedback_votes
    FOR EACH ROW EXECUTE FUNCTION update_ticket_vote_count();
  END IF;
END $$;
