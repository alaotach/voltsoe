'use client'

import { useRef, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  bucket: 'avatars' | 'event-covers' | 'project-images'
  currentUrl?: string | null
  onUpload: (url: string) => void
  shape?: 'circle' | 'rect'
  label?: string
  /** Aspect ratio hint for rect, e.g. "16/9" */
  aspectRatio?: string
}

export default function ImageUpload({
  bucket,
  currentUrl,
  onUpload,
  shape = 'rect',
  label = 'Upload Image',
  aspectRatio = '16/9',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError('')
    setUploading(true)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    const url = data.publicUrl
    setPreview(url)
    onUpload(url)
    setUploading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function clear() {
    setPreview(null)
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing in a text input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (uploading) return
      
      const items = e.clipboardData?.items
      if (!items) return
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            // Check allowed extensions based on bucket
            if (bucket !== 'avatars' && file.type === 'image/gif') return
            
            handleFile(file)
            e.preventDefault()
            break
          }
        }
      }
    }

    window.addEventListener('paste', handleGlobalPaste)
    return () => window.removeEventListener('paste', handleGlobalPaste)
  }, [uploading, bucket]) // bucket is static, uploading changes

  const isCircle = shape === 'circle'
  const size = isCircle ? 96 : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {error && (
        <p style={{ fontSize: '0.78rem', color: '#EF4444' }}>{error}</p>
      )}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          position: 'relative',
          width: isCircle ? size : '100%',
          aspectRatio: isCircle ? '1' : (preview ? undefined : aspectRatio),
          borderRadius: isCircle ? '50%' : 'var(--radius-md)',
          border: `2px dashed ${preview ? 'transparent' : 'var(--color-border)'}`,
          background: preview ? 'transparent' : 'rgba(255,255,255,0.03)',
          cursor: uploading ? 'wait' : 'pointer',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'border-color 0.2s',
        }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              style={{ 
                width: '100%', 
                height: isCircle ? '100%' : 'auto', 
                display: 'block',
                objectFit: isCircle ? 'cover' : 'contain' 
              }}
            />
            {/* Hover overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 6,
              opacity: 0,
              transition: 'opacity 0.2s',
            }}
              className="img-upload-overlay"
            >
              <Upload size={20} color="#fff" />
              <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 600 }}>Change</span>
            </div>
          </>
        ) : uploading ? (
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 16 }}>
            <Upload size={20} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              {label}<br />
              <span style={{ fontSize: '0.68rem' }}>or drag & drop</span>
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={bucket === 'avatars' ? 'image/jpeg,image/png,image/webp,image/gif' : 'image/jpeg,image/png,image/webp'}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>

      {preview && (
        <button
          type="button"
          onClick={clear}
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: isCircle ? 'center' : 'flex-start', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <X size={12} /> Remove
        </button>
      )}

      <style>{`.img-upload-overlay { opacity: 0 !important; } div:hover > .img-upload-overlay { opacity: 1 !important; }`}</style>
    </div>
  )
}
