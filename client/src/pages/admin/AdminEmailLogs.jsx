import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Search, Filter, Eye, X, CheckCircle, XCircle, Clock,
  Send, User, Calendar, FileText, Loader2, RefreshCw, ChevronLeft,
  ChevronRight, AlertTriangle, ExternalLink, Copy, Inbox
} from 'lucide-react'
import { adminAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  sent: { label: 'Sent', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  bounced: { label: 'Bounced', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertTriangle }
}

export default function AdminEmailLogs() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-email-logs', search, statusFilter, page],
    queryFn: () => adminAPI.getEmailLogs({ search, status: statusFilter !== 'all' ? statusFilter : undefined, page, limit }).then(res => res.data)
  })

  const emails = data?.logs || []
  const stats = data?.stats || { total: 0, sent: 0, failed: 0, pending: 0 }
  const totalPages = Math.ceil((data?.total || 0) / limit)

  const copyHtml = () => {
    if (selectedEmail?.html_content) {
      navigator.clipboard.writeText(selectedEmail.html_content)
      toast.success('HTML copied to clipboard')
    }
  }

  return (
    <>
      <Helmet><title>Email Logs - Admin - Magnetic Clouds</title></Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Mail className="w-6 h-6 text-white" />
            </div>
            Email Logs
          </h1>
          <p className="text-dark-500 mt-1">View all sent emails and their delivery status</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-xl shadow-blue-500/20"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
          <Inbox className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-blue-100">Total Emails</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-xl shadow-emerald-500/20"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
          <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{stats.sent}</p>
          <p className="text-sm text-emerald-100">Sent</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white shadow-xl shadow-amber-500/20"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
          <Clock className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{stats.pending}</p>
          <p className="text-sm text-amber-100">Pending</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-5 text-white shadow-xl shadow-red-500/20"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
          <XCircle className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{stats.failed}</p>
          <p className="text-sm text-red-100">Failed</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, subject, or recipient..."
              className="input pl-11 w-full"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'sent', 'pending', 'failed', 'bounced'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={clsx(
                  "px-4 py-2 rounded-lg font-medium capitalize transition-all",
                  statusFilter === status
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                    : "bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-20">
            <Mail className="w-16 h-16 text-dark-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No emails found</h3>
            <p className="text-dark-500">Email logs will appear here when emails are sent</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {emails.map((email, idx) => {
              const statusConfig = STATUS_CONFIG[email.status] || STATUS_CONFIG.pending
              const StatusIcon = statusConfig.icon
              
              return (
                <motion.div
                  key={email.uuid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setSelectedEmail(email)}
                  className="p-4 hover:bg-dark-50 dark:hover:bg-dark-800/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      email.status === 'sent' ? "bg-emerald-100 dark:bg-emerald-900/30" :
                      email.status === 'failed' ? "bg-red-100 dark:bg-red-900/30" :
                      email.status === 'bounced' ? "bg-orange-100 dark:bg-orange-900/30" :
                      "bg-amber-100 dark:bg-amber-900/30"
                    )}>
                      <StatusIcon className={clsx(
                        "w-5 h-5",
                        email.status === 'sent' ? "text-emerald-600" :
                        email.status === 'failed' ? "text-red-600" :
                        email.status === 'bounced' ? "text-orange-600" :
                        "text-amber-600"
                      )} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="font-semibold truncate group-hover:text-primary-500 transition-colors">
                            {email.subject}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-dark-500">
                            <User className="w-4 h-4" />
                            <span className="truncate">{email.recipient_name || email.recipient_email}</span>
                            <span className="text-dark-300">•</span>
                            <span>{email.recipient_email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", statusConfig.color)}>
                            {statusConfig.label}
                          </span>
                          <Eye className="w-5 h-5 text-dark-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-dark-400">
                        {email.template && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {email.template}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(email.created_at).toLocaleString()}
                        </span>
                        {email.sent_at && (
                          <span className="flex items-center gap-1">
                            <Send className="w-3 h-3" />
                            Sent {new Date(email.sent_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-dark-200 dark:border-dark-700">
            <p className="text-sm text-dark-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEmail(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-dark-200 dark:border-dark-700 bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedEmail.subject}</h2>
                      <div className="flex items-center gap-2 mt-1 text-sm text-dark-500">
                        <span>To: {selectedEmail.recipient_name ? `${selectedEmail.recipient_name} <${selectedEmail.recipient_email}>` : selectedEmail.recipient_email}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                  <span className={clsx("px-3 py-1 rounded-full font-medium", STATUS_CONFIG[selectedEmail.status]?.color)}>
                    {STATUS_CONFIG[selectedEmail.status]?.label}
                  </span>
                  {selectedEmail.template && (
                    <span className="px-3 py-1 rounded-full bg-dark-100 dark:bg-dark-800 font-medium">
                      Template: {selectedEmail.template}
                    </span>
                  )}
                  <span className="text-dark-500">
                    Created: {new Date(selectedEmail.created_at).toLocaleString()}
                  </span>
                  {selectedEmail.sent_at && (
                    <span className="text-dark-500">
                      Sent: {new Date(selectedEmail.sent_at).toLocaleString()}
                    </span>
                  )}
                  {selectedEmail.opened_at && (
                    <span className="text-emerald-500">
                      Opened: {new Date(selectedEmail.opened_at).toLocaleString()}
                    </span>
                  )}
                </div>

                {selectedEmail.error_message && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      <strong>Error:</strong> {selectedEmail.error_message}
                    </p>
                  </div>
                )}
              </div>

              {/* Email Content Preview */}
              <div className="flex-1 overflow-auto p-6 bg-dark-50 dark:bg-dark-950">
                <div className="flex justify-end mb-4">
                  <button onClick={copyHtml} className="btn-secondary text-sm">
                    <Copy className="w-4 h-4 mr-2" /> Copy HTML
                  </button>
                </div>
                
                {/* Rendered Email Preview */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-dark-200 dark:border-dark-700">
                  <div className="bg-dark-100 dark:bg-dark-800 px-4 py-2 flex items-center gap-2 border-b border-dark-200 dark:border-dark-700">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-4 text-sm text-dark-500">Email Preview</span>
                  </div>
                  <iframe
                    srcDoc={selectedEmail.html_content}
                    className="w-full min-h-[500px] bg-white"
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
