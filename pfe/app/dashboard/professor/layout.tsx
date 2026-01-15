import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { SignOutButton } from './signout-button'
import { MobileMenu } from './mobile-menu'
import { Sidebar } from './sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = await requireAuth('professor')
  if (auth.error) {
    redirect('/auth/signin')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/professor" className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                ISAEG PFE
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden lg:hidden xl:flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                  PR
                </div>
                <span className="text-sm text-gray-200 font-medium">
                  Professeur
                </span>
              </div>
              <SignOutButton />
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:pl-64">
          <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}


