import { Link, useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  FileText, ArrowLeft, Calendar, CreditCard, Package, Server,
  CheckCircle, Clock, XCircle, AlertCircle, Download, Printer,
  Hash, User, Mail, Phone, MapPin, Building, ChevronRight
} from 'lucide-react'
import { userAPI } from '../../lib/api'
import { useCurrencyStore, useThemeStore } from '../../store/useStore'
import clsx from 'clsx'

const statusConfig = {
  paid: { 
    color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20', 
    icon: CheckCircle,
    label: 'Paid'
  },
  unpaid: { 
    color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20', 
    icon: Clock,
    label: 'Unpaid'
  },
  cancelled: { 
    color: 'bg-red-500/10 text-red-500 border border-red-500/20', 
    icon: XCircle,
    label: 'Cancelled'
  },
  refunded: { 
    color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20', 
    icon: AlertCircle,
    label: 'Refunded'
  },
  draft: { 
    color: 'bg-dark-500/10 text-dark-400 border border-dark-500/20', 
    icon: FileText,
    label: 'Draft'
  },
}

export default function InvoiceDetail() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const { format } = useCurrencyStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const { data, isLoading, error } = useQuery({
    queryKey: ['invoice', uuid],
    queryFn: () => userAPI.getInvoice(uuid).then(res => res.data)
  })

  const invoice = data?.invoice

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-dark-500">Loading invoice details...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-16">
        <FileText className="w-16 h-16 text-dark-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Invoice Not Found</h2>
        <p className="text-dark-500 mb-6">The invoice you're looking for doesn't exist or you don't have access.</p>
        <button onClick={() => navigate('/dashboard/invoices')} className="btn-primary">
          Back to Invoices
        </button>
      </div>
    )
  }

  const status = statusConfig[invoice.status] || statusConfig.draft
  const StatusIcon = status.icon

  return (
    <>
      <Helmet>
        <title>Invoice {invoice.invoice_number} - Magnetic Clouds</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard/invoices')}
              className={clsx(
                "p-2 rounded-xl transition-all",
                isDark ? "hover:bg-dark-700" : "hover:bg-dark-100"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={clsx(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-dark-900"
              )}>
                Invoice {invoice.invoice_number}
              </h1>
              <p className="text-dark-500 text-sm mt-1">
                Created on {new Date(invoice.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={clsx(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold",
              status.color
            )}>
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "rounded-2xl overflow-hidden",
                isDark 
                  ? "bg-dark-800/80 border border-dark-700/50" 
                  : "bg-white border border-dark-100 shadow-sm"
              )}
            >
              <div className="p-6 border-b border-dark-100 dark:border-dark-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={clsx(
                    "text-lg font-bold",
                    isDark ? "text-white" : "text-dark-900"
                  )}>Order Details</h2>
                </div>
              </div>
              
              <div className="p-6">
                {invoice.order_items && invoice.order_items.length > 0 ? (
                  <div className="space-y-4">
                    {invoice.order_items.map((item, idx) => (
                      <div 
                        key={idx}
                        className={clsx(
                          "p-4 rounded-xl",
                          isDark ? "bg-dark-700/50" : "bg-dark-50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={clsx(
                              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                              isDark ? "bg-dark-600" : "bg-white border border-dark-200"
                            )}>
                              <Server className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                              <h3 className={clsx(
                                "font-semibold",
                                isDark ? "text-white" : "text-dark-900"
                              )}>{item.name || item.product_name}</h3>
                              <p className="text-sm text-dark-500 mt-1">
                                {item.billing_cycle || item.billingCycle || 'One-time'}
                              </p>
                              {item.description && (
                                <p className="text-sm text-dark-400 mt-2">{item.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={clsx(
                              "font-bold text-lg",
                              isDark ? "text-white" : "text-dark-900"
                            )}>{format(item.price || item.total)}</p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-dark-500">x{item.quantity}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : invoice.service_name ? (
                  <div className={clsx(
                    "p-4 rounded-xl",
                    isDark ? "bg-dark-700/50" : "bg-dark-50"
                  )}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={clsx(
                          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                          isDark ? "bg-dark-600" : "bg-white border border-dark-200"
                        )}>
                          <Server className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                          <h3 className={clsx(
                            "font-semibold",
                            isDark ? "text-white" : "text-dark-900"
                          )}>{invoice.service_name}</h3>
                          <p className="text-sm text-dark-500 mt-1">
                            {invoice.service_type} • {invoice.billing_cycle || 'Monthly'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={clsx(
                          "font-bold text-lg",
                          isDark ? "text-white" : "text-dark-900"
                        )}>{format(invoice.total)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-dark-300 mx-auto mb-3" />
                    <p className="text-dark-500">No order items available</p>
                  </div>
                )}

                {/* Totals */}
                <div className={clsx(
                  "mt-6 pt-6 border-t space-y-3",
                  isDark ? "border-dark-700" : "border-dark-200"
                )}>
                  {invoice.order_subtotal && (
                    <div className="flex justify-between text-dark-500">
                      <span>Subtotal</span>
                      <span>{format(invoice.order_subtotal)}</span>
                    </div>
                  )}
                  {invoice.order_discount > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Discount</span>
                      <span>-{format(invoice.order_discount)}</span>
                    </div>
                  )}
                  <div className={clsx(
                    "flex justify-between text-lg font-bold pt-3 border-t",
                    isDark ? "border-dark-700 text-white" : "border-dark-200 text-dark-900"
                  )}>
                    <span>Total</span>
                    <span>{format(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Service Information */}
            {invoice.service_uuid && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={clsx(
                  "rounded-2xl overflow-hidden",
                  isDark 
                    ? "bg-dark-800/80 border border-dark-700/50" 
                    : "bg-white border border-dark-100 shadow-sm"
                )}
              >
                <div className="p-6 border-b border-dark-100 dark:border-dark-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Server className="w-5 h-5 text-white" />
                    </div>
                    <h2 className={clsx(
                      "text-lg font-bold",
                      isDark ? "text-white" : "text-dark-900"
                    )}>Related Service</h2>
                  </div>
                </div>
                <div className="p-6">
                  <Link 
                    to={`/dashboard/services/${invoice.service_uuid}`}
                    className={clsx(
                      "flex items-center justify-between p-4 rounded-xl transition-all group",
                      isDark ? "bg-dark-700/50 hover:bg-dark-700" : "bg-dark-50 hover:bg-dark-100"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        isDark ? "bg-dark-600" : "bg-white border border-dark-200"
                      )}>
                        <Server className="w-6 h-6 text-primary-500" />
                      </div>
                      <div>
                        <h3 className={clsx(
                          "font-semibold group-hover:text-primary-500 transition-colors",
                          isDark ? "text-white" : "text-dark-900"
                        )}>{invoice.service_name}</h3>
                        <p className="text-sm text-dark-500">
                          {invoice.service_type} • Next due: {invoice.next_due_date ? new Date(invoice.next_due_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Invoice Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={clsx(
                "rounded-2xl overflow-hidden",
                isDark 
                  ? "bg-dark-800/80 border border-dark-700/50" 
                  : "bg-white border border-dark-100 shadow-sm"
              )}
            >
              <div className="p-6 border-b border-dark-100 dark:border-dark-700/50">
                <h2 className={clsx(
                  "text-lg font-bold",
                  isDark ? "text-white" : "text-dark-900"
                )}>Invoice Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isDark ? "bg-dark-700" : "bg-dark-100"
                  )}>
                    <Hash className="w-5 h-5 text-dark-500" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500 uppercase tracking-wider">Invoice Number</p>
                    <p className={clsx(
                      "font-semibold",
                      isDark ? "text-white" : "text-dark-900"
                    )}>{invoice.invoice_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isDark ? "bg-dark-700" : "bg-dark-100"
                  )}>
                    <Calendar className="w-5 h-5 text-dark-500" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500 uppercase tracking-wider">Due Date</p>
                    <p className={clsx(
                      "font-semibold",
                      isDark ? "text-white" : "text-dark-900"
                    )}>{new Date(invoice.due_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</p>
                  </div>
                </div>

                {invoice.payment_method && (
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isDark ? "bg-dark-700" : "bg-dark-100"
                    )}>
                      <CreditCard className="w-5 h-5 text-dark-500" />
                    </div>
                    <div>
                      <p className="text-xs text-dark-500 uppercase tracking-wider">Payment Method</p>
                      <p className={clsx(
                        "font-semibold capitalize",
                        isDark ? "text-white" : "text-dark-900"
                      )}>{invoice.payment_method}</p>
                    </div>
                  </div>
                )}

                {invoice.order_number && (
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isDark ? "bg-dark-700" : "bg-dark-100"
                    )}>
                      <Package className="w-5 h-5 text-dark-500" />
                    </div>
                    <div>
                      <p className="text-xs text-dark-500 uppercase tracking-wider">Order Number</p>
                      <p className={clsx(
                        "font-semibold",
                        isDark ? "text-white" : "text-dark-900"
                      )}>{invoice.order_number}</p>
                    </div>
                  </div>
                )}

                {/* Total Amount Card */}
                <div className={clsx(
                  "mt-6 p-4 rounded-xl text-center",
                  invoice.status === 'paid'
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : invoice.status === 'unpaid'
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : isDark ? "bg-dark-700" : "bg-dark-100"
                )}>
                  <p className="text-sm text-dark-500 mb-1">Total Amount</p>
                  <p className={clsx(
                    "text-3xl font-bold",
                    invoice.status === 'paid' ? "text-emerald-500" : 
                    invoice.status === 'unpaid' ? "text-amber-500" :
                    isDark ? "text-white" : "text-dark-900"
                  )}>{format(invoice.total)}</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={clsx(
                "rounded-2xl p-6",
                isDark 
                  ? "bg-dark-800/80 border border-dark-700/50" 
                  : "bg-white border border-dark-100 shadow-sm"
              )}
            >
              <h2 className={clsx(
                "text-lg font-bold mb-4",
                isDark ? "text-white" : "text-dark-900"
              )}>Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/dashboard/tickets/new"
                  className={clsx(
                    "flex items-center gap-3 w-full p-3 rounded-xl transition-all",
                    isDark ? "hover:bg-dark-700" : "hover:bg-dark-50"
                  )}
                >
                  <Mail className="w-5 h-5 text-primary-500" />
                  <span className={isDark ? "text-white" : "text-dark-900"}>Contact Support</span>
                </Link>
                <Link
                  to="/dashboard/invoices"
                  className={clsx(
                    "flex items-center gap-3 w-full p-3 rounded-xl transition-all",
                    isDark ? "hover:bg-dark-700" : "hover:bg-dark-50"
                  )}
                >
                  <FileText className="w-5 h-5 text-primary-500" />
                  <span className={isDark ? "text-white" : "text-dark-900"}>View All Invoices</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
