import { api } from './api/api.client'
import type { LoginPayload, LoginResponse } from '~/types/auth'

/**
 * Thin, feature-oriented wrapper around `/auth/*` endpoints.
 * Keeps Pinia stores free of raw HTTP concerns.
 */
export const authService = {
  login(payload: LoginPayload) {
    return api.post<LoginResponse, LoginPayload>('/auth/login', payload)
  },
}
