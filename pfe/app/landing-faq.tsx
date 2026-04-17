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
      if (!res.ok) { setError(json.error || "Erreur lors de l'envoi."); return }
      setSuccess(true)
      setName(''); setEmail(''); setSubject(''); setMessage('')
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact-accueil" className="py-20 bg-gray-50 border-t border-gray-100 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Left — info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3">Contact</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Une question ?<br />Écrivez-nous.
              </h2>
              <p className="text-gray-500 mt-4 leading-relaxed">
                L&apos;équipe de l&apos;administration ISAEG PFE vous répond par e-mail
                dans les meilleurs délais.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: '🎓', title: 'Étudiants', text: 'Questions sur les sujets, l\'encadrement, les délais.' },
                { icon: '🧑‍🏫', title: 'Enseignants', text: 'Accès à la plateforme, gestion des sujets.' },
                { icon: '🏛️', title: 'Administration', text: 'Demandes spécifiques ou problèmes techniques.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold text-sm hover:from-emerald-700 hover:to-cyan-700 shadow-md transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Se connecter à la plateforme
              </Link>
              <a
                href="#contact-faculte"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-white hover:shadow-sm transition-all"
              >
                Contact faculté
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            {success ? (
              <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-10 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Message envoyé !</h4>
                <p className="text-gray-500 text-sm mb-6">
                  Votre message a été transmis à l&apos;administration. Vous recevrez une réponse à l&apos;adresse indiquée.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="text-sm font-semibold text-emerald-600 hover:underline"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5"
              >
                <h3 className="text-lg font-bold text-gray-900">Envoyer un message</h3>

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
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
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
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
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
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Décrivez votre question ou problème en détail…"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-shadow"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold text-sm hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md transition-all"
                >
                  {loading ? 'Envoi en cours…' : 'Envoyer le message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
