import { storeToRefs } from 'pinia'

/**
 * Convenience facade around the auth + user stores.
 * Keeps components free of store-plumbing details.
 */
export const useAuth = () => {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const { loading, error } = storeToRefs(authStore)

  return {
    // State
    loading,
    error,
    user: computed(() => userStore.current),
    isAuthenticated: computed(() => userStore.isLoggedIn),
    displayName: computed(() => userStore.displayName),
    initials: computed(() => userStore.initials),

    // Actions
    login: authStore.login,
    register: authStore.register,
    registerPlayer: authStore.registerPlayer,
    logout: authStore.logout,
  }
}
