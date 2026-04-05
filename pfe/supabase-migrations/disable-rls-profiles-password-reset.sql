-- Désactive la RLS sur les tables utilisées par « mot de passe oublié » + lecture profil côté API.
-- À n’utiliser que si votre app n’expose pas PostgREST publiquement sans autre protection,
-- ou en dev local. En production, préférez SUPABASE_SERVICE_ROLE_KEY côté serveur.

ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.password_reset_tokens DISABLE ROW LEVEL SECURITY;
