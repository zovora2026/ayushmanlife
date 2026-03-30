import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useAppStore } from './store/appStore'
import { useAuthStore } from './store/authStore'
import DashboardLayout from './components/layout/DashboardLayout'

const Landing = lazy(() => import('./pages/Landing'))
const About = lazy(() => import('./pages/About'))
const Solutions = lazy(() => import('./pages/Solutions'))
const Platform = lazy(() => import('./pages/Platform'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Insights = lazy(() => import('./pages/Insights'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const VCare = lazy(() => import('./pages/VCare'))
const Claims = lazy(() => import('./pages/Claims'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Workforce = lazy(() => import('./pages/Workforce'))
const Services = lazy(() => import('./pages/Services'))
const Payer = lazy(() => import('./pages/Payer'))
const Academy = lazy(() => import('./pages/Academy'))
const DataGovernance = lazy(() => import('./pages/DataGovernance'))
const Admin = lazy(() => import('./pages/Admin'))
const ClientPortal = lazy(() => import('./pages/ClientPortal'))
const TestManagement = lazy(() => import('./pages/TestManagement'))
const SecurityDashboard = lazy(() => import('./pages/SecurityDashboard'))

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted">Loading...</p>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
      <div className="text-center">
        <h1 className="font-display font-bold text-6xl text-primary mb-4">404</h1>
        <p className="text-xl text-text dark:text-text-dark mb-2">Page Not Found</p>
        <p className="text-muted mb-6">The page you are looking for does not exist.</p>
        <a href="/" className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors inline-block">
          Go Home
        </a>
      </div>
    </div>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="font-display font-bold text-4xl text-error mb-4">Something went wrong</h1>
            <p className="text-muted mb-6">An unexpected error occurred. Please try refreshing the page.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.href = '/'
              }}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { theme } = useAppStore()
  const { checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<Insights />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vcare" element={<VCare />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/workforce" element={<Workforce />} />
              <Route path="/services" element={<Services />} />
              <Route path="/payer" element={<Payer />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/data-governance" element={<DataGovernance />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              <Route path="/test-management" element={<TestManagement />} />
              <Route path="/security" element={<SecurityDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
