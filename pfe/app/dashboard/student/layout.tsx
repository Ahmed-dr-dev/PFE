import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { isTopicSubmissionDeadlinePassed } from '@/lib/topic-submission-deadline'
import { SignOutButton } from './signout-button'
import { MobileMenu } from './mobile-menu'
import { Sidebar } from './sidebar'
import { NotificationBell } from '@/components/notification-bell'
import { DeadlineBlockedPanel } from './deadline-blocked-panel'

function formatDeadlineFr(value: string | null | undefined): string {
  if (!value?.trim()) return ''
  const ymd = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (ymd) {
    const d = new Date(Date.UTC(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3])))
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  }
  const t = new Date(value)
  return Number.isNaN(t.getTime()) ? value : t.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = await requireAuth('student')
  if (auth.error) {
    redirect('/auth/signin')
  }

  const supabase = await createClient()
  const userId = auth.user!.id

  const [{ data: deadlineRow }, { data: pfeWithTopic }] = await Promise.all([
    supabase.from('platform_settings').select('value').eq('key', 'topic_submission_deadline').maybeSingle(),
    supabase.from('pfe_projects').select('id').eq('student_id', userId).not('topic_id', 'is', null).limit(1).maybeSingle(),
  ])

  const deadlinePassed = isTopicSubmissionDeadlinePassed(deadlineRow?.value)
  const hasAssignedTopic = !!pfeWithTopic
  const dashboardBlocked = deadlinePassed && !hasAssignedTopic

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                ISAEG PFE
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {!dashboardBlocked && <NotificationBell />}
              <div className="hidden lg:hidden xl:flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-gray-900 font-semibold text-sm">
                  AA
                </div>
                <span className="text-sm text-gray-700 font-medium">
                   Student
                </span>
              </div>
              <SignOutButton />
              {!dashboardBlocked && <MobileMenu />}
            </div>
          </div>
        </div>
      </nav>
      {dashboardBlocked ? (
        <DeadlineBlockedPanel deadlineLabel={formatDeadlineFr(deadlineRow?.value)} />
      ) : (
        <div className="flex">
          <Sidebar />
          <main className="flex-1 lg:pl-64">
            <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
          </main>
        </div>
      )}
    </div>
  )
}

