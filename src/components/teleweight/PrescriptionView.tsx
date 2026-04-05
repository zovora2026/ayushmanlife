import { useState, useEffect } from 'react'
import {
  Loader2, Pill, AlertTriangle, ClipboardList, FlaskConical,
  HeartPulse, FileText, CalendarDays,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { teleweight } from '../../lib/api'
import type { TWPrescription } from '../../lib/api'
import { cn, formatCurrency, formatDate } from '../../lib/utils'

interface PrescriptionViewProps {
  patientId: string
}

interface Medication {
  name: string
  dosage: string
  frequency: string
  duration_days: number
  instructions: string
}

const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  active: 'success',
  completed: 'neutral',
  cancelled: 'error',
}

const statusLabels: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function safeParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

export default function PrescriptionView({ patientId }: PrescriptionViewProps) {
  const [prescriptions, setPrescriptions] = useState<TWPrescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await teleweight.patientPrescriptions(patientId)
        if (!cancelled) setPrescriptions(data.prescriptions || [])
      } catch (err) {
        console.error('Failed to load prescriptions:', err)
        if (!cancelled) setPrescriptions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [patientId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (prescriptions.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium text-primary dark:text-white mb-1">
            No prescriptions yet
          </p>
          <p className="text-sm text-secondary dark:text-gray-400 max-w-sm">
            Prescriptions will appear here after your consultation.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {prescriptions.map((rx) => {
        const medications = safeParse<Medication[]>(rx.medications, [])
        const lifestyle = safeParse<string[]>(rx.lifestyle_recommendations, [])
        const labTests = safeParse<string[]>(rx.lab_tests_ordered, [])

        return (
          <Card key={rx.id} padding="none">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border dark:border-border-dark flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-primary dark:text-white">
                  Dr. {rx.doctor_name || 'Unknown'}
                </p>
                <p className="text-xs text-secondary dark:text-gray-400">
                  Reg. No. {rx.doctor_registration_number} &middot; {formatDate(rx.prescription_date)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {rx.is_controlled_substance === 1 && (
                  <Badge variant="error">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Schedule H1 — Controlled
                  </Badge>
                )}
                <Badge variant={statusVariants[rx.status] || 'neutral'} dot>
                  {statusLabels[rx.status] || rx.status}
                </Badge>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Diagnosis */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-secondary dark:text-gray-400" />
                  <h4 className="text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">
                    Diagnosis
                  </h4>
                </div>
                <p className="text-sm text-primary dark:text-white bg-gray-50 dark:bg-white/5 rounded-lg p-3 border border-border dark:border-border-dark">
                  {rx.diagnosis}
                </p>
              </div>

              {/* Medications table */}
              {medications.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="w-4 h-4 text-secondary dark:text-gray-400" />
                    <h4 className="text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">
                      Medications
                    </h4>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-border dark:border-border-dark">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-white/5">
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">
                            Medicine
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">
                            Dosage
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">
                            Frequency
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">
                            Instructions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border dark:divide-border-dark">
                        {medications.map((med, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-medium text-primary dark:text-white whitespace-nowrap">
                              {med.name}
                            </td>
                            <td className="px-4 py-3 text-secondary dark:text-gray-300 whitespace-nowrap">
                              {med.dosage}
                            </td>
                            <td className="px-4 py-3 text-secondary dark:text-gray-300 whitespace-nowrap">
                              {med.frequency}
                            </td>
                            <td className="px-4 py-3 text-secondary dark:text-gray-300 whitespace-nowrap">
                              {med.duration_days} days
                            </td>
                            <td className="px-4 py-3 text-secondary dark:text-gray-300">
                              {med.instructions}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Lifestyle Recommendations */}
              {lifestyle.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <HeartPulse className="w-4 h-4 text-secondary dark:text-gray-400" />
                    <h4 className="text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">
                      Lifestyle Recommendations
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {lifestyle.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-primary dark:text-gray-200 bg-green-50 dark:bg-green-900/10 rounded-lg px-3 py-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lab Tests Ordered */}
              {labTests.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="w-4 h-4 text-secondary dark:text-gray-400" />
                    <h4 className="text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">
                      Lab Tests Ordered
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {labTests.map((test, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-primary dark:text-gray-200 bg-blue-50 dark:bg-blue-900/10 rounded-lg px-3 py-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        {test}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Special Instructions */}
              {rx.special_instructions && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider">
                      Special Instructions
                    </h4>
                  </div>
                  <p className="text-sm text-primary dark:text-gray-200 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-200 dark:border-amber-800/30">
                    {rx.special_instructions}
                  </p>
                </div>
              )}

              {/* Follow-up date */}
              {rx.follow_up_date && (
                <div className="flex items-center gap-2 text-sm pt-2 border-t border-border dark:border-border-dark">
                  <CalendarDays className="w-4 h-4 text-secondary dark:text-gray-400" />
                  <span className="text-secondary dark:text-gray-400">Follow-up Date:</span>
                  <span className="font-medium text-primary dark:text-white">
                    {formatDate(rx.follow_up_date)}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
