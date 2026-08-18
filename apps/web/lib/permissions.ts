// Centralised permission definitions for VOLT League
// These are checked across admin pages to gate specific actions.

export const PERMISSIONS = [
  {
    key: 'mark_attendance',
    label: 'Mark Attendance',
    description: 'Can check students in/out at events',
    defaultRoles: ['core', 'vp', 'president', 'super_admin'],
  },
  {
    key: 'award_points',
    label: 'Award Points',
    description: 'Can add or deduct points for students',
    defaultRoles: ['vp', 'president', 'super_admin'],
  },
  {
    key: 'create_events',
    label: 'Create / Edit Events',
    description: 'Can create, edit and publish events',
    defaultRoles: ['vp', 'president', 'super_admin'],
  },
  {
    key: 'manage_registrations',
    label: 'Manage Registrations',
    description: 'Can add/remove students from events',
    defaultRoles: ['core', 'vp', 'president', 'super_admin'],
  },
  {
    key: 'send_notifications',
    label: 'Send Notifications',
    description: 'Can broadcast notifications to students',
    defaultRoles: ['vp', 'president', 'super_admin'],
  },
  {
    key: 'verify_students',
    label: 'Verify Students',
    description: 'Can approve/reject student registrations',
    defaultRoles: ['core', 'vp', 'president', 'super_admin'],
  },
  {
    key: 'manage_challenges',
    label: 'Manage Challenges',
    description: 'Can create and manage challenges',
    defaultRoles: ['vp', 'president', 'super_admin'],
  },
  {
    key: 'view_reports',
    label: 'View Reports',
    description: 'Can access analytics and export data',
    defaultRoles: ['vp', 'president', 'super_admin'],
  },
] as const

export type Permission = typeof PERMISSIONS[number]['key']

/**
 * Returns true if the user has the given permission.
 * super_admin and president always have all permissions.
 * Other roles are checked against defaults, then custom_permissions is checked as an override.
 */
export function hasPermission(
  user: { role: string; custom_permissions?: string[] | null },
  permission: Permission
): boolean {
  if (user.role === 'super_admin' || user.role === 'president') return true
  const def = PERMISSIONS.find((p) => p.key === permission)
  if (!def) return false
  // Role has it by default
  if (def.defaultRoles.includes(user.role as any)) return true
  // Custom permission granted individually
  return (user.custom_permissions ?? []).includes(permission)
}
