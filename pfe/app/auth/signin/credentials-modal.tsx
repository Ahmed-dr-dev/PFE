export function CredentialsModal() {
  return (
    <div className="bg-emerald-50/90 border border-emerald-100 rounded-xl p-5 text-left">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200/80">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Identifiants de connexion</h3>
          <p className="text-gray-600 text-xs leading-relaxed mb-2">
            Pour les <strong className="text-gray-900">étudiants</strong> et <strong className="text-gray-900">enseignants</strong> :
          </p>
          <ul className="text-gray-600 text-xs leading-relaxed space-y-1.5">
            <li><strong className="text-gray-900">Identifiant (email)</strong> : votre numéro de carte d&apos;identité</li>
            <li><strong className="text-gray-900">Mot de passe</strong> : votre date de naissance (JJ/MM/AAAA)</li>
          </ul>
          <p className="text-gray-500 text-xs leading-relaxed mt-3">
            En cas de problème, rapprochez-vous de l&apos;administration ISAEG.
          </p>
        </div>
      </div>
    </div>
  )
}
