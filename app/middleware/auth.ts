/**
 * Route guard for authenticated pages.
 * Redirects unauthenticated visitors to `/login`, preserving the intended
 * destination in `?redirect=`.
 */
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  auth.hydrate()

  if (!auth.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
    })
  }
})
