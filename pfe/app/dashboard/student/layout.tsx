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
  const auth = await requireAuth('student')
  if (auth.error) {
    redirect('/auth/signin')
  }
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
              <div className="hidden lg:hidden xl:flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-gray-900 font-semibold text-sm">
                  AA
                </div>
                <span className="text-sm text-gray-700 font-medium">
                   Student
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

