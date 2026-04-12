'use client'

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

type ChartStats = {
  studentsWithSupervisor: number
  studentsWithoutSupervisor: number
  pfeInProgressCount: number
  pfeCompletedCount: number
}

const RADIAN = Math.PI / 180
function CustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1 mb-4">{subtitle}</p>}
      {children}
    </div>
  )
}

export function DashboardCharts({ stats }: { stats: ChartStats }) {
  const supervisionData = [
    { name: 'Avec encadrant', value: stats.studentsWithSupervisor, color: '#10b981' },
    { name: 'Sans encadrant', value: stats.studentsWithoutSupervisor, color: '#f59e0b' },
  ]

  const pfeData = [
    { name: 'En cours', value: stats.pfeInProgressCount, color: '#06b6d4' },
    { name: 'Terminés', value: stats.pfeCompletedCount, color: '#8b5cf6' },
  ]

  const barData = [
    {
      label: 'Encadrement',
      'Avec encadrant': stats.studentsWithSupervisor,
      'Sans encadrant': stats.studentsWithoutSupervisor,
    },
    {
      label: 'Statuts PFE',
      'En cours': stats.pfeInProgressCount,
      'Terminés': stats.pfeCompletedCount,
    },
  ]

  const totalStudents = stats.studentsWithSupervisor + stats.studentsWithoutSupervisor
  const totalPfe = stats.pfeInProgressCount + stats.pfeCompletedCount

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Graphiques</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut — Encadrement */}
        <ChartCard
          title="Encadrement des étudiants"
          subtitle="Répartition dans le périmètre des filtres actifs"
        >
          {totalStudents === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">Aucune donnée disponible.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={supervisionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={CustomLabel}
                  >
                    {supervisionData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{ borderRadius: 10, fontSize: 13 }}
                  />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-sm text-gray-500 -mt-2">
                Total : <span className="font-semibold text-gray-800">{totalStudents}</span> étudiant(s)
              </p>
            </>
          )}
        </ChartCard>

        {/* Donut — Statuts PFE */}
        <ChartCard
          title="Statuts PFE (étudiants)"
          subtitle="Projets en cours ou terminés (comptage par étudiant)"
        >
          {totalPfe === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">Aucune donnée disponible.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pfeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={CustomLabel}
                  >
                    {pfeData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{ borderRadius: 10, fontSize: 13 }}
                  />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-sm text-gray-500 -mt-2">
                Total : <span className="font-semibold text-gray-800">{totalPfe}</span> projet(s)
              </p>
            </>
          )}
        </ChartCard>

        {/* Grouped bar chart — side-by-side comparison */}
        <ChartCard
          title="Vue comparée"
          subtitle="Encadrement et statuts PFE côte à côte"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { name: 'Avec encadrant', value: stats.studentsWithSupervisor, fill: '#10b981' },
                { name: 'Sans encadrant', value: stats.studentsWithoutSupervisor, fill: '#f59e0b' },
                { name: 'PFE en cours', value: stats.pfeInProgressCount, fill: '#06b6d4' },
                { name: 'PFE terminés', value: stats.pfeCompletedCount, fill: '#8b5cf6' },
              ]}
              margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, fontSize: 13 }}
                formatter={(value: number) => [value, 'Total']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {[
                  { fill: '#10b981' },
                  { fill: '#f59e0b' },
                  { fill: '#06b6d4' },
                  { fill: '#8b5cf6' },
                ].map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Summary numbers card */}
        <ChartCard title="Résumé chiffré" subtitle="Indicateurs clés du périmètre sélectionné">
          <div className="grid grid-cols-2 gap-4 mt-2">
            {[
              { label: 'Avec encadrant', value: stats.studentsWithSupervisor, color: '#10b981', bg: '#d1fae5' },
              { label: 'Sans encadrant', value: stats.studentsWithoutSupervisor, color: '#d97706', bg: '#fef3c7' },
              { label: 'PFE en cours', value: stats.pfeInProgressCount, color: '#0891b2', bg: '#cffafe' },
              { label: 'PFE terminés', value: stats.pfeCompletedCount, color: '#7c3aed', bg: '#ede9fe' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4 flex flex-col gap-1"
                style={{ backgroundColor: item.bg }}
              >
                <span className="text-3xl font-bold tabular-nums" style={{ color: item.color }}>
                  {item.value}
                </span>
                <span className="text-sm font-medium text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </ChartCard>

      </div>
    </section>
  )
}
