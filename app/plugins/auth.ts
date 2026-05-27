/**
 * Hydrates the auth store from cookies as early as possible so that:
 * - SSR can render the correct shell on first paint
 * - Page refreshes don't flash an unauthenticated state before middleware
 *   runs
 */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  auth.hydrate()
})
