import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Heart, LogIn } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'
import { NAV_ITEMS } from '../../lib/constants'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useAppStore()
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isLanding = location.pathname === '/'

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isLanding && !scrolled ? 'bg-transparent' : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-border dark:border-border-dark'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className={cn(
              'font-display font-bold text-xl',
              isLanding && !scrolled ? 'text-white' : 'text-text dark:text-text-dark'
            )}>
              Ayushman<span className="text-secondary">Life</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.public.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isLanding && !scrolled
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-muted hover:text-text dark:hover:text-text-dark hover:bg-gray-100 dark:hover:bg-slate-800',
                  location.pathname === item.href && (isLanding && !scrolled ? 'text-white bg-white/10' : 'text-primary bg-primary/5')
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isLanding && !scrolled ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-muted hover:bg-gray-100 dark:hover:bg-slate-800'
              )}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isLanding && !scrolled ? 'text-white/80 hover:text-white' : 'text-muted hover:text-text'
                  )}
                >
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link
                  to="/contact"
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Request Demo
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn('md:hidden p-2 rounded-lg', isLanding && !scrolled ? 'text-white' : 'text-text dark:text-text-dark')}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-border dark:border-border-dark">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.public.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-text dark:hover:text-text-dark hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border dark:border-border-dark flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-primary">
                Login
              </Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium text-center">
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
