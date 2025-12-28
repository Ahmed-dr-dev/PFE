import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  if (role === 'student') {
    return (
      <div className="min-h-screen bg-slate-900">
        <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                  📚
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">ISAEG PFE</h1>
                  <p className="text-xs text-gray-400">Espace Étudiant</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-300">{user.email}</span>
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    Déconnexion
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Profile & Stats */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-4">
                    👤
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {user.user_metadata.full_name}
                  </h2>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm mb-2">
                    📚 Étudiant
                  </div>
                  {user.user_metadata.student_id && (
                    <p className="text-emerald-50 text-sm">N° {user.user_metadata.student_id}</p>
                  )}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Statut PFE</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Progression</span>
                    <span className="text-sm font-bold text-emerald-400">0%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                  <div className="pt-3 space-y-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-300">Sujet: Non choisi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span className="text-sm text-gray-400">Encadrant: Non assigné</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span className="text-sm text-gray-400">Documents: 0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Bienvenue, {user.user_metadata.full_name.split(' ')[0]} 👋
                    </h2>
                    <p className="text-emerald-50">Commencez par choisir votre sujet de PFE</p>
                  </div>
                  <div className="hidden md:block text-6xl opacity-20">🎓</div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/dashboard/subjects"
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-emerald-600 transition-all group"
                >
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white">Sujets disponibles</h3>
                  <p className="text-sm text-gray-400 group-hover:text-emerald-50">Parcourir et choisir un sujet</p>
                </Link>

                <Link
                  href="/dashboard/my-pfe"
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-teal-600 transition-all group"
                >
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="text-lg font-bold text-white mb-2">Proposer un sujet</h3>
                  <p className="text-sm text-gray-400 group-hover:text-teal-50">Soumettre votre propre idée</p>
                </Link>

                <Link
                  href="/dashboard/documents"
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-cyan-600 transition-all group"
                >
                  <div className="text-4xl mb-3">📤</div>
                  <h3 className="text-lg font-bold text-white mb-2">Mes documents</h3>
                  <p className="text-sm text-gray-400 group-hover:text-cyan-50">Déposer rapports et fichiers</p>
                </Link>
              </div>

              {/* Progress Timeline */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Parcours PFE
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  <div className="text-center p-4 bg-yellow-500/20 border-2 border-yellow-500 rounded-xl">
                    <div className="text-3xl mb-2">1</div>
                    <p className="text-xs text-yellow-300 font-bold">Choix</p>
                    <p className="text-xs text-gray-400 mt-1">Sujet</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl opacity-40">
                    <div className="text-3xl mb-2">2</div>
                    <p className="text-xs text-gray-400 font-medium">Validation</p>
                    <p className="text-xs text-gray-500 mt-1">Admin</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl opacity-40">
                    <div className="text-3xl mb-2">3</div>
                    <p className="text-xs text-gray-400 font-medium">Affectation</p>
                    <p className="text-xs text-gray-500 mt-1">Encadrant</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl opacity-40">
                    <div className="text-3xl mb-2">4</div>
                    <p className="text-xs text-gray-400 font-medium">En cours</p>
                    <p className="text-xs text-gray-500 mt-1">Travail</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl opacity-40">
                    <div className="text-3xl mb-2">5</div>
                    <p className="text-xs text-gray-400 font-medium">Terminé</p>
                    <p className="text-xs text-gray-500 mt-1">Soutenance</p>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🔔</span>
                    Notifications récentes
                  </h3>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">1 nouvelle</span>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-blue-300 text-sm">Bienvenue sur la plateforme</p>
                        <span className="text-xs text-gray-500">Aujourd'hui</span>
                      </div>
                      <p className="text-sm text-gray-400">Consultez les sujets disponibles pour commencer votre PFE</p>
                    </div>
                  </div>
                  <div className="p-4 text-center text-gray-500 text-sm border border-white/5 rounded-xl">
                    Aucune autre notification
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Teacher Dashboard
  if (role === 'teacher') {
    return (
      <div className="min-h-screen bg-slate-900">
        <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  👨‍🏫
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">ISAEG PFE</h1>
                  <p className="text-xs text-gray-400">Espace Enseignant</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden md:block text-sm text-gray-300">{user.email}</span>
                <form action={signOut}>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    Déconnexion
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-2">
              Bienvenue, Prof. {user.user_metadata.full_name} 👋
            </h2>
            <p className="text-indigo-100">Gérez vos sujets et encadrez vos étudiants</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-2xl font-bold text-white mb-1">0</p>
              <p className="text-sm text-gray-400">Sujets proposés</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-2xl font-bold text-indigo-400 mb-1">0</p>
              <p className="text-sm text-gray-400">Étudiants encadrés</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-2xl font-bold text-green-400 mb-1">0</p>
              <p className="text-sm text-gray-400">PFE terminés</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/dashboard/proposals" className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-indigo-600 transition-all group">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white">Mes Propositions</h3>
              <p className="text-sm text-gray-400 group-hover:text-indigo-50">Proposer et gérer les sujets de PFE</p>
            </Link>

            <Link href="/dashboard/my-students" className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-purple-600 transition-all group">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-2">Mes Étudiants</h3>
              <p className="text-sm text-gray-400 group-hover:text-purple-50">Suivre l'avancement des étudiants</p>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Admin Dashboard
  if (role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900">
        <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold">
                  ⚙️
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">ISAEG PFE</h1>
                  <p className="text-xs text-gray-400">Administration</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden md:block text-sm text-gray-300">{user.email}</span>
                <form action={signOut}>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    Déconnexion
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 mb-8 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-2">
              Panneau d'Administration 👋
            </h2>
            <p className="text-blue-100">Gérez les utilisateurs et validez les sujets</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-2xl font-bold text-white mb-1">0</p>
              <p className="text-sm text-gray-400">Étudiants</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <div className="text-4xl mb-2">👨‍🏫</div>
              <p className="text-2xl font-bold text-blue-400 mb-1">0</p>
              <p className="text-sm text-gray-400">Enseignants</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-2xl font-bold text-cyan-400 mb-1">0</p>
              <p className="text-sm text-gray-400">Sujets</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <div className="text-4xl mb-2">⏳</div>
              <p className="text-2xl font-bold text-yellow-400 mb-1">0</p>
              <p className="text-sm text-gray-400">À valider</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/dashboard/admin/students" className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-blue-600 transition-all group">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-2">Étudiants</h3>
              <p className="text-sm text-gray-400 group-hover:text-blue-50">Gérer les étudiants</p>
            </Link>

            <Link href="/dashboard/admin/teachers" className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-cyan-600 transition-all group">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-bold text-white mb-2">Enseignants</h3>
              <p className="text-sm text-gray-400 group-hover:text-cyan-50">Gérer les enseignants</p>
            </Link>

            <Link href="/dashboard/admin/validation" className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-teal-600 transition-all group">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-white mb-2">Validation</h3>
              <p className="text-sm text-gray-400 group-hover:text-teal-50">Valider les sujets</p>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Fallback
  return null
}

