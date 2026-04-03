-- Optional topic choice on supervision request (existing approved topic, suggested title, or both null).
ALTER TABLE public.supervision_requests
  ADD COLUMN IF NOT EXISTS preferred_topic_id UUID REFERENCES public.pfe_topics(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS suggested_topic_title TEXT;

CREATE INDEX IF NOT EXISTS idx_supervision_requests_preferred_topic
  ON public.supervision_requests(preferred_topic_id)
  WHERE preferred_topic_id IS NOT NULL;
