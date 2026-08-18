import type { Metadata } from 'next'
import NewSeasonForm from './new-season-form'

export const metadata: Metadata = { title: 'Create Season' }

export default function NewSeasonPage() {
  return <NewSeasonForm />
}
