import { getViewingSeason } from '@/lib/season'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FolderOpen, Heart, Play, Plus, MessageSquare } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Student projects from the VOLT League season.',
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; tag?: string }>
}) {
  const { sort = 'newest', tag } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const season = await getViewingSeason()

  let query = supabase
    .from('projects')
    .select('*, users(full_name, department, batch)')
    .eq('is_published', true)
    .eq('season_id', season?.id ?? '')

  if (tag) query = query.contains('tags', [tag])
  if (sort === 'liked') query = query.order('likes_count', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: projects } = await query.limit(48)

  // Get user's likes
  const projectIds = (projects ?? []).map((p) => p.id)
  const { data: myLikes } = user ? await supabase
    .from('project_likes')
    .select('project_id')
    .eq('user_id', user.id)
    .in('project_id', projectIds) : { data: [] }

  const likedSet = new Set((myLikes ?? []).map((l) => l.project_id))

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6 }}>Projects</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>What students are building this season.</p>
        </div>
        {user ? (
          <Link href="/projects/new" className="btn btn-primary btn-sm">
            <Plus size={15} /> Submit Project
          </Link>
        ) : (
          <Link href="/login" className="btn btn-primary btn-sm">
            Sign in to Submit
          </Link>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        <Link href="/projects?sort=newest" className={`btn btn-sm ${sort === 'newest' ? 'btn-primary' : 'btn-secondary'}`}>Newest</Link>
        <Link href="/projects?sort=liked" className={`btn btn-sm ${sort === 'liked' ? 'btn-primary' : 'btn-secondary'}`}>Most Liked</Link>
      </div>

      {/* Projects grid */}
      {(projects ?? []).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
          <FolderOpen size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No projects yet. Be the first to submit!</p>
          {user && <Link href="/projects/new" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Submit Project</Link>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {(projects ?? []).map((project) => {
            const hasLiked = likedSet.has(project.id)
            const author = project.users as { full_name: string; department: string }
            return (
              <div key={project.id} className="card card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Image */}
                <Link href={`/projects/${project.id}`} style={{ display: 'block' }}>
                {project.image_url ? (
                  <div style={{ height: 180, background: `url(${project.image_url}) center/cover` }} />
                ) : (
                  <div
                    style={{
                      height: 180,
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(245,197,24,0.08) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FolderOpen size={36} style={{ opacity: 0.3 }} />
                  </div>
                )}
                </Link>

                <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href={`/projects/${project.id}`} style={{ display: 'block' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em', transition: 'color 0.2s' }} className="hover-white">{project.title}</h3>
                  </Link>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>by {author?.full_name}</p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {project.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{tag}</span>
                      ))}
                    </div>
                  )}

                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, flex: 1 }}>
                    {project.description.slice(0, 100)}{project.description.length > 100 ? '...' : ''}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {project.demo_video_url && (
                        <a
                          href={project.demo_video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <Play size={12} /> Demo
                        </a>
                      )}
                      
                      <div className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        <MessageSquare size={13} /> {project.comments_count ?? 0}
                      </div>
                    </div>
                    
                    {/* Like button */}
                    <div>
                      {user ? (
                        <form action={`/api/projects/${project.id}/like`} method="POST">
                          <button
                            type="submit"
                            className="btn btn-ghost btn-sm"
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              color: hasLiked ? '#F472B6' : 'var(--color-text-muted)',
                            }}
                          >
                            <Heart size={13} fill={hasLiked ? '#F472B6' : 'none'} />
                            {project.likes_count}
                          </button>
                        </form>
                      ) : (
                        <div
                          className="btn btn-ghost btn-sm"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          <Heart size={13} fill="none" />
                          {project.likes_count}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
