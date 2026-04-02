-- In-app notifications for students and professors (cross-role messaging via SECURITY DEFINER RPC)

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- No row policies here: add SELECT/UPDATE (user_id = auth.uid()) elsewhere or /api/notifications will fail.

-- Inserts only via RPC (validates relationship between caller and recipient)
CREATE OR REPLACE FUNCTION public.insert_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_link TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_ok BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'invalid recipient';
  END IF;

  SELECT (
    EXISTS (
      SELECT 1 FROM pfe_projects p
      WHERE p.student_id = auth.uid() AND p.supervisor_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM pfe_projects p
      WHERE p.supervisor_id = auth.uid() AND p.student_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM supervision_requests sr
      WHERE sr.student_id = auth.uid() AND sr.professor_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM supervision_requests sr
      WHERE sr.professor_id = auth.uid() AND sr.student_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM topic_applications ta
      INNER JOIN pfe_topics t ON t.id = ta.topic_id
      WHERE ta.student_id = auth.uid() AND t.professor_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM topic_applications ta
      INNER JOIN pfe_topics t ON t.id = ta.topic_id
      WHERE t.professor_id = auth.uid() AND ta.student_id = p_user_id
    )
  ) INTO v_ok;

  IF NOT v_ok THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (p_user_id, p_type, p_title, p_body, p_link)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.insert_notification(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.insert_notification(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
