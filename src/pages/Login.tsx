import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const success = await login(email, password)
    if (success) {
      navigate('/dashboard')
    } else {
      setError('Invalid credentials. Try demo@ayushmanlife.in / demo123')
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-text dark:text-text-dark">
              Ayushman<span className="text-secondary">Life</span>
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-text dark:text-text-dark">Welcome back</h1>
          <p className="text-muted mt-1">Sign in to your healthcare platform</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@ayushmanlife.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo123"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-border dark:border-border-dark" />
              <span className="mx-3 text-xs text-muted">or</span>
              <div className="flex-grow border-t border-border dark:border-border-dark" />
            </div>
            <button
              type="button"
              onClick={async () => {
                setEmail('demo@ayushmanlife.in')
                setPassword('demo123')
                setError('')
                const success = await login('demo@ayushmanlife.in', 'demo123')
                if (success) navigate('/dashboard')
                else setError('Demo login failed. Please try manually.')
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary/10 text-secondary font-semibold hover:bg-secondary/20 transition-colors border border-secondary/20 disabled:opacity-50"
            >
              Try Demo Instantly
            </button>
            <p className="text-[10px] text-muted text-center">
              No signup required — explore the full platform with sample data
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
