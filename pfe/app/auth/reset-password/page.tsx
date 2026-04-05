import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { ResetPasswordForm } from './reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Image src="/isaeg.jpg" alt="ISAEG" width={160} height={64} className="h-10 sm:h-12 w-auto object-contain shrink-0" />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent truncate">
              ISAEG PFE
            </span>
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 shrink-0">
            Accueil
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10">
          <p className="text-sm font-semibold tracking-widest text-emerald-600 uppercase mb-2">Nouveau mot de passe</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choisissez un mot de passe</h1>
          <p className="text-gray-600 text-sm mb-8">Le lien reçu par e-mail est valable une heure.</p>
          <Suspense fallback={<p className="text-gray-600 text-sm">Chargement…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
