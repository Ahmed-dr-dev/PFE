/**
 * Decorative hero illustration — pure SVG + CSS (see globals.css .hero-ill-*).
 */
export function LandingHeroIllustration() {
  return (
    <div
      className="relative mx-auto w-full max-w-[min(100%,420px)] aspect-[5/4] select-none"
      aria-hidden
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-100/80 via-cyan-50/60 to-teal-100/50 blur-2xl hero-ill-glow" />

      <svg
        viewBox="0 0 400 340"
        className="relative z-10 w-full h-full drop-shadow-[0_20px_50px_rgba(16,185,129,0.12)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="heroGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <filter id="heroSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
          </filter>
        </defs>

        {/* Back plate */}
        <rect
          x="48"
          y="52"
          width="304"
          height="236"
          rx="28"
          className="fill-white/90 stroke-emerald-100"
          strokeWidth="1.5"
        />

        {/* Window chrome */}
        <rect x="64" y="68" width="272" height="36" rx="10" className="fill-gray-50/95 stroke-gray-100" strokeWidth="1" />
        <circle cx="80" cy="86" r="5" className="fill-red-400/90" />
        <circle cx="98" cy="86" r="5" className="fill-amber-400/90" />
        <circle cx="116" cy="86" r="5" className="fill-emerald-400/90" />
        <rect x="148" y="80" width="120" height="10" rx="5" className="fill-gray-200/90" />

        {/* Sidebar */}
        <rect x="64" y="118" width="72" height="152" rx="12" className="fill-emerald-50/90 stroke-emerald-100/80" strokeWidth="1" />
        <rect x="76" y="132" width="48" height="8" rx="4" className="fill-emerald-200/70" />
        <rect x="76" y="148" width="40" height="6" rx="3" className="fill-gray-200/80" />
        <rect x="76" y="162" width="44" height="6" rx="3" className="fill-gray-200/80" />
        <rect x="76" y="176" width="36" height="6" rx="3" className="fill-gray-200/80" />
        <rect x="72" y="198" width="56" height="28" rx="8" className="fill-[url(#heroGrad1)] opacity-90" />

        {/* Main content cards */}
        <g className="hero-ill-float-a">
          <rect x="152" y="118" width="176" height="64" rx="14" className="fill-white stroke-gray-100" strokeWidth="1" />
          <rect x="168" y="134" width="80" height="10" rx="4" className="fill-gray-200/90" />
          <rect x="168" y="152" width="120" height="8" rx="4" className="fill-gray-100" />
          <rect x="168" y="166" width="96" height="6" rx="3" className="fill-gray-100/80" />
          <circle cx="300" cy="150" r="18" className="fill-emerald-100 stroke-emerald-200/80" strokeWidth="1.2" />
          <path
            d="M294 150l5 5 10-12"
            fill="none"
            className="stroke-emerald-500"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <g className="hero-ill-float-b">
          <rect x="152" y="194" width="176" height="64" rx="14" className="fill-white stroke-gray-100" strokeWidth="1" />
          <rect x="168" y="210" width="100" height="8" rx="4" className="fill-gray-200/90" />
          <rect x="168" y="226" width="72" height="6" rx="3" className="fill-gray-100" />
          <rect x="168" y="238" width="88" height="6" rx="3" className="fill-gray-100/80" />
          <rect x="276" y="214" width="40" height="24" rx="8" className="fill-cyan-100 stroke-cyan-200/70" strokeWidth="1" />
          <text
            x="296"
            y="231"
            textAnchor="middle"
            fill="#0e7490"
            fontSize="11"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            PFE
          </text>
        </g>

        {/* Floating nodes */}
        <g className="hero-ill-float-c">
          <circle cx="32" cy="120" r="28" className="fill-[url(#heroGrad2)] opacity-95" />
          <path
            d="M26 118h12M32 112v12"
            fill="none"
            className="stroke-white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        <g className="hero-ill-float-d">
          <rect x="318" y="200" width="64" height="56" rx="16" className="fill-white stroke-emerald-200/90 shadow-sm" strokeWidth="1.2" />
          <path
            d="M334 222h32M334 232h24M334 242h28"
            fill="none"
            className="stroke-gray-300"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Connection arc */}
        <path
          d="M60 200 Q20 140 32 100"
          fill="none"
          className="stroke-emerald-200/60"
          strokeWidth="2"
          strokeDasharray="6 8"
          strokeLinecap="round"
          filter="url(#heroSoft)"
        />
        <path
          d="M340 160 Q380 120 368 88"
          fill="none"
          className="stroke-cyan-200/60"
          strokeWidth="2"
          strokeDasharray="6 8"
          strokeLinecap="round"
        />
      </svg>

      {/* Floating chips */}
      <div className="absolute -left-1 top-[12%] rounded-2xl bg-white/95 border border-emerald-100 px-3 py-2 shadow-lg shadow-emerald-100/40 hero-ill-chip-a">
        <p className="text-[11px] font-bold text-emerald-700">Soutenance</p>
        <p className="text-[10px] text-gray-400">Planifiée</p>
      </div>
      <div className="absolute -right-2 bottom-[18%] rounded-2xl bg-white/95 border border-cyan-100 px-3 py-2 shadow-lg shadow-cyan-100/40 hero-ill-chip-b">
        <p className="text-[11px] font-bold text-cyan-700">Suivi</p>
        <p className="text-[10px] text-gray-400">À jour</p>
      </div>
    </div>
  )
}
