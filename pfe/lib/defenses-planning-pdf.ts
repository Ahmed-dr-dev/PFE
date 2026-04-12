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

// ─── Fiche individuelle ────────────────────────────────────────────────────────

type FicheDefense = Record<string, unknown> & {
  scheduled_date?: string | null
  scheduled_time?: string | null
  room?: string | null
  duration_minutes?: number | null
  jury_members?: string[] | null
  notes?: string | null
  note?: number | null
  note_comment?: string | null
  status?: string
}

/** Génère et télécharge un PDF de fiche pour une soutenance individuelle. */
export function downloadDefenseFichePdf(defense: FicheDefense): void {
  const { student, supervisor } = normalizePfe(defense as Record<string, unknown>)
  const topic = (() => {
    const p = defense.pfe_project as Record<string, unknown> | null | undefined
    if (p) {
      const t = p.topic
      return ((Array.isArray(t) ? t[0] : t) as { title?: string } | null)?.title || null
    }
    const pp2 = defense.pfe_projects
    const pp = Array.isArray(pp2) ? pp2[0] : pp2
    if (!pp || typeof pp !== 'object') return null
    const t2 = (pp as Record<string, unknown>).topic
    return ((Array.isArray(t2) ? t2[0] : t2) as { title?: string } | null)?.title || null
  })()

  const jm: string[] = Array.isArray(defense.jury_members) ? defense.jury_members : []

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 20

  // ── Header bar ──────────────────────────────────────────────────────────────
  doc.setFillColor(34, 197, 94) // emerald-500
  doc.rect(0, 0, pageW, 28, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('FICHE DE SOUTENANCE PFE', pageW / 2, 13, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Générée le ${new Date().toLocaleDateString('fr-FR')}`, pageW / 2, 21, { align: 'center' })

  let y = 38

  // ── Student / topic ─────────────────────────────────────────────────────────
  const drawSection = (title: string) => {
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, y, pageW - margin * 2, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(30, 30, 30)
    doc.text(title, margin + 3, y + 5)
    y += 10
  }

  const drawRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text(label, margin + 3, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(20, 20, 20)
    const wrapped = doc.splitTextToSize(value, pageW - margin * 2 - 45)
    doc.text(wrapped, margin + 45, y)
    y += wrapped.length * 5 + 2
  }

  drawSection('Étudiant et sujet')
  drawRow('Étudiant :', student?.full_name || '—')
  if (topic) drawRow('Sujet PFE :', topic)
  y += 4

  drawSection('Informations de la soutenance')
  drawRow('Date :', formatDatePlanning(defense.scheduled_date ?? null))
  drawRow('Heure :', formatHeure(defense.scheduled_time ?? null))
  if (defense.room) drawRow('Salle :', String(defense.room))
  if (defense.duration_minutes) drawRow('Durée :', `${defense.duration_minutes} minutes`)
  y += 4

  drawSection('Composition du jury')
  drawRow('Encadrant :', jm[0] || supervisor?.full_name || '—')
  drawRow('Rapporteur :', jm[1] || '—')
  drawRow('Président du jury :', jm[2] || '—')
  y += 4

  // ── Note ────────────────────────────────────────────────────────────────────
  const hasNote = defense.note !== null && defense.note !== undefined
  drawSection('Note finale')
  if (hasNote) {
    // Big note box
    doc.setFillColor(209, 250, 229) // emerald-100
    doc.setDrawColor(16, 185, 129) // emerald-500
    doc.setLineWidth(0.5)
    doc.roundedRect(margin, y, 50, 18, 3, 3, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(5, 150, 105) // emerald-600
    doc.text(`${defense.note} / 20`, margin + 25, y + 12, { align: 'center' })
    y += 22

    if (defense.note_comment) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      const lines = doc.splitTextToSize(`Appréciation : ${defense.note_comment}`, pageW - margin * 2 - 6)
      doc.text(lines, margin + 3, y)
      y += lines.length * 5 + 4
    }
  } else {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text('Note non encore attribuée par le Président du jury.', margin + 3, y + 5)
    y += 12
  }

  if (defense.notes) {
    y += 2
    drawSection('Notes administratives')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    const lines = doc.splitTextToSize(String(defense.notes), pageW - margin * 2 - 6)
    doc.text(lines, margin + 3, y)
    y += lines.length * 5 + 4
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight()
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, pageH - 14, pageW - margin, pageH - 14)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(160, 160, 160)
  doc.text('Plateforme PFE ISAEG — Document généré automatiquement', pageW / 2, pageH - 8, { align: 'center' })

  const studentName = (student?.full_name || 'etudiant').replace(/\s+/g, '-').toLowerCase()
  doc.save(`fiche-soutenance-${studentName}-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ─── Planning complet ──────────────────────────────────────────────────────────

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
