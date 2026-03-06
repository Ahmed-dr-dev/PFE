'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProposeTopicPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', requirements: '', department: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/student/topics/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          requirements: form.requirements || null,
          department: form.department || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur')
        return
      }
      router.push('/dashboard/student/topics')
    } catch (e) {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/student/topics" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Retour aux sujets
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Proposer un sujet à votre encadrant</h1>
        <p className="text-gray-600 text-sm">Votre encadrant validera ou rejettera le sujet.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Titre *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200"
            placeholder="Titre du sujet"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            rows={4}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 resize-none"
            placeholder="Description du sujet"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Prérequis (optionnel)</label>
          <textarea
            value={form.requirements}
            onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
            rows={2}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200 resize-none"
            placeholder="Prérequis"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Département (optionnel)</label>
          <select
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-200"
          >
            <option value="">—</option>
            <option value="informatique">Informatique</option>
            <option value="gestion">Gestion</option>
            <option value="finance">Finance</option>
            <option value="marketing">Marketing</option>
            <option value="rh">Ressources Humaines</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50">
            {loading ? 'Envoi...' : 'Proposer le sujet'}
          </button>
          <Link href="/dashboard/student/topics" className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 border border-gray-200">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
