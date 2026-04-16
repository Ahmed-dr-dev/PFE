'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { DashboardCharts } from './components/dashboard-charts'

type Stats = {
  filters: { department: string | null; year: string | null }
  filterOptions: { departments: string[]; years: string[] }
  totalStudents: number
  studentsWithSupervisor: number
  studentsWithoutSupervisor: number
  pfeInProgressCount: number
  pfeCompletedCount: number
  totalProfessors: number
  professorsSupervising: number
  professorsWithoutStudent: number
  totalSupervisionSlots: number
  supervisionSlotsUsed: number
  professorsAtCapacity: number
  avgStudentsPerSupervisor: number
  capacityUtilizationPercent: number
  topicsProposedByFilteredProfs: number
  pendingTopics: number
  approvedTopics: number
  pendingAssignments: number
  pendingAssignmentsFiltered: number
  studentsPreview: {
    id: string
    full_name: string | null
    email: string | null
    department: string | null
    year: string | null
    hasSupervisor: boolean
    supervisorName: string | null
  }[]
  professorsPreview: {
    id: string
    full_name: string | null
    email: string | null
    department: string | null
    office: string | null
    capacity: number
    studentsSupervised: number
  }[]
}

const YEAR_FILTER_EXTRAS = ['3ème année ', '2ème année Master']

const emptyStats: Stats = {
  filters: { department: null, year: null },
  filterOptions: { departments: [], years: [] },
  totalStudents: 0,
  studentsWithSupervisor: 0,
  studentsWithoutSupervisor: 0,
  pfeInProgressCount: 0,
  pfeCompletedCount: 0,
  totalProfessors: 0,
  professorsSupervising: 0,
  professorsWithoutStudent: 0,
  totalSupervisionSlots: 0,
  supervisionSlotsUsed: 0,
  professorsAtCapacity: 0,
  avgStudentsPerSupervisor: 0,
  capacityUtilizationPercent: 0,
  topicsProposedByFilteredProfs: 0,
  pendingTopics: 0,
  approvedTopics: 0,
  pendingAssignments: 0,
  pendingAssignmentsFiltered: 0,
  studentsPreview: [],
  professorsPreview: [],
}

function KpiCard({
  value,
  label,
  hint,
  icon,
  tone,
}: {
  value: string | number
  label: string
  hint?: string
  icon: ReactNode
  tone: 'blue' | 'purple' | 'emerald' | 'orange' | 'rose' | 'slate'
}) {
  const tones = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
    rose: 'from-rose-500/20 to-rose-600/20 border-rose-500/30 text-rose-400',
    slate: 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-500',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
      <div
        className={`w-10 h-10 bg-gradient-to-br ${tones[tone]} rounded-lg flex items-center justify-center border shrink-0`}
      >
        <span className="scale-75">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 tabular-nums leading-tight">{value}</p>
        <p className="text-gray-600 text-xs font-medium mt-0.5 leading-snug">{label}</p>
        {hint ? <p className="text-xs text-gray-400 mt-0.5 truncate">{hint}</p> : null}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>(emptyStats)
  const [loading, setLoading] = useState(true)
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (department) q.set('department', department)
      if (year) q.set('year', year)
      const res = await fetch(`/api/admin/stats?${q.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setStats({ ...emptyStats, ...data })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [department, year])

  useEffect(() => {
    load()
  }, [load])

  const deptLabel = (d: string) => d.charAt(0).toUpperCase() + d.slice(1)

  const yearFilterOptions = YEAR_FILTER_EXTRAS

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Bienvenue,{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Administration
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            Vue synthétique des étudiants, encadrants et sujets (filtres par département et année pour les
            étudiants)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Département</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full sm:w-52 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Tous les départements</option>
              {stats.filterOptions.departments.map((d) => (
                <option key={d} value={d}>
                  {deptLabel(d)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Année</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full sm:w-52 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Toutes les années</option>
              {yearFilterOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setDepartment('')
              setYear('')
            }}
            className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600 py-8">Chargement des indicateurs…</p>
      ) : (
        <>
          {(stats.filters.department || stats.filters.year) && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
              Filtres actifs :{' '}
              {[stats.filters.department && `département « ${deptLabel(stats.filters.department)} »`, stats.filters.year && `année « ${stats.filters.year} »`]
                .filter(Boolean)
                .join(' · ')}
              . Les enseignants sont filtrés par département lorsque celui-ci est choisi.
            </p>
          )}


          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Étudiants & PFE</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              <KpiCard
                tone="blue"
                value={stats.totalStudents}
                label="Étudiants (périmètre filtre)"
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
              />
              <KpiCard
                tone="emerald"
                value={stats.pfeInProgressCount}
                label="PFE en cours"
                hint="Nombre de PFE affectés (étudiants ayant un encadrant assigné)."
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <KpiCard
                tone="rose"
                value={stats.studentsWithoutSupervisor}
                label="Sans encadrant"
                hint="Étudiants sans projet supervisé (ou projet sans encadrant)."
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                }
              />
              <KpiCard
                tone="orange"
                value={stats.studentsWithSupervisor}
                label="PFE actifs"
                hint="Étudiants ayant déjà un encadrant assigné sur au moins un projet PFE."
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <KpiCard
                tone="slate"
                value={stats.pfeCompletedCount}
                label="PFE terminés"
                hint="Étudiants ayant une soutenance planifiée (date de soutenance fixée)."
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                }
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Enseignants & encadrement</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              <KpiCard
                tone="purple"
                value={stats.totalProfessors}
                label="Enseignants"
                hint={department ? 'Filtrés par le département sélectionné.' : 'Tous les enseignants.'}
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
              <KpiCard
                tone="emerald"
                value={stats.professorsSupervising}
                label="Encadrants actifs"
                hint="Au moins un étudiant supervisé."
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
              />
              <KpiCard
                tone="slate"
                value={stats.professorsWithoutStudent}
                label="Sans étudiant supervisé"
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                }
              />
              <KpiCard
                tone="blue"
                value={`${stats.supervisionSlotsUsed} / ${stats.totalSupervisionSlots}`}
                label="Places d’encadrement"
                hint={`Taux d’occupation : ${stats.capacityUtilizationPercent}%`}
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                  </svg>
                }
              />
              <KpiCard
                tone="rose"
                value={stats.professorsAtCapacity}
                label="Enseignants à capacité max"
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
              />
              <KpiCard
                tone="purple"
                value={stats.avgStudentsPerSupervisor}
                label="Moy. étudiants / encadrant actif"
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                }
              />
              <KpiCard
                tone="emerald"
                value={stats.topicsProposedByFilteredProfs}
                label="Sujets proposés (enseignants du filtre)"
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              />
            </div>
          </section>

          <DashboardCharts
            stats={{
              studentsWithSupervisor: stats.studentsWithSupervisor,
              studentsWithoutSupervisor: stats.studentsWithoutSupervisor,
              pfeInProgressCount: stats.pfeInProgressCount,
              pfeCompletedCount: stats.pfeCompletedCount,
            }}
          />
        </>
      )}
    </div>
  )
}
