CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL UNIQUE,
  code VARCHAR(12) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','faculty','mentor')),
  avatar_color VARCHAR(12) DEFAULT '#5b5bd6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  title VARCHAR(80) DEFAULT 'Faculty member'
);
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL, email VARCHAR(180) NOT NULL, phone VARCHAR(30),
  department_id UUID REFERENCES departments(id), year INTEGER NOT NULL, semester INTEGER NOT NULL, previous_performance NUMERIC(5,2) DEFAULT 0,
  mentor_id UUID REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(160) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE, faculty_id UUID REFERENCES faculty(id), department_id UUID REFERENCES departments(id)
);
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id), date DATE NOT NULL, status VARCHAR(10) NOT NULL CHECK (status IN ('present','absent')),
  UNIQUE(student_id, subject_id, date)
);
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id), assessment_type VARCHAR(60) NOT NULL, marks NUMERIC(6,2) NOT NULL,
  max_marks NUMERIC(6,2) NOT NULL, date DATE NOT NULL
);
CREATE TABLE IF NOT EXISTS engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  participation_score NUMERIC(5,2) DEFAULT 0, assignment_completion NUMERIC(5,2) DEFAULT 0,
  activity_score NUMERIC(5,2) DEFAULT 0, date DATE NOT NULL
);
CREATE TABLE IF NOT EXISTS risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  attendance_score NUMERIC(5,2) NOT NULL, assessment_score NUMERIC(5,2) NOT NULL,
  assignment_score NUMERIC(5,2) NOT NULL, exam_score NUMERIC(5,2) NOT NULL,
  engagement_score NUMERIC(5,2) NOT NULL, risk_score NUMERIC(5,2) NOT NULL,
  risk_level VARCHAR(12) NOT NULL CHECK (risk_level IN ('low','medium','high')), calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id), type VARCHAR(80) NOT NULL, notes TEXT, status VARCHAR(20) NOT NULL DEFAULT 'pending',
  follow_up_date DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_risk_scores_student_date ON risk_scores(student_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_student_date ON assessments(student_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_interventions_student ON interventions(student_id);
