/**
 * Route guard for guest-only pages (e.g. /login).
 * Authenticated users are bounced to the home screen.
 */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  auth.hydrate()

  if (auth.isAuthenticated) {
    return navigateTo('/')
  }
})
