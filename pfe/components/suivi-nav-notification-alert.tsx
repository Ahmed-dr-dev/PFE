'use client'

export const SUIVI_MON_PFE_HREF = '/dashboard/student/suivi-mon-pfe'

/** Icône + pastille pour l’entrée « Suivi — Mon PFE » quand il y a des notifications non lues */
export function SuiviNavNotificationAlert({ unread }: { unread: number }) {
  if (unread <= 0) return null
  return (
    <span
      className="ml-auto shrink-0 inline-flex items-center gap-1"
      title={`${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}`}
    >
      <svg
        className="w-4 h-4 text-amber-600"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full px-1.5 min-w-[1.25rem] text-center tabular-nums border border-amber-200">
        {unread > 9 ? '9+' : unread}
      </span>
    </span>
  )
}
