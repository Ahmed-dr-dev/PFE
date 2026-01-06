import { TopicCard } from './topic-card'
import { SubmitTopicForm } from './submit-topic-form'

export default function TopicsPage() {
  const topics = [
    {
      id: '1',
      title: 'Système de gestion de bibliothèque',
      description: 'Développement d\'une application web pour la gestion d\'une bibliothèque avec authentification, recherche de livres, et système de prêt.',
      teacher: { full_name: 'Prof. Ahmed Benali', email: 'ahmed.benali@isaeg.ma' },
      department: 'informatique',
    },
    {
      id: '2',
      title: 'Plateforme e-commerce pour PME',
      description: 'Création d\'une plateforme e-commerce complète avec gestion des produits, panier, paiement en ligne et tableau de bord administrateur.',
      teacher: { full_name: 'Prof. Fatima Alami', email: 'fatima.alami@isaeg.ma' },
      department: 'informatique',
    },
    {
      id: '3',
      title: 'Application mobile de gestion de budget',
      description: 'Développement d\'une application mobile pour la gestion personnelle du budget avec suivi des dépenses et statistiques.',
      teacher: { full_name: 'Prof. Youssef Idrissi', email: 'youssef.idrissi@isaeg.ma' },
      department: 'gestion',
    },
    {
      id: '4',
      title: 'Système de gestion des ressources humaines',
      description: 'Application web pour la gestion du personnel, congés, évaluations et planning dans une entreprise.',
      teacher: { full_name: 'Prof. Karima Tazi', email: 'karima.tazi@isaeg.ma' },
      department: 'rh',
    },
    {
      id: '5',
      title: 'Analyse de données marketing avec IA',
      description: 'Développement d\'un système d\'analyse de données marketing utilisant l\'intelligence artificielle pour prédire les tendances.',
      teacher: { full_name: 'Prof. Mehdi Bensaid', email: 'mehdi.bensaid@isaeg.ma' },
      department: 'marketing',
    },
    {
      id: '6',
      title: 'Plateforme de gestion de projets collaboratifs',
      description: 'Création d\'une plateforme web pour la gestion de projets en équipe avec suivi des tâches, deadlines et communication.',
      teacher: { full_name: 'Prof. Salma Amrani', email: 'salma.amrani@isaeg.ma' },
      department: 'informatique',
    },
  ]

  const myPfe = null

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Sujets de PFE <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">disponibles</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Consultez les sujets proposés par les enseignants
          </p>
        </div>
        <SubmitTopicForm />
      </div>

      {myPfe && (
        <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-6 py-4 rounded-lg backdrop-blur-sm">
          <p className="font-medium">
            Vous avez déjà un PFE assigné. Vous pouvez consulter les détails sur la page{' '}
            <a href="/dashboard/my-pfe" className="underline hover:text-blue-100">
              Mon PFE
            </a>
            .
          </p>
        </div>
      )}

      {topics && topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} hasPfe={!!myPfe} />
          ))}
        </div>
      ) : (
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5" />
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              <svg
                className="w-10 h-10 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-300 text-lg font-medium">Aucun sujet disponible pour le moment</p>
          </div>
        </div>
      )}
    </div>
  )
}

