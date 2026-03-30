import { useState, useRef, useEffect } from 'react'
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
  Video,
  Star,
  MessageCircle,
  CheckSquare,
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
} from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { patients as patientsAPI } from '../lib/api'
import type { ChatMessage } from '../types'
import type { Vital, Medication, Appointment } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { cn } from '../lib/utils'

const quickReplies = [
  'Book Appointment',
  'Check Symptoms',
  'Medication Reminder',
  'Talk to Doctor',
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

function getTriageResult(severity: number) {
  if (severity <= 2) {
    return {
      level: 'Self-Care',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-500',
      advice: 'Your symptoms suggest a mild condition that can likely be managed at home.',
      steps: [
        'Rest and stay hydrated',
        'Over-the-counter medications as appropriate',
        'Monitor symptoms for any changes',
        'Consult a doctor if symptoms persist beyond 5 days',
      ],
      showBooking: false,
    }
  }
  if (severity === 3) {
    return {
      level: 'Routine',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-500',
      advice: 'Your symptoms warrant medical attention. Please book an appointment within 1 week.',
      steps: [
        'Schedule a consultation with your doctor',
        'Keep a symptom diary until your appointment',
        'Take prescribed medications as directed',
        'Avoid activities that worsen symptoms',
      ],
      showBooking: true,
    }
  }
  if (severity === 4) {
    return {
      level: 'Urgent',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      iconColor: 'text-orange-500',
      advice: 'Your symptoms require prompt medical attention. See a doctor within 24 hours.',
      steps: [
        'Visit your nearest clinic or hospital today',
        'Do not ignore worsening symptoms',
        'Bring a list of current medications',
        'Have someone accompany you if possible',
      ],
      showBooking: true,
    }
  }
  return {
    level: 'Emergency',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
    advice: 'Your symptoms indicate a potentially serious condition. Seek emergency care immediately.',
    steps: [
      'Call 108 (Emergency Ambulance) immediately',
      'Go to the nearest Emergency Room',
      'Do NOT drive yourself — ask for help',
      'Bring your ID and insurance documents',
    ],
    showBooking: false,
  }
}

const defaultVitals = [
  { label: 'Blood Pressure', value: '128/82', unit: 'mmHg', icon: Activity, color: 'text-error' },
  { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: 'text-pink-500' },
  { label: 'SpO2', value: '98', unit: '%', icon: Droplets, color: 'text-accent' },
  { label: 'Blood Glucose', value: '118', unit: 'mg/dL', icon: Activity, color: 'text-warning' },
  { label: 'Temperature', value: '36.6', unit: '\u00B0C', icon: Thermometer, color: 'text-secondary' },
  { label: 'Weight', value: '78', unit: 'kg', icon: Weight, color: 'text-success' },
]

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
        <p className={cn('mt-1.5 text-[10px]', isUser ? 'text-white/60' : 'text-muted')}>
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
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

export default function VCare() {
  const { messages, isTyping, sendMessage, clearChat, loadConversation } = useChatStore()
  const [input, setInput] = useState('')
  const [patientVitals, setPatientVitals] = useState(defaultVitals)
  const [patientMeds, setPatientMeds] = useState<{ name: string; dosage: string; timing: string }[]>([
    { name: 'Metformin 500mg', dosage: '1 tablet', timing: 'After breakfast & dinner' },
    { name: 'Amlodipine 5mg', dosage: '1 tablet', timing: 'Morning' },
    { name: 'Atorvastatin 10mg', dosage: '1 tablet', timing: 'Bedtime' },
    { name: 'Aspirin 75mg', dosage: '1 tablet', timing: 'After lunch' },
  ])
  const [patientApts, setPatientApts] = useState([
    { date: '30 Mar 2026', doctor: 'Dr. Anil Kapoor', department: 'Cardiology', time: '10:00 AM' },
    { date: '02 Apr 2026', doctor: 'Dr. Meera Joshi', department: 'Internal Medicine', time: '10:30 AM' },
    { date: '10 Apr 2026', doctor: 'Dr. Kavita Nair', department: 'Pulmonology', time: '11:00 AM' },
  ])
  const [contextLoading, setContextLoading] = useState(true)
  const [teleLink, setTeleLink] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [medsTaken, setMedsTaken] = useState<Record<number, boolean>>({})
  const [bookingDept, setBookingDept] = useState('Cardiology')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  // Symptom Checker state
  const [scStep, setScStep] = useState(1)
  const [scSystem, setScSystem] = useState<BodySystem | null>(null)
  const [scSymptoms, setScSymptoms] = useState<string[]>([])
  const [scDuration, setScDuration] = useState('')
  const [scSeverity, setScSeverity] = useState(0)
  const [scNotes, setScNotes] = useState('')

  const resetSymptomChecker = () => {
    setScStep(1)
    setScSystem(null)
    setScSymptoms([])
    setScDuration('')
    setScSeverity(0)
    setScNotes('')
  }

  const toggleSymptom = (symptom: string) => {
    setScSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    )
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadConversation()
    // Load patient context from API
    async function loadContext() {
      try {
        const { vitals, medications, appointments } = await patientsAPI.get('pat-001')
        if (vitals && vitals.length > 0) {
          const vitalMap: Record<string, { value: string; unit: string }> = {}
          for (const v of vitals as Vital[]) {
            vitalMap[v.type] = { value: String(v.value), unit: v.unit }
          }
          const iconMap: Record<string, { icon: typeof Activity; color: string; label: string }> = {
            bp_systolic: { icon: Activity, color: 'text-error', label: 'Blood Pressure' },
            heart_rate: { icon: Heart, color: 'text-pink-500', label: 'Heart Rate' },
            spo2: { icon: Droplets, color: 'text-accent', label: 'SpO2' },
            blood_sugar: { icon: Activity, color: 'text-warning', label: 'Blood Glucose' },
            temperature: { icon: Thermometer, color: 'text-secondary', label: 'Temperature' },
            weight: { icon: Weight, color: 'text-success', label: 'Weight' },
          }
          const mapped = Object.entries(vitalMap).filter(([k]) => iconMap[k]).map(([k, v]) => ({
            ...iconMap[k], value: v.value, unit: v.unit,
          }))
          if (mapped.length > 0) setPatientVitals(mapped)
        }
        if (medications && (medications as Medication[]).length > 0) {
          setPatientMeds((medications as Medication[]).map(m => ({
            name: `${m.name} ${m.dosage}`, dosage: '1 tablet', timing: m.frequency,
          })))
        }
        if (appointments && (appointments as Appointment[]).length > 0) {
          setPatientApts((appointments as Appointment[]).map(a => ({
            date: a.date, doctor: a.doctor_name || 'Doctor', department: a.department, time: a.time,
          })))
        }
      } catch {
        // Keep defaults
      }
      setContextLoading(false)
    }
    loadContext()
  }, [])

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

  return (
    <div className="flex gap-4" style={{ height: 'calc(100vh - 8rem)' }}>
      <div className="flex w-3/5 flex-col rounded-xl border border-border bg-white shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 dark:border-border-dark">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-text dark:text-text-dark">V-Care AI Assistant</h2>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-success font-medium">Online</span>
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
              onKeyDown={handleKeyDown} placeholder="Type your message..."
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

      <div className="flex w-2/5 flex-col gap-4 overflow-y-auto">
        <Card header={<h3 className="font-display font-semibold text-text dark:text-text-dark">Patient Profile</h3>}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-bold text-lg">RK</div>
            <div>
              <h4 className="font-semibold text-text dark:text-text-dark">Rajesh Kumar</h4>
              <p className="text-sm text-muted">Age 58 &middot; Male</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Blood Group</p>
              <p className="text-sm font-bold text-text dark:text-text-dark">O+</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Insurance</p>
              <p className="text-sm font-bold text-text dark:text-text-dark">Star Health</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="warning" size="sm">Type 2 Diabetes</Badge>
            <Badge variant="error" size="sm">Hypertension</Badge>
            <Badge variant="neutral" size="sm">Penicillin Allergy</Badge>
          </div>
        </Card>

        {/* Symptom Checker */}
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
                  <button
                    key={sys.id}
                    onClick={() => { setScSystem(sys); setScStep(2) }}
                    className="flex items-center gap-2 rounded-lg border border-border dark:border-border-dark px-3 py-2.5 text-left text-xs font-medium text-text dark:text-text-dark transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <sys.icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="leading-tight">{sys.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Symptom Selection */}
          {scStep === 2 && scSystem && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => { setScStep(1); setScSymptoms([]) }} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
                <span className="text-xs text-muted">|</span>
                <span className="text-xs font-medium text-text dark:text-text-dark">{scSystem.label}</span>
              </div>
              <p className="text-xs text-muted mb-3">Select all symptoms that apply:</p>
              <div className="space-y-2">
                {scSystem.symptoms.map((symptom) => (
                  <label key={symptom} className="flex items-center gap-2.5 cursor-pointer rounded-lg border border-border dark:border-border-dark px-3 py-2 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="checkbox"
                      checked={scSymptoms.includes(symptom)}
                      onChange={() => toggleSymptom(symptom)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <span className="text-xs font-medium text-text dark:text-text-dark">{symptom}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => { if (scSymptoms.length > 0) setScStep(3) }}
                disabled={scSymptoms.length === 0}
                className={cn(
                  'mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors',
                  scSymptoms.length > 0
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                )}
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

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
                {/* Duration */}
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1.5">How long have you had these symptoms?</label>
                  <select
                    value={scDuration}
                    onChange={(e) => setScDuration(e.target.value)}
                    className="w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select duration...</option>
                    {durationOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1.5">Severity level</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setScSeverity(level)}
                        className={cn(
                          'flex-1 flex flex-col items-center gap-1 rounded-lg border py-2 transition-all text-[10px] font-medium',
                          scSeverity === level
                            ? `${severityLabels[level].color} text-white border-transparent`
                            : 'border-border dark:border-border-dark text-muted hover:border-primary/40'
                        )}
                      >
                        <span className="text-sm font-bold">{level}</span>
                        <span className="leading-none">{severityLabels[level].label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1.5">Additional notes (optional)</label>
                  <textarea
                    value={scNotes}
                    onChange={(e) => setScNotes(e.target.value)}
                    placeholder="Describe any other relevant details..."
                    rows={2}
                    className="w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>

              <button
                onClick={() => { if (scDuration && scSeverity > 0) setScStep(4) }}
                disabled={!scDuration || scSeverity === 0}
                className={cn(
                  'mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors',
                  scDuration && scSeverity > 0
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                )}
              >
                Get AI Assessment <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Step 4: AI Triage Result */}
          {scStep === 4 && scSystem && (() => {
            const triage = getTriageResult(scSeverity)
            return (
              <div>
                {/* Triage Level Badge */}
                <div className={cn('rounded-lg border p-3 mb-3', triage.bgColor, triage.borderColor)}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {scSeverity <= 2 && <ShieldCheck className={cn('h-5 w-5', triage.iconColor)} />}
                    {scSeverity === 3 && <Calendar className={cn('h-5 w-5', triage.iconColor)} />}
                    {scSeverity === 4 && <AlertTriangle className={cn('h-5 w-5', triage.iconColor)} />}
                    {scSeverity === 5 && <Phone className={cn('h-5 w-5', triage.iconColor)} />}
                    <span className={cn('text-sm font-bold', triage.color)}>
                      {triage.level}
                    </span>
                  </div>
                  <p className="text-xs text-text dark:text-text-dark leading-relaxed">{triage.advice}</p>
                </div>

                {/* Summary */}
                <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-3 mb-3 space-y-1.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Assessment Summary</p>
                  <p className="text-xs text-text dark:text-text-dark"><span className="text-muted">System:</span> {scSystem.label}</p>
                  <p className="text-xs text-text dark:text-text-dark"><span className="text-muted">Symptoms:</span> {scSymptoms.join(', ')}</p>
                  <p className="text-xs text-text dark:text-text-dark"><span className="text-muted">Duration:</span> {scDuration}</p>
                  <p className="text-xs text-text dark:text-text-dark"><span className="text-muted">Severity:</span> {scSeverity}/5 ({severityLabels[scSeverity].label})</p>
                  {scNotes && <p className="text-xs text-text dark:text-text-dark"><span className="text-muted">Notes:</span> {scNotes}</p>}
                </div>

                {/* Recommended Steps */}
                <div className="mb-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">Recommended Next Steps</p>
                  <ul className="space-y-1.5">
                    {triage.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-text dark:text-text-dark">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {triage.showBooking && (
                    <button
                      onClick={() => {
                        resetSymptomChecker()
                        // Scroll to booking card (best-effort)
                        document.getElementById('book-appointment-card')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" /> Book Appointment
                    </button>
                  )}
                  {scSeverity === 5 && (
                    <a
                      href="tel:108"
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call 108 - Emergency
                    </a>
                  )}
                  <button
                    onClick={resetSymptomChecker}
                    className="w-full py-2.5 rounded-lg bg-gray-100 dark:bg-white/10 text-muted text-xs font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                  >
                    Start New Assessment
                  </button>
                </div>

                <p className="mt-3 text-[10px] text-muted text-center leading-relaxed">
                  This is an AI-based assessment and not a medical diagnosis. Always consult a qualified healthcare professional.
                </p>
              </div>
            )
          })()}
        </Card>

        <Card header={<div className="flex items-center gap-2"><Wind className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-text dark:text-text-dark">Recent Vitals</h3></div>} padding="sm">
          {contextLoading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted" /></div>
          ) : (
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
          )}
        </Card>

        <Card header={<div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-text dark:text-text-dark">Upcoming Appointments</h3></div>} padding="none">
          <ul className="divide-y divide-border dark:divide-border-dark">
            {patientApts.map((apt, i) => (
              <li key={i} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text dark:text-text-dark">{apt.doctor}</p>
                  <Badge variant="info" size="sm">{apt.department}</Badge>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <Clock className="h-3 w-3" /><span>{apt.date} &middot; {apt.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card header={<div id="book-appointment-card" className="flex items-center gap-2"><CalendarPlus className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-text dark:text-text-dark">Book Appointment</h3></div>}>
          {bookingConfirmed ? (
            <div className="text-center py-3">
              <CheckCircle className="h-10 w-10 text-success mx-auto mb-2" />
              <p className="text-sm font-semibold text-text dark:text-text-dark">Appointment Confirmed!</p>
              <div className="mt-3 rounded-lg bg-gray-50 dark:bg-white/5 p-3 text-left space-y-1">
                <p className="text-xs text-muted">Department: <span className="font-medium text-text dark:text-text-dark">{bookingDept}</span></p>
                <p className="text-xs text-muted">Date: <span className="font-medium text-text dark:text-text-dark">{bookingDate}</span></p>
                <p className="text-xs text-muted">Time: <span className="font-medium text-text dark:text-text-dark">{bookingTime}</span></p>
              </div>
              <button
                onClick={() => {
                  setBookingConfirmed(false)
                  setBookingDate('')
                  setBookingTime('')
                  setBookingDept('Cardiology')
                }}
                className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                Book Another
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1">Department</label>
                <select
                  value={bookingDept}
                  onChange={(e) => setBookingDept(e.target.value)}
                  className="w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {['Cardiology', 'General Medicine', 'Orthopedics', 'Neurology', 'Pulmonology', 'Gynecology', 'ENT'].map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1">Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-wider text-muted mb-1">Time Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setBookingTime(slot)}
                      className={cn(
                        'rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                        bookingTime === slot
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border dark:border-border-dark text-muted hover:border-primary/40 hover:text-primary'
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  if (bookingDate && bookingTime) setBookingConfirmed(true)
                }}
                disabled={!bookingDate || !bookingTime}
                className={cn(
                  'w-full py-2.5 rounded-lg text-sm font-medium transition-colors',
                  bookingDate && bookingTime
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                )}
              >
                Book Now
              </button>
            </div>
          )}
        </Card>

        <Card header={<div className="flex items-center gap-2"><Pill className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-text dark:text-text-dark">Active Medications</h3></div>} padding="none">
          <ul className="divide-y divide-border dark:divide-border-dark">
            {patientMeds.map((med, i) => (
              <li key={i} className="px-5 py-3">
                <p className="text-sm font-semibold text-text dark:text-text-dark">{med.name}</p>
                <p className="mt-0.5 text-xs text-muted">{med.dosage} &middot; {med.timing}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card header={<div className="flex items-center gap-2"><Video className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-text dark:text-text-dark">Telemedicine</h3></div>}>
          {teleLink ? (
            <div className="space-y-3">
              <p className="text-xs text-success font-medium">Video call link generated!</p>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 text-xs font-mono text-muted break-all">{teleLink}</div>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(teleLink)} className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">Copy Link</button>
                <button onClick={() => setTeleLink('')} className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-white/10 text-muted text-xs font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors">New Link</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setTeleLink(`https://meet.ayushmanlife.in/${Date.now().toString(36)}`)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
              <Video className="h-4 w-4" /> Start Video Call
            </button>
          )}
          <p className="mt-2.5 text-[10px] text-muted text-center">Secure, HIPAA-aligned video consultation</p>
        </Card>

        <Card header={<div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-text dark:text-text-dark">Patient Feedback</h3></div>}>
          {feedbackSent ? (
            <div className="text-center py-2">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm font-medium text-text dark:text-text-dark">Thank you!</p>
              <p className="text-xs text-muted mt-1">Your feedback helps us improve care.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setFeedbackRating(n)} className="p-0.5">
                    <Star className={cn('h-6 w-6 transition-colors', n <= feedbackRating ? 'text-warning fill-warning' : 'text-gray-300 dark:text-gray-600')} />
                  </button>
                ))}
              </div>
              <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Share your experience..." rows={2} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              <button onClick={() => { if (feedbackRating > 0) setFeedbackSent(true) }} disabled={feedbackRating === 0} className={cn('w-full py-2 rounded-lg text-xs font-medium transition-colors', feedbackRating > 0 ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800')}>
                Submit Feedback
              </button>
            </div>
          )}
        </Card>

        <Card header={<div className="flex items-center gap-2"><CheckSquare className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-text dark:text-text-dark">Today's Adherence</h3></div>}>
          <div className="space-y-2">
            {patientMeds.map((med, i) => (
              <label key={i} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={!!medsTaken[i]} onChange={() => setMedsTaken(prev => ({...prev, [i]: !prev[i]}))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
                <span className={cn('text-xs', medsTaken[i] ? 'text-muted line-through' : 'text-text dark:text-text-dark font-medium')}>{med.name}</span>
              </label>
            ))}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-muted mb-1">
              <span>Adherence</span>
              <span>{Math.round((Object.values(medsTaken).filter(Boolean).length / Math.max(patientMeds.length, 1)) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div className="h-full rounded-full bg-success transition-all duration-300" style={{ width: `${(Object.values(medsTaken).filter(Boolean).length / Math.max(patientMeds.length, 1)) * 100}%` }} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
