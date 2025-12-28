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
    <div className="min-h-screen bg-slate-900">
      
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">ISAEG PFE</h1>
          <Link
            href="/auth/signin"
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <main className="flex items-center justify-center min-h-[calc(100vh-73px)] px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-emerald-400">Gérez</span>
            <span className="text-white"> les Projets</span>
            <br />
            <span className="text-white">de Fin d'Études</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Plateforme moderne et complète pour la gestion des PFE à l'ISAEG
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signin"
              className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold text-lg shadow-2xl hover:shadow-emerald-500/50"
            >
              Sign In
            </Link>
            
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all font-semibold text-lg shadow-2xl"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
