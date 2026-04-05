import { useState, useEffect, useMemo } from 'react'
import { teleweight } from '../../lib/api'
import type { TWWeightProfile } from '../../lib/api'
import { cn } from '../../lib/utils'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Heart,
  Ruler,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

interface IntakeFormProps {
  patientId: string
  onComplete?: () => void
}

interface FormData {
  // Step 1 — Physical Metrics
  height_cm: string
  current_weight_kg: string
  target_weight_kg: string
  waist_circumference_cm: string
  // Step 2 — Medical History
  comorbidities: string[]
  current_medications: string
  allergies: string
  previous_weight_treatments: string
  family_history: string
  // Step 3 — Lifestyle
  dietary_preference: string
  exercise_frequency: string
  smoking_status: string
  alcohol_status: string
  // Step 4 — Consent
  consent_telemedicine: boolean
  consent_data_sharing: boolean
}

const COMORBIDITY_OPTIONS = [
  'Diabetes Type 2',
  'Hypertension',
  'PCOS/PCOD',
  'Thyroid Disorder',
  'Sleep Apnea',
  'Joint Problems',
  'None',
] as const

const DIETARY_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'] as const
const EXERCISE_OPTIONS = ['Sedentary', '1-2 times/week', '3-4 times/week', 'Daily'] as const
const SMOKING_OPTIONS = ['Never', 'Former', 'Current'] as const
const ALCOHOL_OPTIONS = ['Never', 'Occasional', 'Regular'] as const

const STEPS = [
  { label: 'Physical Metrics', icon: Ruler },
  { label: 'Medical History', icon: Heart },
  { label: 'Lifestyle', icon: Activity },
  { label: 'Consent', icon: ShieldCheck },
] as const

const initialFormData: FormData = {
  height_cm: '',
  current_weight_kg: '',
  target_weight_kg: '',
  waist_circumference_cm: '',
  comorbidities: [],
  current_medications: '',
  allergies: '',
  previous_weight_treatments: '',
  family_history: '',
  dietary_preference: '',
  exercise_frequency: '',
  smoking_status: '',
  alcohol_status: '',
  consent_telemedicine: false,
  consent_data_sharing: false,
}

function computeBMI(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

function getBMICategory(bmi: number): { label: string; variant: 'success' | 'warning' | 'error' | 'info' } {
  if (bmi < 18.5) return { label: 'Underweight', variant: 'info' }
  if (bmi < 25) return { label: 'Normal', variant: 'success' }
  if (bmi < 30) return { label: 'Overweight', variant: 'warning' }
  return { label: 'Obese', variant: 'error' }
}

const inputClass =
  'w-full rounded-lg border border-border bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark'
const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300'
const primaryBtnClass =
  'px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors'

export default function IntakeForm({ patientId, onComplete }: IntakeFormProps) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingProfile, setExistingProfile] = useState<TWWeightProfile | null>(null)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load existing intake on mount
  useEffect(() => {
    let cancelled = false
    async function loadIntake() {
      try {
        setLoading(true)
        const res = await teleweight.getIntake(patientId)
        if (!cancelled && res.profile) {
          setExistingProfile(res.profile)
          populateFormFromProfile(res.profile)
          setIsUpdateMode(true)
        }
      } catch {
        // No existing profile — start fresh
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadIntake()
    return () => {
      cancelled = true
    }
  }, [patientId])

  function populateFormFromProfile(profile: TWWeightProfile) {
    const comorbidities = profile.comorbidities
      ? profile.comorbidities.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    setFormData({
      height_cm: profile.height_cm ? String(profile.height_cm) : '',
      current_weight_kg: profile.current_weight_kg ? String(profile.current_weight_kg) : '',
      target_weight_kg: profile.target_weight_kg ? String(profile.target_weight_kg) : '',
      waist_circumference_cm: profile.waist_circumference_cm ? String(profile.waist_circumference_cm) : '',
      comorbidities,
      current_medications: profile.current_medications || '',
      allergies: profile.allergies || '',
      previous_weight_treatments: profile.previous_weight_treatments || '',
      family_history: profile.family_history || '',
      dietary_preference: profile.dietary_preference || '',
      exercise_frequency: profile.exercise_frequency || '',
      smoking_status: profile.smoking_status || '',
      alcohol_status: profile.alcohol_status || '',
      consent_telemedicine: true,
      consent_data_sharing: true,
    })
  }

  // Real-time BMI calculation
  const bmi = useMemo(() => {
    const w = parseFloat(formData.current_weight_kg)
    const h = parseFloat(formData.height_cm)
    if (isNaN(w) || isNaN(h)) return null
    return computeBMI(w, h)
  }, [formData.current_weight_kg, formData.height_cm])

  const bmiCategory = useMemo(() => {
    if (bmi === null) return null
    return getBMICategory(bmi)
  }, [bmi])

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  function toggleComorbidity(item: string) {
    setFormData((prev) => {
      let next: string[]
      if (item === 'None') {
        next = prev.comorbidities.includes('None') ? [] : ['None']
      } else {
        const withoutNone = prev.comorbidities.filter((c) => c !== 'None')
        next = withoutNone.includes(item)
          ? withoutNone.filter((c) => c !== item)
          : [...withoutNone, item]
      }
      return { ...prev, comorbidities: next }
    })
  }

  function validateStep(s: number): string | null {
    switch (s) {
      case 0: {
        const h = parseFloat(formData.height_cm)
        const w = parseFloat(formData.current_weight_kg)
        const t = parseFloat(formData.target_weight_kg)
        if (!formData.height_cm || isNaN(h) || h < 50 || h > 300)
          return 'Please enter a valid height (50-300 cm).'
        if (!formData.current_weight_kg || isNaN(w) || w < 20 || w > 500)
          return 'Please enter a valid current weight (20-500 kg).'
        if (!formData.target_weight_kg || isNaN(t) || t < 20 || t > 500)
          return 'Please enter a valid target weight (20-500 kg).'
        return null
      }
      case 1:
        return null // All optional in step 2
      case 2:
        if (!formData.dietary_preference) return 'Please select a dietary preference.'
        if (!formData.exercise_frequency) return 'Please select an exercise frequency.'
        if (!formData.smoking_status) return 'Please select a smoking status.'
        if (!formData.alcohol_status) return 'Please select an alcohol status.'
        return null
      case 3:
        if (!formData.consent_telemedicine)
          return 'You must consent to telemedicine consultation to proceed.'
        if (!formData.consent_data_sharing)
          return 'You must consent to data sharing to proceed.'
        return null
      default:
        return null
    }
  }

  function handleNext() {
    const err = validateStep(step)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setStep((s) => Math.min(s + 1, 3))
  }

  function handleBack() {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSubmit() {
    const err = validateStep(step)
    if (err) {
      setError(err)
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    const payload = {
      patient_id: patientId,
      height_cm: parseFloat(formData.height_cm),
      current_weight_kg: parseFloat(formData.current_weight_kg),
      target_weight_kg: parseFloat(formData.target_weight_kg),
      waist_circumference_cm: formData.waist_circumference_cm
        ? parseFloat(formData.waist_circumference_cm)
        : undefined,
      bmi: bmi ?? undefined,
      comorbidities: formData.comorbidities.join(', '),
      current_medications: formData.current_medications,
      allergies: formData.allergies,
      previous_weight_treatments: formData.previous_weight_treatments,
      family_history: formData.family_history,
      dietary_preference: formData.dietary_preference,
      exercise_frequency: formData.exercise_frequency,
      smoking_status: formData.smoking_status,
      alcohol_status: formData.alcohol_status,
    }

    try {
      if (isUpdateMode) {
        const res = await teleweight.updateIntake(patientId, payload)
        setExistingProfile(res.profile)
        setSuccessMessage('Health profile updated successfully.')
      } else {
        const res = await teleweight.submitIntake(payload)
        setExistingProfile(res.profile)
        setIsUpdateMode(true)
        setSuccessMessage('Health intake submitted successfully.')
      }
      onComplete?.()
    } catch (e: any) {
      setError(e?.message || 'Failed to submit intake. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Render helpers ----

  function renderStepIndicator() {
    return (
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon
          const isActive = i === step
          const isCompleted = i < step
          return (
            <div key={s.label} className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  // Allow navigating back to completed steps
                  if (i < step) {
                    setError(null)
                    setStep(i)
                  }
                }}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive && 'bg-primary/10 text-primary dark:bg-primary/20',
                  isCompleted && 'text-success cursor-pointer hover:bg-success/10',
                  !isActive && !isCompleted && 'text-gray-400 dark:text-gray-500 cursor-default'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                    isActive && 'bg-primary text-white',
                    isCompleted && 'bg-success text-white',
                    !isActive && !isCompleted && 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="hidden sm:inline">
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 mx-1" />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  function renderBMIDisplay() {
    if (bmi === null) return null
    const cat = bmiCategory!
    return (
      <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-border dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
              Computed BMI
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
              {bmi.toFixed(1)}
            </p>
          </div>
          <Badge variant={cat.variant} size="md">
            {cat.label}
          </Badge>
        </div>
        <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              cat.variant === 'info' && 'bg-accent',
              cat.variant === 'success' && 'bg-success',
              cat.variant === 'warning' && 'bg-warning',
              cat.variant === 'error' && 'bg-error'
            )}
            style={{ width: `${Math.min((bmi / 50) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-400 dark:text-gray-500">
          <span>Underweight &lt;18.5</span>
          <span>Normal 18.5-24.9</span>
          <span>Overweight 25-29.9</span>
          <span>Obese 30+</span>
        </div>
      </div>
    )
  }

  function renderStep0() {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>
              Height (cm) <span className="text-error">*</span>
            </label>
            <input
              type="number"
              min={50}
              max={300}
              step="0.1"
              placeholder="e.g. 170"
              className={cn(inputClass, 'mt-1.5')}
              value={formData.height_cm}
              onChange={(e) => updateField('height_cm', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>
              Current Weight (kg) <span className="text-error">*</span>
            </label>
            <input
              type="number"
              min={20}
              max={500}
              step="0.1"
              placeholder="e.g. 85"
              className={cn(inputClass, 'mt-1.5')}
              value={formData.current_weight_kg}
              onChange={(e) => updateField('current_weight_kg', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>
              Target Weight (kg) <span className="text-error">*</span>
            </label>
            <input
              type="number"
              min={20}
              max={500}
              step="0.1"
              placeholder="e.g. 72"
              className={cn(inputClass, 'mt-1.5')}
              value={formData.target_weight_kg}
              onChange={(e) => updateField('target_weight_kg', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>
              Waist Circumference (cm){' '}
              <span className="text-xs text-gray-400 font-normal">optional</span>
            </label>
            <input
              type="number"
              min={30}
              max={300}
              step="0.1"
              placeholder="e.g. 90"
              className={cn(inputClass, 'mt-1.5')}
              value={formData.waist_circumference_cm}
              onChange={(e) => updateField('waist_circumference_cm', e.target.value)}
            />
          </div>
        </div>

        {renderBMIDisplay()}
      </div>
    )
  }

  function renderStep1() {
    return (
      <div className="space-y-5">
        <div>
          <label className={labelClass}>Comorbidities</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMORBIDITY_OPTIONS.map((item) => {
              const checked = formData.comorbidities.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleComorbidity(item)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                    checked
                      ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                      : 'border-border bg-white text-gray-600 hover:border-primary/50 dark:border-border-dark dark:bg-surface-dark dark:text-gray-300'
                  )}
                >
                  {checked && <CheckCircle2 className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
                  {item}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className={labelClass}>Current Medications</label>
          <textarea
            rows={3}
            placeholder="List any current medications, dosages, and frequency..."
            className={cn(inputClass, 'mt-1.5 resize-none')}
            value={formData.current_medications}
            onChange={(e) => updateField('current_medications', e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Allergies</label>
          <textarea
            rows={2}
            placeholder="List any known allergies (food, drug, environmental)..."
            className={cn(inputClass, 'mt-1.5 resize-none')}
            value={formData.allergies}
            onChange={(e) => updateField('allergies', e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Previous Weight Management Treatments</label>
          <textarea
            rows={2}
            placeholder="Any previous treatments, programs, or surgeries for weight management..."
            className={cn(inputClass, 'mt-1.5 resize-none')}
            value={formData.previous_weight_treatments}
            onChange={(e) => updateField('previous_weight_treatments', e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Family History</label>
          <textarea
            rows={2}
            placeholder="Relevant family medical history (obesity, diabetes, heart disease, etc.)..."
            className={cn(inputClass, 'mt-1.5 resize-none')}
            value={formData.family_history}
            onChange={(e) => updateField('family_history', e.target.value)}
          />
        </div>
      </div>
    )
  }

  function renderStep2() {
    return (
      <div className="space-y-5">
        <div>
          <label className={labelClass}>
            Dietary Preference <span className="text-error">*</span>
          </label>
          <select
            className={cn(inputClass, 'mt-1.5')}
            value={formData.dietary_preference}
            onChange={(e) => updateField('dietary_preference', e.target.value)}
          >
            <option value="">Select dietary preference</option>
            {DIETARY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Exercise Frequency <span className="text-error">*</span>
          </label>
          <select
            className={cn(inputClass, 'mt-1.5')}
            value={formData.exercise_frequency}
            onChange={(e) => updateField('exercise_frequency', e.target.value)}
          >
            <option value="">Select exercise frequency</option>
            {EXERCISE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Smoking Status <span className="text-error">*</span>
          </label>
          <select
            className={cn(inputClass, 'mt-1.5')}
            value={formData.smoking_status}
            onChange={(e) => updateField('smoking_status', e.target.value)}
          >
            <option value="">Select smoking status</option>
            {SMOKING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Alcohol Status <span className="text-error">*</span>
          </label>
          <select
            className={cn(inputClass, 'mt-1.5')}
            value={formData.alcohol_status}
            onChange={(e) => updateField('alcohol_status', e.target.value)}
          >
            <option value="">Select alcohol status</option>
            {ALCOHOL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  function renderStep3() {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
            Please review the following consent statements carefully before submitting your health intake form. Both consents are required to proceed.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.consent_telemedicine}
            onChange={(e) => updateField('consent_telemedicine', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 dark:border-gray-600 dark:bg-surface-dark"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
            I consent to telemedicine consultation and understand that the first consultation will be via video call as per{' '}
            <strong>Telemedicine Practice Guidelines 2020</strong>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.consent_data_sharing}
            onChange={(e) => updateField('consent_data_sharing', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 dark:border-gray-600 dark:bg-surface-dark"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
            I consent to sharing my health data with the treating physician through this platform as per{' '}
            <strong>DPDP Act 2023</strong>
          </span>
        </label>
      </div>
    )
  }

  // ---- Loading state ----
  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading health profile...</p>
        </div>
      </Card>
    )
  }

  // ---- Success state (post-submit) ----
  if (successMessage && !error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{successMessage}</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Your health profile has been saved. You can now proceed to book a consultation with a doctor.
          </p>
          <button
            type="button"
            className={cn(primaryBtnClass, 'mt-6')}
            onClick={() => {
              setSuccessMessage(null)
              setStep(0)
            }}
          >
            Review Profile
          </button>
        </div>
      </Card>
    )
  }

  // ---- Main form ----
  const stepContent = [renderStep0, renderStep1, renderStep2, renderStep3]
  const currentStepMeta = STEPS[step]

  return (
    <Card className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isUpdateMode ? 'Update Health Profile' : 'Health Intake Form'}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isUpdateMode
            ? 'Review and update your health information below.'
            : 'Complete all steps to set up your weight management profile.'}
        </p>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Title */}
      <div className="flex items-center gap-2 mb-5">
        <currentStepMeta.icon className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {currentStepMeta.label}
        </h3>
        <Badge variant="neutral" size="sm">
          Step {step + 1} of {STEPS.length}
        </Badge>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-error/30 bg-error/5 p-3">
          <AlertCircle className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Step Content */}
      {stepContent[step]()}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-5 border-t border-border dark:border-border-dark">
        {step > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button type="button" onClick={handleNext} className={cn(primaryBtnClass, 'flex items-center gap-1.5')}>
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              primaryBtnClass,
              'flex items-center gap-2',
              submitting && 'opacity-70 cursor-not-allowed'
            )}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isUpdateMode ? 'Update Profile' : 'Submit Intake'}
          </button>
        )}
      </div>
    </Card>
  )
}
