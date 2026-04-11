import Link from 'next/link'

type Choice = { label: string; reply: string }

type FaqBlock = { title: string; items: Choice[] }

const FAQ_BLOCKS: FaqBlock[] = [
  {
    title: 'Vous êtes plutôt…',
    items: [
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
    title: 'Comment obtenir ou réinitialiser l’accès ?',
    items: [
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
    title: 'Que faire sur la plateforme en priorité ?',
    items: [
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
    title: 'Besoin d’un contact humain ?',
    items: [
      {
        label: 'Contacter la faculté',
        reply:
          'Retrouvez l’adresse, le téléphone et l’e-mail de l’ISAEG dans le pied de page de cette page (Contact faculté).',
      },
      {
        label: 'Accéder à la plateforme',
        reply:
          'Connectez-vous ci-dessous pour accéder à votre espace. Bonne réussite pour votre PFE !',
      },
    ],
  },
]

export function LandingFaq() {
  return (
    <section id="contact-accueil" className="py-16 md:py-20 bg-slate-50 border-t border-gray-200 scroll-mt-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Questions fréquentes</h3>
          <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
            Réponses courtes aux questions les plus posées sur l’accès et l’utilisation de la plateforme PFE ISAEG.
          </p>
        </div>

        <div className="space-y-6">
          {FAQ_BLOCKS.map((block) => (
            <div
              key={block.title}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <h4 className="px-5 py-4 text-base font-bold text-gray-900 border-b border-gray-100 bg-gradient-to-r from-emerald-600/8 to-cyan-600/8">
                {block.title}
              </h4>
              <div className="divide-y divide-gray-100">
                {block.items.map((item) => (
                  <details key={item.label} className="group px-5 py-1">
                    <summary className="cursor-pointer list-none py-3 flex items-center justify-between gap-3 text-sm font-semibold text-gray-900 hover:text-emerald-700 [&::-webkit-details-marker]:hidden">
                      <span>{item.label}</span>
                      <span className="shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180 text-xs leading-none">
                        ▼
                      </span>
                    </summary>
                    <p className="pb-4 pl-0.5 text-sm text-gray-600 leading-relaxed">{item.reply}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
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
