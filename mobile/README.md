# PFE Mobile

Expo app for professors and students to access key PFE features on mobile.

## Setup

1. **Configure the API URL**

   Edit `.env` and set your machine's local IP (find it with `ipconfig` on Windows):

   ```
   EXPO_PUBLIC_API_URL=http://192.168.x.x:3001
   ```

   > The Next.js web server must be running (`npm run dev` in `/pfe`).

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the app**

   ```bash
   npm start
   ```

   Then scan the QR code with the **Expo Go** app on your phone (iOS or Android).

## Features

### Professor
| Tab | Features |
|-----|----------|
| Accueil | Dashboard stats, profile, sign out |
| Étudiants | List of supervised students, validate App / Rapport / Soutenance |
| Réunions | Pending proposals (accept/reject), scheduled meetings |
| Documents | View public, student-submitted, and shared documents |
| Annonces | Create and delete announcements for students |

### Student
| Tab | Features |
|-----|----------|
| Accueil | PFE status overview, supervisor info, sign out |
| Mon PFE | Topic details, validation progress, milestones, supervisor notes |
| Réunions | Propose meeting dates, view proposals and confirmed meetings |
| Documents | View submitted documents |
| Annonces | Read announcements from admin and professor |

## Architecture

- **Expo Router** — file-based navigation (like Next.js App Router)
- **SecureStore** — stores the user ID locally after sign-in
- **X-User-Id header** — sent with every API call; the Next.js backend accepts this alongside the browser cookie
- **Role-based routing** — professors go to `/(professor)`, students to `/(student)`
