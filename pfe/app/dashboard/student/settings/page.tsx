import { redirect } from 'next/navigation'

export default function StudentSettingsRedirect() {
  redirect('/dashboard/student/annonces')
}
