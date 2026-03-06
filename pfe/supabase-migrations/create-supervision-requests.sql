-- Run in Supabase SQL Editor if supervision_requests is missing
CREATE TABLE IF NOT EXISTS public.supervision_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, professor_id)
);
CREATE INDEX IF NOT EXISTS idx_supervision_requests_professor ON public.supervision_requests(professor_id);
CREATE INDEX IF NOT EXISTS idx_supervision_requests_student ON public.supervision_requests(student_id);
