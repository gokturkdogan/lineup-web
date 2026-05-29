/**
 * Route guard for guest-only pages (welcome, login, register).
 * Authenticated users are bounced to the app home screen.
 */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  auth.hydrate()

  if (auth.isAuthenticated) {
    return navigateTo('/home')
  }
})
