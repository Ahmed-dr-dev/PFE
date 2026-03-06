import { redirect } from 'next/navigation'

export default function ProfessorSettingsRedirect() {
  redirect('/dashboard/professor/annonces')
}
