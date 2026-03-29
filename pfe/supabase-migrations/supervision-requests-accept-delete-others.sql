-- When a supervision request becomes accepted, remove all other requests for the same student.
-- Runs as SECURITY DEFINER so it works even if RLS blocks cross-professor deletes from the API.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.delete_other_supervision_requests_on_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    DELETE FROM public.supervision_requests
    WHERE student_id = NEW.student_id
      AND id IS DISTINCT FROM NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_supervision_accept_cleanup ON public.supervision_requests;
CREATE TRIGGER tr_supervision_accept_cleanup
AFTER UPDATE OF status ON public.supervision_requests
FOR EACH ROW
WHEN (NEW.status = 'accepted')
EXECUTE FUNCTION public.delete_other_supervision_requests_on_accept();
