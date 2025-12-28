# ISAEG PFE - Plateforme de Gestion des Projets de Fin d'Études

Application web simple et efficace pour gérer les Projets de Fin d'Études à l'ISAEG.

## Technologies

- Next.js 16 (App Router)
- TypeScript
- Supabase (Auth & Database)
- Tailwind CSS

## Installation

```bash
npm install
```

## Configuration

1. Créez un fichier `.env.local` à la racine du projet:

```env
NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=votre-clé-anon-supabase
```

2. Configurez votre projet Supabase:
   - Créez un projet sur [supabase.com](https://supabase.com)
   - Copiez l'URL du projet et la clé anonyme
   - Collez-les dans `.env.local`

## Démarrage

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## Structure

```
app/
├── page.tsx              # Page d'accueil
├── auth/
│   ├── signin/          # Page de connexion
│   └── signup/          # Page d'inscription
├── dashboard/           # Tableau de bord
└── api/auth/           # Routes API pour l'authentification

lib/
└── supabase/           # Utilitaires Supabase
```

## Fonctionnalités

- ✅ Authentification (inscription/connexion)
- ✅ Gestion des rôles (étudiant, enseignant, admin)
- ✅ Page d'accueil responsive
- 🔄 Dashboard utilisateur (en cours)
- 🔄 Gestion des projets (à venir)
- 🔄 Gestion des sujets (à venir)
- 🔄 Suivi des PFE (à venir)
