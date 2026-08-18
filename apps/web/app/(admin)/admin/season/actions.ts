'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_COOKIE } from '@/lib/season'

/** Set the season the admin is currently previewing */
export async function setPreviewSeason(seasonId: string) {
  const cookieStore = await cookies()
  cookieStore.set(PREVIEW_COOKIE, seasonId, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })
  revalidatePath('/admin', 'layout')
}

/** Clear the preview cookie — go back to active season */
export async function clearPreviewSeason() {
  const cookieStore = await cookies()
  cookieStore.delete(PREVIEW_COOKIE)
  revalidatePath('/admin', 'layout')
}

/** Make a season active — enforces only ONE active season at a time */
export async function activateSeason(seasonId: string) {
  const supabase = await createClient()
  await supabase.from('seasons').update({ is_active: false }).neq('id', 'none') // deactivate ALL
  await supabase.from('seasons').update({ is_active: true }).eq('id', seasonId)
  revalidatePath('/admin/season')
  revalidatePath('/admin', 'layout')
}

/** Deactivate a season */
export async function deactivateSeason(seasonId: string) {
  const supabase = await createClient()
  await supabase.from('seasons').update({ is_active: false }).eq('id', seasonId)
  revalidatePath('/admin/season')
  revalidatePath('/admin', 'layout')
}

/** Toggle recap published flag */
export async function toggleRecap(seasonId: string, current: boolean) {
  const supabase = await createClient()
  await supabase.from('seasons').update({ recap_published: !current }).eq('id', seasonId)
  revalidatePath('/admin/season')
}

/** Update season name, slug, and dates */
export async function updateSeason(
  seasonId: string,
  data: { name: string; slug: string; start_date: string; end_date: string }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('seasons').update(data).eq('id', seasonId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/season')
  revalidatePath('/admin', 'layout')
}

/** Delete a season (cannot delete an active season) */
export async function deleteSeason(seasonId: string) {
  const supabase = await createClient()
  // Safety: refuse to delete an active season
  const { data } = await supabase.from('seasons').select('is_active').eq('id', seasonId).single()
  if (data?.is_active) throw new Error('Cannot delete an active season. Deactivate it first.')
  await supabase.from('seasons').delete().eq('id', seasonId)
  revalidatePath('/admin/season')
  redirect('/admin/season')
}
