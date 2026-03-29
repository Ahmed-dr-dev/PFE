'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

export function ProfessorNavbarCapacity() {
  const pathname = usePathname()
  const [cap, setCap] = useState<{ current: number; capacity: number } | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/professor/supervision-capacity', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setCap({ current: data.current ?? 0, capacity: data.capacity ?? 8 })
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    load()
  }, [pathname, load])

  useEffect(() => {
    window.addEventListener('professor-supervision-refresh', load)
    return () => window.removeEventListener('professor-supervision-refresh', load)
  }, [load])

  if (!cap) return null

  const over = cap.current > cap.capacity
  return (
    <span
      className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold border shrink-0 ${
        over ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
      }`}
      title="Étudiants encadrés / capacité maximale"
    >
      Encadrement {cap.current}/{cap.capacity}
    </span>
  )
}
