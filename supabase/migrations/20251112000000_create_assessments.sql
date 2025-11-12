-- Create lesson_assessments table
CREATE TABLE IF NOT EXISTS lesson_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  time_limit_minutes INTEGER, -- NULL means no time limit
  max_attempts INTEGER, -- NULL means unlimited attempts
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create assessment_questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES lesson_assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB NOT NULL DEFAULT '[]', -- Array of option strings
  correct_answer INTEGER NOT NULL, -- Index of correct option (0-based)
  explanation TEXT, -- Explanation of correct answer
  points INTEGER DEFAULT 1 CHECK (points > 0),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assessment_id, order_index)
);

-- Create assessment_attempts table
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES lesson_assessments(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}', -- { "question_id": selected_answer_index }
  score NUMERIC(5,2) NOT NULL DEFAULT 0, -- Percentage score (0-100)
  passed BOOLEAN NOT NULL DEFAULT false,
  time_taken_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_assessments_lesson ON lesson_assessments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_assessments_course ON lesson_assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment ON assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_learner ON assessment_attempts(learner_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_enrollment ON assessment_attempts(enrollment_id);

-- Enable Row Level Security
ALTER TABLE lesson_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_assessments
-- Educators can manage assessments for their own courses
CREATE POLICY "Educators can view their own course assessments"
  ON lesson_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lesson_assessments.course_id 
      AND courses.educator_id = auth.uid()
    )
  );

CREATE POLICY "Educators can insert assessments for their courses"
  ON lesson_assessments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lesson_assessments.course_id 
      AND courses.educator_id = auth.uid()
    )
  );

CREATE POLICY "Educators can update their own course assessments"
  ON lesson_assessments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lesson_assessments.course_id 
      AND courses.educator_id = auth.uid()
    )
  );

CREATE POLICY "Educators can delete their own course assessments"
  ON lesson_assessments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lesson_assessments.course_id 
      AND courses.educator_id = auth.uid()
    )
  );

-- Learners can view assessments for enrolled courses
CREATE POLICY "Learners can view assessments for enrolled courses"
  ON lesson_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.course_id = lesson_assessments.course_id 
      AND enrollments.learner_id = auth.uid()
    )
  );

-- RLS Policies for assessment_questions
-- Educators can manage questions for their assessments
CREATE POLICY "Educators can manage questions for their assessments"
  ON assessment_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lesson_assessments la
      JOIN courses c ON c.id = la.course_id
      WHERE la.id = assessment_questions.assessment_id 
      AND c.educator_id = auth.uid()
    )
  );

-- Learners can view questions for enrolled course assessments
CREATE POLICY "Learners can view questions for enrolled assessments"
  ON assessment_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lesson_assessments la
      JOIN enrollments e ON e.course_id = la.course_id
      WHERE la.id = assessment_questions.assessment_id 
      AND e.learner_id = auth.uid()
    )
  );

-- RLS Policies for assessment_attempts
-- Learners can view their own attempts
CREATE POLICY "Learners can view their own attempts"
  ON assessment_attempts FOR SELECT
  USING (learner_id = auth.uid());

-- Learners can insert their own attempts
CREATE POLICY "Learners can create their own attempts"
  ON assessment_attempts FOR INSERT
  WITH CHECK (learner_id = auth.uid());

-- Learners can update their own incomplete attempts
CREATE POLICY "Learners can update their own incomplete attempts"
  ON assessment_attempts FOR UPDATE
  USING (learner_id = auth.uid() AND submitted_at IS NULL);

-- Educators can view attempts for their course assessments
CREATE POLICY "Educators can view attempts for their assessments"
  ON assessment_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lesson_assessments la
      JOIN courses c ON c.id = la.course_id
      WHERE la.id = assessment_attempts.assessment_id 
      AND c.educator_id = auth.uid()
    )
  );

-- Add updated_at trigger for lesson_assessments
CREATE OR REPLACE FUNCTION update_lesson_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lesson_assessments_updated_at
  BEFORE UPDATE ON lesson_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_assessments_updated_at();

-- Add updated_at trigger for assessment_questions
CREATE OR REPLACE FUNCTION update_assessment_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assessment_questions_updated_at
  BEFORE UPDATE ON assessment_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_questions_updated_at();

