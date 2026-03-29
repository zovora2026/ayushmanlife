import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/utils'
import { Bell, Search, Sun, Moon } from 'lucide-react'

export default function DashboardLayout() {
  const { isAuthenticated } = useAuthStore()
  const { sidebarCollapsed, theme, toggleTheme, notifications } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <Sidebar />
      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        <header className="sticky top-0 z-30 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border dark:border-border-dark flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search patients, claims, staff..."
                className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-border dark:border-border-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-text dark:text-text-dark placeholder:text-muted"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted hover:text-text dark:hover:text-text-dark hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="relative p-2 rounded-lg text-muted hover:text-text dark:hover:text-text-dark hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
