export type UserRole = 'OWNER' | 'ADMIN' | 'ORGANIZER' | 'PLAYER' | 'GUEST'

export interface User {
  id: string
  name: string
  surname: string
  email: string
  role: UserRole
  organizationId: string
  avatarUrl?: string | null
}

export type UserSummary = Pick<User, 'id' | 'name' | 'surname' | 'avatarUrl'>

export const fullName = (user: Pick<User, 'name' | 'surname'>): string =>
  `${user.name ?? ''} ${user.surname ?? ''}`.trim()

export const initials = (user: Pick<User, 'name' | 'surname'>): string => {
  const first = (user.name ?? '').trim().charAt(0)
  const last = (user.surname ?? '').trim().charAt(0)
  return `${first}${last}`.toUpperCase() || '?'
}
