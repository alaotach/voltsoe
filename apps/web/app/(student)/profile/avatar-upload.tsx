'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/image-upload'
import { useRouter } from 'next/navigation'

export default function AvatarUpload({
  userId,
  currentUrl,
}: {
  userId: string
  currentUrl: string | null
}) {
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleUpload(url: string) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({ avatar_url: url || null }).eq('id', userId)
    setSaving(false)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <ImageUpload
        bucket="avatars"
        currentUrl={currentUrl}
        onUpload={handleUpload}
        shape="circle"
        label="Upload avatar"
      />
      {saving && <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Saving…</p>}
    </div>
  )
}
