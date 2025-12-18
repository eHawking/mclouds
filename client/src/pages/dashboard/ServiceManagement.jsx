import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  Server, ArrowLeft, Globe, Shield, HardDrive, Cloud, Mail, Database,
  ExternalLink, Cpu, MemoryStick, HardDrive as Storage, Activity, Loader2,
  Copy, Check, MonitorPlay, Lock, Zap, RefreshCw, Settings, Calendar,
  CreditCard, Clock, ChevronRight, FileText, Power, Pause, Play, Sparkles,
  Receipt, Headphones, BarChart3, Wifi, Key, AlertCircle, Edit, Trash2,
  Plus, X, Save, RotateCcw
} from 'lucide-react'
import { userAPI } from '../../lib/api'
import clsx from 'clsx'
import toast from 'react-hot-toast'

// DNS Record Types
const DNS_RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV']

// Default Nameservers
const DEFAULT_NAMESERVERS = [
  'ns1.magnetichosting.com',
  'ns2.magnetichosting.com'
]

// Domain Management Tabs Component
function DomainManagementTabs({ domainName }) {
  const [activeTab, setActiveTab] = useState('dns')
  const [dnsRecords, setDnsRecords] = useState([
    { id: 1, type: 'A', name: '@', value: '192.168.1.1', ttl: 3600 },
    { id: 2, type: 'CNAME', name: 'www', value: domainName, ttl: 3600 },
    { id: 3, type: 'MX', name: '@', value: 'mail.' + domainName, ttl: 3600, priority: 10 },
  ])
  const [nameservers, setNameservers] = useState(DEFAULT_NAMESERVERS)
  const [emailForwards, setEmailForwards] = useState([
    { id: 1, from: 'info', to: 'admin@gmail.com' }
  ])
  const [urlForward, setUrlForward] = useState({ enabled: false, url: '', type: 'permanent' })
  
  // Form states
  const [showDnsForm, setShowDnsForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [editingDns, setEditingDns] = useState(null)
  const [newDns, setNewDns] = useState({ type: 'A', name: '', value: '', ttl: 3600, priority: 10 })
  const [newEmail, setNewEmail] = useState({ from: '', to: '' })
  const [customNs, setCustomNs] = useState(false)
  const [nsInputs, setNsInputs] = useState(['', ''])

  const tabs = [
    { id: 'dns', label: 'DNS Records', icon: Server, color: 'indigo' },
    { id: 'nameservers', label: 'Nameservers', icon: Globe, color: 'purple' },
    { id: 'email', label: 'Email Forwarding', icon: Mail, color: 'blue' },
    { id: 'url', label: 'URL Forwarding', icon: ExternalLink, color: 'amber' },
  ]

  const handleAddDns = () => {
    if (!newDns.name || !newDns.value) {
      toast.error('Please fill in all required fields')
      return
    }
    const record = { ...newDns, id: Date.now() }
    setDnsRecords([...dnsRecords, record])
    setNewDns({ type: 'A', name: '', value: '', ttl: 3600, priority: 10 })
    setShowDnsForm(false)
    toast.success('DNS record added successfully')
  }

  const handleDeleteDns = (id) => {
    setDnsRecords(dnsRecords.filter(r => r.id !== id))
    toast.success('DNS record deleted')
  }

  const handleAddEmail = () => {
    if (!newEmail.from || !newEmail.to) {
      toast.error('Please fill in all fields')
      return
    }
    setEmailForwards([...emailForwards, { ...newEmail, id: Date.now() }])
    setNewEmail({ from: '', to: '' })
    setShowEmailForm(false)
    toast.success('Email forward added')
  }

  const handleDeleteEmail = (id) => {
    setEmailForwards(emailForwards.filter(e => e.id !== id))
    toast.success('Email forward deleted')
  }

  const handleSaveNameservers = () => {
    if (customNs) {
      if (!nsInputs[0] || !nsInputs[1]) {
        toast.error('Please enter at least 2 nameservers')
        return
      }
      setNameservers(nsInputs.filter(ns => ns))
    } else {
      setNameservers(DEFAULT_NAMESERVERS)
    }
    toast.success('Nameservers updated successfully')
  }

  const handleSaveUrlForward = () => {
    if (urlForward.enabled && !urlForward.url) {
      toast.error('Please enter a destination URL')
      return
    }
    toast.success('URL forwarding settings saved')
  }

  return (
    <div className="card overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-dark-100 dark:border-dark-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-5 py-4 font-medium text-sm whitespace-nowrap transition-all border-b-2 -mb-px",
              activeTab === tab.id
                ? `border-${tab.color}-500 text-${tab.color}-500 bg-${tab.color}-50 dark:bg-${tab.color}-900/20`
                : "border-transparent text-dark-500 hover:text-dark-700 dark:hover:text-dark-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* DNS Records Tab */}
          {activeTab === 'dns' && (
            <motion.div
              key="dns"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">DNS Records</h3>
                  <p className="text-sm text-dark-500">Manage your domain's DNS records</p>
                </div>
                <button
                  onClick={() => setShowDnsForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Record
                </button>
              </div>

              {/* Add DNS Form */}
              {showDnsForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-4 bg-dark-50 dark:bg-dark-700 rounded-xl"
                >
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <select
                      value={newDns.type}
                      onChange={(e) => setNewDns({ ...newDns, type: e.target.value })}
                      className="input"
                    >
                      {DNS_RECORD_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Name (@ for root)"
                      value={newDns.name}
                      onChange={(e) => setNewDns({ ...newDns, name: e.target.value })}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={newDns.value}
                      onChange={(e) => setNewDns({ ...newDns, value: e.target.value })}
                      className="input"
                    />
                    <input
                      type="number"
                      placeholder="TTL"
                      value={newDns.ttl}
                      onChange={(e) => setNewDns({ ...newDns, ttl: parseInt(e.target.value) })}
                      className="input"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleAddDns} className="flex-1 btn-primary py-2">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setShowDnsForm(false)} className="px-3 py-2 bg-dark-200 dark:bg-dark-600 rounded-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* DNS Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-100 dark:border-dark-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Value</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">TTL</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                    {dnsRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-xs font-medium">
                            {record.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{record.name}</td>
                        <td className="py-3 px-4 font-mono text-sm truncate max-w-[200px]">{record.value}</td>
                        <td className="py-3 px-4 text-dark-500">{record.ttl}s</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteDns(record.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Nameservers Tab */}
          {activeTab === 'nameservers' && (
            <motion.div
              key="nameservers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-1">Nameservers</h3>
                <p className="text-sm text-dark-500">Configure which nameservers your domain uses</p>
              </div>

              <div className="space-y-4">
                {/* Default NS Option */}
                <label className={clsx(
                  "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  !customNs ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-dark-200 dark:border-dark-700"
                )}>
                  <input
                    type="radio"
                    checked={!customNs}
                    onChange={() => setCustomNs(false)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">Use Default Nameservers (Recommended)</p>
                    <p className="text-sm text-dark-500 mt-1">Use Magnetic Clouds nameservers for easy DNS management</p>
                    <div className="mt-3 space-y-1">
                      {DEFAULT_NAMESERVERS.map((ns, i) => (
                        <p key={i} className="text-sm font-mono bg-dark-100 dark:bg-dark-700 px-3 py-1.5 rounded inline-block mr-2">
                          {ns}
                        </p>
                      ))}
                    </div>
                  </div>
                </label>

                {/* Custom NS Option */}
                <label className={clsx(
                  "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  customNs ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-dark-200 dark:border-dark-700"
                )}>
                  <input
                    type="radio"
                    checked={customNs}
                    onChange={() => setCustomNs(true)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Use Custom Nameservers</p>
                    <p className="text-sm text-dark-500 mt-1">Point to your own nameservers</p>
                    {customNs && (
                      <div className="mt-3 space-y-2">
                        <input
                          type="text"
                          placeholder="ns1.example.com"
                          value={nsInputs[0]}
                          onChange={(e) => setNsInputs([e.target.value, nsInputs[1]])}
                          className="input w-full"
                        />
                        <input
                          type="text"
                          placeholder="ns2.example.com"
                          value={nsInputs[1]}
                          onChange={(e) => setNsInputs([nsInputs[0], e.target.value])}
                          className="input w-full"
                        />
                      </div>
                    )}
                  </div>
                </label>

                <button
                  onClick={handleSaveNameservers}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Nameservers
                </button>
              </div>
            </motion.div>
          )}

          {/* Email Forwarding Tab */}
          {activeTab === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">Email Forwarding</h3>
                  <p className="text-sm text-dark-500">Forward emails to external addresses</p>
                </div>
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Forward
                </button>
              </div>

              {/* Add Email Form */}
              {showEmailForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-4 bg-dark-50 dark:bg-dark-700 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="alias"
                        value={newEmail.from}
                        onChange={(e) => setNewEmail({ ...newEmail, from: e.target.value })}
                        className="input flex-1"
                      />
                      <span className="text-dark-500">@{domainName}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-dark-400" />
                    <input
                      type="email"
                      placeholder="forward@example.com"
                      value={newEmail.to}
                      onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                      className="input flex-1"
                    />
                    <button onClick={handleAddEmail} className="btn-primary py-2 px-4">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowEmailForm(false)} className="px-3 py-2 bg-dark-200 dark:bg-dark-600 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Email Forwards List */}
              <div className="space-y-3">
                {emailForwards.map((forward) => (
                  <div key={forward.id} className="flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{forward.from}@{domainName}</p>
                        <p className="text-sm text-dark-500">→ {forward.to}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEmail(forward.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {emailForwards.length === 0 && (
                  <div className="text-center py-8 text-dark-500">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No email forwards configured</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* URL Forwarding Tab */}
          {activeTab === 'url' && (
            <motion.div
              key="url"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-1">URL Forwarding</h3>
                <p className="text-sm text-dark-500">Redirect your domain to another website</p>
              </div>

              <div className="space-y-4">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                  <div>
                    <p className="font-medium">Enable URL Forwarding</p>
                    <p className="text-sm text-dark-500">Redirect visitors to another URL</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={urlForward.enabled}
                      onChange={(e) => setUrlForward({ ...urlForward, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-dark-300 peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {urlForward.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    {/* Destination URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Destination URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={urlForward.url}
                        onChange={(e) => setUrlForward({ ...urlForward, url: e.target.value })}
                        className="input w-full"
                      />
                    </div>

                    {/* Redirect Type */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Redirect Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={clsx(
                          "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          urlForward.type === 'permanent' ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-dark-200 dark:border-dark-700"
                        )}>
                          <input
                            type="radio"
                            checked={urlForward.type === 'permanent'}
                            onChange={() => setUrlForward({ ...urlForward, type: 'permanent' })}
                          />
                          <div>
                            <p className="font-medium">Permanent (301)</p>
                            <p className="text-xs text-dark-500">SEO-friendly, cached by browsers</p>
                          </div>
                        </label>
                        <label className={clsx(
                          "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          urlForward.type === 'temporary' ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-dark-200 dark:border-dark-700"
                        )}>
                          <input
                            type="radio"
                            checked={urlForward.type === 'temporary'}
                            onChange={() => setUrlForward({ ...urlForward, type: 'temporary' })}
                          />
                          <div>
                            <p className="font-medium">Temporary (302)</p>
                            <p className="text-xs text-dark-500">Not cached, for temporary redirects</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={handleSaveUrlForward}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Format currency
const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// Parse specs from service name like "Custom VPS (32 vCPU, 128GB RAM, 2000GB SSD)"
const parseServiceSpecs = (service) => {
  const name = service.name || ''
  const specs = { cpu: null, ram: null, storage: null, bandwidth: null, type: null }
  
  // Detect service type
  const nameLower = name.toLowerCase()
  if (nameLower.includes('vps')) specs.type = 'VPS'
  else if (nameLower.includes('dedicated')) specs.type = 'Dedicated Server'
  else if (nameLower.includes('cloud')) specs.type = 'Cloud Server'
  else if (nameLower.includes('reseller')) specs.type = 'Reseller Hosting'
  else if (nameLower.includes('hosting')) specs.type = 'Hosting'
  else specs.type = service.service_type || 'Hosting'
  
  // Parse CPU - look for patterns like "32 vCPU", "8 CPU", "4 Core"
  const cpuMatch = name.match(/(\d+)\s*(vcpu|cpu|core)/i)
  if (cpuMatch) specs.cpu = cpuMatch[1]
  
  // Parse RAM - look for patterns like "128GB RAM", "4GB RAM", "8 GB RAM"
  const ramMatch = name.match(/(\d+)\s*GB\s*RAM/i)
  if (ramMatch) specs.ram = ramMatch[1]
  
  // Parse Storage - look for patterns like "2000GB SSD", "500GB NVMe" - must have SSD/NVMe/HDD after
  const storageMatch = name.match(/(\d+)\s*GB\s*(SSD|NVMe|HDD)/i)
  if (storageMatch) specs.storage = storageMatch[1]
  
  // Parse Bandwidth - only if explicitly mentioned with "Bandwidth" or "BW"
  const bwMatch = name.match(/(\d+)\s*(TB|GB)\s*(Bandwidth|BW)/i)
  if (bwMatch) specs.bandwidth = bwMatch[1] + (bwMatch[2] === 'GB' ? ' GB' : ' TB')
  
  return specs
}

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  suspended: 'bg-red-500/20 text-red-400 border border-red-500/30',
  cancelled: 'bg-dark-500/20 text-dark-400 border border-dark-500/30',
}

export default function ServiceManagement() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(null)
  const [pleskLoading, setPleskLoading] = useState(false)

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', uuid],
    queryFn: () => userAPI.getService(uuid).then(res => res.data?.service)
  })

  const { data: pleskConfig } = useQuery({
    queryKey: ['plesk-config'],
    queryFn: () => userAPI.getPleskStatus().then(res => res.data).catch(() => ({ enabled: false }))
  })

  // Parse specs from service name
  const specs = service ? parseServiceSpecs(service) : {}

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(null), 2000)
  }

  const handlePleskLogin = async () => {
    setPleskLoading(true)
    try {
      const res = await userAPI.getPleskLoginUrl(uuid)
      if (res.data?.url) {
        window.open(res.data.url, '_blank')
      } else {
        toast.error('Could not generate Plesk login URL')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to connect to Plesk')
    } finally {
      setPleskLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="text-center py-20">
        <Server className="w-16 h-16 mx-auto mb-4 text-dark-400" />
        <h2 className="text-xl font-bold mb-2">Service Not Found</h2>
        <p className="text-dark-500 mb-6">The service you're looking for doesn't exist.</p>
        <Link to="/dashboard/services" className="btn-primary">Back to Services</Link>
      </div>
    )
  }

  // Check if this is a domain service - check service_type OR domain name patterns
  const domainTLDs = ['.com', '.net', '.org', '.io', '.co', '.dev', '.app', '.xyz', '.info', '.biz', '.me', '.us', '.uk', '.ca', '.au', '.de', '.fr', '.in', '.bd']
  const serviceName = (service.domain_name || service.name || '').toLowerCase()
  const hasDomainTLD = domainTLDs.some(tld => serviceName.endsWith(tld))
  const isDomain = service.service_type === 'domain' || 
                   (hasDomainTLD && !serviceName.includes('hosting') && !serviceName.includes('vps') && !serviceName.includes('server'))

  // Calculate days until expiry for domains
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - now
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysUntilExpiry = getDaysUntilExpiry(service.expires_at)
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0

  // Domain Management View
  if (isDomain) {
    return (
      <>
        <Helmet>
          <title>{service.domain_name || service.name} - Domain Management</title>
        </Helmet>

        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard/domains" 
            className="inline-flex items-center gap-2 text-dark-500 hover:text-primary-500 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Domains
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{service.domain_name || service.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", statusColors[service.status])}>
                    {service.status}
                  </span>
                  <span className="text-dark-500">Domain</span>
                </div>
              </div>
            </div>
            
            <a
              href={`https://${service.domain_name || service.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              Visit Website
            </a>
          </div>
        </div>

        {/* Expiring Soon Warning */}
        {isExpiringSoon && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  Domain expires in {daysUntilExpiry} days
                </p>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                  Renew now to avoid losing your domain
                </p>
              </div>
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
                Renew Now
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Domain Details Card */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Domain Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Domain Name */}
                  <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-dark-500 uppercase tracking-wider">Domain Name</span>
                      <button
                        onClick={() => copyToClipboard(service.domain_name || service.name, 'domain')}
                        className="p-1 hover:bg-dark-200 dark:hover:bg-dark-600 rounded transition-colors"
                      >
                        {copied === 'domain' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-dark-400" />}
                      </button>
                    </div>
                    <p className="font-medium truncate">{service.domain_name || service.name}</p>
                  </div>
                  
                  {/* Registration Date */}
                  <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                    <span className="text-xs text-dark-500 uppercase tracking-wider block mb-1">Registration Date</span>
                    <p className="font-medium">
                      {service.registration_date ? new Date(service.registration_date).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      }) : service.created_at ? new Date(service.created_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                  
                  {/* Expiry Date */}
                  <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                    <span className="text-xs text-dark-500 uppercase tracking-wider block mb-1">Expiry Date</span>
                    <p className={clsx(
                      "font-medium",
                      isExpired ? "text-red-500" : isExpiringSoon ? "text-amber-500" : ""
                    )}>
                      {service.expires_at ? new Date(service.expires_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      }) : 'N/A'}
                    </p>
                    {daysUntilExpiry !== null && (
                      <p className={clsx(
                        "text-xs mt-1",
                        isExpired ? "text-red-500" : isExpiringSoon ? "text-amber-500" : "text-dark-500"
                      )}>
                        {isExpired ? 'Expired' : `${daysUntilExpiry} days remaining`}
                      </p>
                    )}
                  </div>
                  
                  {/* Auto Renew */}
                  <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                    <span className="text-xs text-dark-500 uppercase tracking-wider block mb-1">Auto Renewal</span>
                    <p className={clsx(
                      "font-medium",
                      service.auto_renew ? "text-emerald-500" : "text-dark-500"
                    )}>
                      {service.auto_renew ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Domain Protection */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Domain Protection
                </h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium">WHOIS Privacy</p>
                        <p className="text-xs text-emerald-500">Enabled</p>
                      </div>
                    </div>
                    <p className="text-xs text-dark-500">Your personal information is hidden from public WHOIS lookups</p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Transfer Lock</p>
                        <p className="text-xs text-blue-500">Locked</p>
                      </div>
                    </div>
                    <p className="text-xs text-dark-500">Domain is protected from unauthorized transfers</p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Domain Management Tabs */}
            <DomainManagementTabs domainName={service.domain_name || service.name} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Domain Info */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <h3 className="font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Domain Information
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-dark-100 dark:border-dark-700">
                    <span className="text-dark-500">Type</span>
                    <span className="font-medium">Domain Registration</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-dark-100 dark:border-dark-700">
                    <span className="text-dark-500">Status</span>
                    <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", statusColors[service.status])}>
                      {service.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-dark-100 dark:border-dark-700">
                    <span className="text-dark-500">Billing Cycle</span>
                    <span className="font-medium capitalize">{service.billing_cycle || 'Yearly'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-dark-100 dark:border-dark-700">
                    <span className="text-dark-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Registered
                    </span>
                    <span className="font-medium">
                      {service.registration_date ? new Date(service.registration_date).toLocaleDateString() : 
                       service.created_at ? new Date(service.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-dark-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Expires
                    </span>
                    <span className="font-medium">
                      {service.expires_at ? new Date(service.expires_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Renewal */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <h3 className="font-bold flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Renewal
                </h3>
              </div>
              <div className="p-5">
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl mb-4">
                  <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">Renewal Price</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(service.amount || 12.99)}
                    <span className="text-sm font-normal text-dark-500">/year</span>
                  </p>
                </div>
                <button className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40">
                  <RefreshCw className="w-4 h-4" />
                  Renew Domain
                </button>
              </div>
            </div>

            {/* Need Help */}
            <div className="card p-6 bg-gradient-to-br from-primary-500/10 to-indigo-500/10 border-primary-500/20">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-dark-500 mb-4">Our support team is available 24/7 to assist you.</p>
              <Link 
                to="/dashboard/tickets"
                className="block w-full text-center py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors font-medium"
              >
                Open Support Ticket
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Hosting/Server Management View (existing code)
  return (
    <>
      <Helmet>
        <title>{service.name} - Server Management</title>
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/dashboard/services" 
          className="inline-flex items-center gap-2 text-dark-500 hover:text-primary-500 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Server className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{service.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", statusColors[service.status])}>
                  {service.status}
                </span>
                <span className="text-dark-500 capitalize">{specs.type || service.service_type || 'Hosting'}</span>
              </div>
            </div>
          </div>
          
          {service.status === 'active' && (
            <button
              onClick={handlePleskLogin}
              disabled={pleskLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
            >
              {pleskLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Login to Panel
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Server Details Card */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Server Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Hostname */}
                <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-dark-500 uppercase tracking-wider">Hostname</span>
                    <button
                      onClick={() => copyToClipboard(service.hostname || service.domain_name || 'N/A', 'hostname')}
                      className="p-1 hover:bg-dark-200 dark:hover:bg-dark-600 rounded transition-colors"
                    >
                      {copied === 'hostname' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-dark-400" />}
                    </button>
                  </div>
                  <p className="font-medium truncate">{service.hostname || service.domain_name || 'N/A'}</p>
                </div>
                
                {/* IP Address */}
                <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-dark-500 uppercase tracking-wider">IP Address</span>
                    <button
                      onClick={() => copyToClipboard(service.ip_address || 'N/A', 'ip')}
                      className="p-1 hover:bg-dark-200 dark:hover:bg-dark-600 rounded transition-colors"
                    >
                      {copied === 'ip' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-dark-400" />}
                    </button>
                  </div>
                  <p className="font-medium">{service.ip_address || 'Pending'}</p>
                </div>
                
                {/* Username */}
                <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-dark-500 uppercase tracking-wider">Username</span>
                    <button
                      onClick={() => copyToClipboard(service.username || 'N/A', 'username')}
                      className="p-1 hover:bg-dark-200 dark:hover:bg-dark-600 rounded transition-colors"
                    >
                      {copied === 'username' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-dark-400" />}
                    </button>
                  </div>
                  <p className="font-medium">{service.username || 'N/A'}</p>
                </div>
                
                {/* Password */}
                <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-dark-500 uppercase tracking-wider">Password</span>
                    <Lock className="w-3 h-3 text-dark-400" />
                  </div>
                  <p className="font-medium">••••••••</p>
                </div>

                {/* Nameservers */}
                {service.nameservers && (
                  <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-dark-500 uppercase tracking-wider">Nameservers</span>
                      <button
                        onClick={() => copyToClipboard(service.nameservers, 'ns')}
                        className="p-1 hover:bg-dark-200 dark:hover:bg-dark-600 rounded transition-colors"
                      >
                        {copied === 'ns' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-dark-400" />}
                      </button>
                    </div>
                    <p className="font-medium">{service.nameservers}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resources Card */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Resources
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl text-center"
                >
                  <Cpu className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{specs.cpu || service.cpu_cores || '1'}</p>
                  <p className="text-xs text-dark-500">vCPU</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl text-center"
                >
                  <MemoryStick className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{specs.ram || service.ram || '1'} GB</p>
                  <p className="text-xs text-dark-500">RAM</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl text-center"
                >
                  <Storage className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="text-2xl font-bold">{specs.storage || service.storage || '20'} GB</p>
                  <p className="text-xs text-dark-500">Storage</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/20 rounded-xl text-center"
                >
                  <Wifi className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                  <p className="text-2xl font-bold">{specs.bandwidth || service.bandwidth || '1 TB'}</p>
                  <p className="text-xs text-dark-500">Bandwidth</p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {pleskConfig?.enabled && service.status === 'active' && (
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-500" />
                Quick Actions
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <button 
                  onClick={handlePleskLogin}
                  className="p-4 bg-dark-50 dark:bg-dark-700 hover:bg-dark-100 dark:hover:bg-dark-600 rounded-xl transition-colors text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                        <MonitorPlay className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-medium">Control Panel</p>
                        <p className="text-xs text-dark-500">Manage via Plesk</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </button>
                <button className="p-4 bg-dark-50 dark:bg-dark-700 hover:bg-dark-100 dark:hover:bg-dark-600 rounded-xl transition-colors text-left group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Databases</p>
                        <p className="text-xs text-dark-500">Manage MySQL/PgSQL</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </button>
                <button className="p-4 bg-dark-50 dark:bg-dark-700 hover:bg-dark-100 dark:hover:bg-dark-600 rounded-xl transition-colors text-left group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Email Accounts</p>
                        <p className="text-xs text-dark-500">Setup email</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Service Info */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <h3 className="font-bold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Service Information
              </h3>
            </div>
            <div className="p-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-dark-100 dark:border-dark-700">
                <span className="text-dark-500">Service Type</span>
                <span className="font-medium capitalize">{specs.type || service.service_type || 'Hosting'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-dark-100 dark:border-dark-700">
                <span className="text-dark-500">Status</span>
                <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", statusColors[service.status])}>
                  {service.status}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-dark-100 dark:border-dark-700">
                <span className="text-dark-500">Billing Cycle</span>
                <span className="font-medium capitalize">{service.billing_cycle || 'Monthly'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-dark-100 dark:border-dark-700">
                <span className="text-dark-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Created
                </span>
                <span className="font-medium">
                  {service.created_at ? new Date(service.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Next Due
                </span>
                <span className="font-medium">
                  {service.next_due_date ? new Date(service.next_due_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
            </div>
          </div>

          {/* Billing */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
              <h3 className="font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing
              </h3>
            </div>
            <div className="p-5">
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl mb-4">
                <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">Current Plan</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(service.amount || service.price || service.total || 0)}
                  <span className="text-sm font-normal text-dark-500">/{service.billing_cycle || 'monthly'}</span>
                </p>
              </div>
              <Link 
                to={`/dashboard/invoices?service=${uuid}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
              >
                <Receipt className="w-4 h-4" />
                View Invoices
              </Link>
            </div>
          </div>

          {/* Need Help */}
          <div className="card p-6 bg-gradient-to-br from-primary-500/10 to-indigo-500/10 border-primary-500/20">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-sm text-dark-500 mb-4">Our support team is available 24/7 to assist you.</p>
            <Link 
              to="/dashboard/tickets"
              className="block w-full text-center py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors font-medium"
            >
              Open Support Ticket
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
