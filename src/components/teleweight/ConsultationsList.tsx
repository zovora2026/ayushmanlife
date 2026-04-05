import { useState, useEffect } from 'react'
import {
  Loader2, Video, Phone, MessageSquare, Calendar, Clock,
  ChevronDown, ChevronUp, Stethoscope, CalendarCheck, Info,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { teleweight } from '../../lib/api'
import type { TWConsultation } from '../../lib/api'
import { cn, formatCurrency, formatDate } from '../../lib/utils'

interface ConsultationsListProps {
  patientId: string
}

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

export default function ConsultationsList({ patientId }: ConsultationsListProps) {
  const [consultations, setConsultations] = useState<TWConsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await teleweight.patientConsultations(patientId)
        if (!cancelled) setConsultations(data.consultations || [])
      } catch (err) {
        console.error('Failed to load consultations:', err)
        if (!cancelled) setConsultations([])
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

  if (consultations.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Stethoscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium text-primary dark:text-white mb-1">
            No consultations yet
          </p>
          <p className="text-sm text-secondary dark:text-gray-400 max-w-sm">
            Book your first consultation with a specialist.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {consultations.map((c) => {
        const isExpanded = expandedId === c.id
        const mode = modeConfig[c.mode] || modeConfig.chat
        const ModeIcon = mode.icon

        return (
          <Card key={c.id} padding="none">
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : c.id)}
              className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              {/* Mode icon */}
              <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', mode.color)}>
                <ModeIcon className="w-5 h-5" />
              </div>

              {/* Doctor info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary dark:text-white truncate">
                  {c.doctor_name || 'Doctor'}
                </p>
                <p className="text-xs text-secondary dark:text-gray-400">
                  {c.doctor_specialty || 'Specialist'}
                </p>
              </div>

              {/* Date */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-secondary dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(c.scheduled_at)}
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
              <span className="hidden lg:block text-sm font-medium text-primary dark:text-white whitespace-nowrap">
                {formatCurrency(c.consultation_fee)}
              </span>

              {/* Expand chevron */}
              {isExpanded
                ? <ChevronUp className="w-4 h-4 text-secondary dark:text-gray-400 flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-secondary dark:text-gray-400 flex-shrink-0" />
              }
            </button>

            {/* Mobile badges row */}
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
              <span className="text-xs text-secondary dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(c.scheduled_at)}
              </span>
              <span className="text-xs font-medium text-primary dark:text-white">
                {formatCurrency(c.consultation_fee)}
              </span>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-border dark:border-border-dark px-5 py-4 space-y-4 bg-gray-50/50 dark:bg-white/[0.02]">
                {/* Duration */}
                {c.duration_minutes != null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-secondary dark:text-gray-400" />
                    <span className="text-secondary dark:text-gray-400">Duration:</span>
                    <span className="font-medium text-primary dark:text-white">
                      {c.duration_minutes} minutes
                    </span>
                  </div>
                )}

                {/* Time info */}
                {c.started_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarCheck className="w-4 h-4 text-secondary dark:text-gray-400" />
                    <span className="text-secondary dark:text-gray-400">Started:</span>
                    <span className="font-medium text-primary dark:text-white">
                      {formatDate(c.started_at)}
                    </span>
                    {c.ended_at && (
                      <>
                        <span className="text-secondary dark:text-gray-400 mx-1">-</span>
                        <span className="text-secondary dark:text-gray-400">Ended:</span>
                        <span className="font-medium text-primary dark:text-white">
                          {formatDate(c.ended_at)}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Consultation notes */}
                {c.consultation_notes && (
                  <div>
                    <p className="text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider mb-1">
                      Consultation Notes
                    </p>
                    <p className="text-sm text-primary dark:text-gray-200 bg-white dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark p-3">
                      {c.consultation_notes}
                    </p>
                  </div>
                )}

                {/* Follow-up recommendation */}
                {c.follow_up_recommended === 1 && (
                  <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 dark:text-blue-300">
                        Follow-up Recommended
                      </p>
                      {c.follow_up_weeks && (
                        <p className="text-blue-600 dark:text-blue-400">
                          Schedule a follow-up in {c.follow_up_weeks} week{c.follow_up_weeks !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Fee breakdown */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-2 bg-white dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark">
                    <p className="text-xs text-secondary dark:text-gray-400">Consultation Fee</p>
                    <p className="text-sm font-semibold text-primary dark:text-white">{formatCurrency(c.consultation_fee)}</p>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark">
                    <p className="text-xs text-secondary dark:text-gray-400">Platform Fee</p>
                    <p className="text-sm font-semibold text-primary dark:text-white">{formatCurrency(c.platform_fee)}</p>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark">
                    <p className="text-xs text-secondary dark:text-gray-400">Doctor Payout</p>
                    <p className="text-sm font-semibold text-primary dark:text-white">{formatCurrency(c.doctor_payout)}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
