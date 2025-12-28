import Link from 'next/link'
import { SignInForm } from './signin-form'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Connexion</h1>
          <p className="text-gray-300">ISAEG PFE</p>
        </div>

        <SignInForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Pas de compte?{' '}
            <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">
              S'inscrire
            </Link>
          </p>
          <Link href="/" className="block text-sm text-gray-400 hover:text-gray-300 mt-4">
            ← Retour
          </Link>
        </div>
      </div>
    </div>
  )
}
