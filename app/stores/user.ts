import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { fullName, initials, type User } from '~/types/user'

/**
 * Read-oriented view onto the currently authenticated user.
 *
 * The `auth` store owns mutation (login / logout / persistence).
 * The `user` store exposes derived data for UI consumption so feature code
 * doesn't have to know how the user object is stored.
 */
export const useUserStore = defineStore('user', {
  getters: {
    current(): User | null {
      return useAuthStore().user
    },

    isLoggedIn(): boolean {
      return useAuthStore().isAuthenticated
    },

    displayName(): string {
      const user = this.current
      return user ? fullName(user) : ''
    },

    initials(): string {
      const user = this.current
      return user ? initials(user) : ''
    },

    role(): User['role'] | null {
      return this.current?.role ?? null
    },

    organizationId(): string | null {
      return this.current?.organizationId ?? null
    },
  },
})
