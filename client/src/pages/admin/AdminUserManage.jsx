import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  User, ArrowLeft, Mail, Phone, Building2, Calendar, MapPin,
  ShoppingCart, Server, Ticket, FileText, DollarSign, Package,
  CheckCircle, AlertCircle, Loader2, Save, Shield, Ban, Unlock,
  Activity, Cpu, HardDrive, Wifi, MemoryStick, BarChart3, Clock,
  Globe, CreditCard, RefreshCw, Settings, UserCog, Zap
} from 'lucide-react'
import { adminAPI } from '../../lib/api'
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
  }
  return colors[status] || colors.pending
}

export default function AdminUserManage() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    status: 'active',
    role: 'user'
  })

  // Fetch user details
  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['admin-user', uuid],
    queryFn: () => adminAPI.getUser(uuid).then(res => res.data),
    enabled: !!uuid
  })

  // Fetch user resource usage (aggregate from all services)
  const { data: resourceData, isLoading: resourcesLoading, refetch: refetchResources } = useQuery({
    queryKey: ['admin-user-resources', uuid],
    queryFn: () => adminAPI.getUserResources(uuid).then(res => res.data).catch(() => null),
    enabled: !!uuid,
    refetchInterval: 60000
  })

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: (data) => adminAPI.updateUser(uuid, data),
    onSuccess: () => {
      toast.success('User updated successfully')
      queryClient.invalidateQueries(['admin-user', uuid])
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update user')
    }
  })

  // Initialize form when data loads
  useEffect(() => {
    if (userData?.user) {
      const u = userData.user
      setEditForm({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        email: u.email || '',
        phone: u.phone || '',
        company: u.company || '',
        address: u.address || '',
        status: u.status || 'active',
        role: u.role || 'user'
      })
    }
  }, [userData])

  const handleSave = () => {
    updateMutation.mutate(editForm)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!userData?.user) {
    return (
      <div className="text-center py-20">
        <User className="w-16 h-16 mx-auto mb-4 text-dark-400" />
        <h2 className="text-xl font-bold mb-2">User Not Found</h2>
        <p className="text-dark-500 mb-6">The user you're looking for doesn't exist.</p>
        <Link to="/admin/users" className="btn-primary">Back to Users</Link>
      </div>
    )
  }

  const user = userData.user
  const stats = userData.stats || {}
  const services = userData.services || []
  const resources = resourceData?.resources || null

  return (
    <>
      <Helmet>
        <title>Manage {user.first_name} {user.last_name} | Admin</title>
      </Helmet>

      {/* Back Button */}
      <Link 
        to={`/admin/users/${uuid}`}
        className="inline-flex items-center gap-2 text-dark-500 hover:text-primary-500 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to User Profile
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Manage User</h1>
              <p className="text-dark-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(user.status))}>
                  {user.status}
                </span>
                <span className={clsx(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                )}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetchResources()}
              disabled={resourcesLoading}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={clsx("w-4 h-4", resourcesLoading && "animate-spin")} />
              Refresh Stats
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - User Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Settings */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-500" />
              Account Settings
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="input w-full"
                  placeholder="Not provided"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="input w-full"
                  placeholder="Not provided"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="input w-full"
                  placeholder="Not provided"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="input w-full"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="input w-full"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                Total Resource Usage
              </h3>
              {resources && (
                <span className="text-xs text-dark-500 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Aggregated from {services.length} service(s)
                </span>
              )}
            </div>

            {resourcesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : resources ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CPU Usage */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Avg CPU Usage</p>
                      <p className="text-xl font-bold">{resources.cpu_usage || 0}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(resources.cpu_usage || 0, 100)}%` }}
                    />
                  </div>
                </motion.div>

                {/* RAM Usage */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <MemoryStick className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">RAM Usage</p>
                      <p className="text-xl font-bold">{resources.ram_used || 0} GB</p>
                    </div>
                  </div>
                  <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((resources.ram_used / resources.ram_total) * 100 || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">{resources.ram_used || 0} / {resources.ram_total || 0} GB</p>
                </motion.div>

                {/* Disk Usage */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Disk Usage</p>
                      <p className="text-xl font-bold">{resources.disk_used || 0} GB</p>
                    </div>
                  </div>
                  <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((resources.disk_used / resources.disk_total) * 100 || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">{resources.disk_used || 0} / {resources.disk_total || 0} GB</p>
                </motion.div>

                {/* Bandwidth Usage */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Bandwidth</p>
                      <p className="text-xl font-bold">{resources.bandwidth_used || 0} GB</p>
                    </div>
                  </div>
                  <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((resources.bandwidth_used / resources.bandwidth_total) * 100 || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">{resources.bandwidth_used || 0} / {resources.bandwidth_total || 0} GB</p>
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-12 text-dark-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No resource data available</p>
                <p className="text-sm mt-1">User has no active services with Plesk integration</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                onClick={() => setEditForm({ ...editForm, status: 'active' })}
                className={clsx(
                  "p-4 rounded-xl text-center transition-colors border",
                  editForm.status === 'active' 
                    ? "bg-emerald-500 text-white border-emerald-500" 
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20"
                )}
              >
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500" style={{ color: editForm.status === 'active' ? 'white' : undefined }} />
                <span className="text-sm font-medium">Activate</span>
              </button>
              <button 
                onClick={() => setEditForm({ ...editForm, status: 'suspended' })}
                className={clsx(
                  "p-4 rounded-xl text-center transition-colors border",
                  editForm.status === 'suspended' 
                    ? "bg-red-500 text-white border-red-500" 
                    : "bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
                )}
              >
                <Ban className="w-6 h-6 mx-auto mb-2 text-red-500" style={{ color: editForm.status === 'suspended' ? 'white' : undefined }} />
                <span className="text-sm font-medium">Suspend</span>
              </button>
              <button 
                onClick={() => setEditForm({ ...editForm, role: 'admin' })}
                className={clsx(
                  "p-4 rounded-xl text-center transition-colors border",
                  editForm.role === 'admin' 
                    ? "bg-purple-500 text-white border-purple-500" 
                    : "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20"
                )}
              >
                <Shield className="w-6 h-6 mx-auto mb-2 text-purple-500" style={{ color: editForm.role === 'admin' ? 'white' : undefined }} />
                <span className="text-sm font-medium">Make Admin</span>
              </button>
              <button 
                onClick={() => setEditForm({ ...editForm, role: 'user' })}
                className={clsx(
                  "p-4 rounded-xl text-center transition-colors border",
                  editForm.role === 'user' 
                    ? "bg-blue-500 text-white border-blue-500" 
                    : "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
                )}
              >
                <User className="w-6 h-6 mx-auto mb-2 text-blue-500" style={{ color: editForm.role === 'user' ? 'white' : undefined }} />
                <span className="text-sm font-medium">Set as User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Account Summary */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Account Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <span className="font-bold">{stats.totalOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">Active Services</span>
                </div>
                <span className="font-bold">{stats.activeServices || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Support Tickets</span>
                </div>
                <span className="font-bold">{stats.supportTickets || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Total Spent</span>
                </div>
                <span className="font-bold">{formatCurrency(stats.totalSpent)}</span>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-500" />
              User Services
            </h3>
            {services.length > 0 ? (
              <div className="space-y-3">
                {services.map(service => (
                  <Link 
                    key={service.uuid}
                    to={`/admin/services/${service.uuid}/manage`}
                    className="block p-3 bg-dark-50 dark:bg-dark-700 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{service.name}</p>
                        <p className="text-xs text-dark-500">{service.next_due_date ? new Date(service.next_due_date).toLocaleDateString() : 'No due date'}</p>
                      </div>
                      <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(service.status))}>
                        {service.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-dark-500 text-center py-4">No services</p>
            )}
          </div>

          {/* Member Info */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-500" />
              Member Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-dark-500">Member Since</span>
                <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-500">User ID</span>
                <span className="font-mono text-sm">{user.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-500">UUID</span>
                <span className="font-mono text-xs truncate max-w-[150px]" title={user.uuid}>{user.uuid}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
