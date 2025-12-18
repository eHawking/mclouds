import { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, Search, Eye, Download, CheckCircle, XCircle, Clock,
  DollarSign, User, Calendar, Loader2, Filter, ExternalLink, X,
  CreditCard, Building2, Mail, Phone, MapPin, Receipt, Ban, RotateCcw,
  Printer, Share2, Send, Globe, Sparkles
} from 'lucide-react'
import { adminAPI } from '../../lib/api'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import ConfirmDialog from '../../components/ConfirmDialog'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function AdminInvoices() {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoiceDetails, setInvoiceDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', invoice: null })
  const [actionLoading, setActionLoading] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const invoiceRef = useRef(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-invoices', statusFilter],
    queryFn: () => adminAPI.getInvoices({ status: statusFilter }).then(res => res.data)
  })

  const loadInvoiceDetails = async (invoice) => {
    setSelectedInvoice(invoice)
    setLoadingDetails(true)
    try {
      const res = await adminAPI.getInvoice(invoice.uuid)
      setInvoiceDetails(res.data.invoice)
    } catch (err) {
      toast.error('Failed to load invoice details')
      setSelectedInvoice(null)
    } finally {
      setLoadingDetails(false)
    }
  }

  const updateStatus = async (uuid, newStatus) => {
    try {
      await adminAPI.updateInvoiceStatus(uuid, newStatus)
      toast.success('Invoice status updated')
      refetch()
      if (invoiceDetails?.uuid === uuid) {
        setInvoiceDetails({ ...invoiceDetails, status: newStatus })
      }
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const closeModal = () => {
    setSelectedInvoice(null)
    setInvoiceDetails(null)
  }

  const downloadPdf = async () => {
    if (!invoiceRef.current || !invoiceDetails) return
    
    setDownloadingPdf(true)
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${invoiceDetails.invoice_number}.pdf`)
      
      toast.success('Invoice downloaded successfully!')
    } catch (err) {
      console.error('PDF download error:', err)
      toast.error('Failed to download PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
  }

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      unpaid: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      draft: 'bg-dark-200 text-dark-600 dark:bg-dark-700 dark:text-dark-400',
      cancelled: 'bg-dark-200 text-dark-600 dark:bg-dark-700 dark:text-dark-400',
      refunded: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    }
    return colors[status] || colors.draft
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return CheckCircle
      case 'unpaid': return Clock
      case 'cancelled': return XCircle
      default: return FileText
    }
  }

  const filteredInvoices = data?.invoices?.filter(invoice => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
      invoice.email?.toLowerCase().includes(searchLower) ||
      invoice.first_name?.toLowerCase().includes(searchLower) ||
      invoice.last_name?.toLowerCase().includes(searchLower)
    )
  }) || []

  // Stats
  const stats = {
    total: data?.invoices?.length || 0,
    paid: data?.invoices?.filter(i => i.status === 'paid').length || 0,
    unpaid: data?.invoices?.filter(i => i.status === 'unpaid').length || 0,
    totalRevenue: data?.invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.total || 0), 0) || 0,
  }

  return (
    <>
      <Helmet><title>Invoices - Admin - Magnetic Clouds</title></Helmet>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-dark-500 mt-1">Manage all invoices from proposals and orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-dark-500">Total Invoices</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.paid}</p>
            <p className="text-xs text-dark-500">Paid</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.unpaid}</p>
            <p className="text-xs text-dark-500">Unpaid</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-dark-500">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="input pl-11 w-full"
          />
        </div>
        <div className="flex gap-2">
          {['', 'unpaid', 'paid', 'cancelled', 'refunded'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                statusFilter === status 
                  ? "bg-primary-500 text-white" 
                  : "bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700"
              )}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filteredInvoices.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="text-left p-4 font-medium">Invoice #</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Due Date</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
              {filteredInvoices.map(invoice => {
                const StatusIcon = getStatusIcon(invoice.status)
                return (
                  <tr 
                    key={invoice.uuid}
                    onClick={() => loadInvoiceDetails(invoice)}
                    className="hover:bg-dark-50 dark:hover:bg-dark-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-mono font-medium">{invoice.invoice_number}</p>
                          {invoice.proposal_title && (
                            <p className="text-xs text-dark-500">{invoice.proposal_title}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{invoice.first_name} {invoice.last_name}</p>
                      <p className="text-sm text-dark-500">{invoice.email}</p>
                    </td>
                    <td className="p-4 text-dark-500">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-dark-500">{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={clsx("px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1", getStatusColor(invoice.status))}>
                        <StatusIcon className="w-3 h-3" />
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold">{formatCurrency(invoice.total)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Invoices Found</h2>
          <p className="text-dark-500">Invoices will appear here when proposals are accepted or orders are placed.</p>
        </div>
      )}

      {/* Premium Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" 
            onClick={closeModal}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl my-8"
              onClick={e => e.stopPropagation()}
            >
              {loadingDetails ? (
                <div className="bg-white dark:bg-dark-800 rounded-2xl flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : invoiceDetails ? (
                <>
                  {/* Action Bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={downloadPdf}
                        disabled={downloadingPdf}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
                      >
                        {downloadingPdf ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Download PDF
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur text-white rounded-xl font-medium hover:bg-white/20 transition-all">
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur text-white rounded-xl font-medium hover:bg-white/20 transition-all">
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </div>
                    <button 
                      onClick={closeModal} 
                      className="p-2 bg-white/10 backdrop-blur text-white rounded-xl hover:bg-white/20 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Invoice Document */}
                  <div ref={invoiceRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Premium Header */}
                    <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8 overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
                      </div>
                      
                      <div className="relative flex justify-between items-start">
                        {/* Company Info */}
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h1 className="text-2xl font-bold">Magnetic Clouds</h1>
                              <p className="text-white/60 text-sm">Premium Cloud Services</p>
                            </div>
                          </div>
                          <div className="text-sm text-white/70 space-y-1">
                            <p className="flex items-center gap-2"><Globe className="w-4 h-4" /> clouds.hassanscode.com</p>
                            <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@hassanscode.com</p>
                          </div>
                        </div>

                        {/* Invoice Info */}
                        <div className="text-right">
                          <div className="inline-block">
                            <h2 className="text-4xl font-bold tracking-tight mb-2">INVOICE</h2>
                            <p className="text-lg font-mono text-purple-300">{invoiceDetails.invoice_number}</p>
                            <div className="mt-4">
                              <span className={clsx(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide",
                                invoiceDetails.status === 'paid' && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                                invoiceDetails.status === 'unpaid' && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                                invoiceDetails.status === 'cancelled' && "bg-red-500/20 text-red-300 border border-red-500/30",
                                invoiceDetails.status === 'refunded' && "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              )}>
                                {invoiceDetails.status === 'paid' && <CheckCircle className="w-4 h-4" />}
                                {invoiceDetails.status === 'unpaid' && <Clock className="w-4 h-4" />}
                                {invoiceDetails.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                                {invoiceDetails.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Body */}
                    <div className="p-8">
                      {/* Bill To & Details */}
                      <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* Bill To */}
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Bill To</h3>
                          <div className="space-y-2">
                            <p className="text-xl font-bold text-slate-800">{invoiceDetails.first_name} {invoiceDetails.last_name}</p>
                            {invoiceDetails.company && (
                              <p className="text-slate-600 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" /> {invoiceDetails.company}
                              </p>
                            )}
                            <p className="text-slate-600 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-slate-400" /> {invoiceDetails.email}
                            </p>
                            {invoiceDetails.phone && (
                              <p className="text-slate-600 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" /> {invoiceDetails.phone}
                              </p>
                            )}
                            {invoiceDetails.address && (
                              <p className="text-slate-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" /> {invoiceDetails.address}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Invoice Details */}
                        <div className="md:text-right">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Invoice Details</h3>
                          <div className="space-y-3">
                            <div className="flex md:justify-end gap-8">
                              <div>
                                <p className="text-xs text-slate-400 uppercase">Issue Date</p>
                                <p className="font-semibold text-slate-800">{new Date(invoiceDetails.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 uppercase">Due Date</p>
                                <p className="font-semibold text-slate-800">{new Date(invoiceDetails.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                              </div>
                            </div>
                            {invoiceDetails.paid_date && (
                              <div>
                                <p className="text-xs text-slate-400 uppercase">Paid On</p>
                                <p className="font-semibold text-emerald-600">{new Date(invoiceDetails.paid_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="mb-8">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-slate-200">
                              <th className="text-left py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Description</th>
                              <th className="text-center py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-24">Qty</th>
                              <th className="text-right py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-32">Price</th>
                              <th className="text-right py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-32">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {invoiceDetails.items && invoiceDetails.items.length > 0 ? (
                              invoiceDetails.items.map((item, idx) => (
                                <tr key={idx} className="group">
                                  <td className="py-4">
                                    <p className="font-semibold text-slate-800">{item.name}</p>
                                    {item.description && <p className="text-sm text-slate-500 mt-1">{item.description}</p>}
                                  </td>
                                  <td className="py-4 text-center text-slate-600">{item.quantity || 1}</td>
                                  <td className="py-4 text-right text-slate-600">{formatCurrency(item.price)}</td>
                                  <td className="py-4 text-right font-semibold text-slate-800">{formatCurrency((item.quantity || 1) * Number(item.price))}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td className="py-4">
                                  <p className="font-semibold text-slate-800">{invoiceDetails.proposal_title || 'Service'}</p>
                                </td>
                                <td className="py-4 text-center text-slate-600">1</td>
                                <td className="py-4 text-right text-slate-600">{formatCurrency(invoiceDetails.subtotal)}</td>
                                <td className="py-4 text-right font-semibold text-slate-800">{formatCurrency(invoiceDetails.subtotal)}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals */}
                      <div className="flex justify-end">
                        <div className="w-80">
                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-slate-600">
                              <span>Subtotal</span>
                              <span className="font-medium">{formatCurrency(invoiceDetails.subtotal)}</span>
                            </div>
                            {parseFloat(invoiceDetails.discount || 0) > 0 && (
                              <div className="flex justify-between text-emerald-600">
                                <span>Discount</span>
                                <span className="font-medium">-{formatCurrency(invoiceDetails.discount)}</span>
                              </div>
                            )}
                            {parseFloat(invoiceDetails.tax || 0) > 0 && (
                              <div className="flex justify-between text-slate-600">
                                <span>Tax</span>
                                <span className="font-medium">{formatCurrency(invoiceDetails.tax)}</span>
                              </div>
                            )}
                          </div>
                          <div className="pt-4 border-t-2 border-slate-200">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-slate-800">Total Due</span>
                              <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                                {formatCurrency(invoiceDetails.total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {invoiceDetails.notes && (
                        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Notes</h4>
                          <p className="text-sm text-slate-600">{invoiceDetails.notes}</p>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                        <p className="text-sm text-slate-400">Thank you for your business!</p>
                        <p className="text-xs text-slate-400 mt-1">Questions? Contact us at support@hassanscode.com</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {invoiceDetails.status === 'unpaid' && (
                      <button 
                        onClick={() => updateStatus(invoiceDetails.uuid, 'paid')}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                      >
                        <CheckCircle className="w-5 h-5" /> Mark as Paid
                      </button>
                    )}
                    {invoiceDetails.status === 'paid' && (
                      <button 
                        onClick={() => setConfirmDialog({ open: true, type: 'refund', invoice: invoiceDetails })}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                      >
                        <RotateCcw className="w-5 h-5" /> Refund Invoice
                      </button>
                    )}
                    {invoiceDetails.status !== 'cancelled' && invoiceDetails.status !== 'paid' && (
                      <button 
                        onClick={() => setConfirmDialog({ open: true, type: 'cancel', invoice: invoiceDetails })}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all"
                      >
                        <XCircle className="w-5 h-5" /> Cancel Invoice
                      </button>
                    )}
                  </div>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: '', invoice: null })}
        onConfirm={async () => {
          setActionLoading(true)
          try {
            const newStatus = confirmDialog.type === 'cancel' ? 'cancelled' : 'refunded'
            await updateStatus(confirmDialog.invoice.uuid, newStatus)
            setConfirmDialog({ open: false, type: '', invoice: null })
          } finally {
            setActionLoading(false)
          }
        }}
        title={confirmDialog.type === 'cancel' ? 'Cancel Invoice?' : 'Refund Invoice?'}
        message={
          confirmDialog.type === 'cancel' 
            ? `Are you sure you want to cancel invoice ${confirmDialog.invoice?.invoice_number}? This action cannot be undone.`
            : `Are you sure you want to refund invoice ${confirmDialog.invoice?.invoice_number}? The payment will be marked as refunded.`
        }
        confirmText={confirmDialog.type === 'cancel' ? 'Yes, Cancel Invoice' : 'Yes, Refund'}
        type={confirmDialog.type === 'cancel' ? 'danger' : 'warning'}
        icon={confirmDialog.type === 'cancel' ? Ban : RotateCcw}
        loading={actionLoading}
      />
    </>
  )
}
