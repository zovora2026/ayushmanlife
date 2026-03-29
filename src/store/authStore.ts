import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (name: string, email: string, password: string) => boolean
}

const DEMO_USER: User = {
  id: 'usr-001',
  name: 'Dr. Priya Sharma',
  email: 'demo@ayushmanlife.in',
  role: 'Hospital Administrator',
  hospital: 'AyushmanLife Demo Hospital, Delhi',
}

export const useAuthStore = create<AuthState>((set) => {
  const stored = localStorage.getItem('ayushmanlife_user')
  const initialUser = stored ? JSON.parse(stored) as User : null

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    login: (email: string, password: string) => {
      if (email === 'demo@ayushmanlife.in' && password === 'demo123') {
        localStorage.setItem('ayushmanlife_user', JSON.stringify(DEMO_USER))
        set({ user: DEMO_USER, isAuthenticated: true })
        return true
      }
      return false
    },
    logout: () => {
      localStorage.removeItem('ayushmanlife_user')
      set({ user: null, isAuthenticated: false })
    },
    register: (name: string, email: string, _password: string) => {
      const newUser: User = {
        id: 'usr-' + Date.now(),
        name,
        email,
        role: 'Staff',
        hospital: 'AyushmanLife Demo Hospital, Delhi',
      }
      localStorage.setItem('ayushmanlife_user', JSON.stringify(newUser))
      set({ user: newUser, isAuthenticated: true })
      return true
    },
  }
})
