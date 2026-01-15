-- ============================================
-- ISAEG PFE Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'professor', 'admin')),
  department TEXT,
  year TEXT, -- For students: '5ème année', etc.
  office TEXT, -- For professors
  office_hours TEXT, -- For professors
  bio TEXT, -- For professors
  expertise TEXT[], -- For professors: array of skills
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PFE TOPICS TABLE
-- ============================================
CREATE TABLE pfe_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  department TEXT,
  professor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PFE PROJECTS TABLE (Student PFE assignments)
-- ============================================
CREATE TABLE pfe_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES pfe_topics(id) ON DELETE SET NULL,
  supervisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id) -- One PFE per student
);

-- ============================================
-- 4. TOPIC APPLICATIONS TABLE
-- ============================================
CREATE TABLE topic_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES pfe_topics(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(student_id, topic_id) -- One application per student per topic
);

-- ============================================
-- 5. MEETINGS TABLE
-- ============================================
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pfe_project_id UUID REFERENCES pfe_projects(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER DEFAULT 60, -- Duration in minutes
  type TEXT DEFAULT 'Suivi' CHECK (type IN ('Suivi', 'Révision', 'Présentation', 'Kick-off', 'Autre')),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),
  notes TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. DOCUMENTS TABLE
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pfe_project_id UUID REFERENCES pfe_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_type TEXT NOT NULL, -- PDF, DOCX, PNG, ZIP, etc.
  file_size BIGINT, -- Size in bytes
  category TEXT DEFAULT 'Autre' CHECK (category IN ('Cahier des charges', 'Documentation', 'Rapports', 'Design', 'Code source', 'Autre')),
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. CALENDAR EVENTS TABLE
-- ============================================
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pfe_project_id UUID REFERENCES pfe_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  type TEXT DEFAULT 'meeting' CHECK (type IN ('meeting', 'deadline', 'presentation', 'review', 'other')),
  location TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. PROJECT MILESTONES TABLE
-- ============================================
CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pfe_project_id UUID REFERENCES pfe_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  completed_date DATE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. ASSIGNMENTS TABLE (Admin assignments)
-- ============================================
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES pfe_topics(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'cancelled')),
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin who made the assignment
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for better query performance
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_department ON profiles(department);
CREATE INDEX idx_pfe_topics_professor ON pfe_topics(professor_id);
CREATE INDEX idx_pfe_topics_status ON pfe_topics(status);
CREATE INDEX idx_pfe_projects_student ON pfe_projects(student_id);
CREATE INDEX idx_pfe_projects_topic ON pfe_projects(topic_id);
CREATE INDEX idx_pfe_projects_supervisor ON pfe_projects(supervisor_id);
CREATE INDEX idx_topic_applications_student ON topic_applications(student_id);
CREATE INDEX idx_topic_applications_topic ON topic_applications(topic_id);
CREATE INDEX idx_meetings_project ON meetings(pfe_project_id);
CREATE INDEX idx_meetings_student ON meetings(student_id);
CREATE INDEX idx_meetings_supervisor ON meetings(supervisor_id);
CREATE INDEX idx_documents_project ON documents(pfe_project_id);
CREATE INDEX idx_calendar_events_project ON calendar_events(pfe_project_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(date);
CREATE INDEX idx_milestones_project ON project_milestones(pfe_project_id);
CREATE INDEX idx_assignments_student ON assignments(student_id);
CREATE INDEX idx_assignments_topic ON assignments(topic_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pfe_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pfe_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PFE Topics policies
CREATE POLICY "Anyone can view approved topics"
  ON pfe_topics FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Professors can view their own topics"
  ON pfe_topics FOR SELECT
  USING (
    professor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Professors can create topics"
  ON pfe_topics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'professor'
    )
  );

CREATE POLICY "Professors can update their own topics"
  ON pfe_topics FOR UPDATE
  USING (
    professor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PFE Projects policies
CREATE POLICY "Students can view their own project"
  ON pfe_projects FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Supervisors can view their students' projects"
  ON pfe_projects FOR SELECT
  USING (
    supervisor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all projects"
  ON pfe_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Topic Applications policies
CREATE POLICY "Students can view their own applications"
  ON topic_applications FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can create applications"
  ON topic_applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );

CREATE POLICY "Professors can view applications for their topics"
  ON topic_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pfe_topics
      WHERE pfe_topics.id = topic_applications.topic_id
      AND pfe_topics.professor_id = auth.uid()
    )
  );

-- Meetings policies
CREATE POLICY "Users can view meetings for their projects"
  ON meetings FOR SELECT
  USING (
    student_id = auth.uid() OR
    supervisor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Supervisors can create meetings"
  ON meetings FOR INSERT
  WITH CHECK (
    supervisor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Documents policies
CREATE POLICY "Users can view documents for their projects"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pfe_projects
      WHERE pfe_projects.id = documents.pfe_project_id
      AND (
        pfe_projects.student_id = auth.uid() OR
        pfe_projects.supervisor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can upload documents to their projects"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pfe_projects
      WHERE pfe_projects.id = documents.pfe_project_id
      AND (
        pfe_projects.student_id = auth.uid() OR
        pfe_projects.supervisor_id = auth.uid()
      )
    )
  );

-- Calendar Events policies
CREATE POLICY "Users can view events for their projects"
  ON calendar_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pfe_projects
      WHERE pfe_projects.id = calendar_events.pfe_project_id
      AND (
        pfe_projects.student_id = auth.uid() OR
        pfe_projects.supervisor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Project Milestones policies
CREATE POLICY "Users can view milestones for their projects"
  ON project_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pfe_projects
      WHERE pfe_projects.id = project_milestones.pfe_project_id
      AND (
        pfe_projects.student_id = auth.uid() OR
        pfe_projects.supervisor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Assignments policies
CREATE POLICY "Admins can view all assignments"
  ON assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Students can view their own assignments"
  ON assignments FOR SELECT
  USING (student_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pfe_topics_updated_at BEFORE UPDATE ON pfe_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pfe_projects_updated_at BEFORE UPDATE ON pfe_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON project_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Note: Profiles will be created automatically via trigger when users sign up
-- You can manually insert test data if needed after creating users in auth.users
