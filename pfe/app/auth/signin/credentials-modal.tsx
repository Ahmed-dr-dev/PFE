export function CredentialsModal() {
  return (
    <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 text-left">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="text-sm font-semibold text-amber-200 mb-1">Identifiants de connexion</h3>
          <p className="text-gray-300 text-xs leading-relaxed">
            Les comptes <strong className="text-white">étudiant</strong> et <strong className="text-white">enseignant</strong> sont créés par l&apos;administration.
            Rapprochez-vous de l&apos;administration ISAEG pour obtenir vos identifiants (email et mot de passe) avant de vous connecter.
          </p>
        </div>
      </div>
    </div>
  )
}
