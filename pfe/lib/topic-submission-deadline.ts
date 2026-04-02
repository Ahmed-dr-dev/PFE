/**
 * Admin setting `topic_submission_deadline` (usually YYYY-MM-DD or ISO).
 * Returns true after the end of that calendar day (UTC).
 */
export function isTopicSubmissionDeadlinePassed(deadlineValue: string | null | undefined): boolean {
  if (!deadlineValue?.trim()) return false
  const raw = deadlineValue.trim()
  const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (ymd) {
    const y = Number(ymd[1])
    const m = Number(ymd[2])
    const d = Number(ymd[3])
    if (!y || m < 1 || m > 12 || d < 1 || d > 31) return false
    const endUtc = Date.UTC(y, m - 1, d, 23, 59, 59, 999)
    return Date.now() > endUtc
  }
  const t = new Date(raw)
  if (Number.isNaN(t.getTime())) return false
  const endUtc = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), 23, 59, 59, 999)
  return Date.now() > endUtc
}
