import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">ISAEG PFE</h1>
            <div className="flex gap-4">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Gestion des Projets de Fin d'Études
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Plateforme simple pour gérer les PFE à l'ISAEG
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            Commencer
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Étudiants</h3>
            <p className="text-gray-600">
              Consultez les sujets disponibles et suivez votre projet
            </p>
          </div>

          <div className="bg-white p-6 rounded border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enseignants</h3>
            <p className="text-gray-600">
              Proposez des sujets et encadrez vos étudiants
            </p>
          </div>

          <div className="bg-white p-6 rounded border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Administration</h3>
            <p className="text-gray-600">
              Gérez les utilisateurs et validez les sujets
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Fonctionnalités</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Gestion des comptes et authentification</li>
            <li>• Proposition et validation de sujets</li>
            <li>• Affectation des encadrants</li>
            <li>• Suivi de l'état des projets</li>
            <li>• Dépôt de documents</li>
          </ul>
        </div>
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2025 ISAEG - Gestion des PFE
          </p>
        </div>
      </footer>
    </div>
  )
}
