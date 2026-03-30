import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquareHeart, FileCheck, TrendingUp, Database,
  Headphones, Users, Building2, GraduationCap, Lightbulb, Settings,
  ChevronLeft, ChevronRight, Heart, LogOut,
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, MessageSquareHeart, FileCheck, TrendingUp, Database,
  Headphones, Users, Building2, GraduationCap, Lightbulb, Settings,
}

interface NavGroup {
  label: string
  items: { label: string; href: string; icon: string }[]
}

const navGroups: NavGroup[] = [
  {
    label: 'CORE',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'V-Care', href: '/vcare', icon: 'MessageSquareHeart' },
      { label: 'SmartClaims', href: '/claims', icon: 'FileCheck' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { label: 'Analytics', href: '/analytics', icon: 'TrendingUp' },
      { label: 'Data Governance', href: '/data-governance', icon: 'Database' },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Managed Services', href: '/services', icon: 'Headphones' },
      { label: 'Workforce', href: '/workforce', icon: 'Users' },
    ],
  },
  {
    label: 'PAYER',
    items: [
      { label: 'Payer Platform', href: '/payer', icon: 'Building2' },
    ],
  },
  {
    label: 'GROWTH',
    items: [
      { label: 'CareerPath Academy', href: '/academy', icon: 'GraduationCap' },
      { label: 'Insights', href: '/insights', icon: 'Lightbulb' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'Admin', href: '/admin', icon: 'Settings' },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebarCollapse } = useAppStore()
  const { user, logout } = useAuthStore()

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-border dark:border-border-dark z-40 transition-all duration-300 flex flex-col',
      sidebarCollapsed ? 'w-64 md:w-16' : 'w-64'
    )}>
      <div className="h-1 gradient-primary" />

      <div className="flex items-center gap-2 px-4 h-14 border-b border-border dark:border-border-dark">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed ? (
          <span className="font-display font-bold text-lg text-text dark:text-text-dark">
            Ayushman<span className="text-secondary">Life</span>
          </span>
        ) : (
          <span className="font-display font-bold text-lg text-text dark:text-text-dark md:hidden">
            Ayushman<span className="text-secondary">Life</span>
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!sidebarCollapsed ? (
              <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-muted uppercase">
                {group.label}
              </p>
            ) : (
              <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-muted uppercase md:hidden">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'text-muted hover:text-text dark:hover:text-text-dark hover:bg-gray-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed ? (
                      <span>{item.label}</span>
                    ) : (
                      <span className="md:hidden">{item.label}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div className={cn(
          'border-t border-border dark:border-border-dark p-3',
          sidebarCollapsed ? 'md:flex md:justify-center' : ''
        )}>
          {sidebarCollapsed ? (
            <>
              {/* Collapsed: icon-only on desktop, full profile on mobile */}
              <div className="hidden md:flex w-8 h-8 rounded-full bg-primary/10 items-center justify-center text-primary text-xs font-bold">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex items-center gap-3 md:hidden">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text dark:text-text-dark truncate">{user.name}</p>
                  <p className="text-xs text-muted truncate">{user.role}</p>
                </div>
                <button onClick={logout} className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text dark:text-text-dark truncate">{user.name}</p>
                <p className="text-xs text-muted truncate">{user.role}</p>
              </div>
              <button onClick={logout} className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={toggleSidebarCollapse}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-border dark:border-border-dark hidden md:flex items-center justify-center text-muted hover:text-text dark:hover:text-text-dark shadow-sm transition-colors"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  )
}
