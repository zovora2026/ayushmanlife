import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Loader2,
  Star,
  Video,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Users,
  IndianRupee,
  FileText,
  ClipboardList,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  CalendarDays,
  AlertCircle,
  Info,
  Play,
  Eye,
  TrendingUp,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { teleweight } from '../../lib/api'
import type { TWDoctor, TWConsultation, TWPrescription } from '../../lib/api'
import { cn, formatCurrency, formatDate } from '../../lib/utils'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DoctorPanelProps {
  defaultDoctorId?: string
}

// ---------------------------------------------------------------------------
// Sub-types
// ---------------------------------------------------------------------------

type SubTab = 'schedule' | 'consultations' | 'patients' | 'earnings' | 'prescription'

interface MedicationRow {
  name: string
  dosage: string
  frequency: string
  duration_days: string
  instructions: string
}

interface DerivedPatient {
  patient_id: string
  patient_name: string
  consultation_count: number
  last_visit: string
  latest_notes: string
}

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------

const typeLabels: Record<string, string> = {
  initial: 'Initial',
  follow_up: 'Follow-up',
  review: 'Review',
}

const typeVariants: Record<string, 'info' | 'neutral' | 'warning'> = {
  initial: 'info',
  follow_up: 'neutral',
  review: 'warning',
}

const modeConfig: Record<string, { label: string; icon: typeof Video; color: string }> = {
  video: { label: 'Video', icon: Video, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  audio: { label: 'Audio', icon: Phone, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  chat: { label: 'Chat', icon: MessageSquare, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
}

const statusVariants: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
  scheduled: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
}

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderStars(rating: number) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
      {half && (
        <Star
          key="h"
          className="w-4 h-4 text-amber-400"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
      ))}
    </span>
  )
}

function isSameDay(dateStr: string, reference: Date): boolean {
  const d = new Date(dateStr)
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  )
}

function emptyMedicationRow(): MedicationRow {
  return { name: '', dosage: '', frequency: '', duration_days: '', instructions: '' }
}

// ---------------------------------------------------------------------------
// Sub-tab definitions
// ---------------------------------------------------------------------------

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'schedule', label: "Today's Schedule" },
  { key: 'consultations', label: 'All Consultations' },
  { key: 'patients', label: 'My Patients' },
  { key: 'earnings', label: 'Earnings' },
  { key: 'prescription', label: 'Write Prescription' },
]

// =========================================================================
// COMPONENT
// =========================================================================

export default function DoctorPanel({ defaultDoctorId }: DoctorPanelProps) {
  // --- Doctor list ---
  const [doctors, setDoctors] = useState<TWDoctor[]>([])
  const [doctorsLoading, setDoctorsLoading] = useState(true)
  const [doctorsError, setDoctorsError] = useState<string | null>(null)

  // --- Selected doctor ---
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(defaultDoctorId || '')
  const [doctorDetail, setDoctorDetail] = useState<TWDoctor | null>(null)
  const [consultationStats, setConsultationStats] = useState<any>(null)
  const [consultations, setConsultations] = useState<TWConsultation[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  // --- Sub-tab state ---
  const [activeTab, setActiveTab] = useState<SubTab>('schedule')

  // --- Expanded rows ---
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null)
  const [expandedConsultationId, setExpandedConsultationId] = useState<string | null>(null)

  // --- Prescription form ---
  const [rxConsultationId, setRxConsultationId] = useState('')
  const [rxDiagnosis, setRxDiagnosis] = useState('')
  const [rxIcdCode, setRxIcdCode] = useState('')
  const [rxMedications, setRxMedications] = useState<MedicationRow[]>([emptyMedicationRow()])
  const [rxLifestyle, setRxLifestyle] = useState('')
  const [rxLabTests, setRxLabTests] = useState('')
  const [rxFollowUpDate, setRxFollowUpDate] = useState('')
  const [rxSpecialInstructions, setRxSpecialInstructions] = useState('')
  const [rxSubmitting, setRxSubmitting] = useState(false)
  const [rxError, setRxError] = useState<string | null>(null)
  const [rxSuccess, setRxSuccess] = useState<string | null>(null)

  // --- Prescriptions (to know which consultations already have one) ---
  const [existingPrescriptions, setExistingPrescriptions] = useState<TWPrescription[]>([])

  // =====================================================================
  // Fetch all doctors on mount
  // =====================================================================
  useEffect(() => {
    let cancelled = false
    async function load() {
      setDoctorsLoading(true)
      setDoctorsError(null)
      try {
        const res = await teleweight.doctors()
        if (!cancelled) {
          const list = res.doctors || []
          setDoctors(list)
          // Default selection
          if (!selectedDoctorId && list.length > 0) {
            setSelectedDoctorId(defaultDoctorId && list.some((d) => d.id === defaultDoctorId) ? defaultDoctorId : list[0].id)
          }
        }
      } catch (err: any) {
        if (!cancelled) setDoctorsError(err.message || 'Failed to load doctors')
      } finally {
        if (!cancelled) setDoctorsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // =====================================================================
  // Fetch doctor detail + consultations when selected doctor changes
  // =====================================================================
  const loadDoctorData = useCallback(async (doctorId: string) => {
    if (!doctorId) return
    setDetailLoading(true)
    setDetailError(null)
    setDoctorDetail(null)
    setConsultations([])
    setConsultationStats(null)
    setExistingPrescriptions([])

    try {
      const [detailRes, consultRes, rxRes] = await Promise.allSettled([
        teleweight.doctorDetail(doctorId),
        teleweight.doctorConsultations(doctorId),
        teleweight.prescriptions({ doctor_id: doctorId }),
      ])

      if (detailRes.status === 'fulfilled') {
        setDoctorDetail(detailRes.value.doctor)
        setConsultationStats(detailRes.value.consultation_stats)
      } else {
        throw (detailRes as PromiseRejectedResult).reason
      }

      if (consultRes.status === 'fulfilled') {
        setConsultations(consultRes.value.consultations || [])
      }

      if (rxRes.status === 'fulfilled') {
        setExistingPrescriptions(rxRes.value.prescriptions || [])
      }
    } catch (err: any) {
      setDetailError(err.message || 'Failed to load doctor details')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedDoctorId) {
      loadDoctorData(selectedDoctorId)
    }
  }, [selectedDoctorId, loadDoctorData])

  // =====================================================================
  // Derived data
  // =====================================================================

  const today = useMemo(() => new Date(), [])

  const todayConsultations = useMemo(
    () =>
      consultations
        .filter((c) => isSameDay(c.scheduled_at, today))
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
    [consultations, today],
  )

  const allConsultationsSorted = useMemo(
    () => [...consultations].sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()),
    [consultations],
  )

  const derivedPatients = useMemo<DerivedPatient[]>(() => {
    const map = new Map<string, DerivedPatient>()
    // Process in date order (oldest first) so latest overwrites
    const sorted = [...consultations].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    for (const c of sorted) {
      const existing = map.get(c.patient_id)
      if (!existing) {
        map.set(c.patient_id, {
          patient_id: c.patient_id,
          patient_name: c.patient_name || 'Unknown Patient',
          consultation_count: 1,
          last_visit: c.scheduled_at,
          latest_notes: c.consultation_notes || '',
        })
      } else {
        existing.consultation_count += 1
        existing.last_visit = c.scheduled_at
        if (c.consultation_notes) existing.latest_notes = c.consultation_notes
        if (c.patient_name) existing.patient_name = c.patient_name
      }
    }
    return Array.from(map.values()).sort((a, b) => new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime())
  }, [consultations])

  // Earnings calculations
  const earningsData = useMemo(() => {
    const completed = consultations.filter((c) => c.status === 'completed')
    const totalPayout = completed.reduce((sum, c) => sum + (c.doctor_payout || 0), 0)
    const totalPlatformFee = completed.reduce((sum, c) => sum + (c.platform_fee || 0), 0)
    const totalConsultationFee = completed.reduce((sum, c) => sum + (c.consultation_fee || 0), 0)

    // Monthly aggregation
    const monthly = new Map<string, { month: string; payout: number; count: number }>()
    for (const c of completed) {
      const d = new Date(c.scheduled_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      const existing = monthly.get(key)
      if (!existing) {
        monthly.set(key, { month: label, payout: c.doctor_payout || 0, count: 1 })
      } else {
        existing.payout += c.doctor_payout || 0
        existing.count += 1
      }
    }

    return {
      completed,
      totalPayout,
      totalPlatformFee,
      totalConsultationFee,
      monthly: Array.from(monthly.values()).sort((a, b) => b.month.localeCompare(a.month)),
    }
  }, [consultations])

  // Consultations eligible for prescription (completed, no existing prescription)
  const prescriptionEligible = useMemo(() => {
    const existingConsIds = new Set(existingPrescriptions.map((p) => p.consultation_id))
    return consultations.filter((c) => c.status === 'completed' && !existingConsIds.has(c.id))
  }, [consultations, existingPrescriptions])

  // Auto-populate patient_id from selected consultation
  const selectedConsultationForRx = useMemo(
    () => consultations.find((c) => c.id === rxConsultationId),
    [consultations, rxConsultationId],
  )

  // =====================================================================
  // Prescription form handlers
  // =====================================================================

  function handleMedChange(index: number, field: keyof MedicationRow, value: string) {
    setRxMedications((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function addMedicationRow() {
    setRxMedications((prev) => [...prev, emptyMedicationRow()])
  }

  function removeMedicationRow(index: number) {
    setRxMedications((prev) => prev.filter((_, i) => i !== index))
  }

  function resetRxForm() {
    setRxConsultationId('')
    setRxDiagnosis('')
    setRxIcdCode('')
    setRxMedications([emptyMedicationRow()])
    setRxLifestyle('')
    setRxLabTests('')
    setRxFollowUpDate('')
    setRxSpecialInstructions('')
    setRxError(null)
    setRxSuccess(null)
  }

  async function handleSubmitPrescription(e: React.FormEvent) {
    e.preventDefault()
    if (!rxConsultationId || !selectedConsultationForRx || !selectedDoctorId) {
      setRxError('Please select a consultation.')
      return
    }
    if (!rxDiagnosis.trim()) {
      setRxError('Diagnosis is required.')
      return
    }
    const validMeds = rxMedications.filter((m) => m.name.trim())
    if (validMeds.length === 0) {
      setRxError('At least one medication is required.')
      return
    }

    setRxSubmitting(true)
    setRxError(null)
    setRxSuccess(null)

    try {
      const medications = validMeds.map((m) => ({
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        frequency: m.frequency.trim(),
        duration_days: parseInt(m.duration_days, 10) || 0,
        instructions: m.instructions.trim(),
      }))

      const diagnosisText = rxIcdCode.trim()
        ? `${rxDiagnosis.trim()} [ICD-10: ${rxIcdCode.trim()}]`
        : rxDiagnosis.trim()

      const lifestyleArr = rxLifestyle
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

      const labTestsArr = rxLabTests
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const payload: Parameters<typeof teleweight.createPrescription>[0] = {
        consultation_id: rxConsultationId,
        patient_id: selectedConsultationForRx.patient_id,
        doctor_id: selectedDoctorId,
        diagnosis: diagnosisText,
        medications,
        ...(lifestyleArr.length > 0 ? { lifestyle_recommendations: lifestyleArr } : {}),
        ...(labTestsArr.length > 0 ? { lab_tests_ordered: labTestsArr } : {}),
        ...(rxFollowUpDate ? { follow_up_date: rxFollowUpDate } : {}),
        ...(rxSpecialInstructions.trim() ? { special_instructions: rxSpecialInstructions.trim() } : {}),
      }

      const res = await teleweight.createPrescription(payload)
      setRxSuccess(`Prescription created successfully! ID: ${res.prescription.id}`)
      // Reload prescriptions list to update eligible consultations
      try {
        const rxRes = await teleweight.prescriptions({ doctor_id: selectedDoctorId })
        setExistingPrescriptions(rxRes.prescriptions || [])
      } catch {
        // non-critical
      }
    } catch (err: any) {
      setRxError(err.message || 'Failed to create prescription.')
    } finally {
      setRxSubmitting(false)
    }
  }

  // =====================================================================
  // RENDER
  // =====================================================================

  // --- Doctors loading ---
  if (doctorsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // --- Doctors error ---
  if (doctorsError) {
    return (
      <Card className="text-center py-12">
        <XCircle className="w-10 h-10 text-error mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">{doctorsError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Retry
        </button>
      </Card>
    )
  }

  // --- No doctors ---
  if (doctors.length === 0) {
    return (
      <Card className="text-center py-12">
        <Stethoscope className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No doctors registered</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          There are no doctors on the platform yet.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* ============================================================= */}
      {/* DOCTOR SELECTOR                                                */}
      {/* ============================================================= */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Select Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} — {d.specialty}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* ============================================================= */}
      {/* DOCTOR PROFILE CARD                                            */}
      {/* ============================================================= */}
      {detailLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {detailError && !detailLoading && (
        <Card className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{detailError}</p>
          <button
            onClick={() => loadDoctorData(selectedDoctorId)}
            className="mt-3 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
          >
            Try Again
          </button>
        </Card>
      )}

      {doctorDetail && !detailLoading && (
        <>
          {/* Profile Card */}
          <Card>
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xl font-bold shrink-0">
                {doctorDetail.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {doctorDetail.full_name}
                  </h2>
                  <Badge variant={doctorDetail.is_active ? 'success' : 'error'} dot>
                    {doctorDetail.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {doctorDetail.specialty} &middot; {doctorDetail.qualifications}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Registration:</span>{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {doctorDetail.registration_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Council:</span>{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {doctorDetail.council_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Rating:</span>{' '}
                    {renderStars(doctorDetail.rating)}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {doctorDetail.rating.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Consultation Fee:</span>{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatCurrency(doctorDetail.consultation_fee)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Experience:</span>{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {doctorDetail.experience_years} years
                    </span>
                  </div>
                  {consultationStats && (
                    <div>
                      <span className="text-gray-400">Total Consultations:</span>{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {consultationStats.total ?? doctorDetail.total_consultations}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* =========================================================== */}
          {/* SUB-TABS                                                      */}
          {/* =========================================================== */}
          <div className="flex flex-wrap gap-2">
            {SUB_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-border dark:border-border-dark hover:border-gray-400 dark:hover:border-gray-500',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* =========================================================== */}
          {/* TAB 1: TODAY'S SCHEDULE                                       */}
          {/* =========================================================== */}
          {activeTab === 'schedule' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today&apos;s Schedule
                <Badge variant="neutral" size="sm">{todayConsultations.length}</Badge>
              </h3>

              {todayConsultations.length === 0 ? (
                <Card className="text-center py-12">
                  <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No consultations scheduled for today
                  </p>
                </Card>
              ) : (
                todayConsultations.map((c) => {
                  const isExpanded = expandedScheduleId === c.id
                  const mode = modeConfig[c.mode] || modeConfig.video
                  const ModeIcon = mode.icon

                  return (
                    <Card key={c.id} padding="none">
                      <div className="px-5 py-4 flex flex-wrap items-center gap-4">
                        {/* Mode icon */}
                        <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', mode.color)}>
                          <ModeIcon className="w-5 h-5" />
                        </div>

                        {/* Patient info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {c.patient_name || 'Patient'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(c.scheduled_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2">
                          <Badge variant={typeVariants[c.consultation_type] || 'neutral'}>
                            {typeLabels[c.consultation_type] || c.consultation_type}
                          </Badge>
                          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', mode.color)}>
                            {mode.label}
                          </span>
                          <Badge variant={statusVariants[c.status] || 'neutral'} dot>
                            {statusLabels[c.status] || c.status}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {c.status === 'scheduled' && (
                            <button
                              type="button"
                              className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5" />
                              Start Consultation
                            </button>
                          )}
                          {c.status === 'completed' && c.consultation_notes && (
                            <button
                              type="button"
                              onClick={() => setExpandedScheduleId(isExpanded ? null : c.id)}
                              className="px-4 py-1.5 bg-white dark:bg-surface-dark border border-border dark:border-border-dark text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium hover:border-gray-400 transition-colors flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {isExpanded ? 'Hide Notes' : 'View Notes'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded notes */}
                      {isExpanded && c.consultation_notes && (
                        <div className="border-t border-border dark:border-border-dark px-5 py-4 bg-gray-50/50 dark:bg-white/[0.02]">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Consultation Notes
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark p-3">
                            {c.consultation_notes}
                          </p>
                          {c.follow_up_recommended === 1 && (
                            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-3">
                              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm">
                                <p className="font-medium text-blue-800 dark:text-blue-300">
                                  Follow-up Recommended
                                </p>
                                {c.follow_up_weeks && (
                                  <p className="text-blue-600 dark:text-blue-400">
                                    Schedule in {c.follow_up_weeks} week{c.follow_up_weeks !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  )
                })
              )}
            </div>
          )}

          {/* =========================================================== */}
          {/* TAB 2: ALL CONSULTATIONS                                      */}
          {/* =========================================================== */}
          {activeTab === 'consultations' && (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card padding="sm">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Total Consultations</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{consultations.length}</p>
                </Card>
                <Card padding="sm">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Completed</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {consultations.filter((c) => c.status === 'completed').length}
                  </p>
                </Card>
                <Card padding="sm">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Revenue Earned</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(earningsData.totalPayout)}
                  </p>
                </Card>
              </div>

              {allConsultationsSorted.length === 0 ? (
                <Card className="text-center py-12">
                  <Stethoscope className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No consultations yet</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {allConsultationsSorted.map((c) => {
                    const isExpanded = expandedConsultationId === c.id
                    const mode = modeConfig[c.mode] || modeConfig.video
                    const ModeIcon = mode.icon

                    return (
                      <Card key={c.id} padding="none">
                        <button
                          type="button"
                          onClick={() => setExpandedConsultationId(isExpanded ? null : c.id)}
                          className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          {/* Mode icon */}
                          <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', mode.color)}>
                            <ModeIcon className="w-5 h-5" />
                          </div>

                          {/* Patient info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {c.patient_name || 'Patient'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(c.scheduled_at)}
                            </p>
                          </div>

                          {/* Badges */}
                          <div className="hidden md:flex items-center gap-2">
                            <Badge variant={typeVariants[c.consultation_type] || 'neutral'}>
                              {typeLabels[c.consultation_type] || c.consultation_type}
                            </Badge>
                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', mode.color)}>
                              {mode.label}
                            </span>
                            <Badge variant={statusVariants[c.status] || 'neutral'} dot>
                              {statusLabels[c.status] || c.status}
                            </Badge>
                          </div>

                          {/* Fee */}
                          <span className="hidden lg:block text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {formatCurrency(c.consultation_fee)}
                          </span>

                          {/* Duration */}
                          {c.duration_minutes != null && (
                            <span className="hidden lg:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3.5 h-3.5" />
                              {c.duration_minutes}m
                            </span>
                          )}

                          {/* Chevron */}
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          }
                        </button>

                        {/* Mobile badges */}
                        <div className="flex md:hidden flex-wrap gap-2 px-5 pb-3">
                          <Badge variant={typeVariants[c.consultation_type] || 'neutral'}>
                            {typeLabels[c.consultation_type] || c.consultation_type}
                          </Badge>
                          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', mode.color)}>
                            {mode.label}
                          </span>
                          <Badge variant={statusVariants[c.status] || 'neutral'} dot>
                            {statusLabels[c.status] || c.status}
                          </Badge>
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(c.consultation_fee)}
                          </span>
                          {c.duration_minutes != null && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {c.duration_minutes}m
                            </span>
                          )}
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t border-border dark:border-border-dark px-5 py-4 space-y-4 bg-gray-50/50 dark:bg-white/[0.02]">
                            {c.consultation_notes && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                  Consultation Notes
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark p-3">
                                  {c.consultation_notes}
                                </p>
                              </div>
                            )}

                            {c.follow_up_recommended === 1 && (
                              <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <p className="font-medium text-blue-800 dark:text-blue-300">
                                    Follow-up Recommended
                                  </p>
                                  {c.follow_up_weeks && (
                                    <p className="text-blue-600 dark:text-blue-400">
                                      In {c.follow_up_weeks} week{c.follow_up_weeks !== 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Fee breakdown */}
                            <div className="grid grid-cols-3 gap-3 pt-2">
                              <div className="text-center p-2 bg-white dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark">
                                <p className="text-xs text-gray-400">Consultation Fee</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(c.consultation_fee)}</p>
                              </div>
                              <div className="text-center p-2 bg-white dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark">
                                <p className="text-xs text-gray-400">Platform Fee</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(c.platform_fee)}</p>
                              </div>
                              <div className="text-center p-2 bg-white dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark">
                                <p className="text-xs text-gray-400">Your Payout</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(c.doctor_payout)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* =========================================================== */}
          {/* TAB 3: MY PATIENTS                                            */}
          {/* =========================================================== */}
          {activeTab === 'patients' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                My Patients
                <Badge variant="neutral" size="sm">{derivedPatients.length}</Badge>
              </h3>

              {derivedPatients.length === 0 ? (
                <Card className="text-center py-12">
                  <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No patients yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Patients will appear here after your first consultation.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {derivedPatients.map((p) => (
                    <Card key={p.patient_id}>
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-bold shrink-0">
                          {p.patient_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {p.patient_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Stethoscope className="w-3.5 h-3.5" />
                              {p.consultation_count} consultation{p.consultation_count !== 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5" />
                              Last: {formatDate(p.last_visit)}
                            </span>
                          </div>
                          {p.latest_notes && (
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 bg-gray-50 dark:bg-white/5 rounded-lg p-2 border border-border dark:border-border-dark">
                              {p.latest_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================== */}
          {/* TAB 4: EARNINGS                                               */}
          {/* =========================================================== */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary" />
                Earnings Overview
              </h3>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card padding="sm">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Your Total Payout</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(earningsData.totalPayout)}
                  </p>
                </Card>
                <Card padding="sm">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Total Consultation Fees</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(earningsData.totalConsultationFee)}
                  </p>
                </Card>
                <Card padding="sm">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Platform Fees Deducted</p>
                  <p className="text-xl font-bold text-error">
                    {formatCurrency(earningsData.totalPlatformFee)}
                  </p>
                </Card>
              </div>

              {/* Monthly aggregation */}
              {earningsData.monthly.length > 0 && (
                <Card
                  header={
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Monthly Breakdown
                    </h4>
                  }
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border dark:border-border-dark">
                          <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                          <th className="text-right py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Consultations</th>
                          <th className="text-right py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payout</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border dark:divide-border-dark">
                        {earningsData.monthly.map((m) => (
                          <tr key={m.month}>
                            <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-gray-100">{m.month}</td>
                            <td className="py-2.5 pr-4 text-right text-gray-600 dark:text-gray-400">{m.count}</td>
                            <td className="py-2.5 text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(m.payout)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Per-consultation table */}
              <Card
                header={
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Earnings per Consultation
                  </h4>
                }
              >
                {earningsData.completed.length === 0 ? (
                  <div className="text-center py-8">
                    <IndianRupee className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No completed consultations yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border dark:border-border-dark">
                          <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
                          <th className="text-right py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fee</th>
                          <th className="text-right py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Platform</th>
                          <th className="text-right py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Payout</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border dark:divide-border-dark">
                        {earningsData.completed
                          .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
                          .map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                              <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(c.scheduled_at)}</td>
                              <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{c.patient_name || 'Patient'}</td>
                              <td className="py-2.5 pr-4 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatCurrency(c.consultation_fee)}</td>
                              <td className="py-2.5 pr-4 text-right text-error whitespace-nowrap">{formatCurrency(c.platform_fee)}</td>
                              <td className="py-2.5 text-right font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatCurrency(c.doctor_payout)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* =========================================================== */}
          {/* TAB 5: WRITE PRESCRIPTION                                     */}
          {/* =========================================================== */}
          {activeTab === 'prescription' && (
            <div className="max-w-3xl space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Write Prescription
              </h3>

              {/* Success state */}
              {rxSuccess && (
                <Card className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Prescription Created
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {rxSuccess}
                  </p>
                  <button
                    type="button"
                    onClick={resetRxForm}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Write Another Prescription
                  </button>
                </Card>
              )}

              {/* Form */}
              {!rxSuccess && (
                <Card>
                  <form onSubmit={handleSubmitPrescription} className="space-y-5">
                    {/* Consultation selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Consultation <span className="text-error">*</span>
                      </label>
                      {prescriptionEligible.length === 0 ? (
                        <div className="rounded-lg border border-border dark:border-border-dark bg-gray-50 dark:bg-white/5 p-4 text-center">
                          <ClipboardList className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No completed consultations without a prescription.
                          </p>
                        </div>
                      ) : (
                        <select
                          value={rxConsultationId}
                          onChange={(e) => setRxConsultationId(e.target.value)}
                          className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark"
                        >
                          <option value="">Select a consultation...</option>
                          {prescriptionEligible.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.patient_name || 'Patient'} — {formatDate(c.scheduled_at)} ({typeLabels[c.consultation_type] || c.consultation_type})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Patient ID (auto-populated, read-only) */}
                    {selectedConsultationForRx && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Patient
                        </label>
                        <div className="rounded-lg border border-border dark:border-border-dark bg-gray-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-gray-600 dark:text-gray-400">
                          {selectedConsultationForRx.patient_name || 'Unknown'} (ID: {selectedConsultationForRx.patient_id})
                        </div>
                      </div>
                    )}

                    {/* Diagnosis */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Diagnosis <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={rxDiagnosis}
                        onChange={(e) => setRxDiagnosis(e.target.value)}
                        placeholder="e.g. Obesity with metabolic syndrome"
                        className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark"
                      />
                    </div>

                    {/* ICD-10 Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        ICD-10 Code
                      </label>
                      <input
                        type="text"
                        value={rxIcdCode}
                        onChange={(e) => setRxIcdCode(e.target.value)}
                        placeholder="e.g. E66.01"
                        className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark"
                      />
                    </div>

                    {/* Medications (dynamic rows) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Medications <span className="text-error">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={addMedicationRow}
                          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Medication
                        </button>
                      </div>

                      <div className="space-y-3">
                        {rxMedications.map((med, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-border dark:border-border-dark p-3 space-y-3 bg-gray-50/50 dark:bg-white/[0.02]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Medication {idx + 1}
                              </span>
                              {rxMedications.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeMedicationRow(idx)}
                                  className="text-error hover:text-error/80 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={med.name}
                                onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                                placeholder="Medication name"
                                className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark"
                              />
                              <input
                                type="text"
                                value={med.dosage}
                                onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                                placeholder="Dosage (e.g. 500mg)"
                                className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark"
                              />
                              <input
                                type="text"
                                value={med.frequency}
                                onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                                placeholder="Frequency (e.g. Twice daily)"
                                className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark"
                              />
                              <input
                                type="text"
                                value={med.duration_days}
                                onChange={(e) => handleMedChange(idx, 'duration_days', e.target.value)}
                                placeholder="Duration (days)"
                                className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark"
                              />
                            </div>
                            <input
                              type="text"
                              value={med.instructions}
                              onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                              placeholder="Special instructions (e.g. Take after meals)"
                              className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lifestyle Recommendations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Lifestyle Recommendations
                      </label>
                      <textarea
                        value={rxLifestyle}
                        onChange={(e) => setRxLifestyle(e.target.value)}
                        placeholder="One recommendation per line..."
                        rows={4}
                        className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark resize-none"
                      />
                    </div>

                    {/* Lab Tests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Lab Tests Ordered
                      </label>
                      <textarea
                        value={rxLabTests}
                        onChange={(e) => setRxLabTests(e.target.value)}
                        placeholder="Comma-separated, e.g. HbA1c, Lipid Panel, Liver Function"
                        rows={2}
                        className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark resize-none"
                      />
                    </div>

                    {/* Follow-up Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={rxFollowUpDate}
                        onChange={(e) => setRxFollowUpDate(e.target.value)}
                        className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark"
                      />
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Special Instructions
                      </label>
                      <textarea
                        value={rxSpecialInstructions}
                        onChange={(e) => setRxSpecialInstructions(e.target.value)}
                        placeholder="Any special instructions for the patient..."
                        rows={3}
                        className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark resize-none"
                      />
                    </div>

                    {/* Error */}
                    {rxError && (
                      <div className="flex items-start gap-2 rounded-lg bg-error/10 text-error px-4 py-3 text-sm">
                        <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        {rxError}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={rxSubmitting || prescriptionEligible.length === 0}
                      className={cn(
                        'w-full px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2',
                        (rxSubmitting || prescriptionEligible.length === 0) && 'opacity-60 cursor-not-allowed',
                      )}
                    >
                      {rxSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating Prescription...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Create Prescription
                        </>
                      )}
                    </button>
                  </form>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
