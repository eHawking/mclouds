import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { 
  FileText, Plus, Send, Eye, Trash2, Save, ArrowLeft,
  Clock, User, Mail, Building2, DollarSign, Calendar, ChevronDown, X,
  Sparkles, Crown, Zap, Shield, Star, Package, CreditCard, Loader2,
  UserPlus, Check, AlertTriangle, Globe, Phone, MapPin, Gem
} from 'lucide-react'
import { adminAPI, productsAPI, settingsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'
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
      { id: 'nobot-ai', name: 'NoBot AI Chatbot', price: 29.99 },
      { id: 'web-development', name: 'Custom Web Development', price: 499.00 },
      { id: 'magnetic-builder', name: 'Magnetic Builder (24hr Site)', price: 199.00 },
    ]
  },
  {
    name: 'Domains',
    services: [
      { id: 'domain-com', name: 'Domain Registration (.com)', price: 12.99 },
      { id: 'domain-net', name: 'Domain Registration (.net)', price: 14.99 },
      { id: 'domain-io', name: 'Domain Registration (.io)', price: 49.99 },
      { id: 'domain-transfer', name: 'Domain Transfer', price: 12.99 },
    ]
  },
  {
    name: 'Company Services',
    services: [
      { id: 'consultation', name: 'IT Consultation (per hour)', price: 50.00 },
      { id: 'migration', name: 'Website Migration Service', price: 99.00 },
      { id: 'managed-service', name: 'Managed Hosting Service', price: 49.99 },
      { id: 'custom-solution', name: 'Custom Solution', price: 0 },
    ]
  }
]

// Invoice Template Designs
const INVOICE_TEMPLATES = [
  { id: 'modern', name: 'Modern Minimal', icon: Sparkles, gradient: 'from-slate-600 to-slate-800' },
  { id: 'premium', name: 'Premium Gold', icon: Crown, gradient: 'from-amber-500 to-yellow-600' },
  { id: 'tech', name: 'Tech Futuristic', icon: Zap, gradient: 'from-cyan-500 to-blue-600' },
  { id: 'corporate', name: 'Corporate Pro', icon: Building2, gradient: 'from-indigo-600 to-purple-700' },
  { id: 'elegant', name: 'Elegant Dark', icon: Star, gradient: 'from-gray-800 to-black' }
]

export default function AdminProposalEditor() {
  const navigate = useNavigate()
  const { uuid } = useParams()
  const isEditing = !!uuid
  const { logo: siteLogo, siteName } = useSiteSettingsStore()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [bankSettings, setBankSettings] = useState({})
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
    bank_method: 'bank_transfer'
  })
  
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: ''
  })

  useEffect(() => {
    loadData()
  }, [uuid])

  const loadData = async () => {
    try {
      const [productsRes, usersRes, bankRes] = await Promise.all([
        productsAPI.getAll(),
        adminAPI.getUsers(),
        settingsAPI.getPaymentGateway()
      ])
      
      setProducts(productsRes.data?.products || productsRes.data || [])
      setUsers(usersRes.data?.users || [])
      setBankSettings(bankRes.data?.settings || {})
      
      if (uuid) {
        const proposalRes = await adminAPI.getProposal(uuid)
        if (proposalRes.data?.proposal) {
          setForm(prev => ({ ...prev, ...proposalRes.data.proposal }))
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

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
        
        if (field === 'service_id' && value) {
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
    
    setSaving(true)
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
        setUsers(prev => [...prev, user])
        setShowNewUser(false)
        toast.success('User created successfully')
      }
    } catch (err) {
      toast.error('Failed to create user')
    } finally {
      setSaving(false)
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

    setSaving(true)
    try {
      const data = {
        ...form,
        subtotal: calculateSubtotal(),
        discount_amount: calculateDiscount(),
        tax_amount: calculateTax(),
        total: calculateTotal()
      }
      
      if (isEditing) {
        await adminAPI.updateProposal(uuid, data)
        toast.success('Proposal updated!')
      } else {
        await adminAPI.createProposal(data)
        toast.success('Proposal created!')
      }
      navigate('/admin/proposals')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save proposal')
    } finally {
      setSaving(false)
    }
  }

  const selectedUser = users.find(u => u.id === parseInt(form.user_id))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Proposal' : 'Create Proposal'} - Admin</title>
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/proposals')}
          className="flex items-center gap-2 text-dark-500 hover:text-dark-700 dark:hover:text-dark-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Proposals
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Proposal' : 'Create New Proposal'}</h1>
        <p className="text-dark-500 mt-1">Fill in the details to create a professional proposal</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                Proposal Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Website Hosting Package"
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this proposal..."
                    rows={3}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Client Selection */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                Client Information
              </h2>
              
              {!showNewUser ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Client *</label>
                    <select
                      value={form.user_id}
                      onChange={e => setForm(prev => ({ ...prev, user_id: e.target.value }))}
                      className="input w-full"
                    >
                      <option value="">Select a client...</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewUser(true)}
                    className="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create New Client
                  </button>
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-dark-50 dark:bg-dark-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">New Client</h3>
                    <button type="button" onClick={() => setShowNewUser(false)} className="text-dark-500 hover:text-dark-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newUser.first_name}
                      onChange={e => setNewUser(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="First Name *"
                      className="input"
                    />
                    <input
                      type="text"
                      value={newUser.last_name}
                      onChange={e => setNewUser(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Last Name"
                      className="input"
                    />
                  </div>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email *"
                    className="input w-full"
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={e => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone"
                      className="input"
                    />
                    <input
                      type="text"
                      value={newUser.company}
                      onChange={e => setNewUser(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Company"
                      className="input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateUser}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Create Client
                  </button>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-500" />
                  Line Items
                </h2>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {form.items.map((item, index) => (
                  <div key={index} className="p-4 border border-dark-200 dark:border-dark-700 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-dark-500">Item {index + 1}</span>
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-dark-500 mb-1">Quick Select Service</label>
                        <select
                          value={item.service_id || ''}
                          onChange={e => handleItemChange(index, 'service_id', e.target.value)}
                          className="input w-full text-sm"
                        >
                          <option value="">Choose from list...</option>
                          {SERVICE_CATEGORIES.map(cat => (
                            <optgroup key={cat.name} label={cat.name}>
                              {cat.services.map(s => (
                                <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-dark-500 mb-1">Or Select Product</label>
                        <select
                          value={item.product_id || ''}
                          onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                          className="input w-full text-sm"
                        >
                          <option value="">Choose product...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - ${p.price_monthly || p.price}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleItemChange(index, 'name', e.target.value)}
                          placeholder="Item name *"
                          className="input w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          placeholder="Qty"
                          className="input"
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => handleItemChange(index, 'price', e.target.value)}
                          step="0.01"
                          min="0"
                          placeholder="Price"
                          className="input"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2 text-right text-sm font-medium text-primary-500">
                      Line Total: ${(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Notes */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                Terms & Notes
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Notes to Client</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={3}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Terms & Conditions</label>
                  <textarea
                    value={form.terms}
                    onChange={e => setForm(prev => ({ ...prev, terms: e.target.value }))}
                    rows={4}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Summary */}
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary-500" />
                Pricing Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Subtotal</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.discount}
                    onChange={e => setForm(prev => ({ ...prev, discount: e.target.value }))}
                    min="0"
                    step="0.01"
                    className="input flex-1"
                    placeholder="Discount"
                  />
                  <select
                    value={form.discount_type}
                    onChange={e => setForm(prev => ({ ...prev, discount_type: e.target.value }))}
                    className="input w-20"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">$</option>
                  </select>
                </div>
                
                {calculateDiscount() > 0 && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Discount</span>
                    <span>-${calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.tax}
                    onChange={e => setForm(prev => ({ ...prev, tax: e.target.value }))}
                    min="0"
                    step="0.01"
                    className="input flex-1"
                    placeholder="Tax %"
                  />
                  <span className="text-dark-500 text-sm">%</span>
                </div>
                
                {calculateTax() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-500">Tax</span>
                    <span>+${calculateTax().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-dark-200 dark:border-dark-700 pt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-500">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Settings */}
              <div className="mt-6 pt-6 border-t border-dark-200 dark:border-dark-700 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Valid Until</label>
                  <input
                    type="date"
                    value={form.valid_until}
                    onChange={e => setForm(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Template</label>
                  <div className="grid grid-cols-5 gap-2">
                    {INVOICE_TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, template: t.id }))}
                        className={clsx(
                          "p-2 rounded-lg border-2 transition-all",
                          form.template === t.id
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                            : "border-dark-200 dark:border-dark-700 hover:border-dark-300"
                        )}
                        title={t.name}
                      >
                        <div className={`w-full h-6 rounded bg-gradient-to-br ${t.gradient}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <select
                    value={form.bank_method}
                    onChange={e => setForm(prev => ({ ...prev, bank_method: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="bkash">bKash</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-dark-200 dark:border-dark-700 space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full btn btn-primary"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isEditing ? 'Update Proposal' : 'Create Proposal'}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/admin/proposals')}
                  className="w-full btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
