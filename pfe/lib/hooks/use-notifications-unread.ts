'use client'

import { useCallback, useEffect, useState } from 'react'

export const NOTIFICATIONS_CHANGED_EVENT = 'isaeg-notifications-changed'

export function useNotificationsUnreadCount() {
  const [unread, setUnread] = useState(0)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setUnread(typeof data.unreadCount === 'number' ? data.unreadCount : 0)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 60_000)
    const onFocus = () => load()
    const onCustom = () => load()
    window.addEventListener('focus', onFocus)
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onCustom)
    return () => {
      clearInterval(t)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onCustom)
    }
  }, [load])

  return { unread, refresh: load }
}
