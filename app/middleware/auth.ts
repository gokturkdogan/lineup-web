import { WELCOME_ROUTE } from '~/constants/routes'

/**
 * Route guard for authenticated pages.
 * Redirects unauthenticated visitors to the welcome screen,
 * preserving the intended destination in `?redirect=`.
 */
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  auth.hydrate()

  if (!auth.isAuthenticated) {
    return navigateTo({
      path: WELCOME_ROUTE,
      query: to.fullPath && to.fullPath !== WELCOME_ROUTE ? { redirect: to.fullPath } : undefined,
    })
  }
})
