'use client'

import Link from 'next/link'
import { useState } from 'react'

export function LandingFaq() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/public/support-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Erreur lors de l\'envoi.'); return }
      setSuccess(true)
      setName(''); setEmail(''); setSubject(''); setMessage('')
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact-accueil" className="py-16 md:py-20 bg-slate-50 border-t border-gray-200 scroll-mt-24">
      <div className="max-w-2xl mx-auto px-6">

        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Poser une question</h3>
          <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
            Une question sur la plateforme PFE ISAEG ? Envoyez un message à l'administration.
            Nous vous répondrons par e-mail.
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900">Message envoyé !</h4>
            <p className="text-gray-600 text-sm">
              Votre question a bien été transmise à l'administration. Vous recevrez une réponse à l'adresse indiquée.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-2 text-sm font-semibold text-emerald-600 hover:underline"
            >
              Envoyer une autre question
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5"
          >
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Adresse e-mail <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Sujet (optionnel)</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex. : Problème de connexion, question sur les sujets…"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Votre question <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre question ou problème en détail…"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold text-sm hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md transition-all"
            >
              {loading ? 'Envoi en cours…' : 'Envoyer ma question'}
            </button>
          </form>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link
            href="/auth/signin"
            className="inline-flex justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold hover:from-emerald-700 hover:to-cyan-700 text-sm shadow-md text-center"
          >
            Se connecter
          </Link>
          <a
            href="#contact-faculte"
            className="inline-flex justify-center px-6 py-3 rounded-xl border border-gray-300 text-gray-800 font-semibold text-sm hover:bg-gray-50 text-center"
          >
            Contact faculté
          </a>
        </div>

      </div>
    </section>
  )
}
