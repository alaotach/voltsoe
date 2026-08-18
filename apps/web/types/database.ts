// Auto-generated TypeScript types matching Supabase database schema

export type UserRole = 'student' | 'core' | 'vp' | 'president' | 'super_admin'

export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled'

export type EventDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type RegistrationStatus =
  | 'registered'
  | 'checked_in'
  | 'attended'
  | 'project_submitted'
  | 'points_awarded'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export type NotificationType =
  | 'registration_open'
  | 'registration_closing'
  | 'event_tomorrow'
  | 'attendance_confirmed'
  | 'points_awarded'
  | 'rank_improved'
  | 'rank_dropped'
  | 'new_challenge'
  | 'challenge_deadline'
  | 'badge_unlocked'
  | 'submission_reviewed'
  | 'weekly_digest'

export type ActivityFeedType =
  | 'badge_earned'
  | 'rank_changed'
  | 'project_published'
  | 'points_awarded'
  | 'challenge_completed'
  | 'event_registered'

export type TeamMemberRole = 'leader' | 'member'

export interface Season {
  id: string
  name: string
  slug: string
  start_date: string
  end_date: string
  is_active: boolean
  recap_published: boolean
  created_at: string
}

export interface User {
  id: string
  full_name: string
  email: string
  enrollment_number: string
  batch: string
  department: string
  phone: string | null
  role: UserRole
  is_verified: boolean
  email_verified: boolean
  is_suspended: boolean
  avatar_url: string | null
  created_at: string
}

export interface Event {
  id: string
  season_id: string
  title: string
  slug: string
  description: string | null
  what_youll_build: string | null
  date: string
  start_time: string
  end_time: string | null
  venue: string | null
  capacity: number | null
  difficulty: EventDifficulty | null
  prerequisites: string[] | null
  components_provided: string | null
  what_to_bring: string | null
  organizer_ids: string[] | null
  registration_open: boolean
  registration_deadline: string | null
  is_team_event: boolean
  cover_image_url: string | null
  status: EventStatus
  created_by: string | null
  created_at: string
}

export interface Registration {
  id: string
  event_id: string
  user_id: string
  team_id: string | null
  status: RegistrationStatus
  registered_at: string
  notes: string | null
  added_by: string | null
  registration_link_id: string | null
}

export interface Attendance {
  id: string
  event_id: string
  user_id: string
  checked_in_at: string
  marked_by: string | null
  method: string
  override_reason: string | null
}

export interface PointRule {
  id: string
  event_id: string | null
  season_id: string
  label: string
  points: number
  is_active: boolean
  created_by: string | null
  created_at: string
}

export interface PointTransaction {
  id: string
  user_id: string
  season_id: string
  event_id: string | null
  rule_id: string | null
  points: number
  reason: string
  awarded_by: string | null
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  full_name: string
  department: string
  batch: string
  avatar_url: string | null
  season_id: string
  total_points: number
  rank: number
}

export interface Challenge {
  id: string
  season_id: string
  title: string
  description: string
  reward_points: number
  deadline: string
  is_active: boolean
  is_boss: boolean
  created_by: string | null
  created_at: string
}

export interface Submission {
  id: string
  challenge_id: string
  user_id: string
  content: string | null
  file_url: string | null
  submitted_at: string
  status: SubmissionStatus
  reviewed_by: string | null
  reviewed_at: string | null
}

export interface Project {
  id: string
  user_id: string
  season_id: string
  event_id: string | null
  title: string
  description: string
  image_url: string | null
  demo_video_url: string | null
  tags: string[] | null
  likes_count: number
  is_published: boolean
  created_at: string
}

export interface ProjectLike {
  id: string
  project_id: string
  user_id: string
  created_at: string
}

export interface Team {
  id: string
  season_id: string
  name: string
  invite_code: string
  created_by: string | null
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamMemberRole
  joined_at: string
}

export interface Badge {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  criteria: Record<string, unknown> | null
  is_manual: boolean
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  season_id: string | null
  awarded_at: string
  awarded_by: string | null
}

export interface RegistrationLink {
  id: string
  event_id: string
  token: string
  label: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  metadata: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

export interface ActivityFeedItem {
  id: string
  season_id: string
  user_id: string | null
  team_id: string | null
  type: ActivityFeedType
  content: Record<string, unknown>
  created_at: string
}

export interface AdminAction {
  id: string
  admin_id: string
  action: string
  target_type: string | null
  target_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// Joined / enriched types used in UI
export interface EventWithRegistration extends Event {
  registration: Registration | null
  registered_count: number
}

export interface ProjectWithUser extends Project {
  user: Pick<User, 'id' | 'full_name' | 'department' | 'batch' | 'avatar_url'>
  event: Pick<Event, 'id' | 'title' | 'slug'> | null
  user_has_liked: boolean
}

export interface SubmissionWithChallenge extends Submission {
  challenge: Challenge
}

export interface UserBadgeWithBadge extends UserBadge {
  badge: Badge
}

export interface LeaderboardWithUser extends LeaderboardEntry {
  badge_count: number
  event_count: number
}

export interface DashboardData {
  user: User
  season: Season
  total_points: number
  rank: number
  total_participants: number
  events_attended: number
  projects_submitted: number
  badge_count: number
  current_streak: number
  next_event: Event | null
  next_event_registration: Registration | null
  season_event_count: number
  points_to_next_rank: number | null
  next_rank_user: Pick<User, 'id' | 'full_name'> | null
  next_rank_points: number | null
  badges: UserBadgeWithBadge[]
  opportunities: PointOpportunity[]
}

export interface PointOpportunity {
  label: string
  points: number
  type: 'event' | 'challenge' | 'rule'
  reference_id: string
  reference_title: string
}
