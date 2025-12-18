import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  User, ArrowLeft, Mail, Phone, Building2, Calendar, MapPin,
  ShoppingCart, Server, Ticket, FileText, LogIn,
  Clock, DollarSign, Package, Loader2, Activity, Edit3, UserCog
} from 'lucide-react'
import { adminAPI } from '../../lib/api'
import { useAuthStore } from '../../store/useStore'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
}

const getStatusColor = (status) => {
  const colors = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive: 'bg-dark-200 text-dark-600 dark:bg-dark-700 dark:text-dark-400',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    unpaid: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    closed: 'bg-dark-200 text-dark-600 dark:bg-dark-700 dark:text-dark-400',
  }
  return colors[status] || colors.pending
}

// Parse service type from name
const getServiceType = (service) => {
  const name = (service.name || '').toLowerCase()
  if (name.includes('vps')) return 'VPS'
  if (name.includes('dedicated')) return 'Dedicated'
  if (name.includes('cloud')) return 'Cloud'
  if (name.includes('reseller')) return 'Reseller'
  if (name.includes('nobot')) return 'NoBot AI'
  if (name.includes('wordpress')) return 'WordPress'
  if (name.includes('email')) return 'Email'
  if (name.includes('ssl')) return 'SSL'
  if (name.includes('domain')) return 'Domain'
  return service.service_type || 'Hosting'
}

export default function AdminUserDetail() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [loggingIn, setLoggingIn] = useState(false)

  const { data: userDetails, isLoading } = useQuery({
    queryKey: ['admin-user', uuid],
    queryFn: () => adminAPI.getUser(uuid).then(res => res.data),
    enabled: !!uuid
  })

  const handleLoginAsUser = async () => {
    if (!userDetails?.user) return
    setLoggingIn(true)
    try {
      const res = await adminAPI.loginAsUser(userDetails.user.uuid)
      const currentToken = localStorage.getItem('token')
      sessionStorage.setItem('adminToken', currentToken)
      sessionStorage.setItem('adminUser', JSON.stringify(useAuthStore.getState().user))
      login(res.data.user, res.data.token)
      toast.success(`Logged in as ${res.data.user.first_name}`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to login as user')
    } finally {
      setLoggingIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!userDetails?.user) {
    return (
      <div className="text-center py-20">
        <User className="w-16 h-16 mx-auto mb-4 text-dark-400" />
        <h2 className="text-xl font-bold mb-2">User Not Found</h2>
        <p className="text-dark-500 mb-6">The user you're looking for doesn't exist.</p>
        <Link to="/admin/users" className="btn-primary">Back to Users</Link>
      </div>
    )
  }

  const user = userDetails.user
  const stats = userDetails.stats || {}
  const orders = userDetails.orders || []
  const services = userDetails.services || []
  const tickets = userDetails.tickets || []
  const invoices = userDetails.invoices || []

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, count: orders.length },
    { id: 'services', label: 'Services', icon: Server, count: services.length },
    { id: 'tickets', label: 'Tickets', icon: Ticket, count: tickets.length },
    { id: 'invoices', label: 'Invoices', icon: FileText, count: invoices.length },
  ]

  return (
    <>
      <Helmet>
        <title>{user.first_name} {user.last_name} - Admin - Magnetic Clouds</title>
      </Helmet>

      {/* Back Button */}
      <Link 
        to="/admin/users" 
        className="inline-flex items-center gap-2 text-dark-500 hover:text-primary-500 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Header Card */}
      <div className="card overflow-hidden mb-6">
        <div className="relative px-6 py-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          </div>
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold shadow-xl">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
                <p className="text-white/70">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={clsx(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    user.status === 'active' ? 'bg-emerald-500/30 text-emerald-100' : 'bg-red-500/30 text-red-100'
                  )}>
                    {user.status}
                  </span>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to={`/admin/users/${uuid}/manage`}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all"
              >
                <UserCog className="w-4 h-4" />
                Manage User
              </Link>
              <button
                onClick={handleLoginAsUser}
                disabled={loggingIn}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all"
              >
                {loggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Login as User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-dark-100 dark:border-dark-700 px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-500"
                    : "border-transparent text-dark-500 hover:text-dark-700 dark:hover:text-dark-300"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.5 bg-dark-100 dark:bg-dark-700 rounded text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-dark-400 mt-0.5" />
                <div>
                  <p className="text-xs text-dark-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-dark-400 mt-0.5" />
                <div>
                  <p className="text-xs text-dark-500">Phone</p>
                  <p className="font-medium">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-dark-400 mt-0.5" />
                <div>
                  <p className="text-xs text-dark-500">Company</p>
                  <p className="font-medium">{user.company || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-dark-400 mt-0.5" />
                <div>
                  <p className="text-xs text-dark-500">Address</p>
                  <p className="font-medium">{user.address || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-dark-400 mt-0.5" />
                <div>
                  <p className="text-xs text-dark-500">Member Since</p>
                  <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Summary */}
          <div className="lg:col-span-2">
            <div className="card p-6 mb-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Account Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl text-center"
                >
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{stats.totalOrders || 0}</p>
                  <p className="text-xs text-dark-500">Total Orders</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl text-center"
                >
                  <Server className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="text-2xl font-bold">{stats.activeServices || 0}</p>
                  <p className="text-xs text-dark-500">Active Services</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl text-center"
                >
                  <Ticket className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold">{stats.supportTickets || 0}</p>
                  <p className="text-xs text-dark-500">Support Tickets</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl text-center"
                >
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                  <p className="text-xs text-dark-500">Total Spent</p>
                </motion.div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Recent Orders
              </h3>
              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.uuid} className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-xs text-dark-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(order.total)}</p>
                        <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(order.status))}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-dark-500 text-center py-4">No orders yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="text-left p-4 font-medium">Order #</th>
                <th className="text-left p-4 font-medium">Total</th>
                <th className="text-left p-4 font-medium">Payment</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
              {orders.map(order => (
                <tr key={order.uuid} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                  <td className="p-4 font-medium">{order.order_number}</td>
                  <td className="p-4 font-bold">{formatCurrency(order.total)}</td>
                  <td className="p-4">
                    <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(order.payment_status))}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(order.status))}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-dark-500">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-12 text-center text-dark-500">No orders found</div>
          )}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="text-left p-4 font-medium">Service</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Next Due</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
              {services.map(service => (
                <tr key={service.uuid} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                  <td className="p-4 font-medium">{service.name}</td>
                  <td className="p-4">
                    <span className={clsx(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getServiceType(service) === 'VPS' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                      getServiceType(service) === 'Dedicated' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                      getServiceType(service) === 'Cloud' && "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
                      getServiceType(service) === 'NoBot AI' && "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
                      !['VPS', 'Dedicated', 'Cloud', 'NoBot AI'].includes(getServiceType(service)) && "bg-dark-100 text-dark-600 dark:bg-dark-700 dark:text-dark-400"
                    )}>
                      {getServiceType(service)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(service.status))}>
                      {service.status}
                    </span>
                  </td>
                  <td className="p-4 text-dark-500">
                    {service.next_due_date ? new Date(service.next_due_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    <Link 
                      to={`/admin/services/${service.uuid}/manage`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && (
            <div className="p-12 text-center text-dark-500">No services found</div>
          )}
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="text-left p-4 font-medium">Subject</th>
                <th className="text-left p-4 font-medium">Priority</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
              {tickets.map(ticket => (
                <tr key={ticket.uuid} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                  <td className="p-4 font-medium">{ticket.subject}</td>
                  <td className="p-4 capitalize">{ticket.priority}</td>
                  <td className="p-4">
                    <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(ticket.status))}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4 text-dark-500">{new Date(ticket.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tickets.length === 0 && (
            <div className="p-12 text-center text-dark-500">No tickets found</div>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="text-left p-4 font-medium">Invoice #</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
              {invoices.map(invoice => (
                <tr key={invoice.uuid} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                  <td className="p-4 font-medium">{invoice.invoice_number}</td>
                  <td className="p-4 font-bold">{formatCurrency(invoice.total)}</td>
                  <td className="p-4">
                    <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(invoice.status))}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4 text-dark-500">{new Date(invoice.due_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div className="p-12 text-center text-dark-500">No invoices found</div>
          )}
        </div>
      )}
    </>
  )
}
