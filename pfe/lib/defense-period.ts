/** Parse YYYY-MM-DD */
export function parseDefenseDateOnly(s: string): string | null {
  const t = s.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null
  const d = new Date(`${t}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : t
}

export type DefensePeriodResult = {
  complete: boolean
  /** Normalized YYYY-MM-DD or null */
  start: string | null
  end: string | null
  /** Raw trimmed values from settings */
  startRaw: string
  endRaw: string
}

/**
 * Period is valid only when both dates are set, parseable, and start <= end.
 */
export function resolveDefensePeriod(startRaw: string | undefined | null, endRaw: string | undefined | null): DefensePeriodResult {
  const sr = (startRaw ?? '').trim()
  const er = (endRaw ?? '').trim()
  const start = sr ? parseDefenseDateOnly(sr) : null
  const end = er ? parseDefenseDateOnly(er) : null
  if (!start || !end) {
    return { complete: false, start, end, startRaw: sr, endRaw: er }
  }
  if (start > end) {
    return { complete: false, start, end, startRaw: sr, endRaw: er }
  }
  return { complete: true, start, end, startRaw: sr, endRaw: er }
}

export function defenseDateInPeriod(dateStr: string, period: DefensePeriodResult): boolean {
  if (!period.complete || !period.start || !period.end) return false
  return dateStr >= period.start && dateStr <= period.end
}
