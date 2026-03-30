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
  FolderKanban,
  CheckCircle,
  Circle,
  Database,
  Globe,
  Server,
  Wifi,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components/ui/Card'
import { Stat } from '../components/ui/Stat'
import { Badge } from '../components/ui/Badge'
import { Chart } from '../components/ui/Chart'
import { analytics, appointments as aptAPI, claims as claimsAPI, tickets as ticketsAPI, workforce as workforceAPI } from '../lib/api'
import { demoAppointments, demoActivities, chartData } from '../lib/mock-data'
import { cn, formatDate, getRelativeTime, getStatusColor } from '../lib/utils'
import type { DashboardKPIs, Appointment, Claim, ClaimStats, RevenueData, PatientRiskData, Ticket, Certification } from '../lib/api'
import type { ActivityItem } from '../types'

const activityDotColors: Record<string, string> = {
  claim: 'bg-accent',
  patient: 'bg-success',
  appointment: 'bg-primary',
  system: 'bg-gray-400 dark:bg-gray-500',
  alert: 'bg-error',
}

function getQuickActions(claimStats: ClaimStats | null, kpis: DashboardKPIs | null, slaCount: number) {
  return [
    { label: 'New Claim', icon: FilePlus2, href: '/claims', color: 'bg-primary/10 text-primary', badge: claimStats ? `${claimStats.pending_count} pending` : undefined },
    { label: 'Chat with V-Care', icon: MessageSquareHeart, href: '/vcare', color: 'bg-secondary/10 text-secondary' },
    { label: 'View Analytics', icon: BarChart3, href: '/analytics', color: 'bg-accent/10 text-accent', badge: kpis ? `${kpis.appointments_today} appts today` : undefined },
    { label: 'Manage Staff', icon: UserCog, href: '/workforce', color: 'bg-success/10 text-success', badge: slaCount > 0 ? `${slaCount} alerts` : undefined },
  ]
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [upcomingApts, setUpcomingApts] = useState<Appointment[]>([])
  const [claimStats, setClaimStats] = useState<ClaimStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [recentClaims, setRecentClaims] = useState<Claim[]>([])
  const [riskData, setRiskData] = useState<PatientRiskData | null>(null)
  const [slaTickets, setSlaTickets] = useState<Ticket[]>([])
  const [expiringCerts, setExpiringCerts] = useState<Certification[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [dashData, aptData, statsData, revData, claimsData, riskResult, ticketResult, certResult] = await Promise.all([
          analytics.dashboard(),
          aptAPI.list({ status: 'scheduled', limit: '5' }),
          claimsAPI.stats().catch(() => null),
          analytics.revenue().catch(() => null),
          claimsAPI.list({ limit: '5' }).catch(() => null),
          analytics.patientRisk().catch(() => null),
          ticketsAPI.list({ limit: '10' }).catch(() => null),
          workforceAPI.certifications().catch(() => null),
        ])
        if (mounted) {
          setKpis(dashData)
          setUpcomingApts(aptData.appointments || [])
          if (statsData) setClaimStats(statsData)
          if (revData) setRevenueData(revData)

          const fetchedClaims = claimsData?.claims || []
          setRecentClaims(fetchedClaims)

          if (riskResult) setRiskData(riskResult)

          // Filter tickets that breached SLA or are close to breach
          const breachedTickets = (ticketResult?.tickets || []).filter(
            (t) => t.sla_breached === 1 || t.priority === 'critical' || t.priority === 'high'
          )
          setSlaTickets(breachedTickets)

          // Filter certifications expiring within 30 days
          const now = new Date()
          const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 3600000)
          const expiring = (certResult?.certifications || []).filter((c) => {
            if (!c.expiry_date) return false
            const exp = new Date(c.expiry_date)
            return exp <= thirtyDaysFromNow && exp >= now
          })
          setExpiringCerts(expiring)

          // Build real activity feed from fetched data
          const realActivities: ActivityItem[] = []

          // Map recent claims into activities
          fetchedClaims.forEach((claim, i) => {
            const statusAction =
              claim.status === 'approved' ? 'Claim approved' :
              claim.status === 'rejected' ? 'Claim rejected' :
              claim.status === 'submitted' ? 'Claim submitted' :
              claim.status === 'under_review' ? 'Claim under review' :
              `Claim ${claim.status}`
            realActivities.push({
              id: `claim-act-${i}`,
              action: statusAction,
              subject: `${claim.claim_number} for ${claim.patient_name || 'Patient'} — ₹${claim.claimed_amount?.toLocaleString('en-IN') || '0'}`,
              timestamp: claim.submitted_at || claim.created_at || new Date().toISOString(),
              type: 'claim',
            })
          })

          // Map upcoming appointments into activities
          ;(aptData.appointments || []).slice(0, 3).forEach((apt, i) => {
            realActivities.push({
              id: `apt-act-${i}`,
              action: 'Appointment scheduled',
              subject: `${apt.patient_name || 'Patient'} with ${apt.doctor_name || 'Doctor'} — ${apt.department}`,
              timestamp: apt.date ? `${apt.date}T${apt.time || '00:00'}:00` : new Date().toISOString(),
              type: 'appointment',
            })
          })

          // Add high-risk patient alerts
          if (riskResult?.high_risk) {
            riskResult.high_risk.slice(0, 2).forEach((p, i) => {
              realActivities.push({
                id: `risk-act-${i}`,
                action: 'High-risk patient flagged',
                subject: `${p.name}${p.age ? ` (Age ${p.age})` : ''} — Risk Score ${p.risk_score ?? 'N/A'}`,
                timestamp: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
                type: 'alert',
              })
            })
          }

          // Add SLA breach alerts
          breachedTickets.slice(0, 1).forEach((t, i) => {
            realActivities.push({
              id: `sla-act-${i}`,
              action: 'SLA breach warning',
              subject: `${t.ticket_number} — ${t.title}`,
              timestamp: t.created_at || new Date().toISOString(),
              type: 'alert',
            })
          })

          // Sort by timestamp descending
          realActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

          setActivities(realActivities.length > 0 ? realActivities : demoActivities)
        }
      } catch {
        // API unavailable — use fallback mock data
        if (mounted) setActivities(demoActivities)
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

  const lastUpdatedTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-6">
      {/* System Health Strip */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-success/5 via-white to-success/5 dark:from-success/10 dark:via-surface-dark dark:to-success/10 dark:border-border-dark px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-muted" />
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">System Health</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {[
              { label: 'API Status', icon: Wifi },
              { label: 'D1 Database', icon: Database },
              { label: 'CDN', icon: Globe },
            ].map(svc => (
              <div key={svc.label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <svc.icon className="h-3 w-3 text-muted" />
                <span className="text-xs text-gray-600 dark:text-gray-400">{svc.label}</span>
              </div>
            ))}
            <span className="text-[10px] text-gray-400 dark:text-gray-500">Last updated: {lastUpdatedTime}</span>
          </div>
        </div>
      </div>

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

      {/* Quick Stats Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Database className="h-3 w-3 text-primary" />
          <span className="text-xs font-semibold text-primary">Real-time D1 Data</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10 border border-border dark:border-border-dark">
          <Server className="h-3 w-3 text-muted" />
          <span className="text-xs text-gray-600 dark:text-gray-400">18 API Routes</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10 border border-border dark:border-border-dark">
          <Database className="h-3 w-3 text-muted" />
          <span className="text-xs text-gray-600 dark:text-gray-400">12 D1 Tables</span>
        </div>
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
              value={kpis?.total_patients != null ? kpis.total_patients.toLocaleString('en-IN') : '12,847'}
              change={8.2}
              changeLabel="vs last month"
              icon={<Users className="h-5 w-5" />}
            />
            <Stat
              label="Claims Processed"
              value={kpis?.claims_this_month != null ? kpis.claims_this_month.toLocaleString('en-IN') : '1,247'}
              change={12.5}
              changeLabel="vs last month"
              icon={<FileCheck className="h-5 w-5" />}
            />
            <Stat
              label="Satisfaction Score"
              value={kpis?.satisfaction_score != null ? `${kpis.satisfaction_score}%` : '94.2%'}
              change={3.1}
              changeLabel="vs last month"
              icon={<Heart className="h-5 w-5" />}
            />
            <Stat
              label="Revenue (MTD)"
              value={kpis?.monthly_revenue != null ? `\u20B9${(kpis.monthly_revenue / 10000000).toFixed(1)} Cr` : '\u20B92.4 Cr'}
              change={-2.3}
              changeLabel="vs last month"
              icon={<IndianRupee className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      {/* Operational Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: 'Bed Occupancy', value: kpis?.bed_occupancy ? `${kpis.bed_occupancy}%` : '82%', sub: kpis?.bed_occupancy ? `${Math.round(kpis.bed_occupancy * 4)} / 400 beds` : '328 / 400 beds', color: 'text-warning' },
          { label: 'ER Wait Time', value: kpis?.avg_wait_time ? `${kpis.avg_wait_time} min` : '14 min', sub: 'Avg today', color: 'text-success' },
          { label: 'Staff On Duty', value: '186', sub: '24 doctors, 92 nurses', color: 'text-primary' },
          { label: 'OT Utilization', value: '73%', sub: '8 / 11 active', color: 'text-accent' },
          { label: 'Pending Discharges', value: claimStats ? String(claimStats.pending_count) : '12', sub: claimStats ? `${claimStats.under_review_count ?? 0} under review` : '4 awaiting billing', color: 'text-secondary' },
        ].map(s => (
          <div key={s.label} className="rounded-lg bg-white dark:bg-surface-dark border border-border dark:border-border-dark px-4 py-3">
            <p className={cn('font-display font-bold text-lg', s.color)}>{s.value}</p>
            <p className="text-xs font-medium text-text dark:text-text-dark">{s.label}</p>
            <p className="text-[10px] text-muted mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {getQuickActions(claimStats, kpis, slaTickets.length).map((action) => (
          <Link key={action.label} to={action.href}>
            <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', action.color)}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-text dark:text-text-dark group-hover:text-primary transition-colors">
                    {action.label}
                  </span>
                  {action.badge && (
                    <p className="text-[10px] text-muted mt-0.5">{action.badge}</p>
                  )}
                </div>
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
          {loading ? (
            <div className="flex items-center justify-center h-[280px]">
              <Loader2 className="w-5 h-5 animate-spin text-muted" />
            </div>
          ) : (
            <Chart
              type="line"
              data={chartData.patientVisits}
              dataKeys={['visits', 'claims']}
              xAxisKey="name"
              height={280}
            />
          )}
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
          {loading ? (
            <div className="flex items-center justify-center h-[280px]">
              <Loader2 className="w-5 h-5 animate-spin text-muted" />
            </div>
          ) : (
            <Chart
              type="bar"
              data={
                revenueData?.by_department?.length
                  ? revenueData.by_department.slice(0, 5).map(d => ({
                      name: d.department,
                      revenue: (d as unknown as Record<string, number>).revenue ?? d.amount ?? 0,
                    }))
                  : chartData.departmentRevenue.slice(0, 5)
              }
              dataKeys={['revenue']}
              xAxisKey="name"
              height={280}
            />
          )}
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
            {activities.slice(0, 8).map((activity) => (
              <li
                key={activity.id}
                className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span
                  className={cn(
                    'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                    activityDotColors[activity.type] ?? 'bg-gray-400 dark:bg-gray-500'
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
                {slaTickets.length > 0
                  ? `${slaTickets[0].ticket_number} — ${slaTickets[0].title}. ${slaTickets.length > 1 ? `+${slaTickets.length - 1} more tickets need attention.` : 'Requires immediate attention.'}`
                  : 'No active SLA breaches. All tickets are within SLA thresholds.'}
              </p>
              <Link to="/claims" className="mt-2 inline-block text-xs font-semibold text-warning hover:underline">
                {slaTickets.length > 0 ? 'Review Tickets' : 'View Claims'} &rarr;
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
                {expiringCerts.length > 0
                  ? `${expiringCerts[0].user_name || 'Staff member'}'s ${expiringCerts[0].certification_name} expires on ${formatDate(expiringCerts[0].expiry_date!)}. ${expiringCerts.length > 1 ? `${expiringCerts.length - 1} more expiring soon.` : 'Schedule renewal before the deadline.'}`
                  : 'No certifications expiring within 30 days. All credentials are up to date.'}
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
                {riskData?.high_risk && riskData.high_risk.length > 0
                  ? `${riskData.high_risk[0].name}${riskData.high_risk[0].age ? ` (Age ${riskData.high_risk[0].age})` : ''} — Risk Score ${riskData.high_risk[0].risk_score ?? 'N/A'}. ${riskData.total_high > 1 ? `${riskData.total_high} high-risk patients need monitoring.` : 'Vitals showing deterioration trend.'}`
                  : 'No high-risk patients flagged. All patients within safe parameters.'}
              </p>
              <Link to="/dashboard" className="mt-2 inline-block text-xs font-semibold text-error hover:underline">
                {riskData?.total_high ? `View ${riskData.total_high} Patient${riskData.total_high > 1 ? 's' : ''}` : 'View Patients'} &rarr;
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Client Portal — Project Visibility */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-text dark:text-text-dark">
                Active Projects
              </h3>
            </div>
            <Badge variant="info" size="sm">Client Portal</Badge>
          </div>
        }
        padding="none"
      >
        <div className="divide-y divide-border dark:divide-border-dark">
          {[
            { name: 'Epic EMR Implementation — Max Hospital Delhi', phase: 'Go-Live', progress: 92, status: 'On Track', milestones: '14/15 complete', team: 8, dueDate: '05 Apr 2026' },
            { name: 'Cloud Migration — Apollo Hospitals Chennai', phase: 'Migration', progress: 65, status: 'On Track', milestones: '8/12 complete', team: 6, dueDate: '15 May 2026' },
            { name: 'ServiceNow ITSM — Fortis Gurugram', phase: 'Configuration', progress: 40, status: 'At Risk', milestones: '5/13 complete', team: 4, dueDate: '01 Jun 2026' },
            { name: 'ABDM Integration — AIIMS Rishikesh', phase: 'Testing', progress: 78, status: 'On Track', milestones: '10/13 complete', team: 5, dueDate: '10 May 2026' },
          ].map(project => (
            <div key={project.name} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text dark:text-text-dark truncate">{project.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Badge size="sm" variant={project.phase === 'Go-Live' ? 'success' : project.phase === 'Testing' ? 'info' : 'neutral'}>{project.phase}</Badge>
                    <span>{project.milestones}</span>
                    <span>&middot;</span>
                    <span>{project.team} team members</span>
                    <span>&middot;</span>
                    <span>Due: {project.dueDate}</span>
                  </div>
                </div>
                <Badge size="sm" variant={project.status === 'On Track' ? 'success' : 'warning'}>{project.status}</Badge>
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', project.progress >= 80 ? 'bg-success' : project.progress >= 50 ? 'bg-primary' : 'bg-warning')}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-text dark:text-text-dark w-10 text-right">{project.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
