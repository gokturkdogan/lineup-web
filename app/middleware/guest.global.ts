import { GUEST_ROUTES, HOME_ROUTE } from '~/constants/routes'

/**
 * Oturum açmış kullanıcıyı guest-only sayfalardan `/dashboard`'a yönlendirir.
 * (`/`, login, register, forgot-password, reset-password, invite/accept)
 *
 * `verify-email` dahil değil — maildeki token akışı oturumlu/oturumsuz çalışabilir.
 */
export default defineNuxtRouteMiddleware((to) => {
  const isGuestRoute = GUEST_ROUTES.includes(to.path as (typeof GUEST_ROUTES)[number])
  if (!isGuestRoute) return

  const auth = useAuthStore()
  auth.hydrate()

  if (auth.isAuthenticated) {
    return navigateTo(HOME_ROUTE)
  }
})
