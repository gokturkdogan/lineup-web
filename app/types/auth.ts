import type { User } from './user'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface AuthState {
  token: string | null
  user: User | null
}
