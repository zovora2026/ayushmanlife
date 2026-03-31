import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Trash2,
  Bot,
  User,
  Activity,
  Droplets,
  Heart,
  Thermometer,
  Weight,
  Wind,
  Calendar,
  Pill,
  Clock,
  Loader2,
  Star,
  MessageCircle,
  CheckCircle,
  CalendarPlus,
  Stethoscope,
  Brain,
  Bone,
  Eye,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Phone,
  FileText,
  XCircle,
  Zap,
  Shield,
  TrendingUp,
  IndianRupee,
} from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { patients as patientsAPI, appointments as appointmentsAPI, claims as claimsAPI, chat as chatAPI, analytics as analyticsAPI } from '../lib/api'
import type { ChatMessage } from '../types'
import type { Vital, Medication, Appointment, Claim, Patient, SatisfactionData } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { cn } from '../lib/utils'

const quickReplies = [
  'Book Appointment',
  'Check Symptoms',
  'My Medications',
  'Claim Status',
]

// --- Symptom Checker Data ---
type BodySystem = {
  id: string
  label: string
  icon: typeof Activity
  symptoms: string[]
}

const bodySystems: BodySystem[] = [
  { id: 'head_neck', label: 'Head & Neck', icon: User, symptoms: ['Headache', 'Dizziness', 'Sore Throat', 'Earache', 'Vision Changes', 'Nasal Congestion'] },
  { id: 'chest_respiratory', label: 'Chest & Respiratory', icon: Wind, symptoms: ['Cough', 'Shortness of Breath', 'Chest Pain', 'Wheezing', 'Fever', 'Fatigue'] },
  { id: 'abdomen_gi', label: 'Abdomen & GI', icon: Pill, symptoms: ['Nausea', 'Vomiting', 'Abdominal Pain', 'Diarrhea', 'Constipation', 'Bloating'] },
  { id: 'cardiovascular', label: 'Cardiovascular', icon: Heart, symptoms: ['Palpitations', 'Chest Tightness', 'Swelling in Legs', 'Rapid Heartbeat', 'Fainting', 'Cold Extremities'] },
  { id: 'musculoskeletal', label: 'Musculoskeletal', icon: Bone, symptoms: ['Joint Pain', 'Back Pain', 'Muscle Weakness', 'Stiffness', 'Swelling', 'Limited Mobility'] },
  { id: 'neurological', label: 'Neurological', icon: Brain, symptoms: ['Numbness', 'Tingling', 'Memory Loss', 'Tremors', 'Seizures', 'Balance Issues'] },
  { id: 'skin_dermatology', label: 'Skin & Dermatology', icon: Eye, symptoms: ['Rash', 'Itching', 'Skin Discoloration', 'Dry Skin', 'Wound Not Healing', 'Hair Loss'] },
  { id: 'general_systemic', label: 'General / Systemic', icon: Stethoscope, symptoms: ['Fever', 'Fatigue', 'Weight Loss', 'Night Sweats', 'Loss of Appetite', 'General Weakness'] },
]

const durationOptions = [
  'Less than 24 hours',
  '1-3 days',
  '3-7 days',
  '1-2 weeks',
  'More than 2 weeks',
]

const severityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Mild', color: 'bg-green-500' },
  2: { label: 'Moderate', color: 'bg-blue-500' },
  3: { label: 'Significant', color: 'bg-yellow-500' },
  4: { label: 'Severe', color: 'bg-orange-500' },
  5: { label: 'Critical', color: 'bg-red-500' },
}

const defaultVitals = [
  { label: 'Blood Pressure', value: '—', unit: 'mmHg', icon: Activity, color: 'text-error' },
  { label: 'Heart Rate', value: '—', unit: 'bpm', icon: Heart, color: 'text-pink-500' },
  { label: 'SpO2', value: '—', unit: '%', icon: Droplets, color: 'text-accent' },
  { label: 'Blood Glucose', value: '—', unit: 'mg/dL', icon: Activity, color: 'text-warning' },
  { label: 'Temperature', value: '—', unit: '°F', icon: Thermometer, color: 'text-secondary' },
  { label: 'Weight', value: '—', unit: 'kg', icon: Weight, color: 'text-success' },
]

const claimStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  under_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  appealed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        isUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300')}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
        isUser ? 'rounded-tr-md bg-primary text-white' : 'rounded-tl-md bg-gray-100 text-text dark:bg-gray-800 dark:text-text-dark')}>
        <div className="whitespace-pre-wrap">{message.content}</div>
        <p className={cn('mt-1.5 text-[10px]', isUser ? 'text-white/60 text-right' : 'text-muted')}>
          {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </p>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3 dark:bg-gray-800">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

// Triage result component for symptom checker API response
interface TriageCondition {
  name: string
  likelihood: string
  description: string
}
interface TriageAssessment {
  triage_level: string
  triage_color: string
  possible_conditions: TriageCondition[]
  recommendations: string[]
  seek_care_within: string
  emergency_signs: string[]
  disclaimer: string
}

export default function VCare() {
  const { messages, isTyping, sendMessage, clearChat, loadConversation } = useChatStore()
  const [input, setInput] = useState('')
  const [patientVitals, setPatientVitals] = useState(defaultVitals)
  const [patientMeds, setPatientMeds] = useState<Medication[]>([])
  const [patientApts, setPatientApts] = useState<Appointment[]>([])
  const [patientClaims, setPatientClaims] = useState<Claim[]>([])
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null)
  const [contextLoading, setContextLoading] = useState(true)

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [npsScore, setNpsScore] = useState(0)
  const [satisfactionData, setSatisfactionData] = useState<SatisfactionData | null>(null)

  // Appointment booking state
  const [bookingDept, setBookingDept] = useState('Cardiology')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  // Symptom Checker state
  const [scStep, setScStep] = useState(1)
  const [scSystem, setScSystem] = useState<BodySystem | null>(null)
  const [scSymptoms, setScSymptoms] = useState<string[]>([])
  const [scDuration, setScDuration] = useState('')
  const [scSeverity, setScSeverity] = useState(0)
  const [scNotes, setScNotes] = useState('')
  const [scLoading, setScLoading] = useState(false)
  const [scResult, setScResult] = useState<TriageAssessment | null>(null)

  // Vitals trend
  const [vitalsTrend, setVitalsTrend] = useState<{
    bp: { value: number; date: string }[]
    hr: { value: number; date: string }[]
    spo2: { value: number; date: string }[]
  }>({ bp: [], hr: [], spo2: [] })
  const [vitalsLoading, setVitalsLoading] = useState(true)
  const [patientList, setPatientList] = useState<{ id: string; name: string }[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState('pat-001')

  const PATIENT_ID = selectedPatientId

  const resetSymptomChecker = () => {
    setScStep(1)
    setScSystem(null)
    setScSymptoms([])
    setScDuration('')
    setScSeverity(0)
    setScNotes('')
    setScResult(null)
  }

  const toggleSymptom = (symptom: string) => {
    setScSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    )
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadData = useCallback(async () => {
    try {
      // Load patient profile and context
      const patientData = await patientsAPI.get(PATIENT_ID)
      if (patientData) {
        setPatientProfile(patientData.patient || patientData as unknown as Patient)
        if (patientData.vitals && (patientData.vitals as Vital[]).length > 0) {
          const vitalMap: Record<string, { value: string; unit: string }> = {}
          for (const v of patientData.vitals as Vital[]) {
            vitalMap[v.type] = { value: String(v.value), unit: v.unit }
          }
          const iconMap: Record<string, { icon: typeof Activity; color: string; label: string }> = {
            bp_systolic: { icon: Activity, color: 'text-error', label: 'Blood Pressure' },
            heart_rate: { icon: Heart, color: 'text-pink-500', label: 'Heart Rate' },
            spo2: { icon: Droplets, color: 'text-accent', label: 'SpO2' },
            blood_sugar: { icon: Activity, color: 'text-warning', label: 'Blood Glucose' },
            blood_glucose_fasting: { icon: Activity, color: 'text-warning', label: 'Blood Glucose' },
            temperature: { icon: Thermometer, color: 'text-secondary', label: 'Temperature' },
            weight: { icon: Weight, color: 'text-success', label: 'Weight' },
          }
          const mapped = Object.entries(vitalMap).filter(([k]) => iconMap[k]).map(([k, v]) => ({
            ...iconMap[k], value: v.value, unit: v.unit,
          }))
          if (mapped.length > 0) setPatientVitals(mapped)
        }
        if (patientData.appointments && (patientData.appointments as Appointment[]).length > 0) {
          setPatientApts(patientData.appointments as Appointment[])
        }
      }
    } catch { /* keep defaults */ }

    // Load medications
    try {
      const res = await patientsAPI.medications(PATIENT_ID)
      if (res?.medications?.length) {
        setPatientMeds(res.medications as Medication[])
      }
    } catch { /* keep defaults */ }

    // Load vitals trend
    try {
      const res = await patientsAPI.vitals(PATIENT_ID)
      if (res?.vitals?.length) {
        const vitals = res.vitals as Vital[]
        setVitalsTrend({
          bp: vitals.filter(v => v.type === 'bp_systolic').sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()).slice(-7).map(v => ({ value: v.value, date: v.recorded_at })),
          hr: vitals.filter(v => v.type === 'heart_rate').sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()).slice(-7).map(v => ({ value: v.value, date: v.recorded_at })),
          spo2: vitals.filter(v => v.type === 'spo2').sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()).slice(-7).map(v => ({ value: v.value, date: v.recorded_at })),
        })
      }
    } catch { /* keep defaults */ }
    setVitalsLoading(false)

    // Load claims for this patient
    try {
      const res = await claimsAPI.list({ patient_id: PATIENT_ID })
      if (res?.claims?.length) {
        setPatientClaims(res.claims as Claim[])
      }
    } catch { /* keep defaults */ }

    // Load satisfaction
    try {
      const data = await analyticsAPI.satisfaction()
      if (data) {
        setSatisfactionData(data)
        setNpsScore(data.nps_score ?? 0)
      }
    } catch { /* keep defaults */ }

    setContextLoading(false)
  }, [selectedPatientId])

  // Load patient list for selector
  useEffect(() => {
    patientsAPI.list().then((res: any) => {
      if (res?.patients?.length) {
        setPatientList(res.patients.map((p: any) => ({ id: p.id, name: p.name })))
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    loadConversation()
    loadData()
  }, [loadData])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')
    await sendMessage(trimmed)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // Book appointment — persists to D1
  const handleBookAppointment = async () => {
    if (!bookingDate || !bookingTime) return
    setBookingLoading(true)
    setBookingError('')
    try {
      const result = await appointmentsAPI.create({
        patient_id: PATIENT_ID,
        department: bookingDept,
        date: bookingDate,
        time: bookingTime,
        type: 'consultation',
        notes: `Booked via V-Care by patient`,
      })
      if (result?.appointment) {
        setBookingConfirmed(true)
        // Add to local appointments list
        setPatientApts(prev => [...prev, result.appointment])
      } else {
        setBookingError('Failed to book appointment. Please try again.')
      }
    } catch {
      setBookingError('Failed to book appointment. Please try again.')
    }
    setBookingLoading(false)
  }

  // Symptom check — calls API
  const handleSymptomCheck = async () => {
    if (!scSystem || scSymptoms.length === 0 || !scDuration || scSeverity === 0) return
    setScLoading(true)
    try {
      const severityMap: Record<number, string> = { 1: 'mild', 2: 'mild', 3: 'moderate', 4: 'severe', 5: 'severe' }
      const res = await chatAPI.symptomCheck({
        symptoms: scSymptoms,
        duration: scDuration,
        severity: severityMap[scSeverity] || 'moderate',
      })
      if (res?.assessment) {
        setScResult(res.assessment as TriageAssessment)
      }
    } catch {
      // Fallback to local triage
      setScResult(null)
    }
    setScLoading(false)
    setScStep(4)
  }

  // Profile data from D1
  const profileName = patientProfile?.name || 'Loading...'
  const profileAge = patientProfile?.age || ''
  const profileGender = patientProfile?.gender || ''
  const profileBloodGroup = patientProfile?.blood_group || '—'
  const profileInsurance = patientProfile?.insurance_provider || patientProfile?.insurance_type || '—'
  const profileConditions = patientProfile?.chronic_conditions?.split(',').map(c => c.trim()).filter(Boolean) || []
  const profileInitials = profileName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  const handleCancelAppointment = async (aptId: string) => {
    try {
      await appointmentsAPI.update(aptId, { status: 'cancelled' })
      setPatientApts(prev => prev.map(a => a.id === aptId ? { ...a, status: 'cancelled' } : a))
    } catch (err) { console.error('Failed to cancel appointment:', err) }
  }

  // Upcoming appointments only
  const upcomingApts = patientApts.filter(a => {
    const d = new Date(a.date)
    return d >= new Date(new Date().toDateString()) && a.status !== 'completed' && a.status !== 'cancelled'
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-3">
      {/* Patient Selector */}
      <div className="flex items-center gap-3 px-1">
        <label className="text-sm font-medium text-text dark:text-text-dark">Patient:</label>
        <select
          value={selectedPatientId}
          onChange={e => { setSelectedPatientId(e.target.value); setPatientProfile(null); setPatientMeds([]); setPatientClaims([]); setPatientApts([]) }}
          className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm min-w-[200px]"
        >
          {patientList.length > 0 ? patientList.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
          )) : (
            <option value="pat-001">Ramesh Kumar (pat-001)</option>
          )}
        </select>
        {patientProfile && <span className="text-xs text-muted">{profileGender}, Age {profileAge} | {profileInsurance}</span>}
      </div>
    <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'auto', minHeight: 'calc(100vh - 8rem)' }}>
      {/* Chat Panel — Left Side */}
      <div className="flex w-full lg:w-3/5 flex-col rounded-xl border border-border bg-white shadow-sm dark:border-border-dark dark:bg-surface-dark" style={{ minHeight: '60vh' }}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 dark:border-border-dark">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-semibold text-text dark:text-text-dark">V-Care AI Assistant</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
                  <Shield className="h-2.5 w-2.5" />
                  24/7
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-success font-medium">Online</span>
                {patientProfile && <span className="text-xs text-muted ml-2">Patient: {profileName}</span>}
              </div>
            </div>
          </div>
          <button onClick={clearChat}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-gray-100 hover:text-error dark:hover:bg-white/10"
            title="Clear chat">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Query Suggestions */}
        <div className="border-t border-border px-5 py-2 dark:border-border-dark">
          <p className="text-[10px] font-medium text-muted mb-1.5 flex items-center gap-1">
            <Brain className="h-3 w-3 text-primary" /> Quick Queries
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {['What are my BP trends?', 'Side effects of Metformin?', 'My upcoming appointments', 'My insurance claim status', 'Diabetes management tips'].map((q) => (
              <button key={q} onClick={() => sendMessage(q)}
                className="shrink-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 px-3 py-1 text-[11px] font-medium text-primary transition-all hover:from-primary/20 hover:to-accent/20 dark:border-primary/30">
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border px-5 py-2.5 dark:border-border-dark">
          {quickReplies.map((text) => (
            <button key={text} onClick={() => sendMessage(text)}
              className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/20">
              {text}
            </button>
          ))}
        </div>

        <div className="border-t border-border px-4 py-3 dark:border-border-dark">
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="Ask about health, appointments, medications, claims..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark" />
            <button onClick={handleSend} disabled={!input.trim()}
              className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
                input.trim() ? 'bg-primary text-white hover:bg-primary/90 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600')}>
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted">
            V-Care provides AI-based suggestions only. Always consult a doctor for medical decisions.
          </p>
        </div>
      </div>

      {/* Right Side Panel — Patient Context */}
      <div className="flex w-full lg:w-2/5 flex-col gap-4 overflow-y-auto">

        {/* Patient Profile — from D1 */}
        <Card header={<h3 className="font-display font-semibold text-text dark:text-text-dark">Patient Profile</h3>}>
          {contextLoading ? (
            <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted" /></div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-bold text-lg">{profileInitials}</div>
                <div>
                  <h4 className="font-semibold text-text dark:text-text-dark">{profileName}</h4>
                  <p className="text-sm text-muted">Age {profileAge} · {profileGender}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Blood Group</p>
                  <p className="text-sm font-bold text-text dark:text-text-dark">{profileBloodGroup}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Insurance</p>
                  <p className="text-sm font-bold text-text dark:text-text-dark">{profileInsurance}</p>
                </div>
              </div>
              {profileConditions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profileConditions.map((c) => (
                    <Badge key={c} variant="warning" size="sm">{c}</Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>

        {/* Symptom Checker — calls /api/chat/symptom-check */}
        <Card header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-text dark:text-text-dark">Symptom Checker</h3>
            </div>
            {scStep > 1 && scStep < 4 && (
              <span className="text-[10px] font-medium text-muted">Step {scStep} of 4</span>
            )}
          </div>
        }>
          {/* Step 1: Body System Selection */}
          {scStep === 1 && (
            <div>
              <p className="text-xs text-muted mb-3">Select the body system related to your symptoms:</p>
              <div className="grid grid-cols-2 gap-2">
                {bodySystems.map((sys) => (
                  <button key={sys.id} onClick={() => { setScSystem(sys); setScStep(2) }}
                    className="flex items-center gap-2 rounded-lg border border-border dark:border-border-dark px-3 py-2.5 text-left text-xs font-medium text-text dark:text-text-dark transition-all hover:border-primary hover:bg-primary/5 hover:text-primary">
                    <sys.icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="leading-tight">{sys.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Symptom Selection */}
          {scStep === 2 && scSystem && (() => {
            // Emergency symptom detection
            const emergencySymptoms = ['Chest Pain', 'Chest Tightness', 'Shortness of Breath', 'Fainting', 'Seizures', 'Vision Changes']
            const emergencyCombos: [string, string][] = [
              ['Chest Pain', 'Shortness of Breath'],
              ['Chest Tightness', 'Rapid Heartbeat'],
              ['Numbness', 'Vision Changes'],
              ['Fainting', 'Rapid Heartbeat'],
              ['Seizures', 'Memory Loss'],
            ]
            const hasEmergencySymptom = scSymptoms.some(s => emergencySymptoms.includes(s)) && scSymptoms.length >= 2
            const hasEmergencyCombo = emergencyCombos.some(([a, b]) => scSymptoms.includes(a) && scSymptoms.includes(b))
            const isEmergency = hasEmergencySymptom || hasEmergencyCombo

            return (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => { setScStep(1); setScSymptoms([]) }} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
                <span className="text-xs text-muted">|</span>
                <span className="text-xs font-medium text-text dark:text-text-dark">{scSystem.label}</span>
              </div>

              {/* Emergency Triage Alert */}
              {isEmergency && (
                <div className="mb-3 rounded-lg border-2 border-red-400 bg-red-50 dark:bg-red-900/20 p-3 animate-pulse">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-bold text-red-700 dark:text-red-400 uppercase">Emergency Triage Alert</span>
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-300 mb-2">
                    Your symptoms may indicate a medical emergency. Please seek immediate medical attention.
                  </p>
                  <div className="flex gap-2">
                    <a href="tel:108" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700">
                      <Phone className="h-3.5 w-3.5" /> Call 108 (Ambulance)
                    </a>
                    <a href="tel:112" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300">
                      <Phone className="h-3.5 w-3.5" /> Call 112 (Emergency)
                    </a>
                  </div>
                  <div className="mt-2 text-[10px] text-red-600 dark:text-red-400">
                    <strong>While waiting:</strong> Stay calm, do not eat/drink, lie down if dizzy, loosen tight clothing
                  </div>
                </div>
              )}

              <p className="text-xs text-muted mb-3">Select all symptoms that apply:</p>
              <div className="space-y-2">
                {scSystem.symptoms.map((symptom) => {
                  const isDangerous = emergencySymptoms.includes(symptom)
                  return (
                  <label key={symptom} className={cn('flex items-center gap-2.5 cursor-pointer rounded-lg border px-3 py-2 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5',
                    isDangerous && scSymptoms.includes(symptom) ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10' : 'border-border dark:border-border-dark')}>
                    <input type="checkbox" checked={scSymptoms.includes(symptom)} onChange={() => toggleSymptom(symptom)}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/20" />
                    <span className="text-xs font-medium text-text dark:text-text-dark">{symptom}</span>
                    {isDangerous && <AlertTriangle className="h-3 w-3 text-red-400 ml-auto" />}
                  </label>
                  )
                })}
              </div>
              <button onClick={() => { if (scSymptoms.length > 0) setScStep(3) }} disabled={scSymptoms.length === 0}
                className={cn('mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors',
                  scSymptoms.length > 0 ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600')}>
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            )
          })()}

          {/* Step 3: Duration & Severity */}
          {scStep === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setScStep(2)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
                <span className="text-xs text-muted">|</span>
                <span className="text-xs font-medium text-text dark:text-text-dark">Duration & Severity</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1.5">How long have you had these symptoms?</label>
                  <select value={scDuration} onChange={(e) => setScDuration(e.target.value)}
                    className="w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select duration...</option>
                    {durationOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1.5">Severity level</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button key={level} onClick={() => setScSeverity(level)}
                        className={cn('flex-1 flex flex-col items-center gap-1 rounded-lg border py-2 transition-all text-[10px] font-medium',
                          scSeverity === level ? `${severityLabels[level].color} text-white border-transparent` : 'border-border dark:border-border-dark text-muted hover:border-primary/40')}>
                        <span className="text-sm font-bold">{level}</span>
                        <span className="leading-none">{severityLabels[level].label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1.5">Additional notes (optional)</label>
                  <textarea value={scNotes} onChange={(e) => setScNotes(e.target.value)} placeholder="Describe any other relevant details..." rows={2}
                    className="w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </div>
              </div>
              <button onClick={handleSymptomCheck} disabled={!scDuration || scSeverity === 0 || scLoading}
                className={cn('mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors',
                  scDuration && scSeverity > 0 && !scLoading ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600')}>
                {scLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...</> : <>Get AI Assessment <ArrowRight className="h-3.5 w-3.5" /></>}
              </button>
            </div>
          )}

          {/* Step 4: AI Triage Result — from API */}
          {scStep === 4 && scSystem && (() => {
            const result = scResult
            if (!result) {
              return (
                <div className="text-center py-4">
                  <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
                  <p className="text-sm text-text dark:text-text-dark">Could not complete assessment. Please try again or consult a doctor.</p>
                  <button onClick={resetSymptomChecker} className="mt-3 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                    Start Over
                  </button>
                </div>
              )
            }

            const colorMap: Record<string, { text: string; bg: string; border: string }> = {
              green: { text: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
              yellow: { text: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
              orange: { text: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
              red: { text: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
            }
            const colors = colorMap[result.triage_color] || colorMap.yellow

            return (
              <div>
                {/* Triage Level */}
                <div className={cn('rounded-lg border p-3 mb-3', colors.bg, colors.border)}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {result.triage_level === 'emergency' && <Phone className={cn('h-5 w-5', colors.text)} />}
                    {result.triage_level === 'high' && <AlertTriangle className={cn('h-5 w-5', colors.text)} />}
                    {result.triage_level === 'moderate' && <Calendar className={cn('h-5 w-5', colors.text)} />}
                    {result.triage_level === 'low' && <ShieldCheck className={cn('h-5 w-5', colors.text)} />}
                    <span className={cn('text-sm font-bold uppercase', colors.text)}>{result.triage_level} Risk</span>
                  </div>
                  <p className="text-xs text-text dark:text-text-dark">Seek care within: <strong>{result.seek_care_within}</strong></p>
                </div>

                {/* Summary */}
                <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-3 mb-3 space-y-1.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Assessment Summary</p>
                  <p className="text-xs text-text dark:text-text-dark"><span className="text-muted">System:</span> {scSystem.label}</p>
                  <p className="text-xs text-text dark:text-text-dark"><span className="text-muted">Symptoms:</span> {scSymptoms.join(', ')}</p>
                  <p className="text-xs text-text dark:text-text-dark"><span className="text-muted">Duration:</span> {scDuration}</p>
                </div>

                {/* Possible Conditions */}
                {result.possible_conditions && result.possible_conditions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">Possible Conditions</p>
                    <div className="space-y-2">
                      {result.possible_conditions.map((cond, i) => (
                        <div key={i} className="rounded-lg border border-border dark:border-border-dark p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-text dark:text-text-dark">{cond.name}</span>
                            <Badge variant={cond.likelihood === 'high' ? 'error' : cond.likelihood === 'moderate' ? 'warning' : 'neutral'} size="sm">
                              {cond.likelihood}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted">{cond.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="mb-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">Recommendations</p>
                  <ul className="space-y-1.5">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-text dark:text-text-dark">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Emergency Signs */}
                {result.emergency_signs && result.emergency_signs.length > 0 && (
                  <div className="mb-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1.5">Seek immediate help if:</p>
                    <ul className="space-y-1">
                      {result.emergency_signs.map((sign, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-red-700 dark:text-red-300">
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                          <span>{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {(result.triage_level === 'moderate' || result.triage_level === 'high') && (
                    <button onClick={() => { resetSymptomChecker(); document.getElementById('book-appointment-card')?.scrollIntoView({ behavior: 'smooth' }) }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
                      <CalendarPlus className="h-3.5 w-3.5" /> Book Appointment
                    </button>
                  )}
                  {result.triage_level === 'emergency' && (
                    <a href="tel:108" className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors">
                      <Phone className="h-3.5 w-3.5" /> Call 108 - Emergency
                    </a>
                  )}
                  <button onClick={resetSymptomChecker}
                    className="w-full py-2.5 rounded-lg bg-gray-100 dark:bg-white/10 text-muted text-xs font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors">
                    Start New Assessment
                  </button>
                </div>

                <p className="mt-3 text-[10px] text-muted text-center leading-relaxed">{result.disclaimer}</p>
              </div>
            )
          })()}
        </Card>

        {/* Recent Vitals — from D1 */}
        <Card header={<div className="flex items-center gap-2"><Wind className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-text dark:text-text-dark">Recent Vitals</h3></div>} padding="sm">
          {contextLoading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {patientVitals.map((vital) => (
                  <div key={vital.label} className="flex items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2.5 dark:border-border-dark dark:bg-surface-dark">
                    <vital.icon className={cn('h-4 w-4 shrink-0', vital.color)} />
                    <div>
                      <p className="text-[10px] font-medium text-muted">{vital.label}</p>
                      <p className="text-sm font-bold text-text dark:text-text-dark">{vital.value}<span className="ml-0.5 text-[10px] font-normal text-muted">{vital.unit}</span></p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vitals Trend Mini-Charts */}
              {!vitalsLoading && (vitalsTrend.bp.length > 0 || vitalsTrend.hr.length > 0) && (
                <div className="mt-4 space-y-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">7-Day Trends</p>

                  {vitalsTrend.bp.length > 0 && (
                    <div className="rounded-lg border border-border bg-white p-3 dark:border-border-dark dark:bg-surface-dark">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-3 w-3 text-error" />
                          <span className="text-[10px] font-medium text-text dark:text-text-dark">Blood Pressure (Systolic)</span>
                        </div>
                        <span className="text-[9px] text-muted">{vitalsTrend.bp.length} readings</span>
                      </div>
                      <div className="flex items-end gap-1.5" style={{ height: '40px' }}>
                        {(() => {
                          const data = vitalsTrend.bp.map(r => ({ val: r.value, label: new Date(r.date).toLocaleDateString('en-IN', { weekday: 'narrow' }) }))
                          const maxVal = Math.max(...data.map(d => d.val), 160)
                          const minVal = Math.min(...data.map(d => d.val), 100)
                          const range = maxVal - minVal || 1
                          return data.map((bar, i) => {
                            const pct = Math.max(20, ((bar.val - minVal) / range) * 80 + 20)
                            const color = bar.val > 140 ? 'bg-red-400' : bar.val > 130 ? 'bg-yellow-400' : 'bg-green-400'
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${bar.val} mmHg`}>
                                <div className={cn('w-full rounded-sm', color)} style={{ height: `${pct}%` }} />
                                <span className="text-[8px] text-muted">{bar.label}</span>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </div>
                  )}

                  {vitalsTrend.hr.length > 0 && (
                    <div className="rounded-lg border border-border bg-white p-3 dark:border-border-dark dark:bg-surface-dark">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Heart className="h-3 w-3 text-pink-500" />
                          <span className="text-[10px] font-medium text-text dark:text-text-dark">Heart Rate</span>
                        </div>
                        <span className="text-[9px] text-muted">{vitalsTrend.hr.length} readings</span>
                      </div>
                      <div className="flex items-end gap-1.5" style={{ height: '40px' }}>
                        {(() => {
                          const data = vitalsTrend.hr.map(r => ({ val: r.value, label: new Date(r.date).toLocaleDateString('en-IN', { weekday: 'narrow' }) }))
                          const maxVal = Math.max(...data.map(d => d.val), 100)
                          const minVal = Math.min(...data.map(d => d.val), 50)
                          const range = maxVal - minVal || 1
                          return data.map((bar, i) => {
                            const pct = Math.max(20, ((bar.val - minVal) / range) * 80 + 20)
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${bar.val} bpm`}>
                                <div className="w-full rounded-sm bg-primary" style={{ height: `${pct}%` }} />
                                <span className="text-[8px] text-muted">{bar.label}</span>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Card>

        {/* Lab Results */}
        <Card header={<div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-text dark:text-text-dark">Recent Lab Results</h3></div>} padding="sm">
          <div className="space-y-2 p-2">
            {[
              { test: 'HbA1c', value: '8.2%', ref: '< 6.5%', status: 'high' as const, date: '2026-03-20', interpretation: 'Above target — indicates suboptimal glycemic control over past 3 months' },
              { test: 'Fasting Blood Sugar', value: '186 mg/dL', ref: '70-100 mg/dL', status: 'high' as const, date: '2026-03-20', interpretation: 'Elevated — correlates with HbA1c findings' },
              { test: 'Creatinine', value: '1.1 mg/dL', ref: '0.7-1.3 mg/dL', status: 'normal' as const, date: '2026-03-20', interpretation: 'Within normal range — kidney function preserved' },
              { test: 'Total Cholesterol', value: '210 mg/dL', ref: '< 200 mg/dL', status: 'high' as const, date: '2026-03-18', interpretation: 'Borderline high — lipid management recommended' },
              { test: 'TSH', value: '3.2 mIU/L', ref: '0.5-5.0 mIU/L', status: 'normal' as const, date: '2026-03-15', interpretation: 'Normal thyroid function' },
              { test: 'Hemoglobin', value: '13.8 g/dL', ref: '13.5-17.5 g/dL', status: 'normal' as const, date: '2026-03-15', interpretation: 'Normal — no anemia' },
            ].map((lab) => (
              <div key={lab.test} className="rounded-lg border border-border dark:border-border-dark p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-text dark:text-text-dark">{lab.test}</span>
                  <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase',
                    lab.status === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    lab.status === 'low' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  )}>{lab.status}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={cn('text-sm font-bold', lab.status === 'normal' ? 'text-success' : 'text-error')}>{lab.value}</span>
                  <span className="text-[10px] text-muted">Ref: {lab.ref}</span>
                  <span className="text-[9px] text-muted ml-auto">{lab.date}</span>
                </div>
                <p className="text-[10px] text-muted mt-1 italic">{lab.interpretation}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Claims Status — from D1 */}
        <Card header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-text dark:text-text-dark">My Claims</h3>
            </div>
            {patientClaims.length > 0 && (
              <span className="text-[10px] font-medium text-muted">{patientClaims.length} claims</span>
            )}
          </div>
        }>
          {contextLoading ? (
            <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted" /></div>
          ) : patientClaims.length === 0 ? (
            <p className="text-xs text-muted py-2">No claims found for this patient.</p>
          ) : (
            <div className="space-y-2">
              {patientClaims.slice(0, 5).map((claim) => (
                <div key={claim.id} className="rounded-lg border border-border dark:border-border-dark p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-semibold text-text dark:text-text-dark">{claim.claim_number}</span>
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold', claimStatusColors[claim.status] || claimStatusColors.draft)}>
                      {claim.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted truncate">{claim.diagnosis}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-text dark:text-text-dark">
                      <IndianRupee className="h-3 w-3" />
                      <span className="font-semibold">₹{Number(claim.claimed_amount).toLocaleString('en-IN')}</span>
                      {claim.approved_amount && claim.approved_amount > 0 && (
                        <span className="text-[10px] text-success ml-1">(Approved: ₹{Number(claim.approved_amount).toLocaleString('en-IN')})</span>
                      )}
                    </div>
                    <span className="text-[9px] text-muted">{claim.payer_scheme || ''}</span>
                  </div>
                </div>
              ))}
              {patientClaims.length > 5 && (
                <p className="text-[10px] text-muted text-center">+ {patientClaims.length - 5} more claims</p>
              )}
            </div>
          )}
        </Card>

        {/* Upcoming Appointments — from D1 */}
        <Card header={<div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-text dark:text-text-dark">Upcoming Appointments</h3></div>} padding="none">
          {contextLoading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted" /></div>
          ) : upcomingApts.length === 0 ? (
            <p className="text-xs text-muted px-5 py-4">No upcoming appointments. Book one below.</p>
          ) : (
            <ul className="divide-y divide-border dark:divide-border-dark">
              {upcomingApts.slice(0, 3).map((apt) => (
                <li key={apt.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text dark:text-text-dark">{apt.doctor_name || 'Doctor'}</p>
                    <Badge variant="info" size="sm">{apt.department}</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(apt.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {apt.time}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <Badge variant={apt.status === 'scheduled' ? 'info' : apt.status === 'confirmed' ? 'success' : 'neutral'} size="sm">{apt.status}</Badge>
                    {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                      <button onClick={() => handleCancelAppointment(apt.id)} className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium">Cancel</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Book Appointment — persists to D1 */}
        <Card header={<div id="book-appointment-card" className="flex items-center gap-2"><CalendarPlus className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-text dark:text-text-dark">Book Appointment</h3></div>}>
          {bookingConfirmed ? (
            <div className="py-3">
              <div className="text-center">
                <CheckCircle className="h-10 w-10 text-success mx-auto mb-2" />
                <p className="text-sm font-semibold text-text dark:text-text-dark">Appointment Booked!</p>
                <p className="text-xs text-muted mt-1">Saved to database. You will receive a confirmation.</p>
              </div>
              <div className="mt-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 p-3 text-left space-y-2">
                <div className="flex items-start gap-2">
                  <Stethoscope className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted">Department</p>
                    <p className="text-xs font-medium text-text dark:text-text-dark">{bookingDept}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted">Date & Time</p>
                    <p className="text-xs font-medium text-text dark:text-text-dark">
                      {new Date(bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {bookingTime}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={() => { setBookingConfirmed(false); setBookingDate(''); setBookingTime(''); setBookingDept('Cardiology') }}
                className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                Book Another
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1">Department</label>
                <select value={bookingDept} onChange={(e) => setBookingDept(e.target.value)}
                  className="w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {['Cardiology', 'General Medicine', 'Orthopedics', 'Neurology', 'Pulmonology', 'Gynecology', 'ENT'].map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1">Date</label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1">Time Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((slot) => (
                    <button key={slot} onClick={() => setBookingTime(slot)}
                      className={cn('rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                        bookingTime === slot ? 'border-primary bg-primary/10 text-primary' : 'border-border dark:border-border-dark text-muted hover:border-primary/40 hover:text-primary')}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              {bookingError && <p className="text-xs text-error">{bookingError}</p>}
              <button onClick={handleBookAppointment} disabled={!bookingDate || !bookingTime || bookingLoading}
                className={cn('w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5',
                  bookingDate && bookingTime && !bookingLoading ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600')}>
                {bookingLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Booking...</> : 'Book Now'}
              </button>
            </div>
          )}
        </Card>

        {/* Active Medications — from D1 */}
        <Card header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-text dark:text-text-dark">Active Medications</h3>
            </div>
            {patientMeds.length > 0 && (
              <span className="text-[10px] font-medium text-muted">{patientMeds.filter(m => m.status === 'active').length} active</span>
            )}
          </div>
        } padding="none">
          {contextLoading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted" /></div>
          ) : patientMeds.length === 0 ? (
            <p className="text-xs text-muted px-5 py-4">No medications found.</p>
          ) : (
            <ul className="divide-y divide-border dark:divide-border-dark">
              {patientMeds.filter(m => m.status === 'active').map((med) => (
                <li key={med.id || med.name} className="px-5 py-3">
                  <p className="text-sm font-semibold text-text dark:text-text-dark">{med.name} {med.dosage}</p>
                  <p className="mt-0.5 text-xs text-muted">{med.frequency}</p>
                  {med.start_date && (
                    <p className="mt-0.5 text-[10px] text-muted">
                      Since {new Date(med.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {med.end_date && ` · Until ${new Date(med.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Patient Feedback */}
        <Card header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-text dark:text-text-dark">Feedback</h3>
            </div>
            {npsScore > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted">NPS</span>
                <span className={cn('inline-flex items-center justify-center h-6 w-10 rounded-full text-[10px] font-bold',
                  npsScore >= 50 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400')}>
                  {npsScore}
                </span>
              </div>
            )}
          </div>
        }>
          {feedbackSent ? (
            <div className="text-center py-2">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm font-medium text-text dark:text-text-dark">Thank you!</p>
              <p className="text-xs text-muted mt-1">Your feedback has been submitted.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setFeedbackRating(n)} className="p-0.5">
                      <Star className={cn('h-6 w-6 transition-colors', n <= feedbackRating ? 'text-warning fill-warning' : 'text-gray-300 dark:text-gray-600')} />
                    </button>
                  ))}
                </div>
                {feedbackRating > 0 && (
                  <span className="text-[10px] font-medium text-muted">
                    {feedbackRating === 1 ? 'Poor' : feedbackRating === 2 ? 'Fair' : feedbackRating === 3 ? 'Good' : feedbackRating === 4 ? 'Very Good' : 'Excellent'}
                  </span>
                )}
              </div>
              <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Share your experience..." rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              <button
                onClick={async () => {
                  if (feedbackRating === 0) return
                  setFeedbackSubmitting(true)
                  try {
                    await fetch('/api/analytics/satisfaction', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ rating: feedbackRating, comment: feedbackText, patient_id: PATIENT_ID, department: 'General' }),
                    }).catch(() => {})
                  } finally {
                    setFeedbackSubmitting(false)
                    setFeedbackSent(true)
                  }
                }}
                disabled={feedbackRating === 0 || feedbackSubmitting}
                className={cn('w-full py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
                  feedbackRating > 0 && !feedbackSubmitting ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed')}>
                {feedbackSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                Submit Feedback
              </button>
            </div>
          )}

          {satisfactionData && (
            <div className="mt-3 border-t border-border dark:border-border-dark pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">Hospital Satisfaction</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-gray-50 dark:bg-white/5 px-2.5 py-2 text-center">
                  <p className="text-lg font-bold text-primary">{satisfactionData.avg_rating}</p>
                  <p className="text-[9px] text-muted">Avg Rating</p>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-white/5 px-2.5 py-2 text-center">
                  <p className="text-lg font-bold text-primary">{satisfactionData.nps_score}</p>
                  <p className="text-[9px] text-muted">NPS Score</p>
                </div>
              </div>
            </div>
          )}
        </Card>

      </div>
    </div>
    </div>
  )
}
