import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const HEADER_GRAY: [number, number, number] = [210, 210, 210]

const MOIS_FR = [
  'JANVIER',
  'FÉVRIER',
  'MARS',
  'AVRIL',
  'MAI',
  'JUIN',
  'JUILLET',
  'AOÛT',
  'SEPTEMBRE',
  'OCTOBRE',
  'NOVEMBRE',
  'DÉCEMBRE',
]

function formatDatePlanning(iso: string | null | undefined): string {
  if (!iso || typeof iso !== 'string') return '—'
  const p = iso.slice(0, 10).split('-')
  if (p.length !== 3) return iso
  const y = Number(p[0])
  const m = Number(p[1])
  const day = Number(p[2])
  if (!y || !m || !day) return iso
  return `${day} ${MOIS_FR[m - 1] || ''} ${y}`.trim()
}

function formatHeure(t: string | null | undefined): string {
  if (t == null || t === '') return '—'
  const s = String(t).slice(0, 5)
  if (s.length < 4) return s
  return s.replace(':', 'H')
}

function normalizePfe(d: Record<string, unknown>) {
  const direct = d.pfe_project as Record<string, unknown> | null | undefined
  if (direct) {
    const st = direct.student
    const su = direct.supervisor
    const student = Array.isArray(st) ? st[0] : st
    const supervisor = Array.isArray(su) ? su[0] : su
    return { student: student as { full_name?: string } | null, supervisor: supervisor as { full_name?: string } | null }
  }
  const p = d.pfe_projects
  const pp = Array.isArray(p) ? p[0] : p
  if (!pp || typeof pp !== 'object') return { student: null, supervisor: null }
  const po = pp as Record<string, unknown>
  const st = po.student
  const su = po.supervisor
  const student = (Array.isArray(st) ? st[0] : st) as { full_name?: string } | null
  const supervisor = (Array.isArray(su) ? su[0] : su) as { full_name?: string } | null
  return { student, supervisor }
}

type DefenseRow = Record<string, unknown> & {
  status?: string
  scheduled_date?: string | null
  scheduled_time?: string | null
  room?: string | null
  jury_members?: string[] | null
}

type Group = { date: string; roomLabel: string; juryNum: number; rows: DefenseRow[] }

function buildGroups(planned: DefenseRow[]): Group[] {
  const groupMap = new Map<string, DefenseRow[]>()
  for (const d of planned) {
    const date = String(d.scheduled_date || '')
    const roomKey = String(d.room || '').trim() || '__default__'
    const key = `${date}||${roomKey}`
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(d)
  }

  const sortedKeys = [...groupMap.keys()].sort((a, b) => {
    const [da, ra] = a.split('||')
    const [db, rb] = b.split('||')
    if (da !== db) return da.localeCompare(db)
    return ra.localeCompare(rb)
  })

  let lastDate = ''
  let juryCounter = 0
  const groups: Group[] = []
  for (const key of sortedKeys) {
    const [date, roomKey] = key.split('||')
    if (date !== lastDate) {
      juryCounter = 0
      lastDate = date
    }
    juryCounter++
    const roomLabel = roomKey === '__default__' ? '—' : roomKey
    const rows = groupMap.get(key)!
    rows.sort((a, b) => {
      const ta = String(a.scheduled_time || '').slice(0, 8)
      const tb = String(b.scheduled_time || '').slice(0, 8)
      if (ta !== tb) return ta.localeCompare(tb)
      const na = normalizePfe(a).student?.full_name || ''
      const nb = normalizePfe(b).student?.full_name || ''
      return na.localeCompare(nb, 'fr')
    })
    groups.push({ date, roomLabel, juryNum: juryCounter, rows })
  }
  return groups
}

/** Télécharge un PDF du planning (soutenances au statut « planifiée » uniquement). */
export function downloadDefensesPlanningPdf(defenses: unknown[]): void {
  const planned = (defenses as DefenseRow[]).filter((d) => d && d.status === 'scheduled')

  if (planned.length === 0) {
    window.alert('Aucune soutenance planifiée à exporter (statut « Planifiée »).')
    return
  }

  planned.sort((a, b) => {
    const c = String(a.scheduled_date || '').localeCompare(String(b.scheduled_date || ''))
    if (c !== 0) return c
    const ta = String(a.scheduled_time || '').slice(0, 8)
    const tb = String(b.scheduled_time || '').slice(0, 8)
    return ta.localeCompare(tb)
  })

  const groups = buildGroups(planned)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageH = doc.internal.pageSize.getHeight()
  let y = 12

  const headCols = ['N°', 'Heure', 'Etudiant', 'Encadrant', 'Président', 'Rapporteur']

  for (const g of groups) {
    const dateLabel = `Date : ${formatDatePlanning(g.date)}`
    const juryLabel = `Jury N° ${g.juryNum} – ${g.roomLabel}`
    const headTop = [
      {
        content: dateLabel,
        colSpan: 3,
        styles: { fillColor: HEADER_GRAY, halign: 'center' as const, fontStyle: 'bold' as const },
      },
      {
        content: juryLabel,
        colSpan: 3,
        styles: { fillColor: HEADER_GRAY, halign: 'center' as const, fontStyle: 'bold' as const },
      },
    ]

    const body: string[][] = g.rows.map((d, i) => {
      const { student, supervisor } = normalizePfe(d)
      const jm = Array.isArray(d.jury_members) ? d.jury_members : []
      const enc = String(jm[0] || supervisor?.full_name || '—')
      const president = String(jm[1] || '—')
      const rapporteur = String(jm[2] || '—')
      return [
        String(i + 1),
        formatHeure(d.scheduled_time ?? null),
        String(student?.full_name || '—'),
        enc,
        president,
        rapporteur,
      ]
    })

    if (y > pageH - 40) {
      doc.addPage()
      y = 12
    }

    autoTable(doc, {
      startY: y,
      margin: { left: 10, right: 10 },
      theme: 'grid',
      styles: {
        fontSize: 9,
        halign: 'center',
        valign: 'middle',
        cellPadding: 1.8,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: HEADER_GRAY,
        textColor: [0, 0, 0],
        halign: 'center',
        fontStyle: 'bold',
      },
      bodyStyles: { textColor: [0, 0, 0], halign: 'center' },
      head: [headTop, headCols],
      body,
      didParseCell(data) {
        if (data.section === 'body' && data.column.index === 2) {
          data.cell.styles.fontStyle = 'bold'
        }
      },
    })

    const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } }
    y = (docWithTable.lastAutoTable?.finalY ?? y) + 10
  }

  const fname = `planning-soutenances-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fname)
}
