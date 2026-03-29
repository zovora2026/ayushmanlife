import { create } from 'zustand'
import type { Notification } from '../types'

interface AppState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  notifications: Notification[]
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  toggleSidebarCollapse: () => void
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markRead: (id: string) => void
  clearNotifications: () => void
}

const getInitialTheme = (): 'light' | 'dark' => {
  const stored = localStorage.getItem('ayushmanlife_theme')
  if (stored === 'dark' || stored === 'light') return stored
  return 'light'
}

export const useAppStore = create<AppState>((set) => ({
  theme: getInitialTheme(),
  sidebarOpen: true,
  sidebarCollapsed: false,
  notifications: [
    {
      id: 'n1',
      title: 'New Claim Submitted',
      message: 'Claim CLM-2026-0048 submitted by Dr. Rajesh Kumar for patient Amit Patel.',
      type: 'info',
      read: false,
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 'n2',
      title: 'SLA Breach Warning',
      message: 'Ticket TKT-089 approaching SLA deadline. Escalation in 30 minutes.',
      type: 'warning',
      read: false,
      timestamp: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: 'n3',
      title: 'Claim Approved',
      message: 'Claim CLM-2026-0042 approved by Star Health Insurance. Amount: ₹1,85,000.',
      type: 'success',
      read: true,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('ayushmanlife_theme', newTheme)
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { theme: newTheme }
    }),
  setTheme: (theme) => {
    localStorage.setItem('ayushmanlife_theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme })
  },
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  addNotification: (n) =>
    set((s) => ({
      notifications: [
        {
          ...n,
          id: 'n' + Date.now(),
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...s.notifications,
      ],
    })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
}))
