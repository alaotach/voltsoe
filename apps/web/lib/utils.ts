import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize enrollment number: UPPERCASE + trim whitespace
 */
export function normalizeEnrollment(value: string): string | null {
  const cleaned = value.trim().toUpperCase()
  // Format: 24/11/EE/010 (YY/11/DEPT/NNN where DEPT is EE or EC)
  const regex = /^\d{2}\/11\/(EE|EC)\/\d{3}$/
  if (!regex.test(cleaned)) {
    return null
  }
  return cleaned
}

/**
 * Format a date string to human-readable format
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/**
 * Format time string (HH:MM:SS) to 12-hour format
 */
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Calculate time remaining until a deadline
 */
export function timeRemaining(deadline: string): {
  hours: number
  minutes: number
  expired: boolean
  label: string
} {
  const now = new Date()
  const end = new Date(deadline)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return { hours: 0, minutes: 0, expired: true, label: 'Expired' }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    return { hours, minutes, expired: false, label: `${days}d ${hours % 24}h remaining` }
  }

  return { hours, minutes, expired: false, label: `${hours}h ${minutes}m remaining` }
}

/**
 * Get ordinal suffix for rank number (1st, 2nd, 3rd, etc.)
 */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/**
 * Get difficulty color class
 */
export function difficultyColor(difficulty: string): string {
  const map: Record<string, string> = {
    beginner: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    intermediate: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    advanced: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  }
  return map[difficulty] ?? 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
}

/**
 * Get registration status label and color
 */
export function registrationStatusInfo(status: string | null, registrationOpen: boolean, capacity: number | null, registeredCount: number) {
  if (!registrationOpen) return { label: 'Registration Closed', color: 'text-zinc-500', variant: 'closed' as const }
  if (capacity && registeredCount >= capacity) return { label: 'Full', color: 'text-rose-400', variant: 'full' as const }
  if (status === 'points_awarded') return { label: 'Points Awarded', color: 'text-violet-400', variant: 'done' as const }
  if (status === 'project_submitted') return { label: 'Project Submitted', color: 'text-blue-400', variant: 'done' as const }
  if (status === 'attended') return { label: 'Attended', color: 'text-emerald-400', variant: 'done' as const }
  if (status === 'checked_in') return { label: 'Checked In', color: 'text-emerald-400', variant: 'active' as const }
  if (status === 'registered') return { label: 'Registered', color: 'text-sky-400', variant: 'registered' as const }
  return { label: 'Register', color: 'text-volt-yellow', variant: 'open' as const }
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Generate a random alphanumeric token of given length
 */
export function generateToken(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * Progress percentage, clamped to 0-100
 */
export function progressPct(current: number, total: number): number {
  if (total === 0) return 0
  return Math.min(100, Math.max(0, Math.round((current / total) * 100)))
}
