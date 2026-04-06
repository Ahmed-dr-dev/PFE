'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

type Msg = { role: 'bot' | 'user'; text: string }

const WELCOME =
  'Bonjour et bienvenue sur ISAEG PFE. Je réponds aux questions les plus fréquentes en quelques clics. Choisissez une réponse à chaque étape.'

type Choice = { label: string; reply: string }

type Q = { question: string; choices: Choice[] }

const FAQ_FLOW: Q[] = [
  {
    question: 'Vous êtes plutôt…',
    choices: [
      {
        label: 'Étudiant(e)',
        reply:
          'Sur la plateforme PFE, vous pouvez consulter les sujets, demander un encadrement, suivre votre projet et vos réunions. Connectez-vous avec le CIN ou l’e-mail fourni par l’école.',
      },
      {
        label: 'Enseignant(e)',
        reply:
          'Vous proposez des sujets, gérez les demandes de supervision, planifiez des réunions et suivez vos étudiants. Accès avec les identifiants communiqués par l’administration.',
      },
      {
        label: 'Visiteur / autre',
        reply:
          'La plateforme est réservée aux comptes ISAEG (étudiants, enseignants, administration). Pour toute question générale, utilisez les coordonnées de la faculté en bas de page.',
      },
    ],
  },
  {
    question: 'Comment obtenir ou réinitialiser l’accès ?',
    choices: [
      {
        label: 'Première connexion',
        reply:
          'Les identifiants sont délivré(e)s par la scolarité ou l’administration PFE. Utilisez la page Connexion avec votre CIN ou votre e-mail institutionnel.',
      },
      {
        label: 'Mot de passe oublié',
        reply:
          'Sur la page de connexion, choisissez « Mot de passe oublié ». Si vous vous connectez avec un CIN, renseignez d’abord un e-mail de récupération dans votre profil (avec l’aide de l’admin si besoin).',
      },
      {
        label: 'Compte bloqué',
        reply:
          'Contactez la scolarité ou la coordination PFE de la faculté (téléphone et e-mail en pied de page).',
      },
    ],
  },
  {
    question: 'Que faire sur la plateforme en priorité ?',
    choices: [
      {
        label: 'Choisir / valider un sujet',
        reply:
          'Parcourez les sujets disponibles, postulez ou proposez un sujet selon les dates limites affichées dans Annonces et sur le tableau de bord.',
      },
      {
        label: 'Réunions et suivi',
        reply:
          'Les créneaux se planifient avec l’encadrant ; les notifications vous informent des mises à jour. Consultez l’espace Suivi ou Mes réunions après connexion.',
      },
      {
        label: 'Documents et soutenance',
        reply:
          'Les dépôts et étapes de validation dépendent des consignes de votre département ; l’administration publie les échéances dans les annonces.',
      },
    ],
  },
  {
    question: 'Besoin d’un contact humain ?',
    choices: [
      {
        label: 'Oui, contacter la faculté',
        reply:
          'Retrouvez l’adresse, le téléphone et l’e-mail de l’ISAEG dans le pied de page de cette page (Contact faculté).',
      },
      {
        label: 'Non, j’ai ce qu’il me faut',
        reply:
          'Parfait. Vous pouvez vous connecter ci-dessous pour accéder à votre espace. Bonne réussite pour votre PFE !',
      },
    ],
  },
]

export function LandingHelpChat() {
  const [messages, setMessages] = useState<Msg[]>([{ role: 'bot', text: WELCOME }])
  /** -1 = pas encore démarré, 0..n-1 = question affichée, n = terminé */
  const [qi, setQi] = useState(-1)
  const endRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, qi, scrollToBottom])

  function begin() {
    setMessages([{ role: 'bot', text: WELCOME }, { role: 'bot', text: FAQ_FLOW[0].question }])
    setQi(0)
  }

  function pickChoice(choice: Choice) {
    if (qi < 0 || qi >= FAQ_FLOW.length) return
    const nextQi = qi + 1
    setMessages((prev) => {
      const next: Msg[] = [...prev, { role: 'user', text: choice.label }, { role: 'bot', text: choice.reply }]
      if (nextQi < FAQ_FLOW.length) {
        next.push({ role: 'bot', text: FAQ_FLOW[nextQi].question })
      }
      return next
    })
    setQi(nextQi < FAQ_FLOW.length ? nextQi : FAQ_FLOW.length)
  }

  function restart() {
    setMessages([{ role: 'bot', text: WELCOME }])
    setQi(-1)
  }

  const currentQ = qi >= 0 && qi < FAQ_FLOW.length ? FAQ_FLOW[qi] : null
  const finished = qi === FAQ_FLOW.length

  return (
    <section id="contact-accueil" className="py-16 md:py-20 bg-slate-50 border-t border-gray-200 scroll-mt-24">
      <div className="max-w-lg mx-auto px-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Aide rapide</h3>
          <p className="text-gray-600 text-sm md:text-base">
            Quatre questions courantes — répondez en un clic, comme dans un mini-chat.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[420px] max-h-[min(70vh,560px)]">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-600/10 to-cyan-600/10 flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
              PFE
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Assistant ISAEG PFE</p>
              <p className="text-xs text-gray-500">Réponses automatiques</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/80">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-4 border-t border-gray-100 bg-white space-y-3">
            {qi < 0 && (
              <button
                type="button"
                onClick={begin}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold hover:from-emerald-700 hover:to-cyan-700 transition-all shadow-md text-sm"
              >
                Commencer
              </button>
            )}

            {currentQ && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Votre choix</p>
                <div className="flex flex-col gap-2">
                  {currentQ.choices.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => pickChoice(c)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/50 text-gray-900 text-sm font-medium transition-colors"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {finished && (
              <div className="space-y-3">
                <Link
                  href="/auth/signin"
                  className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold hover:from-emerald-700 hover:to-cyan-700 text-sm"
                >
                  Se connecter
                </Link>
                <button
                  type="button"
                  onClick={restart}
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Recommencer l’aide
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
