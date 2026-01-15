# Database Setup Guide for ISAEG PFE

This guide provides the SQL queries to create all necessary tables for the PFE management system.

## Prerequisites

- A Supabase project created
- Access to the Supabase SQL Editor

## Setup Steps

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the SQL queries below
5. Click **Run** to execute

## SQL Queries - Table Creation

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (User authentication and profiles)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'professor', 'admin')),
  department TEXT,
  year TEXT,
  office TEXT,
  office_hours TEXT,
  bio TEXT,
  expertise TEXT[],
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
  UNIQUE(student_id)
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
  UNIQUE(student_id, topic_id)
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
  duration INTEGER DEFAULT 60,
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
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
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
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Tables Created

1. **profiles** - User profiles (students, professors, admins)
2. **pfe_topics** - PFE topics proposed by professors
3. **pfe_projects** - Student PFE assignments
4. **topic_applications** - Student applications to topics
5. **meetings** - Meetings between students and supervisors
6. **documents** - Files uploaded for projects
7. **calendar_events** - Events and deadlines
8. **project_milestones** - Project progress milestones
9. **assignments** - Admin assignments of students to topics

## Storage Setup

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `pfe-documents`
3. Set it to **Public** (or configure policies as needed)

## Adding Password Column (If Already Created Tables)

If you've already created the `profiles` table without the `password` column, run this SQL:

```sql
ALTER TABLE profiles ADD COLUMN password TEXT NOT NULL DEFAULT '';
```

**Note:** After adding the column, you'll need to update existing users with hashed passwords, or remove the DEFAULT constraint:

```sql
-- Remove default after adding column
ALTER TABLE profiles ALTER COLUMN password DROP DEFAULT;
```

## Important Notes

- **Authentication**: The app uses cookie-based authentication with passwords stored in the `profiles` table (SHA-256 hashed)
- **Password Storage**: Passwords are hashed using SHA-256 before storage
- All timestamps are in UTC (TIMESTAMPTZ)
- UUIDs are used for all primary keys
- Foreign key constraints ensure data integrity
- CHECK constraints validate data values
- The `profiles` table is independent and does not reference `auth.users` (no Supabase Auth dependency)