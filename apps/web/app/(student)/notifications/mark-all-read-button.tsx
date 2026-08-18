'use client'

import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'

export default function MarkAllReadButton() {
  const router = useRouter()

  async function handleClick() {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' })
    router.refresh()
  }

  return (
    <button onClick={handleClick} className="btn btn-secondary btn-sm">
      <CheckCheck size={14} /> Mark all read
    </button>
  )
}
