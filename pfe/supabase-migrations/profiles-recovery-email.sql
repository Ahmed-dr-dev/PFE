-- E-mail dédié à la réception des liens (mot de passe oublié via Brevo).
-- Si vide, le flux utilise `email` uniquement lorsque c’est une adresse valide (contient @).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS recovery_email TEXT;

COMMENT ON COLUMN public.profiles.recovery_email IS 'Adresse pour e-mails transactionnels (réinit. mot de passe). Prioritaire sur `email` si renseignée.';
