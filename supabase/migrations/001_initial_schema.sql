-- Create enum types
CREATE TYPE event_status AS ENUM ('pending', 'published', 'rejected');
CREATE TYPE event_type AS ENUM ('seminar', 'webinar', 'meetup', 'workshop', 'other');

-- Create events table
CREATE TABLE events (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  start_at     TIMESTAMP NOT NULL,
  end_at       TIMESTAMP NOT NULL,
  type         event_type NOT NULL,
  organizer    TEXT NOT NULL,
  place        TEXT NOT NULL,
  register_url TEXT NOT NULL,
  fee          INTEGER,
  target       TEXT[],
  description  TEXT,
  image_url    TEXT,
  prefecture   CHAR(2),
  status       event_status NOT NULL DEFAULT 'pending',
  created_by   TEXT NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_at ON events(start_at);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_prefecture ON events(prefecture);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow read access to published events for everyone
CREATE POLICY "Published events are viewable by everyone" ON events
    FOR SELECT USING (status = 'published');

-- Allow insert for authenticated users
CREATE POLICY "Users can insert events" ON events
    FOR INSERT WITH CHECK (true);

-- Allow update/delete for event creators or moderators
CREATE POLICY "Users can update their own events" ON events
    FOR UPDATE USING (created_by = auth.uid()::text);

CREATE POLICY "Users can delete their own events" ON events
    FOR DELETE USING (created_by = auth.uid()::text);

-- Allow moderators to update any event
CREATE POLICY "Moderators can update any event" ON events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'moderator'
        )
    ); 