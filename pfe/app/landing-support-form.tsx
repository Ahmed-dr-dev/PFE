'use client'

import { useState } from 'react'

export function LandingSupportForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [errMsg, setErrMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrMsg('')
    try {
      const res = await fetch('/api/public/support-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const j = await res.json()
      if (!res.ok) {
        setErrMsg(j.error || 'Erreur')
        setStatus('err')
        return
      }
      setStatus('ok')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch {
      setErrMsg('Erreur réseau')
      setStatus('err')
    }
  }

  return (
    <section className="py-16 md:py-20 bg-slate-50 border-t border-gray-200">
      <div className="max-w-xl mx-auto px-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Contacter le support administratif
          </h3>
          <p className="text-gray-600 text-sm md:text-base">
            Une question sur la plateforme PFE ? Envoyez un message à l&apos;équipe administration.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-4"
        >
          <div>
            <label htmlFor="support-name" className="block text-sm font-semibold text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              id="support-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label htmlFor="support-email" className="block text-sm font-semibold text-gray-700 mb-1">
              E-mail
            </label>
            <input
              id="support-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
              placeholder="vous@exemple.com"
            />
          </div>
          <div>
            <label htmlFor="support-subject" className="block text-sm font-semibold text-gray-700 mb-1">
              Sujet <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              id="support-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
              placeholder="Ex. accès compte, sujet PFE…"
            />
          </div>
          <div>
            <label htmlFor="support-message" className="block text-sm font-semibold text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="support-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 resize-y min-h-[120px]"
              placeholder="Décrivez votre demande…"
            />
          </div>

          {status === 'ok' && (
            <p className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              Message envoyé. L&apos;administration vous recontactera si nécessaire.
            </p>
          )}
          {(status === 'err' || errMsg) && (
            <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {errMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold hover:from-emerald-700 hover:to-cyan-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
          >
            {status === 'sending' ? 'Envoi…' : 'Envoyer au support'}
          </button>
        </form>
      </div>
    </section>
  )
}
