import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { SignOutButton } from './signout-button'
import { MobileMenu } from './mobile-menu'
import { ProfessorNavbarCapacity } from './professor-navbar-capacity'
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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/professor" className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                ISAEG PFE
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ProfessorNavbarCapacity />
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


