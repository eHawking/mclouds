import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, Plus, Send, Eye, Trash2, Search, Filter, CheckCircle, XCircle, 
  Clock, User, Mail, Building2, DollarSign, Calendar, ChevronDown, X,
  Sparkles, Crown, Zap, Shield, Star, Package, CreditCard, Loader2,
  UserPlus, Check, AlertTriangle, Globe, Phone, MapPin, Gem
} from 'lucide-react'
import { adminAPI, productsAPI, settingsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useSiteSettingsStore } from '../../store/useStore'

// Predefined Services by Category
const SERVICE_CATEGORIES = [
  {
    name: 'Hosting',
    services: [
      { id: 'hosting-shared', name: 'Shared Hosting', price: 2.99 },
      { id: 'hosting-business', name: 'Business Hosting', price: 9.99 },
      { id: 'hosting-wordpress', name: 'WordPress Hosting', price: 5.99 },
      { id: 'hosting-reseller', name: 'Reseller Hosting', price: 19.99 },
    ]
  },
  {
    name: 'Servers',
    services: [
      { id: 'vps-basic', name: 'VPS Basic', price: 9.99 },
      { id: 'vps-standard', name: 'VPS Standard', price: 19.99 },
      { id: 'vps-pro', name: 'VPS Pro', price: 39.99 },
      { id: 'vps-enterprise', name: 'VPS Enterprise', price: 79.99 },
      { id: 'bd-server', name: 'BD Server (Bangladesh)', price: 29.99 },
      { id: 'cloud-starter', name: 'Cloud Server Starter', price: 5.00 },
      { id: 'cloud-standard', name: 'Cloud Server Standard', price: 10.00 },
      { id: 'cloud-pro', name: 'Cloud Server Pro', price: 40.00 },
      { id: 'dedicated-starter', name: 'Dedicated Server Starter', price: 99.00 },
      { id: 'dedicated-pro', name: 'Dedicated Server Pro', price: 179.00 },
      { id: 'dedicated-enterprise', name: 'Dedicated Server Enterprise', price: 499.00 },
    ]
  },
  {
    name: 'Security & Tools',
    services: [
      { id: 'ssl-basic', name: 'Basic SSL Certificate', price: 9.99 },
      { id: 'ssl-business', name: 'Business SSL Certificate', price: 49.99 },
      { id: 'ssl-wildcard', name: 'Wildcard SSL Certificate', price: 99.99 },
      { id: 'ssl-ev', name: 'EV SSL Certificate', price: 199.99 },
      { id: 'email-starter', name: 'Professional Email Starter', price: 1.99 },
      { id: 'email-business', name: 'Professional Email Business', price: 4.99 },
      { id: 'email-enterprise', name: 'Professional Email Enterprise', price: 9.99 },
      { id: 'backup-basic', name: 'Website Backup Basic', price: 2.99 },
      { id: 'backup-pro', name: 'Website Backup Pro', price: 7.99 },
      { id: 'backup-enterprise', name: 'Website Backup Enterprise', price: 19.99 },
      { id: 'nobot-ai', name: 'NoBot AI Chatbot', price: 29.99 },
      { id: 'web-development', name: 'Custom Web Development', price: 499.00 },
      { id: 'bug-smash', name: 'Bug Smash Service', price: 49.99 },
      { id: 'magnetic-builder', name: 'Magnetic Builder (24hr Site)', price: 199.00 },
      { id: 'magnetic-shieldx', name: 'Magnetic ShieldX Security', price: 14.99 },
      { id: 'seo-tools', name: 'SEO Tools Package', price: 19.99 },
    ]
  },
  {
    name: 'Domains',
    services: [
      { id: 'domain-com', name: 'Domain Registration (.com)', price: 12.99 },
      { id: 'domain-net', name: 'Domain Registration (.net)', price: 14.99 },
      { id: 'domain-org', name: 'Domain Registration (.org)', price: 13.99 },
      { id: 'domain-io', name: 'Domain Registration (.io)', price: 49.99 },
      { id: 'domain-bd', name: 'Domain Registration (.bd)', price: 39.99 },
      { id: 'domain-com-bd', name: 'Domain Registration (.com.bd)', price: 29.99 },
      { id: 'domain-transfer', name: 'Domain Transfer', price: 12.99 },
      { id: 'domain-privacy', name: 'Domain Privacy Protection', price: 9.99 },
    ]
  },
  {
    name: 'Company Services',
    services: [
      { id: 'consultation', name: 'IT Consultation (per hour)', price: 50.00 },
      { id: 'migration', name: 'Website Migration Service', price: 99.00 },
      { id: 'managed-service', name: 'Managed Hosting Service', price: 49.99 },
      { id: 'priority-support', name: 'Priority Support Package', price: 29.99 },
      { id: 'custom-solution', name: 'Custom Solution', price: 0 },
    ]
  }
]

// Invoice Template Designs
const INVOICE_TEMPLATES = [
  { 
    id: 'modern', 
    name: 'Modern Minimal', 
    icon: Sparkles,
    gradient: 'from-slate-600 to-slate-800',
    preview: 'Clean lines with subtle gradients',
    bgColor: 'bg-white',
    accentColor: 'border-slate-600',
    headerBg: 'bg-gradient-to-r from-slate-700 to-slate-900'
  },
  { 
    id: 'premium', 
    name: 'Premium Gold', 
    icon: Crown,
    gradient: 'from-amber-500 to-yellow-600',
    preview: 'Luxurious gold accents',
    bgColor: 'bg-amber-50',
    accentColor: 'border-amber-500',
    headerBg: 'bg-gradient-to-r from-amber-500 to-yellow-600'
  },
  { 
    id: 'tech', 
    name: 'Tech Futuristic', 
    icon: Zap,
    gradient: 'from-cyan-500 to-blue-600',
    preview: 'Neon cyber aesthetic',
    bgColor: 'bg-slate-900',
    accentColor: 'border-cyan-500',
    headerBg: 'bg-gradient-to-r from-cyan-500 to-blue-600'
  },
  { 
    id: 'corporate', 
    name: 'Corporate Pro', 
    icon: Building2,
    gradient: 'from-indigo-600 to-purple-700',
    preview: 'Professional business style',
    bgColor: 'bg-indigo-50',
    accentColor: 'border-indigo-600',
    headerBg: 'bg-gradient-to-r from-indigo-600 to-purple-700'
  },
  { 
    id: 'elegant', 
    name: 'Elegant Dark', 
    icon: Star,
    gradient: 'from-gray-800 to-black',
    preview: 'Sophisticated dark theme',
    bgColor: 'bg-gray-900',
    accentColor: 'border-gray-600',
    headerBg: 'bg-gradient-to-r from-gray-800 to-black'
  }
]

// Predefined Terms & Conditions Templates
const TERMS_TEMPLATES = [
  {
    id: 'standard',
    name: 'Standard',
    icon: FileText,
    terms: `1. Payment Terms: Payment is due within 7 days of proposal acceptance.
2. Service Delivery: Services will be activated within 24-48 hours after payment confirmation.
3. Refund Policy: 30-day money-back guarantee for hosting services.
4. Support: 24/7 technical support via ticket system.
5. Service Level: 99.9% uptime guarantee on all hosting services.`
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    terms: `1. Payment Terms: Net 30 payment terms. Payment due within 30 days of invoice date.
2. Service Level Agreement: 99.99% uptime guarantee with service credits for downtime.
3. Priority Support: Dedicated account manager and priority 24/7 support.
4. Data Protection: Full GDPR compliance and data processing agreement included.
5. Termination: 30-day notice period required for service termination.
6. Liability: Service provider liability limited to fees paid in preceding 12 months.
7. Confidentiality: All client data treated as strictly confidential.`
  },
  {
    id: 'project',
    name: 'Project-Based',
    icon: Package,
    terms: `1. Project Scope: Work limited to items specified in this proposal.
2. Payment Schedule: 50% deposit required to commence work, 50% upon completion.
3. Revisions: Up to 2 rounds of revisions included. Additional revisions billed hourly.
4. Timeline: Estimated delivery dates subject to timely client feedback.
5. Ownership: Full ownership transfers upon final payment.
6. Cancellation: Deposit non-refundable if cancelled after work commences.`
  },
  {
    id: 'subscription',
    name: 'Subscription',
    icon: CreditCard,
    terms: `1. Billing Cycle: Services billed monthly/annually as selected.
2. Auto-Renewal: Subscription auto-renews unless cancelled 7 days before renewal.
3. Price Lock: Pricing guaranteed for the initial term.
4. Upgrades: Upgrade anytime; difference prorated to current billing cycle.
5. Downgrades: Effective at next billing cycle.
6. Cancellation: Cancel anytime; service continues until end of paid period.`
  }
]

// Create/Edit Proposal Modal
function ProposalModal({ isOpen, onClose, proposal, onSave, products, users, bankSettings, siteLogo, siteName }) {
  const [loading, setLoading] = useState(false)
  const [showNewUser, setShowNewUser] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    user_id: '',
    items: [{ service_id: '', product_id: '', name: '', description: '', quantity: 1, price: 0 }],
    discount: 0,
    discount_type: 'percentage',
    tax: 0,
    notes: '',
    terms: 'Payment is due within 7 days of proposal acceptance.',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    template: 'modern',
    bank_method: 'bank_transfer',
    ...proposal
  })
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: ''
  })

  useEffect(() => {
    if (proposal) {
      setForm(prev => ({ ...prev, ...proposal }))
    }
  }, [proposal])

  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { service_id: '', product_id: '', name: '', description: '', quantity: 1, price: 0 }]
    }))
  }

  const handleRemoveItem = (index) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item
        
        // If selecting a service from predefined list
        if (field === 'service_id' && value) {
          // Find service in categories
          for (const category of SERVICE_CATEGORIES) {
            const service = category.services.find(s => s.id === value)
            if (service) {
              return {
                ...item,
                service_id: value,
                name: service.name,
                description: `${category.name} - ${service.name}`,
                price: service.price
              }
            }
          }
        }
        
        // If selecting a product from database
        if (field === 'product_id' && value) {
          const product = products.find(p => p.id === parseInt(value))
          if (product) {
            return {
              ...item,
              product_id: value,
              name: product.name,
              description: product.description?.substring(0, 100) || '',
              price: product.price_monthly || product.price || 0
            }
          }
        }
        
        return { ...item, [field]: value }
      })
    }))
  }

  const calculateSubtotal = () => {
    return form.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0)
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    if (form.discount_type === 'percentage') {
      return (subtotal * Number(form.discount || 0)) / 100
    }
    return Number(form.discount || 0)
  }

  const calculateTax = () => {
    const afterDiscount = calculateSubtotal() - calculateDiscount()
    return (afterDiscount * Number(form.tax || 0)) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax()
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.first_name) {
      toast.error('Email and first name are required')
      return
    }
    
    setLoading(true)
    try {
      const res = await adminAPI.createUser?.(newUser) || 
        await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        }).then(r => r.json())
      
      if (res.data?.user || res.user) {
        const user = res.data?.user || res.user
        setForm(prev => ({ ...prev, user_id: user.id }))
        setShowNewUser(false)
        toast.success('User created successfully')
        // Refresh users list would happen via parent
      }
    } catch (err) {
      toast.error('Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.user_id && !showNewUser) {
      toast.error('Please select a user or create a new one')
      return
    }
    
    if (form.items.length === 0 || !form.items[0].name) {
      toast.error('Please add at least one item')
      return
    }

    setLoading(true)
    try {
      const data = {
        ...form,
        subtotal: calculateSubtotal(),
        discount_amount: calculateDiscount(),
        tax_amount: calculateTax(),
        total: calculateTotal()
      }
      
      await onSave(data)
      onClose()
    } catch (err) {
      toast.error('Failed to save proposal')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedTemplate = INVOICE_TEMPLATES.find(t => t.id === form.template) || INVOICE_TEMPLATES[0]
  const selectedUser = users.find(u => u.id === parseInt(form.user_id))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[1400px] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl my-8"
      >
        {/* Ultra Premium Header */}
        <div className="sticky top-0 z-10 relative overflow-hidden rounded-t-2xl">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-1/2 right-0 w-48 h-48 bg-pink-500 rounded-full blur-3xl animate-pulse delay-500" />
            </div>
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>
          
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Logo */}
                {siteLogo ? (
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm p-2 border border-white/20 shadow-xl">
                    <img src={siteLogo} alt={siteName} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30">
                    <Gem className="w-7 h-7 text-white" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">
                      {proposal ? 'Edit Proposal' : 'Create New Proposal'}
                    </h2>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-xs font-bold rounded-full uppercase tracking-wide">
                      Premium
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-1">Design a custom offer for your client</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl transition-all border border-white/10 backdrop-blur-sm">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 lg:border-r border-dark-200 dark:border-dark-600 overflow-y-auto max-h-[75vh]">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Proposal Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Enterprise Hosting Package"
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valid Until</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm(prev => ({ ...prev, valid_until: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this proposal..."
              rows={2}
              className="input"
            />
          </div>

          {/* Select User */}
          <div className="p-6 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                Select Client
              </h3>
              <button
                type="button"
                onClick={() => setShowNewUser(!showNewUser)}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                {showNewUser ? 'Select Existing' : 'Create New User'}
              </button>
            </div>

            {showNewUser ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input
                      type="text"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, first_name: e.target.value }))}
                      className="input"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, last_name: e.target.value }))}
                      className="input"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      className="input"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company</label>
                    <input
                      type="text"
                      value={newUser.company}
                      onChange={(e) => setNewUser(prev => ({ ...prev, company: e.target.value }))}
                      className="input"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCreateUser}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Create & Select User
                </button>
              </div>
            ) : (
              <select
                value={form.user_id}
                onChange={(e) => setForm(prev => ({ ...prev, user_id: e.target.value }))}
                className="input"
                required={!showNewUser}
              >
                <option value="">Select a user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Services/Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-500" />
                Services & Items
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {form.items.map((item, index) => (
                <div key={index} className="p-4 bg-dark-50 dark:bg-dark-700/50 rounded-xl border border-dark-200 dark:border-dark-600">
                  <div className="grid md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium mb-1 text-dark-500">Select Service</label>
                      <select
                        value={item.service_id || ''}
                        onChange={(e) => handleItemChange(index, 'service_id', e.target.value)}
                        className="input text-sm"
                      >
                        <option value="">Custom item...</option>
                        {SERVICE_CATEGORIES.map(category => (
                          <optgroup key={category.name} label={`── ${category.name} ──`}>
                            {category.services.map(service => (
                              <option key={service.id} value={service.id}>
                                {service.name} (${service.price}/mo)
                              </option>
                            ))}
                          </optgroup>
                        ))}
                        {products.length > 0 && (
                          <optgroup label="── Products from Database ──">
                            {products.map(p => (
                              <option key={`db-${p.id}`} value={`db-${p.id}`}>
                                {p.name} (${p.price_monthly || p.price || 0}/mo)
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium mb-1 text-dark-500">Item Name *</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder="Service name"
                        className="input text-sm"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1 text-dark-500">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className="input text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1 text-dark-500">Price ($)</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="input text-sm"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Item description (optional)"
                      className="input text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Discount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={form.discount}
                      onChange={(e) => setForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      className="input flex-1"
                    />
                    <select
                      value={form.discount_type}
                      onChange={(e) => setForm(prev => ({ ...prev, discount_type: e.target.value }))}
                      className="input w-24"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">$</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tax (%)</label>
                  <input
                    type="number"
                    value={form.tax}
                    onChange={(e) => setForm(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={form.bank_method}
                  onChange={(e) => setForm(prev => ({ ...prev, bank_method: e.target.value }))}
                  className="input"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="bkash">bKash</option>
                  <option value="rocket">Rocket</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Credit/Debit Card (Stripe)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-3">Price Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-500">Subtotal</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                {form.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount ({form.discount}{form.discount_type === 'percentage' ? '%' : '$'})</span>
                    <span>-${calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                {form.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-dark-500">Tax ({form.tax}%)</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg font-bold text-emerald-600">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes (visible to client)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes..."
              rows={2}
              className="input"
            />
          </div>

          {/* Ultra-Premium Terms & Conditions */}
          <div className="p-5 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-200">Terms & Conditions</h4>
                <p className="text-xs text-amber-600 dark:text-amber-400">Select a template or customize</p>
              </div>
            </div>
            
            {/* Terms Templates */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {TERMS_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, terms: template.terms }))}
                  className={clsx(
                    "p-2 rounded-lg border-2 transition-all text-center hover:scale-105",
                    form.terms === template.terms
                      ? "border-amber-500 bg-amber-100 dark:bg-amber-900/40"
                      : "border-amber-200 dark:border-amber-700 hover:border-amber-400"
                  )}
                >
                  <template.icon className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-200">{template.name}</span>
                </button>
              ))}
            </div>

            <textarea
              value={form.terms}
              onChange={(e) => setForm(prev => ({ ...prev, terms: e.target.value }))}
              rows={4}
              className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-amber-300 dark:border-amber-600 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Enter terms and conditions..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              {proposal ? 'Update Proposal' : 'Create Proposal'}
            </button>
          </div>
        </form>

          {/* Right Side - Ultra Premium Live Preview */}
          <div className="w-full lg:w-[450px] p-6 bg-gradient-to-br from-slate-100 via-purple-50 to-slate-100 dark:from-dark-900 dark:via-purple-900/10 dark:to-dark-900 overflow-y-auto max-h-[75vh]">
            <div className="sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Live Preview</h3>
                </div>
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">
                  Real-time
                </span>
              </div>

              {/* Ultra Premium Invoice Preview Card */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/50 dark:border-dark-600 bg-white transform hover:scale-[1.02] transition-all duration-300">
                {/* Premium Invoice Header with Logo */}
                <div className="relative overflow-hidden">
                  <div className={clsx("absolute inset-0", selectedTemplate.headerBg)} />
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
                  </div>
                  <div className="relative p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* Logo in Preview */}
                        {siteLogo ? (
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm p-1.5 border border-white/30">
                            <img src={siteLogo} alt={siteName} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <Gem className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-white font-bold text-lg tracking-wide">PROPOSAL</h4>
                          <p className="text-white/60 text-xs font-mono">#{form.title ? 'PROP-XXXX' : '---'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                          <selectedTemplate.icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Body - Premium Design */}
                <div className={clsx(
                  "p-5 space-y-5",
                  selectedTemplate.id === 'tech' || selectedTemplate.id === 'elegant' 
                    ? 'bg-gradient-to-b from-gray-900 to-gray-950 text-white' 
                    : 'bg-gradient-to-b from-white to-slate-50 text-slate-800'
                )}>
                  {/* Title & Client with Premium Styling */}
                  <div className="pb-4 border-b-2 border-dashed border-current/10">
                    <h5 className="font-bold text-base">{form.title || 'Proposal Title'}</h5>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1 opacity-60">
                        <User className="w-3 h-3" />
                        {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : 'Select a client'}
                      </span>
                      <span className="flex items-center gap-1 opacity-60">
                        <Calendar className="w-3 h-3" />
                        {form.valid_until || '---'}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview - Enhanced */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-50">Services & Items</p>
                    {form.items.filter(i => i.name).length > 0 ? (
                      <div className="space-y-2">
                        {form.items.filter(i => i.name).slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-current/5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Package className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-xs font-medium truncate max-w-[150px]">{item.name}</span>
                            </div>
                            <span className="text-xs font-bold">${(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-current/5 text-center">
                        <p className="text-xs opacity-50 italic">No items added yet</p>
                      </div>
                    )}
                    {form.items.filter(i => i.name).length > 3 && (
                      <p className="text-xs opacity-50 text-center">+{form.items.filter(i => i.name).length - 3} more items...</p>
                    )}
                  </div>

                  {/* Premium Totals Section */}
                  <div className="pt-4 border-t-2 border-dashed border-current/10 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="opacity-60">Subtotal</span>
                      <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {form.discount > 0 && (
                      <div className="flex justify-between text-xs text-emerald-500">
                        <span>Discount</span>
                        <span className="font-medium">-${calculateDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    {form.tax > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="opacity-60">Tax ({form.tax}%)</span>
                        <span className="font-medium">${calculateTax().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-current/10">
                      <span className="font-bold">Total Due</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Terms Preview - Compact */}
                  {form.terms && (
                    <div className="pt-3 border-t border-current/10">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-2">Terms & Conditions</p>
                      <p className="text-xs opacity-60 line-clamp-2">{form.terms}</p>
                    </div>
                  )}
                </div>

                {/* Premium Invoice Footer with Branding */}
                <div className={clsx(
                  "px-5 py-4 flex items-center justify-between",
                  selectedTemplate.id === 'tech' || selectedTemplate.id === 'elegant' 
                    ? 'bg-gray-800' 
                    : 'bg-slate-100'
                )}>
                  <div className="flex items-center gap-2">
                    {siteLogo ? (
                      <img src={siteLogo} alt="" className="w-5 h-5 object-contain opacity-50" />
                    ) : (
                      <Gem className="w-4 h-4 opacity-50" />
                    )}
                    <span className="text-xs opacity-50">{siteName || 'Magnetic Clouds'}</span>
                  </div>
                  <span className="text-xs opacity-30">Premium Proposal</span>
                </div>
              </div>

              {/* Template Selection - Premium Cards */}
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-dark-500 mb-3">Select Template Style</p>
                <div className="grid grid-cols-5 gap-2">
                  {INVOICE_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, template: template.id }))}
                      className={clsx(
                        "p-3 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg",
                        form.template === template.id
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-lg shadow-purple-500/20"
                          : "border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800"
                      )}
                    >
                      <div className={clsx(
                        "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mx-auto shadow-lg",
                        template.gradient
                      )}>
                        <template.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs mt-2 font-medium text-center">{template.name.split(' ')[0]}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Main Admin Proposals Page
export default function AdminProposals() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [proposals, setProposals] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, proposal: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const proposalsRes = await adminAPI.getProposals?.() || { data: { proposals: [] } }
      setProposals(proposalsRes.data?.proposals || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendProposal = async (proposal) => {
    try {
      await adminAPI.sendProposal(proposal.uuid)
      toast.success('Proposal sent to client!')
      loadData()
    } catch (err) {
      toast.error('Failed to send proposal')
    }
  }

  const handleDeleteProposal = async (proposal) => {
    setDeleteDialog({ open: true, proposal })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.proposal) return
    setDeleteLoading(true)
    try {
      await adminAPI.deleteProposal(deleteDialog.proposal.uuid)
      toast.success('Proposal deleted')
      loadData()
      setDeleteDialog({ open: false, proposal: null })
    } catch (err) {
      toast.error('Failed to delete proposal')
    } finally {
      setDeleteLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      viewed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      expired: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    }
    
    const icons = {
      draft: Clock,
      sent: Send,
      viewed: Eye,
      accepted: CheckCircle,
      rejected: XCircle,
      expired: Clock
    }
    
    const Icon = icons[status] || Clock
    
    return (
      <span className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', styles[status])}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const filteredProposals = proposals.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && 
        !p.user_email?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <>
      <Helmet><title>Proposals - Admin - Magnetic Clouds</title></Helmet>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Proposals
          </h1>
          <p className="text-dark-500 mt-1">Create and manage custom offers for clients</p>
        </div>
        <button
          onClick={() => navigate('/admin/proposals/new')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: proposals.length, color: 'from-slate-500 to-slate-600' },
          { label: 'Draft', value: proposals.filter(p => p.status === 'draft').length, color: 'from-gray-500 to-gray-600' },
          { label: 'Sent', value: proposals.filter(p => p.status === 'sent').length, color: 'from-blue-500 to-blue-600' },
          { label: 'Accepted', value: proposals.filter(p => p.status === 'accepted').length, color: 'from-green-500 to-green-600' },
          { label: 'Rejected', value: proposals.filter(p => p.status === 'rejected').length, color: 'from-red-500 to-red-600' }
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className={clsx('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2', stat.color)}>
              <FileText className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-dark-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search proposals..."
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'sent', 'accepted', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No proposals yet</h3>
          <p className="text-dark-500 mb-6">Create your first proposal to send custom offers to clients</p>
          <button onClick={() => navigate('/admin/proposals/new')} className="btn-primary mx-auto">
            <Plus className="w-4 h-4 mr-2" /> Create Proposal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal, index) => (
            <motion.div
              key={proposal.uuid || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{proposal.title}</h3>
                    {getStatusBadge(proposal.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-dark-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {proposal.user_name || proposal.user_email || 'No user'}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${Number(proposal.total || 0).toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Valid until {new Date(proposal.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {proposal.status === 'draft' && (
                    <button
                      onClick={() => handleSendProposal(proposal)}
                      className="btn-primary text-sm"
                    >
                      <Send className="w-4 h-4 mr-1" /> Send
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/admin/proposals/${proposal.uuid}/edit`)}
                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProposal(proposal)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, proposal: null })}
        onConfirm={confirmDelete}
        title="Delete Proposal?"
        message={`Are you sure you want to delete the proposal "${deleteDialog.proposal?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        type="danger"
        icon={Trash2}
        loading={deleteLoading}
      />
    </>
  )
}
