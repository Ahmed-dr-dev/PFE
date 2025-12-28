import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                  📚
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">ISAEG PFE</h1>
                  <p className="text-xs text-gray-400">Mes Documents</p>
                </div>
              </Link>
            </div>
            <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
              ← Retour
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Gestion des Documents</h2>
          <p className="text-gray-400">Déposez et consultez vos documents de PFE</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">📤 Déposer un Document</h3>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-emerald-500 transition-all cursor-pointer">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-white font-medium mb-2">Cliquez pour uploader</p>
              <p className="text-sm text-gray-400">PDF uniquement (Max 10MB)</p>
              <input type="file" className="hidden" accept=".pdf" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">📊 Statistiques</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Documents déposés</span>
                <span className="text-2xl font-bold text-emerald-400">0</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Dernière mise à jour</span>
                <span className="text-sm text-gray-400">-</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Statut</span>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                  En attente
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-4">📁 Mes Documents</h3>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📂</div>
            <h4 className="text-lg font-semibold text-white mb-2">Aucun document déposé</h4>
            <p className="text-gray-400 mb-6">Commencez par uploader votre rapport de PFE</p>
          </div>
        </div>

        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-300 text-sm mb-1">Important</p>
              <p className="text-sm text-gray-400">
                Assurez-vous que votre rapport est au format PDF et ne dépasse pas 10MB. Les documents seront consultables par votre encadrant et l'administration.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

