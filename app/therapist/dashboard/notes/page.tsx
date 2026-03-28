import { redirect } from 'next/navigation'

// Notes are now integrated into the Sessions page
export default function NotesRedirect() {
  redirect('/therapist/dashboard/video')
}
