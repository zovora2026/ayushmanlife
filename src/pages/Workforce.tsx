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
} from 'lucide-react'
import { cn, getInitials, formatDate } from '../lib/utils'
import { demoStaff } from '../lib/mock-data'
import { workforce } from '../lib/api'
import type { StaffMember, ShiftSchedule } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Tabs } from '../components/ui/Tabs'
import { Dropdown } from '../components/ui/Dropdown'
import { Table } from '../components/ui/Table'
import type { Staff, Certification } from '../types'

const TABS = [
  { id: 'talent', label: 'Talent Dashboard', icon: <Users className="h-4 w-4" /> },
  { id: 'talent-solutions', label: 'Talent Solutions', icon: <Briefcase className="h-4 w-4" /> },
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [staffRes, scheduleRes] = await Promise.all([
          workforce.staff(),
          workforce.schedule(),
        ])
        if (mounted && staffRes.staff) {
          setStaffList(staffRes.staff.map(mapAPIStaffToLocal))
        }
        if (mounted && scheduleRes.schedules) {
          setScheduleData(scheduleRes.schedules)
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

      {/* ── Talent Solutions ──────────────────────────────────────── */}
      {activeTab === 'talent-solutions' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Active Placements"
              value={156}
              icon={<Briefcase className="h-5 w-5" />}
            />
            <Stat
              label="Insurance Specialists"
              value={48}
              icon={<Shield className="h-5 w-5" />}
            />
            <Stat
              label="Healthcare IT Consultants"
              value={89}
              icon={<UserPlus className="h-5 w-5" />}
            />
            <Stat
              label="Avg Placement Time"
              value="12 days"
              icon={<Clock className="h-5 w-5" />}
            />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left column - Healthcare IT Talent Pool */}
            <Card padding="none">
              <div className="border-b border-border px-5 py-4 dark:border-border-dark">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Healthcare IT Talent Pool
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-50 dark:border-border-dark dark:bg-white/5">
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Specialization
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Exp
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Certifications
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Availability
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-border-dark">
                    {TALENT_POOL.map((person) => (
                      <tr
                        key={person.name}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
                              {getInitials(person.name)}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {person.name}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                          {person.specialization}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                          {person.experience}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {person.certifications.split(', ').map((cert) => (
                              <Badge key={cert} variant="info" size="sm">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <Badge
                            variant={person.availability === 'Available' ? 'success' : 'warning'}
                            dot
                            size="sm"
                          >
                            {person.availability}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Right column - Insurance Talent Specializations */}
            <Card>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
                Insurance Talent Specializations
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SPECIALIZATIONS.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-shadow hover:shadow-md dark:border-border-dark"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                      {spec.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {spec.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {spec.count} available
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Bottom section - Direct Placement Pipeline */}
          <Card>
            <h3 className="mb-6 text-base font-semibold text-gray-900 dark:text-gray-100">
              Direct Placement Pipeline
            </h3>
            <div className="flex items-center justify-between gap-2 overflow-x-auto">
              {PIPELINE_STAGES.map((stage, idx) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white',
                        idx === 0 && 'bg-blue-500',
                        idx === 1 && 'bg-indigo-500',
                        idx === 2 && 'bg-violet-500',
                        idx === 3 && 'bg-amber-500',
                        idx === 4 && 'bg-emerald-500'
                      )}
                    >
                      {stage.count}
                    </div>
                    <span className="whitespace-nowrap text-xs font-medium text-gray-700 dark:text-gray-300">
                      {stage.label}
                    </span>
                  </div>
                  {idx < PIPELINE_STAGES.length - 1 && (
                    <ArrowRight className="h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" />
                  )}
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
