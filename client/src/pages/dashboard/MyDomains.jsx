import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Globe, Plus, Search, Filter, Calendar, Clock, Shield, 
  CheckCircle, AlertCircle, XCircle, RefreshCw, ExternalLink,
  Copy, MoreVertical, ChevronRight, Sparkles, Lock, Server,
  Settings, Mail, ArrowUpRight, Zap
} from 'lucide-react'
import { userAPI } from '../../lib/api'
import { useCurrencyStore, useThemeStore } from '../../store/useStore'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const statusConfig = {
  active: { 
    color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20', 
    icon: CheckCircle,
    label: 'Active',
    glow: 'shadow-emerald-500/20'
  },
  pending: { 
    color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20', 
    icon: Clock,
    label: 'Pending',
    glow: 'shadow-amber-500/20'
  },
  suspended: { 
    color: 'bg-red-500/10 text-red-500 border border-red-500/20', 
    icon: AlertCircle,
    label: 'Suspended',
    glow: 'shadow-red-500/20'
  },
  cancelled: { 
    color: 'bg-dark-500/10 text-dark-400 border border-dark-500/20', 
    icon: XCircle,
    label: 'Cancelled',
    glow: 'shadow-dark-500/20'
  },
  terminated: { 
    color: 'bg-dark-500/10 text-dark-400 border border-dark-500/20', 
    icon: XCircle,
    label: 'Terminated',
    glow: 'shadow-dark-500/20'
  },
}

const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function MyDomains() {
  const { format } = useCurrencyStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch both domains API and all services to catch domains that might be mistyped
  const { data, isLoading } = useQuery({
    queryKey: ['user-domains'],
    queryFn: () => userAPI.getDomains().then(res => res.data)
  })

  const { data: servicesData } = useQuery({
    queryKey: ['user-services-for-domains'],
    queryFn: () => userAPI.getServices().then(res => res.data)
  })

  // Domain TLDs for detection
  const domainTLDs = ['.com', '.net', '.org', '.io', '.co', '.dev', '.app', '.xyz', '.info', '.biz', '.me', '.us', '.uk', '.ca', '.au', '.de', '.fr', '.in', '.bd']
  
  // Check if a service name looks like a domain
  const isDomainName = (name) => {
    if (!name) return false
    const lowerName = name.toLowerCase()
    return domainTLDs.some(tld => lowerName.endsWith(tld)) && 
           !lowerName.includes('hosting') && 
           !lowerName.includes('vps') && 
           !lowerName.includes('server')
  }

  // Get domains from API + any services that look like domains but aren't typed as such
  const apiDomains = data?.domains || []
  const apiDomainUuids = new Set(apiDomains.map(d => d.uuid))
  
  // Find services that look like domains but might not be in the domains list
  const additionalDomains = (servicesData?.services || []).filter(s => 
    !apiDomainUuids.has(s.uuid) && isDomainName(s.domain_name || s.name)
  )
  
  const domains = [...apiDomains, ...additionalDomains]
  
  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.domain_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         domain.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || domain.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const stats = {
    total: domains.length,
    active: domains.filter(d => d.status === 'active').length,
    expiringSoon: domains.filter(d => {
      const days = getDaysUntilExpiry(d.expires_at)
      return days !== null && days <= 30 && days > 0
    }).length
  }

  return (
    <>
      <Helmet><title>My Domains - Magnetic Clouds</title></Helmet>

      <div className="space-y-6">
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
                <Globe className="w-4 h-4" />
                Domain Management
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-white">
                My Domains
              </h1>
              <p className="text-white/70 text-lg max-w-md">
                Manage all your registered domains in one place
              </p>
            </div>
            <Link 
              to="/domains" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-black/20"
            >
              <Plus className="w-5 h-5" />
              Register New Domain
            </Link>
          </div>

          {/* Stats Row */}
          {domains.length > 0 && (
            <div className="relative mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-white">{stats.total}</p>
                <p className="text-white/70 text-sm">Total Domains</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-emerald-300">{stats.active}</p>
                <p className="text-white/70 text-sm">Active</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-amber-300">{stats.expiringSoon}</p>
                <p className="text-white/70 text-sm">Expiring Soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        {domains.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "flex flex-col sm:flex-row gap-4 p-4 rounded-2xl",
              isDark 
                ? "bg-dark-800/80 border border-dark-700/50" 
                : "bg-white border border-dark-100 shadow-sm"
            )}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search domains..."
                className={clsx(
                  "w-full pl-12 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-primary-500",
                  isDark ? "bg-dark-700 text-white" : "bg-dark-50 text-dark-900"
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-dark-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={clsx(
                  "px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-primary-500",
                  isDark ? "bg-dark-700 text-white" : "bg-dark-50 text-dark-900"
                )}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Domain List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-dark-500">Loading your domains...</p>
            </div>
          </div>
        ) : filteredDomains.length > 0 ? (
          <div className="space-y-4">
            {filteredDomains.map((domain, idx) => {
              const status = statusConfig[domain.status] || statusConfig.pending
              const StatusIcon = status.icon
              const daysUntilExpiry = getDaysUntilExpiry(domain.expires_at)
              const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0
              const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0

              return (
                <motion.div
                  key={domain.uuid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={clsx(
                    "group rounded-2xl overflow-hidden transition-all duration-300",
                    "hover:shadow-xl hover:-translate-y-1",
                    isDark 
                      ? "bg-dark-800/80 border border-dark-700/50 hover:border-dark-600" 
                      : "bg-white border border-dark-100 hover:border-dark-200 shadow-sm"
                  )}
                >
                  <div className="p-6">
                    {/* Domain Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                          "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
                        )}>
                          <Globe className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className={clsx(
                              "text-xl font-bold",
                              isDark ? "text-white" : "text-dark-900"
                            )}>
                              {domain.domain_name || domain.name}
                            </h3>
                            <button 
                              onClick={() => copyToClipboard(domain.domain_name || domain.name)}
                              className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                            >
                              <Copy className="w-4 h-4 text-dark-400" />
                            </button>
                            <a 
                              href={`https://${domain.domain_name || domain.name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-dark-400" />
                            </a>
                          </div>
                          <p className="text-dark-500 text-sm mt-1">
                            Registered on {domain.registration_date ? new Date(domain.registration_date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            }) : domain.created_at ? new Date(domain.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'}
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
                        {domain.auto_renew && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Auto-Renew
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Domain Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className={clsx(
                        "p-4 rounded-xl",
                        isDark ? "bg-dark-700/50" : "bg-dark-50"
                      )}>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-dark-400" />
                          <span className="text-xs text-dark-500 uppercase tracking-wider font-medium">Expires</span>
                        </div>
                        <p className={clsx(
                          "font-semibold",
                          isExpired ? "text-red-500" : isExpiringSoon ? "text-amber-500" : isDark ? "text-white" : "text-dark-900"
                        )}>
                          {domain.expires_at ? new Date(domain.expires_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </p>
                        {daysUntilExpiry !== null && (
                          <p className={clsx(
                            "text-xs mt-1",
                            isExpired ? "text-red-500" : isExpiringSoon ? "text-amber-500" : "text-dark-500"
                          )}>
                            {isExpired ? 'Expired' : `${daysUntilExpiry} days left`}
                          </p>
                        )}
                      </div>

                      <div className={clsx(
                        "p-4 rounded-xl",
                        isDark ? "bg-dark-700/50" : "bg-dark-50"
                      )}>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-dark-400" />
                          <span className="text-xs text-dark-500 uppercase tracking-wider font-medium">Next Due</span>
                        </div>
                        <p className={clsx(
                          "font-semibold",
                          isDark ? "text-white" : "text-dark-900"
                        )}>
                          {domain.next_due_date ? new Date(domain.next_due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </p>
                        <p className="text-xs text-dark-500 mt-1 capitalize">{domain.billing_cycle || 'Yearly'}</p>
                      </div>

                      <div className={clsx(
                        "p-4 rounded-xl",
                        isDark ? "bg-dark-700/50" : "bg-dark-50"
                      )}>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-dark-400" />
                          <span className="text-xs text-dark-500 uppercase tracking-wider font-medium">Protection</span>
                        </div>
                        <p className={clsx(
                          "font-semibold",
                          isDark ? "text-white" : "text-dark-900"
                        )}>
                          WHOIS Privacy
                        </p>
                        <p className="text-xs text-emerald-500 mt-1">Enabled</p>
                      </div>

                      <div className={clsx(
                        "p-4 rounded-xl",
                        isDark ? "bg-dark-700/50" : "bg-dark-50"
                      )}>
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-4 h-4 text-dark-400" />
                          <span className="text-xs text-dark-500 uppercase tracking-wider font-medium">Lock Status</span>
                        </div>
                        <p className={clsx(
                          "font-semibold",
                          isDark ? "text-white" : "text-dark-900"
                        )}>
                          Transfer Lock
                        </p>
                        <p className="text-xs text-emerald-500 mt-1">Locked</p>
                      </div>
                    </div>

                    {/* Expiring Soon Warning */}
                    {isExpiringSoon && (
                      <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                          <div>
                            <p className="text-amber-600 dark:text-amber-400 font-medium">
                              Domain expires in {daysUntilExpiry} days
                            </p>
                            <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                              Renew now to avoid losing your domain
                            </p>
                          </div>
                          <button className="ml-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
                            Renew Now
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-dark-100 dark:border-dark-700/50">
                      <Link 
                        to={`/dashboard/services/${domain.uuid}/manage`}
                        className={clsx(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                          isDark 
                            ? "bg-dark-700 hover:bg-dark-600 text-white" 
                            : "bg-dark-100 hover:bg-dark-200 text-dark-700"
                        )}
                      >
                        <Server className="w-4 h-4" />
                        DNS Settings
                      </Link>
                      <Link 
                        to={`/dashboard/services/${domain.uuid}/manage`}
                        className={clsx(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                          isDark 
                            ? "bg-dark-700 hover:bg-dark-600 text-white" 
                            : "bg-dark-100 hover:bg-dark-200 text-dark-700"
                        )}
                      >
                        <Mail className="w-4 h-4" />
                        Email Forwarding
                      </Link>
                      <Link 
                        to={`/dashboard/services/${domain.uuid}/manage`}
                        className={clsx(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                          isDark 
                            ? "bg-dark-700 hover:bg-dark-600 text-white" 
                            : "bg-dark-100 hover:bg-dark-200 text-dark-700"
                        )}
                      >
                        <Settings className="w-4 h-4" />
                        Manage
                      </Link>
                      <button className={clsx(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                        "bg-primary-500 hover:bg-primary-600 text-white"
                      )}>
                        <RefreshCw className="w-4 h-4" />
                        Renew Domain
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "rounded-2xl p-12 text-center",
              isDark 
                ? "bg-dark-800/80 border border-dark-700/50" 
                : "bg-white border border-dark-100 shadow-sm"
            )}
          >
            <div className={clsx(
              "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6",
              "bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20"
            )}>
              <Globe className="w-12 h-12 text-indigo-500" />
            </div>
            <h2 className={clsx(
              "text-2xl font-bold mb-3",
              isDark ? "text-white" : "text-dark-900"
            )}>
              {searchQuery || statusFilter !== 'all' ? 'No Domains Found' : 'No Domains Yet'}
            </h2>
            <p className="text-dark-500 mb-8 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Register your first domain and establish your online presence today'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <div className="space-y-4">
                <Link 
                  to="/domains" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  <Search className="w-5 h-5" />
                  Search Available Domains
                </Link>
                <div className="flex items-center justify-center gap-6 text-sm text-dark-500">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Instant Activation
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Free WHOIS Privacy
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-blue-500" />
                    Transfer Lock
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  )
}
