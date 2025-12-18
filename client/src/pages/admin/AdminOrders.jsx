import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../lib/api'
import { useCurrencyStore } from '../../store/useStore'
import { CheckCircle, XCircle, Eye, Clock, CreditCard, Building2, Banknote, X, Sparkles, Shield, Zap, Loader2, Edit3, User } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const statusColors = { pending: 'badge-warning', processing: 'badge-primary', active: 'badge-success', completed: 'badge-success', cancelled: 'badge-danger' }
const paymentStatusColors = { pending: 'badge-warning', paid: 'badge-success', failed: 'badge-danger', refunded: 'badge-primary', unpaid: 'badge-warning' }
const statusOptions = ['pending', 'processing', 'active', 'completed', 'cancelled']
const paymentStatusOptions = ['pending', 'paid', 'failed', 'refunded', 'unpaid']

export default function AdminOrders() {
  const { format } = useCurrencyStore()
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [viewProof, setViewProof] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, order: null, action: null })
  const [editModal, setEditModal] = useState({ open: false, order: null })
  const [editForm, setEditForm] = useState({ status: '', payment_status: '' })
  
  const { data, isLoading } = useQuery({ 
    queryKey: ['admin-orders'], 
    queryFn: () => adminAPI.getOrders().then(res => res.data) 
  })

  const updateStatus = useMutation({
    mutationFn: ({ uuid, status, payment_status }) => adminAPI.updateOrderStatus(uuid, { status, payment_status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders'])
      toast.success('Order updated successfully')
      setSelectedOrder(null)
      setConfirmDialog({ open: false, order: null, action: null })
      setEditModal({ open: false, order: null })
    },
    onError: () => toast.error('Failed to update order')
  })

  const openEditModal = (order) => {
    setEditForm({ status: order.status, payment_status: order.payment_status })
    setEditModal({ open: true, order })
  }

  const handleEditSave = () => {
    if (!editModal.order) return
    updateStatus.mutate({ 
      uuid: editModal.order.uuid, 
      status: editForm.status, 
      payment_status: editForm.payment_status 
    })
  }

  const openConfirmDialog = (order, action) => {
    setConfirmDialog({ open: true, order, action })
  }

  const handleConfirm = () => {
    if (!confirmDialog.order) return
    if (confirmDialog.action === 'approve') {
      updateStatus.mutate({ uuid: confirmDialog.order.uuid, status: 'active', payment_status: 'paid' })
    } else if (confirmDialog.action === 'reject') {
      updateStatus.mutate({ uuid: confirmDialog.order.uuid, status: 'cancelled', payment_status: 'failed' })
    }
  }

  const getPaymentIcon = (method) => {
    if (method === 'bank') return Building2
    if (method === 'cash') return Banknote
    return CreditCard
  }

  return (
    <>
      <Helmet><title>Orders - Admin - Magnetic Clouds</title></Helmet>
      <h1 className="text-2xl font-bold mb-8">Orders Management</h1>
      
      {isLoading ? <div className="text-center py-12">Loading...</div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 dark:bg-dark-800">
                <tr>
                  <th className="text-left p-4 font-medium">Order #</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Method</th>
                  <th className="text-left p-4 font-medium">Payment</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                {data?.orders?.map(order => {
                  const PaymentIcon = getPaymentIcon(order.payment_method)
                  return (
                    <tr key={order.uuid} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                      <td className="p-4 font-medium">{order.order_number}</td>
                      <td className="p-4">
                        <div>{order.first_name} {order.last_name}</div>
                        <div className="text-sm text-dark-500">{order.email}</div>
                      </td>
                      <td className="p-4 font-bold">{format(order.total)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <PaymentIcon className="w-4 h-4" />
                          <span className="capitalize">{order.payment_method}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={clsx("badge", paymentStatusColors[order.payment_status])}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={clsx("badge", statusColors[order.status])}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-dark-500">
                        <div>{new Date(order.created_at).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(order.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.payment_proof && (
                            <button 
                              onClick={() => setViewProof(order.payment_proof)}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg text-blue-500"
                              title="View Payment Proof"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {/* Edit button - always visible */}
                          <button 
                            onClick={() => openEditModal(order)}
                            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg text-purple-500"
                            title="Edit Order"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {/* View User */}
                          <Link 
                            to={`/admin/users/${order.user_uuid}`}
                            className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded-lg text-indigo-500"
                            title="View User"
                          >
                            <User className="w-4 h-4" />
                          </Link>
                          {(order.payment_status === 'pending' || order.payment_status === 'unpaid' || order.status === 'pending') && (
                            <>
                              <button 
                                onClick={() => openConfirmDialog(order, 'approve')}
                                className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg text-green-500"
                                title="Approve Payment"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => openConfirmDialog(order, 'reject')}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                                title="Reject Order"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {(!data?.orders || data.orders.length === 0) && (
            <div className="p-12 text-center text-dark-500">No orders found</div>
          )}
        </div>
      )}

      {/* Payment Proof Modal */}
      {viewProof && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewProof(null)}>
          <div className="bg-white dark:bg-dark-800 rounded-2xl max-w-2xl max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Payment Proof</h3>
              <button onClick={() => setViewProof(null)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={viewProof} alt="Payment proof" className="max-w-full rounded-lg" />
          </div>
        </div>
      )}

      {/* Premium Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDialog({ open: false, order: null, action: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white dark:bg-dark-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Gradient Header */}
              <div className={clsx(
                "relative px-6 py-8 text-center text-white overflow-hidden",
                confirmDialog.action === 'approve' 
                  ? "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600"
                  : "bg-gradient-to-br from-red-500 via-rose-500 to-pink-600"
              )}>
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  {confirmDialog.action === 'approve' && (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-4 right-4"
                      >
                        <Sparkles className="w-6 h-6 text-white/30" />
                      </motion.div>
                      <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute bottom-4 left-4"
                      >
                        <Shield className="w-5 h-5 text-white/30" />
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className={clsx(
                    "relative mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg",
                    confirmDialog.action === 'approve'
                      ? "bg-white/20 shadow-emerald-600/30"
                      : "bg-white/20 shadow-red-600/30"
                  )}
                >
                  {confirmDialog.action === 'approve' ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <XCircle className="w-10 h-10 text-white" />
                  )}
                </motion.div>

                <h3 className="text-2xl font-bold mb-2">
                  {confirmDialog.action === 'approve' ? 'Activate Order' : 'Reject Order'}
                </h3>
                <p className="text-white/80 text-sm">
                  {confirmDialog.action === 'approve' 
                    ? 'This will mark the order as paid and active'
                    : 'This will cancel the order and mark payment as failed'}
                </p>
              </div>

              {/* Order Details */}
              {confirmDialog.order && (
                <div className="px-6 py-5 border-b border-dark-100 dark:border-dark-700">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-dark-500 text-sm">Order Number</span>
                      <span className="font-bold">{confirmDialog.order.order_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark-500 text-sm">Customer</span>
                      <span className="font-medium">{confirmDialog.order.first_name} {confirmDialog.order.last_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark-500 text-sm">Amount</span>
                      <span className="font-bold text-lg">{format(confirmDialog.order.total)}</span>
                    </div>
                    {confirmDialog.action === 'approve' && (
                      <div className="flex justify-between items-center pt-2 border-t border-dark-100 dark:border-dark-700">
                        <span className="text-dark-500 text-sm">New Status</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">paid</span>
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">active</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="px-6 py-4 flex gap-3">
                <button
                  onClick={() => setConfirmDialog({ open: false, order: null, action: null })}
                  className="flex-1 px-4 py-3 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={updateStatus.isPending}
                  className={clsx(
                    "flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2",
                    confirmDialog.action === 'approve'
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/30"
                      : "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/30"
                  )}
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {confirmDialog.action === 'approve' ? (
                        <>
                          <Zap className="w-4 h-4" />
                          Activate
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Reject
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Order Modal */}
      <AnimatePresence>
        {editModal.open && editModal.order && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditModal({ open: false, order: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white dark:bg-dark-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative px-6 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                </div>
                <button
                  onClick={() => setEditModal({ open: false, order: null })}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Edit3 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Edit Order</h2>
                    <p className="text-white/70 text-sm">{editModal.order.order_number}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-500">Order Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-500">Payment Status</label>
                  <select
                    value={editForm.payment_status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, payment_status: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {paymentStatusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Preview */}
                <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl space-y-2">
                  <p className="text-xs text-dark-500 uppercase tracking-wider">Preview</p>
                  <div className="flex items-center gap-3">
                    <span className={clsx("badge", statusColors[editForm.status])}>{editForm.status}</span>
                    <span className={clsx("badge", paymentStatusColors[editForm.payment_status])}>{editForm.payment_status}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-dark-100 dark:border-dark-700 flex gap-3">
                <button
                  onClick={() => setEditModal({ open: false, order: null })}
                  className="flex-1 px-4 py-3 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={updateStatus.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
