import Link from 'next/link'
import { SignOutButton } from './signout-button'

type Props = {
  deadlineLabel?: string
  title?: string
  message?: string
}

export function DeadlineBlockedPanel({
  deadlineLabel,
  title = 'Accès suspendu',
  message,
}: Props) {
  const defaultMessage = `La date limite est dépassée${deadlineLabel ? ` (${deadlineLabel})` : '.'}`
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-red-200 shadow-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-700 mb-2">{message || defaultMessage}</p>
        <p className="text-gray-600 text-sm mb-8">
          Contactez <strong>l&apos;administration</strong> pour prolonger la date limite dans les paramètres de la plateforme.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <SignOutButton />
          <Link
            href="/dashboard/student"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}
