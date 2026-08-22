'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addComment } from './actions'
import { Send } from 'lucide-react'

export function CommentForm({ projectId }: { projectId: string }) {
  const [state, formAction, isPending] = useActionState(
    addComment.bind(null, projectId),
    { error: undefined, success: false }
  )

  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {state.error && (
        <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
          {state.error}
        </div>
      )}
      
      <div style={{ position: 'relative' }}>
        <textarea
          name="content"
          placeholder="Share your thoughts on this project..."
          rows={3}
          style={{
            width: '100%',
            padding: '16px',
            paddingRight: '60px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: '0.95rem',
            resize: 'vertical',
            minHeight: 100,
          }}
          disabled={isPending}
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary"
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            padding: '8px 12px',
          }}
        >
          {isPending ? '...' : <Send size={16} />}
        </button>
      </div>
    </form>
  )
}
