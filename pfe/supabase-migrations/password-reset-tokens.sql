-- Tokens de réinitialisation de mot de passe (flux « mot de passe oublié » + email Brevo).
-- Les insert/select/delete sont faits côté serveur avec SUPABASE_SERVICE_ROLE_KEY.

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON public.password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON public.password_reset_tokens(expires_at);

COMMENT ON TABLE public.password_reset_tokens IS 'Jetons à usage unique pour réinitialiser le mot de passe (hash SHA-256 du jeton en clair).';
