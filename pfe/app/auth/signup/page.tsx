import Link from 'next/link'
import { SignUpForm } from './signup-form'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded border w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inscription</h1>
          <p className="text-gray-600">ISAEG PFE</p>
        </div>

        <SignUpForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Déjà inscrit?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
              Se connecter
            </Link>
          </p>
          <Link href="/" className="block text-sm text-gray-500 hover:text-gray-700 mt-4">
            ← Retour
          </Link>
        </div>
      </div>
    </div>
  )
}

