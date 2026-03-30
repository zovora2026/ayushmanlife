import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const success = await register(name, email, password)
    if (success) {
      navigate('/dashboard')
    } else {
      setError('Registration failed. Please try again.')
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
          <h1 className="font-display font-bold text-2xl text-text dark:text-text-dark">Create your account</h1>
          <p className="text-muted mt-1">Get started with AyushmanLife platform</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Priya Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@hospital.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
