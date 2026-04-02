-- Student ↔ professor meeting negotiation (no RLS: enforce access only via Next.js API routes).
-- If you expose PostgREST directly, enable RLS and add policies.

CREATE TABLE IF NOT EXISTS public.meeting_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pfe_project_id UUID NOT NULL REFERENCES public.pfe_projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  supervisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proposed_date DATE NOT NULL,
  proposed_time TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  meeting_type TEXT NOT NULL DEFAULT 'Suivi',
  student_notes TEXT,
  professor_notes TEXT,
  proposed_by TEXT NOT NULL CHECK (proposed_by IN ('student', 'professor')),
  waiting_on TEXT NOT NULL CHECK (waiting_on IN ('professor', 'student')),
  status TEXT NOT NULL DEFAULT 'negotiating' CHECK (status IN ('negotiating', 'agreed', 'rejected')),
  agreed_meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meeting_proposals_student ON public.meeting_proposals(student_id);
CREATE INDEX IF NOT EXISTS idx_meeting_proposals_supervisor ON public.meeting_proposals(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_meeting_proposals_status ON public.meeting_proposals(status);

CREATE UNIQUE INDEX IF NOT EXISTS meeting_proposals_one_negotiation_per_pair
  ON public.meeting_proposals (student_id, supervisor_id)
  WHERE (status = 'negotiating');
