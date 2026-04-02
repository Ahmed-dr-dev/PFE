import Link from 'next/link'
import { SignOutButton } from './signout-button'

type Props = {
  deadlineLabel: string
}

export function DeadlineBlockedPanel({ deadlineLabel }: Props) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-red-200 shadow-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Accès à la plateforme suspendu</h1>
        <p className="text-gray-700 mb-2">
          La <strong>date limite de soumission des sujets</strong> est dépassée
          {deadlineLabel ? (
            <>
              {' '}
              (<span className="font-semibold text-gray-900">{deadlineLabel}</span>).
            </>
          ) : (
            '.'
          )}
        </p>
        <p className="text-gray-600 text-sm mb-8">
          Pour continuer à utiliser l&apos;espace étudiant, contactez <strong>l&apos;administration</strong> afin qu&apos;elle
          prolonge la date limite dans les paramètres de la plateforme.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <SignOutButton />
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
