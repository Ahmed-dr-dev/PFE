/** Slugs de département (alignés sur CreateUser / EditUser) */
export const DEPARTMENT_SLUGS = [
  'informatique',
  'gestion',
  'finance',
  'marketing',
  'rh',
  'comptabilite',
] as const

const SYNONYMS: Record<string, (typeof DEPARTMENT_SLUGS)[number]> = {
  rh: 'rh',
  ressourceshumaines: 'rh',
  resourceshumaines: 'rh',
  hr: 'rh',
  ressources_humaines: 'rh',

  informatique: 'informatique',
  info: 'informatique',
  gsi: 'informatique',

  gestion: 'gestion',

  finance: 'finance',

  marketing: 'marketing',

  comptabilite: 'comptabilite',
  comptabilit: 'comptabilite',
  compta: 'comptabilite',
}

/**
 * Département lisible dans le filtre (slug → libellé).
 */
export function departmentLabel(slug: string): string {
  const map: Record<string, string> = {
    informatique: 'Informatique',
    gestion: 'Gestion',
    finance: 'Finance',
    marketing: 'Marketing',
    rh: 'Ressources Humaines',
    comptabilite: 'Comptabilité',
  }
  const s = slug.trim().toLowerCase()
  return map[s] || slug.charAt(0).toUpperCase() + slug.slice(1)
}

/**
 * Clé canonique pour filtrage (ignore casse, accents, espaces, ponctuation).
 */
export function canonicalDepartmentKey(raw: unknown): string | null {
  if (raw == null) return null
  const s = String(raw).trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, '')
  if (!s) return null
  const alnum = s.replace(/[^a-z0-9_]/g, '')
  const resolved = SYNONYMS[alnum]
  return resolved ?? (alnum as string)
}

/**
 * True si la valeur stockée correspond au slug choisi dans le select (ex. "informatique").
 */
export function departmentMatches(studentDept: unknown, filterSlug: string): boolean {
  const want = canonicalDepartmentKey(filterSlug)
  const got = canonicalDepartmentKey(studentDept)
  if (!want || !got) return false
  return want === got
}
