import { useState, useEffect, useMemo } from 'react'
import {
  Star,
  MapPin,
  Clock,
  Video,
  Phone,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Calendar,
  IndianRupee,
  CheckCircle,
  XCircle,
  Shield,
  Languages,
} from 'lucide-react'
import { teleweight } from '../../lib/api'
import type { TWDoctor } from '../../lib/api'
import { cn, formatCurrency } from '../../lib/utils'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type View = 'grid' | 'detail' | 'booking'

interface DoctorSlot {
  time: string
  available: boolean
}

interface BookingPayload {
  patient_id: string
  doctor_id: string
  consultation_type: string
  mode: string
  scheduled_at: string
  patient_consent_telemedicine: number
  patient_consent_data_sharing: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseLanguages(raw: string): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [String(parsed)]
  } catch {
    return raw.split(',').map((l) => l.trim()).filter(Boolean)
  }
}

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DoctorDiscovery({ patientId }: { patientId: string }) {
  // View navigation
  const [view, setView] = useState<View>('grid')
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)

  // Grid state
  const [doctors, setDoctors] = useState<TWDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [maxFee, setMaxFee] = useState<number | ''>('')
  const [languageSearch, setLanguageSearch] = useState('')

  // Detail state
  const [detailDoctor, setDetailDoctor] = useState<TWDoctor | null>(null)
  const [consultationStats, setConsultationStats] = useState<any>(null)
  const [slots, setSlots] = useState<Record<string, DoctorSlot[]>>({})
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  // Booking state
  const [consultationType, setConsultationType] = useState('initial')
  const [mode, setMode] = useState('video')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [manualDatetime, setManualDatetime] = useState('')
  const [consentTelemedicine, setConsentTelemedicine] = useState(false)
  const [consentDataSharing, setConsentDataSharing] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState<any>(null)

  // ---------- Fetch doctors ----------
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await teleweight.doctors()
        if (!cancelled) setDoctors(res.doctors || [])
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load doctors')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // ---------- Derived data ----------
  const specialties = useMemo(
    () => [...new Set(doctors.map((d) => d.specialty).filter(Boolean))].sort(),
    [doctors],
  )

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      if (specialtyFilter && d.specialty !== specialtyFilter) return false
      if (maxFee !== '' && d.consultation_fee > maxFee) return false
      if (languageSearch) {
        const langs = parseLanguages(d.languages).map((l) => l.toLowerCase())
        if (!langs.some((l) => l.includes(languageSearch.toLowerCase()))) return false
      }
      return true
    })
  }, [doctors, specialtyFilter, maxFee, languageSearch])

  // ---------- Navigation helpers ----------
  async function openDetail(id: string) {
    setSelectedDoctorId(id)
    setView('detail')
    setDetailLoading(true)
    setDetailError(null)
    setDetailDoctor(null)
    setConsultationStats(null)
    setSlots({})
    try {
      const [detailRes, slotsRes] = await Promise.allSettled([
        teleweight.doctorDetail(id),
        teleweight.doctorSlots(id),
      ])
      if (detailRes.status === 'fulfilled') {
        setDetailDoctor(detailRes.value.doctor)
        setConsultationStats(detailRes.value.consultation_stats)
      } else {
        throw (detailRes as PromiseRejectedResult).reason
      }
      if (slotsRes.status === 'fulfilled') {
        setSlots(slotsRes.value.slots || {})
      }
    } catch (err: any) {
      setDetailError(err.message || 'Failed to load doctor details')
    } finally {
      setDetailLoading(false)
    }
  }

  function openBooking() {
    setView('booking')
    setConsultationType('initial')
    setMode('video')
    setSelectedSlot('')
    setManualDatetime('')
    setConsentTelemedicine(false)
    setConsentDataSharing(false)
    setBookingError(null)
    setBookingSuccess(null)
  }

  function backToGrid() {
    setView('grid')
    setSelectedDoctorId(null)
    setDetailDoctor(null)
  }

  function backToDetail() {
    setView('detail')
    setBookingError(null)
    setBookingSuccess(null)
  }

  // ---------- Booking submit ----------
  async function handleBook() {
    if (!detailDoctor) return
    const scheduledAt = selectedSlot || manualDatetime
    if (!scheduledAt) {
      setBookingError('Please select a time slot or enter a date/time.')
      return
    }
    if (!consentTelemedicine || !consentDataSharing) {
      setBookingError('Both consent checkboxes are required to proceed.')
      return
    }

    setBookingLoading(true)
    setBookingError(null)
    try {
      const payload: BookingPayload = {
        patient_id: patientId,
        doctor_id: detailDoctor.id,
        consultation_type: consultationType,
        mode,
        scheduled_at: scheduledAt,
        patient_consent_telemedicine: consentTelemedicine ? 1 : 0,
        patient_consent_data_sharing: consentDataSharing ? 1 : 0,
      }
      const res = await teleweight.bookConsultation(payload)
      setBookingSuccess(res.consultation)
    } catch (err: any) {
      setBookingError(err.message || 'Booking failed. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  // ---------- Enforce mode restriction for initial consult ----------
  useEffect(() => {
    if (consultationType === 'initial' && mode !== 'video') {
      setMode('video')
    }
  }, [consultationType, mode])

  // =====================================================================
  // RENDER
  // =====================================================================

  // ---------- Loading / Error (grid) ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <XCircle className="w-10 h-10 text-error mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Retry
        </button>
      </Card>
    )
  }

  // =================================================================
  // VIEW: BOOKING
  // =================================================================
  if (view === 'booking' && detailDoctor) {
    const isInitial = consultationType === 'initial'

    // If booking succeeded, show success card
    if (bookingSuccess) {
      return (
        <div className="max-w-xl mx-auto space-y-6">
          <Card className="text-center py-10">
            <CheckCircle className="w-14 h-14 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Your consultation has been scheduled successfully.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 text-left space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Doctor</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {detailDoctor.full_name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Type</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {bookingSuccess.consultation_type?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Mode</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {bookingSuccess.mode}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Scheduled</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(bookingSuccess.scheduled_at).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Fee</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(bookingSuccess.consultation_fee ?? detailDoctor.consultation_fee)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <Badge variant="success">{bookingSuccess.status}</Badge>
              </div>
            </div>

            <button
              onClick={backToGrid}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Back to Doctors
            </button>
          </Card>
        </div>
      )
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={backToDetail}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </button>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Book Consultation
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            with <span className="font-medium text-gray-700 dark:text-gray-300">{detailDoctor.full_name}</span>{' '}
            &middot; {formatCurrency(detailDoctor.consultation_fee)}
          </p>

          <div className="space-y-5">
            {/* Consultation type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Consultation Type
              </label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
                className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm"
              >
                <option value="initial">Initial Consultation</option>
                <option value="follow_up">Follow-up</option>
                <option value="review">Review</option>
              </select>
            </div>

            {/* Mode selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mode
              </label>
              <div className="flex gap-3">
                {/* Video — always available */}
                <button
                  type="button"
                  onClick={() => setMode('video')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                    mode === 'video'
                      ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                      : 'border-border bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 hover:border-gray-400',
                  )}
                >
                  <Video className="w-4 h-4" /> Video
                </button>

                {/* Audio */}
                <div className="relative flex-1 group">
                  <button
                    type="button"
                    disabled={isInitial}
                    onClick={() => setMode('audio')}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                      isInitial
                        ? 'border-border bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : mode === 'audio'
                          ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                          : 'border-border bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 hover:border-gray-400',
                    )}
                  >
                    <Phone className="w-4 h-4" /> Audio
                  </button>
                  {isInitial && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                        First consultation must be video per regulations
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 rotate-45" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat */}
                <div className="relative flex-1 group">
                  <button
                    type="button"
                    disabled={isInitial}
                    onClick={() => setMode('chat')}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                      isInitial
                        ? 'border-border bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : mode === 'chat'
                          ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                          : 'border-border bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 hover:border-gray-400',
                    )}
                  >
                    <MessageSquare className="w-4 h-4" /> Chat
                  </button>
                  {isInitial && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                        First consultation must be video per regulations
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 rotate-45" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {isInitial && (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  First consultation must be video per Telemedicine Practice Guidelines 2020
                </p>
              )}
            </div>

            {/* Date / time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Date &amp; Time
              </label>

              {/* Available slots */}
              {Object.keys(slots).length > 0 && (
                <div className="mb-3 space-y-3">
                  {Object.entries(slots).map(([date, daySlots]) => {
                    const availableSlots = (daySlots as DoctorSlot[]).filter((s) => s.available)
                    if (availableSlots.length === 0) return null
                    return (
                      <div key={date}>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                          {new Date(date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => {
                                setSelectedSlot(slot.time)
                                setManualDatetime('')
                              }}
                              className={cn(
                                'px-3 py-1.5 text-xs rounded-lg border transition-colors',
                                selectedSlot === slot.time
                                  ? 'border-primary bg-primary/10 text-primary font-semibold dark:bg-primary/20'
                                  : 'border-border bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 hover:border-gray-400',
                              )}
                            >
                              {new Date(slot.time).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <p className="text-xs text-gray-400 mb-1">Or enter manually:</p>
              <input
                type="datetime-local"
                value={manualDatetime}
                onChange={(e) => {
                  setManualDatetime(e.target.value)
                  setSelectedSlot('')
                }}
                className="w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm"
              />
            </div>

            {/* Consents */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentTelemedicine}
                  onChange={(e) => setConsentTelemedicine(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I consent to telemedicine consultation as per the Telemedicine Practice Guidelines 2020.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentDataSharing}
                  onChange={(e) => setConsentDataSharing(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I consent to sharing my health data with the doctor for this consultation (DPDP Act 2023).
                </span>
              </label>
            </div>

            {/* Error */}
            {bookingError && (
              <div className="flex items-start gap-2 rounded-lg bg-error/10 text-error px-4 py-3 text-sm">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {bookingError}
              </div>
            )}

            {/* Submit */}
            <button
              disabled={bookingLoading || !consentTelemedicine || !consentDataSharing}
              onClick={handleBook}
              className={cn(
                'w-full px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2',
                (bookingLoading || !consentTelemedicine || !consentDataSharing) &&
                  'opacity-60 cursor-not-allowed',
              )}
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Booking...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" /> Confirm Booking
                </>
              )}
            </button>
          </div>
        </Card>
      </div>
    )
  }

  // =================================================================
  // VIEW: DOCTOR DETAIL
  // =================================================================
  if (view === 'detail') {
    if (detailLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )
    }

    if (detailError || !detailDoctor) {
      return (
        <div className="space-y-4">
          <button
            onClick={backToGrid}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Doctors
          </button>
          <Card className="text-center py-12">
            <XCircle className="w-10 h-10 text-error mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {detailError || 'Doctor not found'}
            </p>
          </Card>
        </div>
      )
    }

    const languages = parseLanguages(detailDoctor.languages)

    return (
      <div className="space-y-6">
        {/* Back */}
        <button
          onClick={backToGrid}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Doctors
        </button>

        {/* Profile card */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {detailDoctor.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {detailDoctor.full_name}
                </h2>
                <Badge variant="success" dot>
                  Active
                </Badge>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {detailDoctor.specialty} &middot; {detailDoctor.qualifications}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  {renderStars(detailDoctor.rating)}{' '}
                  <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                    {detailDoctor.rating.toFixed(1)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {detailDoctor.experience_years} yrs exp
                </span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />{' '}
                  {formatCurrency(detailDoctor.consultation_fee)}
                </span>
              </div>

              {/* Bio */}
              {detailDoctor.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {detailDoctor.bio}
                </p>
              )}

              {/* Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Registration:</span>{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {detailDoctor.registration_number}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Council:</span>{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {detailDoctor.council_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Consultations:</span>{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {detailDoctor.total_consultations}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {languages.join(', ') || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Consultation Stats */}
        {consultationStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: consultationStats.total ?? detailDoctor.total_consultations },
              { label: 'Completed', value: consultationStats.completed ?? 0 },
              { label: 'Upcoming', value: consultationStats.upcoming ?? 0 },
              { label: 'Rating', value: detailDoctor.rating.toFixed(1) },
            ].map((s) => (
              <Card key={s.label} padding="sm">
                <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Available Slots */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Available Slots
          </h3>

          {Object.keys(slots).length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
              No upcoming slots available. You can still book by choosing a date/time manually.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(slots).map(([date, daySlots]) => {
                const available = (daySlots as DoctorSlot[]).filter((s) => s.available)
                const unavailable = (daySlots as DoctorSlot[]).filter((s) => !s.available)
                return (
                  <div key={date}>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {new Date(date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(daySlots as DoctorSlot[]).map((slot) => (
                        <span
                          key={slot.time}
                          className={cn(
                            'px-3 py-1.5 text-xs rounded-lg border',
                            slot.available
                              ? 'border-success/30 bg-success/10 text-success'
                              : 'border-border bg-gray-100 dark:bg-gray-800 text-gray-400 line-through',
                          )}
                        >
                          {new Date(slot.time).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      ))}
                    </div>
                    {available.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1">All slots booked</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Book button */}
        <div className="flex justify-center">
          <button
            onClick={openBooking}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Video className="w-4 h-4" /> Book Consultation &middot;{' '}
            {formatCurrency(detailDoctor.consultation_fee)}
          </button>
        </div>
      </div>
    )
  }

  // =================================================================
  // VIEW: DOCTOR GRID (default)
  // =================================================================
  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <Card padding="sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Specialty */}
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm md:w-56"
          >
            <option value="">All Specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Max fee */}
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="number"
              placeholder="Max fee"
              value={maxFee}
              onChange={(e) =>
                setMaxFee(e.target.value === '' ? '' : Number(e.target.value))
              }
              min={0}
              className="rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm w-full md:w-36"
            />
          </div>

          {/* Language search */}
          <div className="flex items-center gap-2 flex-1">
            <Languages className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search language..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              className="rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm w-full"
            />
          </div>
        </div>
      </Card>

      {/* Empty state */}
      {filteredDoctors.length === 0 && (
        <Card className="text-center py-12">
          <MapPin className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
            No doctors found
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Try adjusting your filters to see more results.
          </p>
        </Card>
      )}

      {/* Doctor cards grid */}
      {filteredDoctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doctor) => {
            const langs = parseLanguages(doctor.languages)
            return (
              <Card
                key={doctor.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                padding="md"
              >
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {doctor.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {doctor.full_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {doctor.specialty}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {doctor.qualifications}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    {renderStars(doctor.rating)}
                    <span className="ml-0.5 font-medium text-gray-700 dark:text-gray-300">
                      {doctor.rating.toFixed(1)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {doctor.experience_years}y
                  </span>
                </div>

                {/* Fee */}
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  <IndianRupee className="w-4 h-4 text-primary" />
                  {formatCurrency(doctor.consultation_fee)}
                </div>

                {/* Languages */}
                {langs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {langs.map((lang) => (
                      <Badge key={lang} variant="neutral" size="sm">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action */}
                <button
                  onClick={() => openDetail(doctor.id)}
                  className="w-full px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm"
                >
                  View Profile
                </button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
