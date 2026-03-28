import Image from 'next/image'
import Link from 'next/link'
import { SignInForm } from './signin-form'
import { CredentialsModal } from './credentials-modal'

const HERO_SRC = '/signin-hero.webp'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Image
              src="/isaeg.jpg"
              alt="ISAEG"
              width={160}
              height={64}
              className="h-10 sm:h-12 w-auto object-contain shrink-0"
            />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent truncate">
              ISAEG PFE
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors shrink-0"
          >
            Accueil
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 flex-col lg:flex-row min-h-0">
        {/* Left: form */}
        <div className="order-2 lg:order-1 flex w-full lg:w-1/2 min-w-0 flex-col justify-center px-5 py-10 sm:px-8 lg:px-10 xl:px-14 bg-white lg:border-r border-gray-200">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-10">
              <p className="text-sm font-semibold tracking-widest text-emerald-600 uppercase mb-3">
                Connexion
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                Bienvenue
              </h1>
              <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                Étudiants, enseignants et administration — accédez à votre espace.
              </p>
              <div className="mt-6 h-1 w-14 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600" />
            </div>

            <SignInForm />

            <div className="mt-8 space-y-5">
              <CredentialsModal />
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span aria-hidden>←</span> Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>

        {/* Right: hero */}
        <div className="order-1 lg:order-2 relative w-full lg:w-1/2 min-w-0 h-44 sm:h-56 lg:h-auto lg:min-h-0 lg:flex-1 overflow-hidden">
          <Image
            src={HERO_SRC}
            alt="Cérémonie de remise des diplômes — étudiants en toge lançant leurs mortiers"
            fill
            priority
            unoptimized
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover object-center [transform:translateZ(0)]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/45 to-slate-900/25 lg:from-slate-950/65 lg:via-slate-900/35 lg:to-emerald-950/30 pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-900/20 pointer-events-none"
            aria-hidden
          />
          <div className="absolute bottom-4 left-4 right-4 lg:bottom-10 lg:left-10 lg:right-10 text-white drop-shadow-md">
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-emerald-200/95 uppercase">
              Projet de fin d&apos;études
            </p>
            <p className="mt-1 text-lg sm:text-xl font-bold leading-snug max-w-md text-white">
              Votre réussite, notre accompagnement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
