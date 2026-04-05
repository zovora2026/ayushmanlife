import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Phone,
  PhoneOff,
  Clock,
  User,
  FileText,
  Calendar,
  Pill,
  FlaskConical,
  ShieldCheck,
  Loader2,
  X,
  CheckCircle,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { teleweight } from '../../lib/api'
import type { TWConsultation, TWWeightProfile } from '../../lib/api'
import { cn, formatDate } from '../../lib/utils'

interface ConsultationRoomProps {
  consultationId?: string
  patientId: string
}

const typeLabels: Record<string, string> = {
  initial: 'Initial',
  follow_up: 'Follow-up',
  review: 'Review',
}

const modeLabels: Record<string, string> = {
  video: 'Video',
  audio: 'Audio',
  chat: 'Chat',
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ConsultationRoom({ consultationId, patientId }: ConsultationRoomProps) {
  // --- Shared state ---
  const [consultations, setConsultations] = useState<TWConsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Active room state ---
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [notes, setNotes] = useState('')
  const [tooltipId, setTooltipId] = useState<string | null>(null)
  const [actionToast, setActionToast] = useState<string | null>(null)

  // --- End consultation flow ---
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [endNotes, setEndNotes] = useState('')
  const [ending, setEnding] = useState(false)
  const [ended, setEnded] = useState(false)

  // --- Patient profile ---
  const [profile, setProfile] = useState<TWWeightProfile | null>(null)
  const [patientInfo, setPatientInfo] = useState<{ name: string; age: number; gender: string } | null>(null)

  // Find active consultation from list
  const activeConsultation = consultations.find((c) => c.id === consultationId) || null

  // Scheduled consultations for lobby
  const scheduledConsultations = consultations.filter((c) => c.status === 'scheduled')

  // --- Load consultations ---
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await teleweight.patientConsultations(patientId)
        if (!cancelled) setConsultations(data.consultations || [])
      } catch (err) {
        console.error('Failed to load consultations:', err)
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load consultations')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [patientId])

  // --- Load patient profile ---
  useEffect(() => {
    let cancelled = false
    async function loadProfile() {
      try {
        const data = await teleweight.getIntake(patientId)
        if (!cancelled) {
          setProfile(data.profile || null)
          if (data.patient) {
            setPatientInfo({
              name: data.patient.name || 'Patient',
              age: data.patient.age || 0,
              gender: data.patient.gender || 'Unknown',
            })
          }
        }
      } catch {
        // Profile may not exist yet -- that's fine
      }
    }
    loadProfile()
    return () => { cancelled = true }
  }, [patientId])

  // --- Timer ---
  useEffect(() => {
    if (consultationId && !ended) {
      setElapsedSeconds(0)
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [consultationId, ended])

  // --- Action toast auto-dismiss ---
  useEffect(() => {
    if (actionToast) {
      const timeout = setTimeout(() => setActionToast(null), 3000)
      return () => clearTimeout(timeout)
    }
  }, [actionToast])

  // --- End consultation ---
  const handleEndConsultation = useCallback(async () => {
    if (!consultationId) return
    setEnding(true)
    try {
      const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
      await teleweight.updateConsultation(consultationId, {
        status: 'completed',
        duration_minutes: durationMinutes,
        consultation_notes: notes || endNotes || null,
      })
      setEnded(true)
      setShowEndConfirm(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    } catch (err) {
      console.error('Failed to end consultation:', err)
      setError(err instanceof Error ? err.message : 'Failed to end consultation')
    } finally {
      setEnding(false)
    }
  }, [consultationId, elapsedSeconds, notes, endNotes])

  // --- Integration pending tooltip helper ---
  function showTooltip(id: string) {
    setTooltipId(id)
    setTimeout(() => setTooltipId(null), 2000)
  }

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // --- Error ---
  if (error && !consultationId) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <X className="w-12 h-12 text-error mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Failed to load consultations
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </Card>
    )
  }

  // =====================================================
  // STATE 1: No active consultation -- Lobby view
  // =====================================================
  if (!consultationId) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
              <Video className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Consultation Room
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              Select a scheduled consultation to enter the consultation room. Your video consultation
              will begin once you join.
            </p>
          </div>
        </Card>

        {scheduledConsultations.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                No scheduled consultations
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Book a consultation with a doctor to get started.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Upcoming Consultations
            </h3>
            {scheduledConsultations.map((c) => (
              <Card key={c.id} padding="none">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
                  {/* Doctor info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {c.doctor_name || 'Doctor'}
                    </p>
                    {c.doctor_specialty && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {c.doctor_specialty}
                      </p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(c.scheduled_at)}</span>
                    </div>
                    <Badge variant="info" size="sm">
                      {modeLabels[c.mode] || c.mode}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {typeLabels[c.consultation_type] || c.consultation_type}
                    </Badge>
                  </div>

                  {/* Enter Room button */}
                  <a
                    href={`?tab=room&consultation=${c.id}`}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      'bg-blue-600 text-white hover:bg-blue-700',
                      'dark:bg-blue-500 dark:hover:bg-blue-600'
                    )}
                  >
                    <Video className="w-4 h-4" />
                    Enter Room
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // =====================================================
  // STATE 2: Active consultation room
  // =====================================================

  // --- Ended state ---
  if (ended) {
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
    return (
      <div className="flex items-center justify-center py-16">
        <Card className="max-w-lg w-full">
          <div className="flex flex-col items-center text-center py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Consultation Completed Successfully
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              The consultation has been recorded and saved.
            </p>

            <div className="w-full space-y-3 text-left">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Doctor</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {activeConsultation?.doctor_name || 'Doctor'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {durationMinutes} minute{durationMinutes !== 1 ? 's' : ''} ({formatTimer(elapsedSeconds)})
                </span>
              </div>
              {(notes || endNotes) && (
                <div className="py-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Notes</span>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    {notes || endNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // --- End confirmation overlay ---
  if (showEndConfirm) {
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <Card className="max-w-md w-full">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                End Consultation?
              </h3>
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatTimer(elapsedSeconds)} ({durationMinutes} min)
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End-of-consultation notes (optional)
                </label>
                <textarea
                  value={endNotes}
                  onChange={(e) => setEndNotes(e.target.value)}
                  rows={3}
                  placeholder="Summary, follow-up instructions, etc."
                  className={cn(
                    'w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  )}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  'border border-gray-300 dark:border-gray-600',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEndConsultation}
                disabled={ending}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  'bg-red-600 text-white hover:bg-red-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center justify-center gap-2'
                )}
              >
                {ending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ending...
                  </>
                ) : (
                  'Confirm End'
                )}
              </button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // --- Active consultation room ---
  const comorbidities = profile?.comorbidities
    ? (typeof profile.comorbidities === 'string'
        ? (() => { try { return JSON.parse(profile.comorbidities) } catch { return [profile.comorbidities] } })()
        : profile.comorbidities)
    : []

  return (
    <div className="space-y-4">
      {/* ===== Top Bar ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark px-4 py-3 shadow-sm">
        {/* Left: Doctor info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {activeConsultation?.doctor_name || 'Doctor'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activeConsultation?.doctor_specialty || 'Specialist'}
            </p>
          </div>
        </div>

        {/* Center: Timer */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white tabular-nums">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>
          <Badge variant="success" dot size="sm">Live</Badge>
        </div>

        {/* Right: End button */}
        <button
          type="button"
          onClick={() => setShowEndConfirm(true)}
          className={cn(
            'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            'bg-red-600 text-white hover:bg-red-700',
            'dark:bg-red-500 dark:hover:bg-red-600'
          )}
        >
          <PhoneOff className="w-4 h-4" />
          End Consultation
        </button>
      </div>

      {/* ===== Main Area ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ===== Left Column: Video Area (2/3) ===== */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video bg-gray-900 dark:bg-black rounded-2xl overflow-hidden border border-gray-800">
            {/* Center placeholder content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 mb-4">
                <Video className="w-10 h-10 text-white/60" />
              </div>
              <h3 className="text-lg font-semibold text-white/90 mb-1">
                Video Consultation Room
              </h3>
              <p className="text-sm text-white/50 mb-3">
                WebRTC Integration Point
              </p>
              <p className="text-xs text-white/30 max-w-sm">
                Connect your preferred video provider (Daily.co, Twilio, Agora) or implement native WebRTC
              </p>
            </div>

            {/* Self-view box (bottom-right) */}
            <div className="absolute bottom-16 right-4 w-32 h-24 sm:w-40 sm:h-28 bg-gray-800 dark:bg-gray-950 rounded-xl border border-gray-700 flex flex-col items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white/40 mb-1" />
              <span className="text-xs text-white/40">Your camera</span>
            </div>

            {/* Controls bar */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/60 backdrop-blur-md">
              <div className="flex items-center justify-center gap-3">
                {/* Mic toggle */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setMicOn((prev) => !prev); showTooltip('mic') }}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                      micOn
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-red-500/80 hover:bg-red-500 text-white'
                    )}
                  >
                    {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  {tooltipId === 'mic' && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded bg-black text-white text-xs shadow-lg">
                      Integration pending
                    </span>
                  )}
                </div>

                {/* Camera toggle */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setCameraOn((prev) => !prev); showTooltip('camera') }}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                      cameraOn
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-red-500/80 hover:bg-red-500 text-white'
                    )}
                  >
                    {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
                  {tooltipId === 'camera' && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded bg-black text-white text-xs shadow-lg">
                      Integration pending
                    </span>
                  )}
                </div>

                {/* Screen share */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => showTooltip('screen')}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    <Monitor className="w-5 h-5" />
                  </button>
                  {tooltipId === 'screen' && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded bg-black text-white text-xs shadow-lg">
                      Integration pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Right Column: Sidebar Panels (1/3) ===== */}
        <div className="space-y-4">
          {/* Panel 1: Patient Info */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Patient Info</h4>
              </div>
            }
            padding="sm"
          >
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {patientInfo?.name || activeConsultation?.patient_name || 'Patient'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {patientInfo?.age ? `${patientInfo.age} yrs` : ''}{patientInfo?.age && patientInfo?.gender ? ' / ' : ''}{patientInfo?.gender || ''}
                </p>
              </div>

              {profile && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {profile.current_weight_kg} kg
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">BMI</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {profile.bmi.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {profile.target_weight_kg} kg
                    </p>
                  </div>
                </div>
              )}

              {Array.isArray(comorbidities) && comorbidities.length > 0 && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Comorbidities</p>
                  <div className="flex flex-wrap gap-1">
                    {comorbidities.map((item: string, i: number) => (
                      <Badge key={i} variant="warning" size="sm">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Panel 2: Consultation Notes */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Consultation Notes</h4>
              </div>
            }
            padding="sm"
          >
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Type your consultation notes here..."
                className={cn(
                  'w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'resize-none'
                )}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                Notes auto-save when you end the consultation
              </p>
            </div>
          </Card>

          {/* Panel 3: Quick Actions */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</h4>
              </div>
            }
            padding="sm"
          >
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setActionToast('Complete the consultation first, then write prescription from the Doctor Panel')}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                  'border border-gray-200 dark:border-gray-700',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <Pill className="w-4 h-4 text-blue-500" />
                Write Prescription
              </button>

              <button
                type="button"
                onClick={() => setActionToast('Available after consultation ends')}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                  'border border-gray-200 dark:border-gray-700',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <FlaskConical className="w-4 h-4 text-purple-500" />
                Order Lab Tests
              </button>

              <button
                type="button"
                onClick={() => setActionToast('Available after consultation ends')}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                  'border border-gray-200 dark:border-gray-700',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <Calendar className="w-4 h-4 text-green-500" />
                Schedule Follow-up
              </button>

              <button
                type="button"
                onClick={() => setActionToast('Available after consultation ends')}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                  'border border-gray-200 dark:border-gray-700',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                Record Consent
              </button>

              {/* Action toast */}
              {actionToast && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300">{actionToast}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ===== Regulatory Notice ===== */}
      <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
        <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-300">
          This consultation is conducted per Telemedicine Practice Guidelines 2020. Recording requires explicit patient consent.
        </p>
      </div>
    </div>
  )
}
