import { useState, useEffect } from 'react'
import {
  Loader2, Package, MapPin, CreditCard, Truck, Hash,
  Calendar, CheckCircle2, XCircle, Clock, ShoppingBag,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { teleweight } from '../../lib/api'
import type { TWPharmacyOrder } from '../../lib/api'
import { cn, formatCurrency, formatDate } from '../../lib/utils'

interface PharmacyOrdersProps {
  patientId: string
}

const ORDER_STEPS = ['pending', 'confirmed', 'preparing', 'dispatched', 'delivered'] as const

const stepLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const stepIcons: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle2,
  preparing: Package,
  dispatched: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
}

const paymentStatusVariants: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'neutral',
}

export default function PharmacyOrders({ patientId }: PharmacyOrdersProps) {
  const [orders, setOrders] = useState<TWPharmacyOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await teleweight.pharmacyOrders({ patient_id: patientId })
        if (!cancelled) setOrders(data.orders || [])
      } catch (err) {
        console.error('Failed to load pharmacy orders:', err)
        if (!cancelled) setOrders([])
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

  if (orders.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium text-primary dark:text-white mb-1">
            No pharmacy orders yet
          </p>
          <p className="text-sm text-secondary dark:text-gray-400 max-w-sm">
            Orders will appear here when your doctor prescribes medications.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const isCancelled = order.order_status === 'cancelled'
        const currentStepIndex = ORDER_STEPS.indexOf(
          order.order_status as typeof ORDER_STEPS[number]
        )

        return (
          <Card key={order.id} padding="none">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border dark:border-border-dark flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-secondary dark:text-gray-400" />
                  <p className="text-sm font-semibold text-primary dark:text-white">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <p className="text-xs text-secondary dark:text-gray-400 mt-0.5">
                  {order.pharmacy_name || 'Pharmacy'} &middot; {formatDate(order.created_at)}
                </p>
              </div>
              {isCancelled ? (
                <Badge variant="error" dot>Cancelled</Badge>
              ) : (
                <Badge variant="info" dot>
                  {stepLabels[order.order_status] || order.order_status}
                </Badge>
              )}
            </div>

            <div className="p-5 space-y-5">
              {/* Status Timeline */}
              {!isCancelled ? (
                <div>
                  <h4 className="text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider mb-4">
                    Order Status
                  </h4>
                  <div className="flex items-center justify-between relative">
                    {/* Connection line */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-700" />
                    <div
                      className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
                      style={{
                        width: currentStepIndex >= 0
                          ? `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%`
                          : '0%',
                        maxWidth: 'calc(100% - 2rem)',
                      }}
                    />

                    {ORDER_STEPS.map((step, idx) => {
                      const isCompleted = currentStepIndex >= idx
                      const isCurrent = currentStepIndex === idx
                      const StepIcon = stepIcons[step]

                      return (
                        <div
                          key={step}
                          className="relative flex flex-col items-center z-10"
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                              isCompleted
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white dark:bg-surface-dark border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500',
                              isCurrent && 'ring-4 ring-primary/20'
                            )}
                          >
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <span
                            className={cn(
                              'text-[10px] mt-1.5 font-medium whitespace-nowrap',
                              isCompleted
                                ? 'text-primary dark:text-white'
                                : 'text-gray-400 dark:text-gray-500'
                            )}
                          >
                            {stepLabels[step]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                  <XCircle className="w-5 h-5 text-error flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">
                    This order has been cancelled.
                  </p>
                </div>
              )}

              {/* Delivery Info */}
              <div>
                <h4 className="text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider mb-2">
                  Delivery Information
                </h4>
                <div className="bg-gray-50 dark:bg-white/5 rounded-lg border border-border dark:border-border-dark p-4 space-y-2.5">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-secondary dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-primary dark:text-white">{order.delivery_address}</p>
                      <p className="text-xs text-secondary dark:text-gray-400">
                        PIN: {order.delivery_pincode}
                      </p>
                    </div>
                  </div>

                  {order.estimated_delivery_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-secondary dark:text-gray-400 flex-shrink-0" />
                      <span className="text-secondary dark:text-gray-400">Estimated Delivery:</span>
                      <span className="font-medium text-primary dark:text-white">
                        {formatDate(order.estimated_delivery_date)}
                      </span>
                    </div>
                  )}

                  {order.actual_delivery_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-secondary dark:text-gray-400">Delivered On:</span>
                      <span className="font-medium text-success">
                        {formatDate(order.actual_delivery_date)}
                      </span>
                    </div>
                  )}

                  {order.tracking_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="w-4 h-4 text-secondary dark:text-gray-400 flex-shrink-0" />
                      <span className="text-secondary dark:text-gray-400">Tracking:</span>
                      <span className="font-mono text-xs font-medium text-primary dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        {order.tracking_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="text-xs font-medium text-secondary dark:text-gray-400 uppercase tracking-wider mb-2">
                  Payment
                </h4>
                <div className="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-border dark:border-border-dark p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-secondary dark:text-gray-400" />
                    <span className="text-sm text-secondary dark:text-gray-400">Amount:</span>
                    <span className="text-sm font-semibold text-primary dark:text-white">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>

                  <div className="w-px h-5 bg-border dark:bg-border-dark hidden sm:block" />

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-secondary dark:text-gray-400">Method:</span>
                    <span className="font-medium text-primary dark:text-white capitalize">
                      {order.payment_method.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="w-px h-5 bg-border dark:bg-border-dark hidden sm:block" />

                  <Badge variant={paymentStatusVariants[order.payment_status] || 'neutral'} dot>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
