import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Award,
  Grid3X3,
  Loader2,
  Briefcase,
  UserPlus,
  Clock,
  ArrowRight,
  Shield,
  Search,
  Building2,
  Target,
  DollarSign,
  Zap,
  Star,
  FileText,
} from 'lucide-react'
import { cn, getInitials, formatDate, formatCurrency } from '../lib/utils'
import { demoStaff } from '../lib/mock-data'
import { workforce } from '../lib/api'
import type { StaffMember, ShiftSchedule, Project, ProjectAssignment } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Tabs } from '../components/ui/Tabs'
import { Dropdown } from '../components/ui/Dropdown'
import { Table } from '../components/ui/Table'
import type { Staff, Certification } from '../types'

const TABS = [
  { id: 'talent', label: 'Talent Dashboard', icon: <Users className="h-4 w-4" /> },
  { id: 'projects', label: 'Projects', icon: <Building2 className="h-4 w-4" /> },
  { id: 'assignments', label: 'Assignments & Utilization', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'skills', label: 'Skill Matrix', icon: <Grid3X3 className="h-4 w-4" /> },
  { id: 'scheduler', label: 'Staff Scheduler', icon: <Calendar className="h-4 w-4" /> },
  { id: 'credentials', label: 'Credential Tracker', icon: <Award className="h-4 w-4" /> },
]

const TALENT_POOL = [
  { name: 'Arun Mehta', specialization: 'Epic Analyst', experience: '6 yrs', certifications: 'Epic Certified, ITIL', availability: 'Available' },
  { name: 'Kavita Sharma', specialization: 'Claims Processing', experience: '8 yrs', certifications: 'AAPC CPC, Six Sigma', availability: 'Available' },
  { name: 'Pradeep Nair', specialization: 'Cloud Architect', experience: '10 yrs', certifications: 'AWS SA Pro, Azure Expert', availability: '2 weeks' },
  { name: 'Sonia Gupta', specialization: 'ServiceNow Admin', experience: '5 yrs', certifications: 'CSA, CAD', availability: 'Available' },
  { name: 'Rajiv Verma', specialization: 'Cybersecurity', experience: '7 yrs', certifications: 'CISSP, CEH', availability: 'Available' },
  { name: 'Deepa Iyer', specialization: 'Revenue Cycle', experience: '4 yrs', certifications: 'CRCR, Epic Revenue', availability: '1 week' },
]

const SPECIALIZATIONS = [
  { label: 'Claims Adjudication Experts', count: 12, icon: <CheckCircle className="h-5 w-5" /> },
  { label: 'Underwriting Technology', count: 8, icon: <Shield className="h-5 w-5" /> },
  { label: 'Fraud Detection Analysts', count: 6, icon: <Search className="h-5 w-5" /> },
  { label: 'Policy Admin Systems', count: 10, icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'TPA Operations', count: 14, icon: <Briefcase className="h-5 w-5" /> },
  { label: 'Regulatory Compliance', count: 7, icon: <Award className="h-5 w-5" /> },
]

const PIPELINE_STAGES = [
  { label: 'Requirement', count: 24 },
  { label: 'Screening', count: 18 },
  { label: 'Interview', count: 12 },
  { label: 'Offer', count: 7 },
  { label: 'Onboarded', count: 5 },
]

// ── Insurance Talent Solutions Data ──────────────────────────────────────
const ACTIVE_PLACEMENT_PIPELINE = [
  { candidateName: 'Neha Kulkarni', role: 'Claims Analyst', client: 'Max Bupa Health', stage: 'Offer', matchScore: 96 },
  { candidateName: 'Vikram Desai', role: 'Underwriting Lead', client: 'Star Health Insurance', stage: 'Interview', matchScore: 91 },
  { candidateName: 'Ananya Joshi', role: 'Fraud Detection Specialist', client: 'ICICI Lombard', stage: 'Screening', matchScore: 88 },
  { candidateName: 'Rohan Pillai', role: 'Policy Admin Developer', client: 'HDFC Ergo', stage: 'Onboarded', matchScore: 94 },
  { candidateName: 'Meera Reddy', role: 'TPA Operations Manager', client: 'Medi Assist', stage: 'Interview', matchScore: 85 },
  { candidateName: 'Suresh Pandey', role: 'Revenue Cycle Analyst', client: 'Bajaj Allianz', stage: 'Requirement', matchScore: 79 },
]

const TALENT_POOL_STATS = [
  { label: 'Total Candidates', value: '2,340', icon: <Users className="h-5 w-5" />, change: 12 },
  { label: 'Active Placements', value: '156', icon: <Briefcase className="h-5 w-5" />, change: 8 },
  { label: 'Avg Time to Fill', value: '12 days', icon: <Clock className="h-5 w-5" />, change: -15 },
  { label: 'Client Satisfaction', value: '4.8/5', icon: <Star className="h-5 w-5" />, change: 3 },
]

const HOT_ROLES = [
  { title: 'Claims Adjudication Lead', urgency: 'Critical', salaryRange: '18-25 LPA', openPositions: 4, client: 'Star Health' },
  { title: 'Fraud Analytics Engineer', urgency: 'High', salaryRange: '22-30 LPA', openPositions: 3, client: 'ICICI Lombard' },
  { title: 'Underwriting Systems Architect', urgency: 'Critical', salaryRange: '28-40 LPA', openPositions: 2, client: 'HDFC Ergo' },
  { title: 'TPA Integration Specialist', urgency: 'Medium', salaryRange: '15-20 LPA', openPositions: 5, client: 'Medi Assist' },
  { title: 'Regulatory Compliance Officer', urgency: 'High', salaryRange: '20-28 LPA', openPositions: 3, client: 'Max Bupa' },
]

// ── Staff Augmentation Data ──────────────────────────────────────────────
const AUGMENTATION_STATS = [
  { label: 'Active Contractors', value: '218', icon: <Users className="h-5 w-5" />, change: 14 },
  { label: 'Billable Hours (MTD)', value: '34,560', icon: <Clock className="h-5 w-5" />, change: 6 },
  { label: 'Utilization Rate', value: '92%', icon: <Target className="h-5 w-5" />, change: 3 },
  { label: 'Revenue (MTD)', value: '4.2 Cr', icon: <DollarSign className="h-5 w-5" />, change: 11 },
]

const CLIENT_STAFFING_BREAKDOWN = [
  { client: 'Star Health Insurance', headcount: 48, contractType: 'T&M', endDate: '2026-09-30', status: 'Active', utilization: 95 },
  { client: 'ICICI Lombard', headcount: 36, contractType: 'Fixed Price', endDate: '2026-06-15', status: 'Active', utilization: 89 },
  { client: 'HDFC Ergo', headcount: 52, contractType: 'T&M', endDate: '2026-12-31', status: 'Active', utilization: 93 },
  { client: 'Medi Assist TPA', headcount: 28, contractType: 'Managed Services', endDate: '2026-08-20', status: 'Renewal Due', utilization: 88 },
  { client: 'Bajaj Allianz', headcount: 22, contractType: 'T&M', endDate: '2026-04-30', status: 'Expiring Soon', utilization: 91 },
]

const SKILL_GAP_ANALYSIS = [
  { skill: 'Claims Adjudication (IRDAI)', supply: 45, demand: 72 },
  { skill: 'Fraud Detection & ML', supply: 28, demand: 55 },
  { skill: 'Underwriting Automation', supply: 34, demand: 48 },
  { skill: 'Policy Admin (Guidewire)', supply: 22, demand: 40 },
  { skill: 'Health Data Analytics', supply: 38, demand: 60 },
]

function getPlacementStageBadge(stage: string): 'success' | 'warning' | 'info' | 'neutral' {
  if (stage === 'Onboarded') return 'success'
  if (stage === 'Offer') return 'warning'
  if (stage === 'Interview') return 'info'
  return 'neutral'
}

function getUrgencyVariant(urgency: string): 'error' | 'warning' | 'info' {
  if (urgency === 'Critical') return 'error'
  if (urgency === 'High') return 'warning'
  return 'info'
}

function getClientStatusVariant(status: string): 'success' | 'warning' | 'error' {
  if (status === 'Active') return 'success'
  if (status === 'Renewal Due') return 'warning'
  return 'error'
}

const SKILL_COLUMNS = ['Clinical', 'EMR/EHR', 'ServiceNow', 'Cloud', 'Data Analytics', 'Cybersecurity'] as const

const SHIFT_COLORS: Record<string, string> = {
  Morning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
  Afternoon: 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-300',
  Night: 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300',
}

const SHIFT_TIMES: Record<string, string> = {
  Morning: '6:00 AM - 2:00 PM',
  Afternoon: '2:00 PM - 10:00 PM',
  Night: '10:00 PM - 6:00 AM',
}

function getSkillColor(level: number): string {
  if (level >= 4) return 'bg-emerald-500'
  if (level === 3) return 'bg-amber-400'
  if (level >= 1) return 'bg-red-400'
  return 'bg-gray-200 dark:bg-gray-700'
}

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'info' {
  if (status === 'Active') return 'success'
  if (status === 'On Leave') return 'warning'
  return 'info'
}

function getCredentialStatusVariant(status: string): 'success' | 'warning' | 'error' {
  if (status === 'Active') return 'success'
  if (status === 'Expiring') return 'warning'
  return 'error'
}

/** Map an API StaffMember to the local Staff shape used by the UI */
function mapAPIStaffToLocal(member: StaffMember): Staff {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    department: member.department ?? '',
    email: member.email,
    phone: member.phone ?? '',
    joinDate: '',
    certifications: (member.certifications ?? []).map((c) => ({
      name: c.certification_name,
      issuer: '',
      expiryDate: c.expiry_date,
      status: c.status as Certification['status'],
      verified: false,
    })),
    skills: (member.skills ?? []).map((s) => ({
      skill: s.skill_name,
      level: s.proficiency,
    })),
    shift: '',
    status: 'Active',
  }
}

// Build the weekly schedule with staff assigned to days
function buildWeeklySchedule(staffList: Staff[]) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek === 0 ? 7 : dayOfWeek) - 1))

  const days: { label: string; date: string }[] = []
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push({
      label: dayNames[i],
      date: `${d.getDate()}/${d.getMonth() + 1}`,
    })
  }

  const activeStaff = staffList.filter((s) => s.status === 'Active')
  const schedule: Record<string, { name: string; shift: string; department: string }[]> = {}

  if (activeStaff.length === 0) {
    days.forEach((day) => { schedule[day.label] = [] })
    return { days, schedule }
  }

  days.forEach((day, index) => {
    const startIdx = (index * 3) % activeStaff.length
    schedule[day.label] = [
      { name: activeStaff[startIdx % activeStaff.length].name, shift: 'Morning', department: activeStaff[startIdx % activeStaff.length].department },
      { name: activeStaff[(startIdx + 1) % activeStaff.length].name, shift: 'Afternoon', department: activeStaff[(startIdx + 1) % activeStaff.length].department },
      { name: activeStaff[(startIdx + 2) % activeStaff.length].name, shift: 'Night', department: activeStaff[(startIdx + 2) % activeStaff.length].department },
      { name: activeStaff[(startIdx + 3) % activeStaff.length].name, shift: 'Morning', department: activeStaff[(startIdx + 3) % activeStaff.length].department },
    ]
  })

  return { days, schedule }
}

export default function Workforce() {
  const [activeTab, setActiveTab] = useState('talent')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [staffList, setStaffList] = useState<Staff[]>(demoStaff)
  const [scheduleData, setScheduleData] = useState<ShiftSchedule[]>([])
  const [projectsList, setProjectsList] = useState<Project[]>([])
  const [assignmentsList, setAssignmentsList] = useState<ProjectAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [staffRes, scheduleRes, projRes, asgnRes] = await Promise.all([
          workforce.staff(),
          workforce.schedule(),
          workforce.projects(),
          workforce.assignments(),
        ])
        if (mounted && staffRes.staff) {
          const mapped = staffRes.staff.map(mapAPIStaffToLocal)
          setStaffList(mapped)
        }
        if (mounted && scheduleRes.schedules) {
          setScheduleData(scheduleRes.schedules)
        }
        if (mounted && projRes.projects) {
          setProjectsList(projRes.projects)
        }
        if (mounted && asgnRes.assignments) {
          setAssignmentsList(asgnRes.assignments)
        }
      } catch {
        // keep demoStaff defaults on failure
      }
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const departments = useMemo(
    () => Array.from(new Set(staffList.map((s) => s.department))).sort(),
    [staffList]
  )

  const departmentOptions = useMemo(
    () => [
      { value: '', label: 'All Departments' },
      ...departments.map((d) => ({ value: d, label: d })),
    ],
    [departments]
  )

  const filteredStaff = useMemo(
    () => (departmentFilter ? staffList.filter((s) => s.department === departmentFilter) : staffList),
    [departmentFilter, staffList]
  )

  const allCertifications = useMemo(() => {
    const certs: (Certification & { staffName: string })[] = []
    staffList.forEach((s) => {
      s.certifications.forEach((c) => {
        certs.push({ ...c, staffName: s.name })
      })
    })
    certs.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    return certs
  }, [staffList])

  const expiringCount = allCertifications.filter((c) => c.status === 'Expiring').length

  const { days, schedule } = useMemo(() => buildWeeklySchedule(staffList), [staffList])

  const credentialColumns = [
    { key: 'staffName', label: 'Staff Name' },
    { key: 'name', label: 'Certification' },
    { key: 'issuer', label: 'Issuer' },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      sortable: true,
      render: (item: Record<string, unknown>) => formatDate(item.expiryDate as string),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Record<string, unknown>) => (
        <Badge variant={getCredentialStatusVariant(item.status as string)} dot>
          {item.status as string}
        </Badge>
      ),
    },
    {
      key: 'verified',
      label: 'Verified',
      render: (item: Record<string, unknown>) =>
        item.verified ? (
          <CheckCircle className="h-5 w-5 text-success" />
        ) : (
          <XCircle className="h-5 w-5 text-error" />
        ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Workforce Management
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage staff, skills, scheduling, and credentials
        </p>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* ── Talent Dashboard ──────────────────────────────────────── */}
      {activeTab === 'talent' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Total Staff"
              value={staffList.length}
              icon={<Users className="h-5 w-5" />}
            />
            <Stat
              label="Active"
              value={staffList.filter((s) => s.status === 'Active').length}
              icon={<UserCheck className="h-5 w-5" />}
            />
            <Stat
              label="On Leave"
              value={staffList.filter((s) => s.status === 'On Leave').length}
              icon={<UserX className="h-5 w-5" />}
            />
            <Stat
              label="Training"
              value={staffList.filter((s) => s.status === 'Training').length}
              icon={<GraduationCap className="h-5 w-5" />}
            />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Staff Directory
            </h2>
            <Dropdown
              options={departmentOptions}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              placeholder="All Departments"
              className="w-56"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStaff.map((staff) => (
              <Card key={staff.id} className="transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {getInitials(staff.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                      {staff.name}
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {staff.role}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {staff.department}
                  </span>
                  <Badge variant={getStatusBadgeVariant(staff.status)} dot size="sm">
                    {staff.status}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <Award className="h-3.5 w-3.5" />
                  {staff.certifications.length} certification{staff.certifications.length !== 1 ? 's' : ''}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Projects ─────────────────────────────────────────────── */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Project KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total Projects" value={projectsList.length} icon={<Building2 className="h-5 w-5" />} />
            <Stat label="Active" value={projectsList.filter(p => p.status === 'active').length} icon={<Zap className="h-5 w-5" />} />
            <Stat label="Completed" value={projectsList.filter(p => p.status === 'completed').length} icon={<CheckCircle className="h-5 w-5" />} />
            <Stat label="Total Budget" value={formatCurrency(projectsList.reduce((s, p) => s + (p.budget || 0), 0))} icon={<DollarSign className="h-5 w-5" />} />
          </div>

          {/* Projects Table */}
          <Card padding="none" header={
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Hospital IT Projects</h3>
              <Badge variant="info" size="sm">{projectsList.length} projects</Badge>
            </div>
          }>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 dark:border-border-dark dark:bg-white/5">
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Project</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">City</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Budget</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Team</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {projectsList.map((proj) => (
                    <tr key={proj.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{proj.name}</p>
                        {proj.description && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{proj.description}</p>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          {proj.client_hospital}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">{proj.city || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant="neutral" size="sm">{(proj.project_type || '').replace(/_/g, ' ')}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge
                          variant={proj.status === 'active' ? 'success' : proj.status === 'completed' ? 'info' : 'warning'}
                          dot size="sm"
                        >
                          {proj.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {proj.budget ? formatCurrency(proj.budget) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                        {proj.assigned_count ?? 0}/{proj.team_size ?? 0}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {proj.start_date ? formatDate(proj.start_date) : '—'} — {proj.end_date ? formatDate(proj.end_date) : 'Ongoing'}
                      </td>
                    </tr>
                  ))}
                  {projectsList.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">No projects found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Skills Required by Projects */}
          <Card header={
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Skills Required Across Projects</h3>
          }>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(projectsList.flatMap(p => (p.skills_required || '').split(',').map(s => s.trim()).filter(Boolean)))).map(skill => (
                <Badge key={skill} variant="neutral" size="sm">{skill}</Badge>
              ))}
              {projectsList.length === 0 && <span className="text-sm text-muted">No projects loaded</span>}
            </div>
          </Card>
        </div>
      )}

      {/* ── Assignments & Utilization ──────────────────────────────── */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Assignment KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total Assignments" value={assignmentsList.length} icon={<Briefcase className="h-5 w-5" />} />
            <Stat label="Active" value={assignmentsList.filter(a => a.status === 'active').length} icon={<Zap className="h-5 w-5" />} />
            <Stat label="Completed" value={assignmentsList.filter(a => a.status === 'completed').length} icon={<CheckCircle className="h-5 w-5" />} />
            <Stat label="Consultants Deployed" value={new Set(assignmentsList.filter(a => a.status === 'active').map(a => a.consultant_id)).size} icon={<Users className="h-5 w-5" />} />
          </div>

          {/* Assignments Table */}
          <Card padding="none" header={
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">All Assignments</h3>
              <Badge variant="info" size="sm">{assignmentsList.length} assignments</Badge>
            </div>
          }>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 dark:border-border-dark dark:bg-white/5">
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Consultant</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Project</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Utilization</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rate/Day</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {assignmentsList.map((asgn) => (
                    <tr key={asgn.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
                            {getInitials(asgn.consultant_name || '')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{asgn.consultant_name}</p>
                            <p className="text-xs text-gray-500">{asgn.consultant_department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{asgn.project_name}</p>
                        <p className="text-xs text-gray-500">{asgn.client_hospital}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">{asgn.role}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge
                          variant={asgn.status === 'active' ? 'success' : asgn.status === 'completed' ? 'info' : 'warning'}
                          dot size="sm"
                        >
                          {asgn.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className={cn('h-full rounded-full', (asgn.utilization_pct || 0) >= 80 ? 'bg-emerald-500' : (asgn.utilization_pct || 0) >= 50 ? 'bg-amber-400' : 'bg-red-400')}
                              style={{ width: `${asgn.utilization_pct || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{asgn.utilization_pct || 0}%</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {asgn.rate_per_day ? `₹${(asgn.rate_per_day).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {asgn.start_date ? formatDate(asgn.start_date) : '—'} — {asgn.end_date ? formatDate(asgn.end_date) : 'Ongoing'}
                      </td>
                    </tr>
                  ))}
                  {assignmentsList.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">No assignments found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Consultant Utilization Summary */}
          <Card header={<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Consultant Utilization</h3>}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from(
                assignmentsList
                  .filter(a => a.status === 'active')
                  .reduce((map, a) => {
                    const key = a.consultant_id
                    if (!map.has(key)) map.set(key, { name: a.consultant_name || '', dept: a.consultant_department || '', totalUtil: 0, projects: [] as string[] })
                    const entry = map.get(key)!
                    entry.totalUtil += (a.utilization_pct || 0)
                    entry.projects.push(a.project_name || '')
                    return map
                  }, new Map<string, { name: string; dept: string; totalUtil: number; projects: string[] }>())
                  .values()
              ).map(c => (
                <div key={c.name} className={cn('rounded-lg border p-3', c.totalUtil > 100 ? 'border-error/30 bg-error/5' : c.totalUtil >= 80 ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5')}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{c.name}</p>
                    <span className={cn('text-sm font-bold', c.totalUtil > 100 ? 'text-error' : c.totalUtil >= 80 ? 'text-success' : 'text-warning')}>{c.totalUtil}%</span>
                  </div>
                  <p className="text-xs text-gray-500">{c.dept}</p>
                  <p className="text-xs text-gray-400 mt-1">{c.projects.join(', ')}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Skill Matrix ──────────────────────────────────────────── */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <Card>
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Legend:</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span className="inline-block h-3.5 w-3.5 rounded bg-emerald-500" /> Expert (4-5)
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span className="inline-block h-3.5 w-3.5 rounded bg-amber-400" /> Intermediate (3)
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span className="inline-block h-3.5 w-3.5 rounded bg-red-400" /> Beginner (1-2)
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span className="inline-block h-3.5 w-3.5 rounded bg-gray-200 dark:bg-gray-700" /> None (0)
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border dark:border-border-dark">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 dark:border-border-dark dark:bg-white/5">
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Staff Member
                    </th>
                    {SKILL_COLUMNS.map((skill) => (
                      <th
                        key={skill}
                        className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        {skill}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {staffList.slice(0, 10).map((staff) => (
                    <tr
                      key={staff.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
                            {getInitials(staff.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {staff.name}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {staff.role}
                            </p>
                          </div>
                        </div>
                      </td>
                      {SKILL_COLUMNS.map((skillName) => {
                        const skillRating = staff.skills.find(
                          (s) => s.skill === skillName
                        )
                        const level = skillRating?.level ?? 0
                        return (
                          <td key={skillName} className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center">
                              <div
                                className={cn(
                                  'h-7 w-7 rounded flex items-center justify-center text-xs font-bold',
                                  getSkillColor(level),
                                  level >= 1 ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                                )}
                                title={`${skillName}: ${level}/5`}
                              >
                                {level}
                              </div>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Staff Scheduler ───────────────────────────────────────── */}
      {activeTab === 'scheduler' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Weekly Schedule
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div key={day.label}>
                <div className="mb-2 rounded-lg bg-gray-100 px-3 py-2 text-center dark:bg-white/5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {day.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {day.date}
                  </p>
                </div>
                <div className="space-y-2">
                  {schedule[day.label].map((entry, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'rounded-lg border p-2 text-xs',
                        SHIFT_COLORS[entry.shift]
                      )}
                    >
                      <p className="truncate font-semibold">{entry.name}</p>
                      <p className="mt-0.5 opacity-80">{SHIFT_TIMES[entry.shift]}</p>
                      <p className="mt-0.5 truncate opacity-70">{entry.department}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Credential Tracker ────────────────────────────────────── */}
      {activeTab === 'credentials' && (
        <div className="space-y-4">
          {expiringCount > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
              <p className="text-sm font-medium text-warning">
                {expiringCount} certification{expiringCount !== 1 ? 's' : ''} expiring within 30 days
              </p>
            </div>
          )}

          <Table
            columns={credentialColumns}
            data={allCertifications as unknown as Record<string, unknown>[]}
          />
        </div>
      )}
    </div>
  )
}
