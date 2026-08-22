'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(projectId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in to comment.', success: false }
  }

  const content = formData.get('content')?.toString()
  if (!content || content.trim().length === 0) {
    return { error: 'Comment cannot be empty.', success: false }
  }

  const { error } = await supabase
    .from('project_comments')
    .insert({
      project_id: projectId,
      user_id: user.id,
      content: content.trim(),
    })

  if (error) {
    console.error('Error adding comment:', error)
    return { error: 'Failed to post comment. Make sure you are verified.', success: false }
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: undefined, success: true }
}
