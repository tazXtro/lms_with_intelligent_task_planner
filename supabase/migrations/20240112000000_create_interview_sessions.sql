-- Create interview_sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  conversation_history JSONB DEFAULT '[]'::jsonb,
  feedback JSONB,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  overall_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_at ON interview_sessions(created_at DESC);

-- Add RLS policies
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own interview sessions
CREATE POLICY "Users can view own interview sessions"
  ON interview_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own interview sessions
CREATE POLICY "Users can insert own interview sessions"
  ON interview_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own interview sessions
CREATE POLICY "Users can update own interview sessions"
  ON interview_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own interview sessions
CREATE POLICY "Users can delete own interview sessions"
  ON interview_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_interview_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interview_sessions_updated_at
  BEFORE UPDATE ON interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_interview_sessions_updated_at();

