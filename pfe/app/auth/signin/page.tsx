import Link from 'next/link'
import { SignInForm } from './signin-form'
import { CredentialsModal } from './credentials-modal'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
          <p className="text-gray-600">ISAEG PFE</p>
        </div>

        <SignInForm />

        <div className="mt-6 text-center space-y-3">
          <CredentialsModal />
          <Link href="/" className="block text-sm text-gray-600 hover:text-gray-900 mt-4">
            ← Retour
          </Link>
        </div>
      </div>
    </div>
  )
}
