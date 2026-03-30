import { create } from 'zustand'
import type { User } from '../types'
import { auth as authAPI } from '../lib/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<boolean>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => {
  const stored = localStorage.getItem('ayushmanlife_user')
  const initialUser = stored ? JSON.parse(stored) as User : null

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    loading: false,
    login: async (email: string, password: string) => {
      set({ loading: true })
      try {
        const { user } = await authAPI.login(email, password)
        const mapped: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'Staff',
          hospital: user.department || 'AyushmanLife Hospital',
        }
        localStorage.setItem('ayushmanlife_user', JSON.stringify(mapped))
        set({ user: mapped, isAuthenticated: true, loading: false })
        return true
      } catch {
        // Fallback demo login when API is unavailable
        if (email === 'demo@ayushmanlife.in' && password === 'demo123') {
          const demoUser: User = {
            id: 'usr-001',
            name: 'Dr. Rajesh Kumar',
            email: 'demo@ayushmanlife.in',
            role: 'Hospital Administrator',
            hospital: 'AyushmanLife Demo Hospital, Delhi',
          }
          localStorage.setItem('ayushmanlife_user', JSON.stringify(demoUser))
          set({ user: demoUser, isAuthenticated: true, loading: false })
          return true
        }
        set({ loading: false })
        return false
      }
    },
    logout: async () => {
      try { await authAPI.logout() } catch { /* ignore */ }
      localStorage.removeItem('ayushmanlife_user')
      set({ user: null, isAuthenticated: false })
    },
    register: async (name: string, email: string, password: string) => {
      set({ loading: true })
      try {
        const { user } = await authAPI.register({ email, password, name })
        const mapped: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'Staff',
          hospital: user.department || 'AyushmanLife Hospital',
        }
        localStorage.setItem('ayushmanlife_user', JSON.stringify(mapped))
        set({ user: mapped, isAuthenticated: true, loading: false })
        return true
      } catch {
        // Fallback
        const newUser: User = {
          id: 'usr-' + Date.now(),
          name,
          email,
          role: 'Staff',
          hospital: 'AyushmanLife Hospital',
        }
        localStorage.setItem('ayushmanlife_user', JSON.stringify(newUser))
        set({ user: newUser, isAuthenticated: true, loading: false })
        return true
      }
    },
    checkSession: async () => {
      try {
        const { user } = await authAPI.me()
        if (user) {
          const mapped: User = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'Staff',
            hospital: user.department || 'AyushmanLife Hospital',
          }
          localStorage.setItem('ayushmanlife_user', JSON.stringify(mapped))
          set({ user: mapped, isAuthenticated: true })
        }
      } catch {
        // Session check failed — keep localStorage state
      }
    },
  }
})
