import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Server, ArrowLeft, Cpu, HardDrive, Wifi, MemoryStick, Globe,
  Calendar, DollarSign, Package, CheckCircle, AlertCircle, Settings,
  Loader2, ExternalLink, RefreshCw, User, Clock, Activity, Save,
  Play, Pause, RotateCcw, Trash2, Shield, Zap, Database, BarChart3
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
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    cancelled: 'bg-dark-200 text-dark-600 dark:bg-dark-700 dark:text-dark-400',
  }
  return colors[status] || colors.pending
}

// Parse service type from name
const getServiceType = (name) => {
  const nameLower = (name || '').toLowerCase()
  if (nameLower.includes('vps')) return 'VPS'
  if (nameLower.includes('dedicated')) return 'Dedicated'
  if (nameLower.includes('cloud')) return 'Cloud'
  if (nameLower.includes('reseller')) return 'Reseller'
  if (nameLower.includes('nobot')) return 'NoBot AI'
  return 'Hosting'
}

// Parse specs from service name
const parseSpecs = (name) => {
  const specs = { cpu: null, ram: null, storage: null }
  const cpuMatch = name?.match(/(\d+)\s*(vcpu|cpu|core)/i)
  if (cpuMatch) specs.cpu = cpuMatch[1]
  const ramMatch = name?.match(/(\d+)\s*GB\s*RAM/i)
  if (ramMatch) specs.ram = ramMatch[1]
  const storageMatch = name?.match(/(\d+)\s*GB\s*(SSD|NVMe|HDD)/i)
  if (storageMatch) specs.storage = storageMatch[1]
  return specs
}

export default function AdminServiceManage() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editForm, setEditForm] = useState({
    status: '',
    next_due_date: '',
    hostname: '',
    ip_address: '',
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  // Fetch service details
  const { data: serviceData, isLoading, refetch } = useQuery({
    queryKey: ['admin-service', uuid],
    queryFn: () => adminAPI.getService(uuid).then(res => res.data),
    enabled: !!uuid
  })

  // Fetch Plesk resource usage
  const { data: pleskData, isLoading: pleskLoading, refetch: refetchPlesk } = useQuery({
    queryKey: ['admin-service-plesk', uuid],
    queryFn: () => adminAPI.getServicePleskStats(uuid).then(res => res.data).catch(() => null),
    enabled: !!uuid,
    refetchInterval: 60000 // Refresh every minute
  })

  // Update service mutation
  const updateMutation = useMutation({
    mutationFn: (data) => adminAPI.updateService(uuid, data),
    onSuccess: () => {
      toast.success('Service updated successfully')
      queryClient.invalidateQueries(['admin-service', uuid])
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update service')
    }
  })

  // Initialize form when data loads
  useEffect(() => {
    if (serviceData?.service) {
      const s = serviceData.service
      setEditForm({
        status: s.status || 'pending',
        next_due_date: s.next_due_date ? s.next_due_date.split('T')[0] : '',
        hostname: s.hostname || '',
        ip_address: s.ip_address || '',
        username: s.username || '',
        password: s.password || ''
      })
    }
  }, [serviceData])

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

  if (!serviceData?.service) {
    return (
      <div className="text-center py-20">
        <Server className="w-16 h-16 mx-auto mb-4 text-dark-400" />
        <h2 className="text-xl font-bold mb-2">Service Not Found</h2>
        <p className="text-dark-500 mb-6">The service you're looking for doesn't exist.</p>
        <Link to="/admin/users" className="btn-primary">Back to Users</Link>
      </div>
    )
  }

  const service = serviceData.service
  const user = serviceData.user || {}
  const specs = parseSpecs(service.name)
  const serviceType = getServiceType(service.name)
  const pleskStats = pleskData?.stats || null

  return (
    <>
      <Helmet>
        <title>Manage Service | Admin</title>
      </Helmet>

      {/* Back Button */}
      <Link 
        to={`/admin/users/${user.uuid}`}
        className="inline-flex items-center gap-2 text-dark-500 hover:text-primary-500 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to User
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <Server className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{service.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={clsx(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  serviceType === 'VPS' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                  serviceType === 'Dedicated' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                  serviceType === 'NoBot AI' && "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
                  !['VPS', 'Dedicated', 'NoBot AI'].includes(serviceType) && "bg-dark-100 text-dark-600 dark:bg-dark-700 dark:text-dark-400"
                )}>
                  {serviceType}
                </span>
                <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(service.status))}>
                  {service.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetchPlesk()}
              disabled={pleskLoading}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={clsx("w-4 h-4", pleskLoading && "animate-spin")} />
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
        {/* Left Column - Service Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-500" />
              Service Settings
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="input w-full"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Next Due Date</label>
                <input
                  type="date"
                  value={editForm.next_due_date}
                  onChange={(e) => setEditForm({ ...editForm, next_due_date: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hostname</label>
                <input
                  type="text"
                  value={editForm.hostname}
                  onChange={(e) => setEditForm({ ...editForm, hostname: e.target.value })}
                  className="input w-full"
                  placeholder="server.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">IP Address</label>
                <input
                  type="text"
                  value={editForm.ip_address}
                  onChange={(e) => setEditForm({ ...editForm, ip_address: e.target.value })}
                  className="input w-full"
                  placeholder="192.168.1.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="input w-full"
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="input w-full pr-20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-primary-500 hover:text-primary-600"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Resource Usage from Plesk */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                Live Resource Usage
              </h3>
              {pleskStats && (
                <span className="text-xs text-dark-500 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Live from Plesk
                </span>
              )}
            </div>

            {pleskLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : pleskStats ? (
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
                      <p className="text-xs text-dark-500">CPU Usage</p>
                      <p className="text-xl font-bold">{pleskStats.cpu_usage || 0}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(pleskStats.cpu_usage || 0, 100)}%` }}
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
                      <p className="text-xl font-bold">{pleskStats.ram_used || 0} GB</p>
                    </div>
                  </div>
                  <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((pleskStats.ram_used / pleskStats.ram_total) * 100 || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">{pleskStats.ram_used || 0} / {pleskStats.ram_total || specs.ram || 0} GB</p>
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
                      <p className="text-xl font-bold">{pleskStats.disk_used || 0} GB</p>
                    </div>
                  </div>
                  <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((pleskStats.disk_used / pleskStats.disk_total) * 100 || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">{pleskStats.disk_used || 0} / {pleskStats.disk_total || specs.storage || 0} GB</p>
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
                      <p className="text-xl font-bold">{pleskStats.bandwidth_used || 0} GB</p>
                    </div>
                  </div>
                  <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((pleskStats.bandwidth_used / pleskStats.bandwidth_total) * 100 || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">{pleskStats.bandwidth_used || 0} / {pleskStats.bandwidth_total || 1000} GB</p>
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-12 text-dark-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Resource stats unavailable</p>
                <p className="text-sm mt-1">Plesk integration required for live stats</p>
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
                className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-center transition-colors"
              >
                <Play className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <span className="text-sm font-medium">Activate</span>
              </button>
              <button 
                onClick={() => setEditForm({ ...editForm, status: 'suspended' })}
                className="p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-center transition-colors"
              >
                <Pause className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <span className="text-sm font-medium">Suspend</span>
              </button>
              <button 
                onClick={() => refetch()}
                className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-center transition-colors"
              >
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <button 
                onClick={() => setEditForm({ ...editForm, status: 'cancelled' })}
                className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-center transition-colors"
              >
                <Trash2 className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <span className="text-sm font-medium">Cancel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Service Info & User */}
        <div className="space-y-6">
          {/* Package Info */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-500" />
              Package Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">vCPU</span>
                </div>
                <span className="font-bold">{specs.cpu || 'N/A'} Cores</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">RAM</span>
                </div>
                <span className="font-bold">{specs.ram || 'N/A'} GB</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">Storage</span>
                </div>
                <span className="font-bold">{specs.storage || 'N/A'} GB</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Price</span>
                </div>
                <span className="font-bold">{formatCurrency(service.amount)}/mo</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              Service Owner
            </h3>
            <Link to={`/admin/users/${user.uuid}`} className="block p-4 bg-dark-50 dark:bg-dark-700 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-600 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <div>
                  <p className="font-medium">{user.first_name} {user.last_name}</p>
                  <p className="text-sm text-dark-500">{user.email}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Billing Info */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-500" />
              Billing Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-dark-500">Billing Cycle</span>
                <span className="font-medium capitalize">{service.billing_cycle || 'monthly'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-500">Created</span>
                <span className="font-medium">{new Date(service.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-500">Next Due</span>
                <span className="font-medium">{service.next_due_date ? new Date(service.next_due_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
