import type { ReactNode } from 'react'

type ChartStats = {
  studentsWithSupervisor: number
  studentsWithoutSupervisor: number
  pfeInProgressCount: number
  pfeCompletedCount: number
  pendingTopics: number
  approvedTopics: number
  supervisionSlotsUsed: number
  totalSupervisionSlots: number
  capacityUtilizationPercent: number
}

function BarRow({
  label,
  value,
  max,
  colorClass,
}: {
  label: string
  value: number
  max: number
  colorClass: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold tabular-nums text-gray-900">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {subtitle ? <p className="text-sm text-gray-500 mt-1 mb-5">{subtitle}</p> : <div className="mb-5" />}
      {children}
    </div>
  )
}

export function DashboardCharts({ stats }: { stats: ChartStats }) {
  const studentMax = Math.max(
    stats.studentsWithSupervisor + stats.studentsWithoutSupervisor,
    1
  )
  const pfeMax = Math.max(stats.pfeInProgressCount + stats.pfeCompletedCount, 1)
  const topicTotal = stats.pendingTopics + stats.approvedTopics

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Graphiques</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Encadrement des étudiants"
          subtitle="Répartition dans le périmètre des filtres actifs"
        >
          <div className="space-y-4">
            <BarRow
              label="Avec encadrant"
              value={stats.studentsWithSupervisor}
              max={studentMax}
              colorClass="bg-emerald-500"
            />
            <BarRow
              label="Sans encadrant"
              value={stats.studentsWithoutSupervisor}
              max={studentMax}
              colorClass="bg-amber-500"
            />
          </div>
        </ChartCard>

        <ChartCard title="Statuts PFE (étudiants)" subtitle="Projets en cours ou terminés (comptage par étudiant)">
          <div className="space-y-4">
            <BarRow
              label="En cours"
              value={stats.pfeInProgressCount}
              max={pfeMax}
              colorClass="bg-cyan-500"
            />
            <BarRow
              label="Terminés"
              value={stats.pfeCompletedCount}
              max={pfeMax}
              colorClass="bg-violet-500"
            />
          </div>
        </ChartCard>

        <ChartCard title="Sujets proposés" subtitle="En attente de validation vs approuvés">
          {topicTotal === 0 ? (
            <p className="text-sm text-gray-500">Aucun sujet dans ce périmètre.</p>
          ) : (
            <div className="space-y-4">
              <BarRow
                label="En attente de validation"
                value={stats.pendingTopics}
                max={topicTotal}
                colorClass="bg-orange-500"
              />
              <BarRow
                label="Approuvés"
                value={stats.approvedTopics}
                max={topicTotal}
                colorClass="bg-emerald-500"
              />
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Capacité d’encadrement"
          subtitle="Places utilisées sur le total des places déclarées"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">Taux d’occupation</span>
              <span className="text-3xl font-bold text-gray-900 tabular-nums">
                {stats.capacityUtilizationPercent}%
              </span>
            </div>
            <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stats.capacityUtilizationPercent))}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{stats.supervisionSlotsUsed}</span> places utilisées
              sur <span className="font-semibold text-gray-800">{stats.totalSupervisionSlots}</span> au total.
            </p>
          </div>
        </ChartCard>
      </div>
    </section>
  )
}
