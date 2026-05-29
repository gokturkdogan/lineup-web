/** Oturum açmış kullanıcıların erişemeyeceği (guest-only) sayfalar. */
export const GUEST_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const

export type GuestRoute = (typeof GUEST_ROUTES)[number]

/** Giriş yapmış kullanıcının ana ekranı. */
export const HOME_ROUTE = '/dashboard'

/** Oturumsuz karşılama ekranı. */
export const WELCOME_ROUTE = '/'
