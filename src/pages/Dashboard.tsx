import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  FileCheck,
  Heart,
  IndianRupee,
  FilePlus2,
  MessageSquareHeart,
  BarChart3,
  UserCog,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Calendar,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components/ui/Card'
import { Stat } from '../components/ui/Stat'
import { Badge } from '../components/ui/Badge'
import { Chart } from '../components/ui/Chart'
import { analytics, appointments as aptAPI } from '../lib/api'
import { demoAppointments, demoActivities, chartData } from '../lib/mock-data'
import { cn, formatDate, getRelativeTime, getStatusColor } from '../lib/utils'
import type { DashboardKPIs, Appointment } from '../lib/api'

const activityDotColors: Record<string, string> = {
  claim: 'bg-accent',
  patient: 'bg-success',
  appointment: 'bg-primary',
  system: 'bg-gray-400',
  alert: 'bg-error',
}

const quickActions = [
  { label: 'New Claim', icon: FilePlus2, href: '/claims', color: 'bg-primary/10 text-primary' },
  { label: 'Chat with V-Care', icon: MessageSquareHeart, href: '/vcare', color: 'bg-secondary/10 text-secondary' },
  { label: 'View Analytics', icon: BarChart3, href: '/analytics', color: 'bg-accent/10 text-accent' },
  { label: 'Manage Staff', icon: UserCog, href: '/workforce', color: 'bg-success/10 text-success' },
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [upcomingApts, setUpcomingApts] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [dashData, aptData] = await Promise.all([
          analytics.dashboard(),
          aptAPI.list({ status: 'scheduled', limit: '5' }),
        ])
        if (mounted) {
          setKpis(dashData)
          setUpcomingApts(aptData.appointments || [])
        }
      } catch {
        // API unavailable — use fallback
      }
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const today = new Date()
  const formattedToday = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(today)

  const displayApts = upcomingApts.length > 0
    ? upcomingApts.map(a => ({
        id: a.id,
        patientName: a.patient_name || 'Patient',
        doctorName: a.doctor_name || 'Doctor',
        department: a.department,
        date: a.date,
        time: a.time,
        status: a.status || 'Scheduled',
      }))
    : demoAppointments.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text dark:text-text-dark">
            Welcome back, {user?.name ?? 'Admin'}
          </h1>
          <p className="text-sm text-muted">{formattedToday}</p>
        </div>
        <Badge variant="success" dot size="md">
          All systems operational
        </Badge>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </Card>
          ))
        ) : (
          <>
            <Stat
              label="Total Patients"
              value={kpis ? kpis.total_patients.toLocaleString('en-IN') : '12,847'}
              change={8.2}
              changeLabel="vs last month"
              icon={<Users className="h-5 w-5" />}
            />
            <Stat
              label="Claims Processed"
              value={kpis ? kpis.claims_this_month.toLocaleString('en-IN') : '1,247'}
              change={12.5}
              changeLabel="vs last month"
              icon={<FileCheck className="h-5 w-5" />}
            />
            <Stat
              label="Satisfaction Score"
              value={kpis ? `${kpis.satisfaction_score}%` : '94.2%'}
              change={3.1}
              changeLabel="vs last month"
              icon={<Heart className="h-5 w-5" />}
            />
            <Stat
              label="Revenue (MTD)"
              value={kpis ? `\u20B9${(kpis.monthly_revenue / 10000000).toFixed(1)} Cr` : '\u20B92.4 Cr'}
              change={-2.3}
              changeLabel="vs last month"
              icon={<IndianRupee className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.label} to={action.href}>
            <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', action.color)}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-text dark:text-text-dark group-hover:text-primary transition-colors">
                  {action.label}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          header={
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-text dark:text-text-dark">
                Claims Trend (7-Day)
              </h3>
              <Badge variant="info" size="sm">Weekly</Badge>
            </div>
          }
          padding="sm"
        >
          <Chart
            type="line"
            data={chartData.patientVisits}
            dataKeys={['visits', 'claims']}
            xAxisKey="name"
            height={280}
          />
        </Card>

        <Card
          header={
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-text dark:text-text-dark">
                Department Revenue
              </h3>
              <Badge variant="info" size="sm">MTD</Badge>
            </div>
          }
          padding="sm"
        >
          <Chart
            type="bar"
            data={chartData.departmentRevenue.slice(0, 5)}
            dataKeys={['revenue']}
            xAxisKey="name"
            height={280}
          />
        </Card>
      </div>

      {/* Activity Feed + Appointments */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          header={
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-text dark:text-text-dark">
                Recent Activity
              </h3>
              <Link to="/analytics" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
          }
          padding="none"
        >
          <ul className="divide-y divide-border dark:divide-border-dark">
            {demoActivities.slice(0, 8).map((activity) => (
              <li
                key={activity.id}
                className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span
                  className={cn(
                    'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                    activityDotColors[activity.type] ?? 'bg-gray-400'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text dark:text-text-dark">
                    {activity.action}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {activity.subject}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {getRelativeTime(activity.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          header={
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-text dark:text-text-dark">
                Upcoming Appointments
              </h3>
            </div>
          }
          padding="none"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted" />
            </div>
          ) : (
            <ul className="divide-y divide-border dark:divide-border-dark">
              {displayApts.map((apt) => (
                <li key={apt.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text dark:text-text-dark">
                      {apt.patientName}
                    </p>
                    <Badge variant={getStatusColor(apt.status)} size="sm">
                      {apt.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {apt.doctorName} &middot; {apt.department}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(apt.date)} &middot; {apt.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-warning/30 bg-warning/5 dark:bg-warning/10">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text dark:text-text-dark">SLA Breach Warning</h4>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Claim CLM-2026-0043 (Amit Singh) is approaching the 48-hour review deadline. Requires immediate attention.
              </p>
              <Link to="/claims" className="mt-2 inline-block text-xs font-semibold text-warning hover:underline">
                Review Claim &rarr;
              </Link>
            </div>
          </div>
        </Card>

        <Card className="border-accent/30 bg-accent/5 dark:bg-accent/10">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text dark:text-text-dark">Credential Expiring</h4>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Dr. Ravi Shankar&apos;s BLS certification expires on 5 Apr 2026. Schedule renewal before the deadline.
              </p>
              <Link to="/workforce" className="mt-2 inline-block text-xs font-semibold text-accent hover:underline">
                Manage Credentials &rarr;
              </Link>
            </div>
          </div>
        </Card>

        <Card className="border-error/30 bg-error/5 dark:bg-error/10">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error/15 text-error">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text dark:text-text-dark">High-Risk Patient</h4>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Sunita Devi (Age 67) — Risk Score 85. Vitals showing deterioration trend. BP 150/94, Blood Glucose 162.
              </p>
              <Link to="/dashboard" className="mt-2 inline-block text-xs font-semibold text-error hover:underline">
                View Patient &rarr;
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
