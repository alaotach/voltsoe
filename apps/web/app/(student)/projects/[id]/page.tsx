import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FolderOpen, Heart, Play, ArrowLeft, MessageSquare, Clock } from 'lucide-react'
import { CommentForm } from './comment-form'
import { formatDistanceToNow } from 'date-fns'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('title, description').eq('id', id).single()

  if (!project) return { title: 'Project Not Found' }
  return {
    title: project.title,
    description: project.description.slice(0, 160),
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch project details, author, and comments
  const { data: project } = await supabase
    .from('projects')
    .select('*, users!projects_user_id_fkey(full_name, department, avatar_url), project_comments(*, users!project_comments_user_id_fkey(full_name, avatar_url))')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Sort comments by newest
  const comments = (project.project_comments as any[] ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const author = project.users as any

  // Check if current user has liked this project
  let hasLiked = false
  if (user) {
    const { data: like } = await supabase
      .from('project_likes')
      .select('id')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .single()
    hasLiked = !!like
  }

  // Parse demo video
  const isYouTube = project.demo_video_url?.includes('youtube.com') || project.demo_video_url?.includes('youtu.be')
  let youtubeEmbedUrl = ''
  if (isYouTube) {
    try {
      const url = new URL(project.demo_video_url)
      const videoId = url.searchParams.get('v') || url.pathname.split('/').pop()
      if (videoId) youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`
    } catch (e) {
      // Invalid URL
    }
  }

  return (
    <div className="fade-in page-container" style={{ maxWidth: 900, padding: '24px 16px' }}>
      <Link href="/projects" className="btn btn-ghost btn-sm" style={{ marginBottom: 24, display: 'inline-flex', padding: 0 }}>
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Media Header */}
        {youtubeEmbedUrl ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={youtubeEmbedUrl}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : project.demo_video_url && project.demo_video_url.endsWith('.mp4') ? (
          <video
            src={project.demo_video_url}
            controls
            style={{ width: '100%', maxHeight: 500, background: '#000', objectFit: 'contain' }}
          />
        ) : project.image_url ? (
          <div style={{ height: 350, background: `url(${project.image_url}) center/cover`, borderBottom: '1px solid var(--color-border)' }} />
        ) : (
          <div
            style={{
              height: 250,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(245,197,24,0.08) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid var(--color-border)'
            }}
          >
            <FolderOpen size={64} style={{ opacity: 0.2 }} />
          </div>
        )}

        <div style={{ padding: '32px 24px' }}>
          {/* Header Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>{project.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--color-surface-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {author?.avatar_url ? (
                    <img src={author.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    author?.full_name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{author?.full_name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{author?.department}</p>
                </div>
              </div>
            </div>

            {/* Like Button */}
            <div style={{ flexShrink: 0 }}>
              {user ? (
                <form action={`/api/projects/${project.id}/like`} method="POST">
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    style={{
                      borderColor: hasLiked ? '#F472B6' : 'var(--color-border)',
                      color: hasLiked ? '#F472B6' : 'var(--color-text-primary)',
                      background: hasLiked ? 'rgba(244, 114, 182, 0.05)' : 'var(--color-surface-2)',
                    }}
                  >
                    <Heart size={16} fill={hasLiked ? '#F472B6' : 'none'} />
                    {project.likes_count} Likes
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-secondary"
                >
                  <Heart size={16} fill="none" />
                  {project.likes_count} Likes
                </Link>
              )}
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
              {project.tags.map((tag: string) => (
                <span key={tag} className="badge badge-gray" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>{tag}</span>
              ))}
            </div>
          )}

          {/* Description */}
          <div style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
            {project.description}
          </div>
          
          {/* External Demo Link */}
          {project.demo_video_url && !youtubeEmbedUrl && !project.demo_video_url.endsWith('.mp4') && (
            <div style={{ marginTop: 32 }}>
              <a href={project.demo_video_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <Play size={16} /> View Demo Externally
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div style={{ marginTop: 40, marginBottom: 80 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageSquare size={20} /> Comments ({project.comments_count})
        </h2>

        {user ? (
          <div style={{ marginBottom: 32 }}>
            <CommentForm projectId={project.id} />
          </div>
        ) : (
          <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 32, background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>Sign in to join the conversation.</p>
            <Link href="/login" className="btn btn-primary btn-sm">Sign In</Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {comments.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px 0' }}>
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--color-surface-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {comment.users?.avatar_url ? (
                        <img src={comment.users.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        comment.users?.full_name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{comment.users?.full_name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </div>
                </div>
                <p style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
