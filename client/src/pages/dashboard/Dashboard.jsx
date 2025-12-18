import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  Server, Globe, FileText, Ticket, AlertCircle, ArrowRight,
  TrendingUp, Clock, CheckCircle, XCircle, Plus, Sparkles,
  Activity, Zap, Shield, ChevronRight
} from 'lucide-react'
import { userAPI } from '../../lib/api'
import { useAuthStore, useCurrencyStore, useThemeStore } from '../../store/useStore'
import clsx from 'clsx'

const statusColors = {
  active: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  suspended: 'bg-red-500/10 text-red-500 border border-red-500/20',
  cancelled: 'bg-dark-500/10 text-dark-400 border border-dark-500/20',
  open: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  answered: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  'customer-reply': 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  closed: 'bg-dark-500/10 text-dark-400 border border-dark-500/20',
  paid: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  unpaid: 'bg-red-500/10 text-red-500 border border-red-500/20',
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { format } = useCurrencyStore()
  const { themeStyle, theme } = useThemeStore()
  const isDark = theme === 'dark'

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => userAPI.getDashboard().then(res => res.data)
  })

  const isGradient = themeStyle === 'gradient'

  const stats = [
    { 
      label: 'Active Services', 
      value: data?.stats?.services?.active || 0,
      total: data?.stats?.services?.total || 0,
      icon: Server, 
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      bgGlow: 'bg-blue-500/20',
      iconBg: 'bg-blue-500',
      to: '/dashboard/services'
    },
    { 
      label: 'Open Tickets', 
      value: data?.stats?.tickets?.open || 0,
      total: data?.stats?.tickets?.total || 0,
      icon: Ticket, 
      gradient: 'from-amber-500 via-orange-500 to-yellow-500',
      bgGlow: 'bg-amber-500/20',
      iconBg: 'bg-amber-500',
      to: '/dashboard/tickets'
    },
    { 
      label: 'Unpaid Invoices', 
      value: data?.stats?.invoices?.unpaid || 0,
      total: data?.stats?.invoices?.total || 0,
      icon: FileText, 
      gradient: 'from-rose-500 via-red-500 to-pink-500',
      bgGlow: 'bg-rose-500/20',
      iconBg: 'bg-rose-500',
      to: '/dashboard/invoices'
    },
    { 
      label: 'Total Orders', 
      value: data?.stats?.orders?.total || 0,
      icon: TrendingUp, 
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      bgGlow: 'bg-emerald-500/20',
      iconBg: 'bg-emerald-500',
      to: '/dashboard/orders'
    },
  ]

  return (
    <>
      <Helmet>
        <title>Dashboard - Magnetic Clouds</title>
      </Helmet>

      <div className="space-y-8">
        {/* Premium Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 p-8">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
          </div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Welcome back
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-white">
                Hello, {user?.first_name}! 👋
              </h1>
              <p className="text-white/70 text-lg max-w-md">
                Here's what's happening with your services today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link 
                to="/hosting" 
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-xl transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                New Service
              </Link>
              <Link 
                to="/dashboard/tickets/new" 
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-primary-600 font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-black/10"
              >
                <Plus className="w-5 h-5" />
                Open Ticket
              </Link>
            </div>
          </div>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Link
                to={stat.to}
                className={clsx(
                  "group relative block h-full overflow-hidden rounded-2xl transition-all duration-300",
                  "hover:shadow-2xl hover:-translate-y-1",
                  isDark 
                    ? "bg-dark-800/80 border border-dark-700/50 hover:border-dark-600" 
                    : "bg-white border border-dark-100 hover:border-dark-200 shadow-sm"
                )}
              >
                {/* Subtle glow effect on hover */}
                <div className={clsx(
                  "absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
                  stat.bgGlow
                )} />
                
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={clsx(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                      `bg-gradient-to-br ${stat.gradient}`
                    )}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className={clsx(
                      "text-4xl font-bold tracking-tight",
                      isDark ? "text-white" : "text-dark-900"
                    )}>
                      {stat.value}
                    </p>
                    <p className="text-dark-500 font-medium">{stat.label}</p>
                    {stat.total !== undefined && stat.total > 0 && (
                      <p className="text-sm text-dark-400">
                        of {stat.total} total
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Services & Tickets - Premium Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={clsx(
              "rounded-2xl overflow-hidden",
              isDark 
                ? "bg-dark-800/80 border border-dark-700/50" 
                : "bg-white border border-dark-100 shadow-sm"
            )}
          >
            <div className="p-6 flex items-center justify-between border-b border-dark-100 dark:border-dark-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <h2 className={clsx(
                  "text-lg font-bold",
                  isDark ? "text-white" : "text-dark-900"
                )}>Recent Services</h2>
              </div>
              <Link 
                to="/dashboard/services" 
                className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 text-sm font-semibold transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-dark-100 dark:divide-dark-700/50">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-dark-500 mt-3">Loading services...</p>
                </div>
              ) : data?.recent?.services?.length > 0 ? (
                data.recent.services.slice(0, 4).map((service, idx) => (
                  <Link
                    key={service.uuid}
                    to={`/dashboard/services/${service.uuid}`}
                    className="group flex items-center justify-between p-4 hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        isDark ? "bg-dark-700" : "bg-dark-100"
                      )}>
                        <Server className="w-6 h-6 text-primary-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={clsx(
                          "font-semibold truncate group-hover:text-primary-500 transition-colors",
                          isDark ? "text-white" : "text-dark-900"
                        )}>{service.name}</p>
                        <p className="text-sm text-dark-500 truncate">{service.service_type}</p>
                      </div>
                    </div>
                    <span className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 ml-4",
                      statusColors[service.status]
                    )}>
                      {service.status}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className={clsx(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                    isDark ? "bg-dark-700" : "bg-dark-100"
                  )}>
                    <Server className="w-8 h-8 text-dark-400" />
                  </div>
                  <p className={clsx(
                    "font-medium mb-1",
                    isDark ? "text-white" : "text-dark-900"
                  )}>No services yet</p>
                  <p className="text-dark-500 text-sm mb-4">Get started with your first service</p>
                  <Link 
                    to="/hosting" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Tickets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={clsx(
              "rounded-2xl overflow-hidden",
              isDark 
                ? "bg-dark-800/80 border border-dark-700/50" 
                : "bg-white border border-dark-100 shadow-sm"
            )}
          >
            <div className="p-6 flex items-center justify-between border-b border-dark-100 dark:border-dark-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <h2 className={clsx(
                  "text-lg font-bold",
                  isDark ? "text-white" : "text-dark-900"
                )}>Recent Tickets</h2>
              </div>
              <Link 
                to="/dashboard/tickets" 
                className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 text-sm font-semibold transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-dark-100 dark:divide-dark-700/50">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-dark-500 mt-3">Loading tickets...</p>
                </div>
              ) : data?.recent?.tickets?.length > 0 ? (
                data.recent.tickets.slice(0, 4).map((ticket) => (
                  <Link
                    key={ticket.uuid}
                    to={`/dashboard/tickets/${ticket.uuid}`}
                    className="group flex items-center justify-between p-4 hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        isDark ? "bg-dark-700" : "bg-dark-100"
                      )}>
                        <Ticket className="w-6 h-6 text-amber-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={clsx(
                          "font-semibold truncate group-hover:text-primary-500 transition-colors",
                          isDark ? "text-white" : "text-dark-900"
                        )}>{ticket.subject}</p>
                        <p className="text-sm text-dark-500">#{ticket.ticket_number}</p>
                      </div>
                    </div>
                    <span className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 ml-4",
                      statusColors[ticket.status]
                    )}>
                      {ticket.status}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className={clsx(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                    isDark ? "bg-dark-700" : "bg-dark-100"
                  )}>
                    <Ticket className="w-8 h-8 text-dark-400" />
                  </div>
                  <p className={clsx(
                    "font-medium mb-1",
                    isDark ? "text-white" : "text-dark-900"
                  )}>No tickets yet</p>
                  <p className="text-dark-500 text-sm mb-4">Need help? Open a support ticket</p>
                  <Link 
                    to="/dashboard/tickets/new" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Open Ticket
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Invoices - Premium Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={clsx(
            "rounded-2xl overflow-hidden",
            isDark 
              ? "bg-dark-800/80 border border-dark-700/50" 
              : "bg-white border border-dark-100 shadow-sm"
          )}
        >
          <div className="p-6 flex items-center justify-between border-b border-dark-100 dark:border-dark-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className={clsx(
                "text-lg font-bold",
                isDark ? "text-white" : "text-dark-900"
              )}>Recent Invoices</h2>
            </div>
            <Link 
              to="/dashboard/invoices" 
              className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 text-sm font-semibold transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={clsx(
                  "border-b",
                  isDark ? "border-dark-700/50 bg-dark-800/50" : "border-dark-100 bg-dark-50/50"
                )}>
                  <th className={clsx(
                    "text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider",
                    isDark ? "text-dark-400" : "text-dark-500"
                  )}>Invoice</th>
                  <th className={clsx(
                    "text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider",
                    isDark ? "text-dark-400" : "text-dark-500"
                  )}>Amount</th>
                  <th className={clsx(
                    "text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider",
                    isDark ? "text-dark-400" : "text-dark-500"
                  )}>Due Date</th>
                  <th className={clsx(
                    "text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider",
                    isDark ? "text-dark-400" : "text-dark-500"
                  )}>Status</th>
                  <th className={clsx(
                    "text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider",
                    isDark ? "text-dark-400" : "text-dark-500"
                  )}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-700/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-dark-500 mt-3">Loading invoices...</p>
                    </td>
                  </tr>
                ) : data?.recent?.invoices?.length > 0 ? (
                  data.recent.invoices.slice(0, 5).map((invoice) => (
                    <tr 
                      key={invoice.uuid} 
                      className="hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "font-semibold",
                          isDark ? "text-white" : "text-dark-900"
                        )}>{invoice.invoice_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "font-semibold",
                          isDark ? "text-white" : "text-dark-900"
                        )}>{format(invoice.total)}</span>
                      </td>
                      <td className="px-6 py-4 text-dark-500">
                        {new Date(invoice.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold",
                          statusColors[invoice.status]
                        )}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/dashboard/invoices/${invoice.uuid}`}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 text-dark-700 dark:text-dark-200"
                        >
                          View
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className={clsx(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                        isDark ? "bg-dark-700" : "bg-dark-100"
                      )}>
                        <FileText className="w-8 h-8 text-dark-400" />
                      </div>
                      <p className={clsx(
                        "font-medium mb-1",
                        isDark ? "text-white" : "text-dark-900"
                      )}>No invoices yet</p>
                      <p className="text-dark-500 text-sm">Your invoices will appear here</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </>
  )
}
