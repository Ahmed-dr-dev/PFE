import React, { createContext, useContext, useEffect, useState } from 'react'
import { clearSession, getStoredUser, getStoredUserId, saveSession } from './storage'

type User = {
  id: string
  full_name: string | null
  email: string
  role: 'student' | 'professor' | 'admin'
  department?: string | null
}

type AuthCtx = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [id, stored] = await Promise.all([getStoredUserId(), getStoredUser<User>()])
      if (id && stored) setUser(stored)
      setLoading(false)
    })()
  }, [])

  const signIn = async (email: string, password: string) => {
    const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'
    const res = await fetch(`${BASE}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error || 'Erreur de connexion')
    const u: User = json.user
    await saveSession(u.id, u)
    setUser(u)
  }

  const signOut = async () => {
    await clearSession()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
