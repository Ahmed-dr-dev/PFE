-- ============================================
-- MOCK DATA FOR ISAEG PFE DATABASE
-- ============================================
-- 
-- IMPORTANT: Before running this script:
-- 1. Create auth users in Supabase Auth with these UUIDs
-- 2. Or replace the UUIDs below with your actual auth user IDs
-- 3. Run this script in Supabase SQL Editor
--
-- ============================================

-- ============================================
-- 1. PROFILES (Users)
-- ============================================
-- Using only existing users:
-- Admin: ba619d91-76d1-4b5f-982b-0a256ae2c7a0 (Mohamed Ali Ben Belgacem)
-- Student: c3c7dd2b-60d1-4910-9c81-103cedafa0e7 (Ahmed Draief)
--
-- NOTE: To create topics, you need a professor profile.
-- Option 1: Create a professor profile manually in Supabase Auth and profiles table
-- Option 2: Update admin profile to also have professor role (if your schema allows)
-- Option 3: Create topics with NULL professor_id (if allowed by your schema)

-- ============================================
-- 2. PFE TOPICS
-- ============================================
-- NOTE: Replace 'PROFESSOR_ID_HERE' with an actual professor profile ID
-- You can create a professor profile manually or use the admin ID if you update their role
INSERT INTO pfe_topics (id, title, description, requirements, department, professor_id, status, created_at, updated_at)
VALUES 
  ('30000000-0000-0000-0000-000000000001', 
   'Système de gestion de bibliothèque en ligne', 
   'Développement d''une application web complète pour la gestion d''une bibliothèque avec réservation de livres, gestion des emprunts, et système de notifications.',
   'Connaissances en React, Node.js, PostgreSQL. Expérience avec les APIs REST.',
   'informatique',
   NULL, -- Replace with professor_id after creating a professor profile
   'approved',
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '25 days'),
  
  ('30000000-0000-0000-0000-000000000002',
   'Application mobile de suivi de fitness',
   'Création d''une application mobile permettant le suivi des activités sportives, calcul des calories, et planification d''entraînements personnalisés.',
   'React Native ou Flutter, Firebase, connaissances en design UX/UI.',
   'informatique',
   NULL, -- Replace with professor_id after creating a professor profile
   'approved',
   NOW() - INTERVAL '25 days',
   NOW() - INTERVAL '20 days'),
  
  ('30000000-0000-0000-0000-000000000003',
   'Système de recommandation basé sur l''IA',
   'Développement d''un système de recommandation intelligent utilisant des algorithmes de machine learning pour suggérer des produits ou contenus.',
   'Python, TensorFlow/PyTorch, bases de données, algorithmes de ML.',
   'informatique',
   NULL, -- Replace with professor_id after creating a professor profile
   'approved',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. PFE PROJECTS
-- ============================================
-- Using only existing student: c3c7dd2b-60d1-4910-9c81-103cedafa0e7
INSERT INTO pfe_projects (id, student_id, topic_id, supervisor_id, status, progress, start_date, created_at, updated_at)
VALUES 
  ('40000000-0000-0000-0000-000000000001',
   'c3c7dd2b-60d1-4910-9c81-103cedafa0e7',
   '30000000-0000-0000-0000-000000000001',
   NULL, -- Replace with supervisor_id (professor profile ID)
   'in_progress',
   45,
   '2024-01-15',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. TOPIC APPLICATIONS
-- ============================================
-- Using only existing student: c3c7dd2b-60d1-4910-9c81-103cedafa0e7
INSERT INTO topic_applications (id, student_id, topic_id, status, submitted_at, reviewed_at)
VALUES 
  ('50000000-0000-0000-0000-000000000001',
   'c3c7dd2b-60d1-4910-9c81-103cedafa0e7',
   '30000000-0000-0000-0000-000000000001',
   'approved',
   NOW() - INTERVAL '15 days',
   NOW() - INTERVAL '12 days'),
  
  ('50000000-0000-0000-0000-000000000002',
   'c3c7dd2b-60d1-4910-9c81-103cedafa0e7',
   '30000000-0000-0000-0000-000000000002',
   'pending',
   NOW() - INTERVAL '3 days',
   NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. MEETINGS
-- ============================================
-- Using only existing student: c3c7dd2b-60d1-4910-9c81-103cedafa0e7
-- NOTE: Replace supervisor_id with actual professor profile ID
INSERT INTO meetings (id, pfe_project_id, student_id, supervisor_id, date, time, duration, type, status, notes, location, created_at, updated_at)
VALUES 
  ('60000000-0000-0000-0000-000000000001',
   '40000000-0000-0000-0000-000000000001',
   'c3c7dd2b-60d1-4910-9c81-103cedafa0e7',
   NULL, -- Replace with supervisor_id (professor profile ID)
   '2024-02-15',
   '14:00:00',
   60,
   'Suivi',
   'planned',
   'Révision de l''architecture de la base de données et discussion sur les fonctionnalités à implémenter.',
   'Bureau 201',
   NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '2 days'),
  
  ('60000000-0000-0000-0000-000000000002',
   '40000000-0000-0000-0000-000000000001',
   'c3c7dd2b-60d1-4910-9c81-103cedafa0e7',
   NULL, -- Replace with supervisor_id (professor profile ID)
   '2024-01-20',
   '14:00:00',
   45,
   'Kick-off',
   'completed',
   'Première réunion de lancement du projet. Présentation des objectifs et planification.',
   'Bureau 201',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. DOCUMENTS
-- ============================================
-- Using only existing student: c3c7dd2b-60d1-4910-9c81-103cedafa0e7
INSERT INTO documents (id, pfe_project_id, name, file_path, file_type, file_size, category, uploaded_by, status, uploaded_at, created_at)
VALUES 
  ('70000000-0000-0000-0000-000000000001',
   '40000000-0000-0000-0000-000000000001',
   'Cahier des charges - Bibliothèque.pdf',
   'https://supabase.co/storage/v1/object/public/pfe-documents/cahier-des-charges-001.pdf',
   'PDF',
   2457600,
   'Cahier des charges',
   'c3c7dd2b-60d1-4910-9c81-103cedafa0e7',
   'approved',
   NOW() - INTERVAL '18 days',
   NOW() - INTERVAL '18 days'),
  
  ('70000000-0000-0000-0000-000000000002',
   '40000000-0000-0000-0000-000000000001',
   'Architecture système.docx',
   'https://supabase.co/storage/v1/object/public/pfe-documents/architecture-001.docx',
   'DOCX',
   1024000,
   'Documentation',
   'c3c7dd2b-60d1-4910-9c81-103cedafa0e7',
   'approved',
   NOW() - INTERVAL '15 days',
   NOW() - INTERVAL '15 days'),
  
  ('70000000-0000-0000-0000-000000000003',
   '40000000-0000-0000-0000-000000000001',
   'Code source - Backend.zip',
   'https://supabase.co/storage/v1/object/public/pfe-documents/code-backend-001.zip',
   'ZIP',
   5120000,
   'Code source',
   'c3c7dd2b-60d1-4910-9c81-103cedafa0e7',
   'pending',
   NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================

-- ============================================
-- 8. PROJECT MILESTONES
-- ============================================
-- Using only existing student project
INSERT INTO project_milestones (id, pfe_project_id, title, description, status, due_date, completed_date, order_index, created_at, updated_at)
VALUES 
  ('90000000-0000-0000-0000-000000000001',
   '40000000-0000-0000-0000-000000000001',
   'Cahier des charges',
   'Rédaction et validation du cahier des charges',
   'completed',
   '2024-01-25',
   '2024-01-22',
   1,
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '18 days'),
  
  ('90000000-0000-0000-0000-000000000002',
   '40000000-0000-0000-0000-000000000001',
   'Conception de l''architecture',
   'Définition de l''architecture technique du système',
   'completed',
   '2024-02-05',
   '2024-02-03',
   2,
   NOW() - INTERVAL '18 days',
   NOW() - INTERVAL '15 days'),
  
  ('90000000-0000-0000-0000-000000000003',
   '40000000-0000-0000-0000-000000000001',
   'Développement Backend',
   'Implémentation des APIs et logique métier',
   'in_progress',
   '2024-02-28',
   NULL,
   3,
   NOW() - INTERVAL '15 days',
   NOW() - INTERVAL '5 days'),
  
  ('90000000-0000-0000-0000-000000000004',
   '40000000-0000-0000-0000-000000000001',
   'Développement Frontend',
   'Création de l''interface utilisateur',
   'pending',
   '2024-03-15',
   NULL,
   4,
   NOW() - INTERVAL '15 days',
   NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. ASSIGNMENTS (Admin assignments)
-- ============================================
-- Using existing admin: ba619d91-76d1-4b5f-982b-0a256ae2c7a0
-- Using existing student: c3c7dd2b-60d1-4910-9c81-103cedafa0e7
-- NOTE: Replace supervisor_id with actual professor profile ID
INSERT INTO assignments (id, student_id, topic_id, supervisor_id, status, assigned_by, assigned_at, created_at, updated_at)
VALUES 
  ('a0000000-0000-0000-0000-000000000001',
   'c3c7dd2b-60d1-4910-9c81-103cedafa0e7',
   '30000000-0000-0000-0000-000000000001',
   NULL, -- Replace with supervisor_id (professor profile ID)
   'assigned',
   'ba619d91-76d1-4b5f-982b-0a256ae2c7a0',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data was inserted correctly:

-- SELECT COUNT(*) FROM profiles;
-- SELECT COUNT(*) FROM pfe_topics;
-- SELECT COUNT(*) FROM pfe_projects;
-- SELECT COUNT(*) FROM topic_applications;
-- SELECT COUNT(*) FROM meetings;
-- SELECT COUNT(*) FROM documents;
-- SELECT COUNT(*) FROM calendar_events;
-- SELECT COUNT(*) FROM project_milestones;
-- SELECT COUNT(*) FROM assignments;
