import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const role = user.user_metadata.role || 'student'

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">ISAEG PFE</h1>
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded border p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Bienvenue, {user.user_metadata.full_name}
          </h2>
          <p className="text-gray-600">
            Rôle: <span className="font-medium capitalize">
              {role === 'student' ? 'Étudiant' : role === 'teacher' ? 'Enseignant' : 'Administration'}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-2">{user.email}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mes projets</h3>
            <p className="text-gray-600 mb-4">Aucun projet pour le moment</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notifications</h3>
            <p className="text-gray-600 mb-4">Aucune notification</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Statut</h3>
            <p className="text-green-600 font-semibold mb-4">Actif</p>
            <p className="text-sm text-gray-500">En ligne</p>
          </div>
        </div>
      </main>
    </div>
  )
}

