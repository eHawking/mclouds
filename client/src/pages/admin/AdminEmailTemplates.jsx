import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail, Search, Edit3, Eye, RotateCcw, Upload, Save, X, Check,
    AlertCircle, Image, Code, FileText, Send, ChevronRight, Sparkles,
    Palette, Copy, CheckCircle, RefreshCw, Layout, Zap, Monitor, Globe,
    Shield, Bell, DollarSign, CreditCard
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Switch from '../../components/ui/Switch'

// Premium Category Definitions
const templateCategories = [
    {
        id: 'all',
        name: 'All Templates',
        icon: Layout,
        description: 'View all available email templates',
        color: 'from-gray-500 to-slate-500'
    },
    {
        id: 'auth',
        name: 'Authentication',
        icon: Shield,
        description: 'Login, registration & security emails',
        color: 'from-blue-500 to-cyan-500',
        templates: ['welcome_email', 'password_reset', 'verify_email', 'two_factor_auth', 'login_alert']
    },
    {
        id: 'orders',
        name: 'Billing & Orders',
        icon: CreditCard,
        description: 'Invoices, payments & order updates',
        color: 'from-emerald-500 to-teal-500',
        templates: ['order_placed', 'order_confirmed', 'order_completed', 'order_cancelled', 'invoice_generated', 'payment_received', 'payment_failed', 'refund_processed']
    },
    {
        id: 'support',
        name: 'Support Operations',
        icon: Mail,
        description: 'Ticket updates & customer support',
        color: 'from-violet-500 to-purple-500',
        templates: ['ticket_created', 'ticket_replied', 'ticket_closed', 'ticket_assigned']
    },
    {
        id: 'services',
        name: 'Service Lifecycle',
        icon: Zap,
        description: 'Provisioning, expiry & suspension',
        color: 'from-orange-500 to-amber-500',
        templates: ['service_created', 'service_suspended', 'service_terminated', 'service_expiring']
    },
    {
        id: 'marketing',
        name: 'Marketing & Growth',
        icon: Sparkles,
        description: 'Newsletters & promotional content',
        color: 'from-pink-500 to-rose-500',
        templates: ['newsletter_subscribe', 'proposal_sent', 'affiliate_approved']
    },
    {
        id: 'admin',
        name: 'Admin Alerts',
        icon: Bell,
        description: 'Internal system notifications',
        color: 'from-indigo-500 to-blue-500',
        templates: ['admin_new_order', 'admin_new_ticket', 'test_email', 'server_alert']
    }
]

export default function AdminEmailTemplates() {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [editMode, setEditMode] = useState(false)
    const [emailLogo, setEmailLogo] = useState(null)
    const [saving, setSaving] = useState(false)
    const [activeCategory, setActiveCategory] = useState('all')
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

    // Editor State
    const [templateData, setTemplateData] = useState({
        subject: '',
        html_content: '',
        is_active: true
    })

    const fileInputRef = useRef(null)
    const [copiedVar, setCopiedVar] = useState(null)

    useEffect(() => {
        fetchTemplates()
        fetchEmailLogo()
    }, [])

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/settings/email-templates', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTemplates(response.data.templates)
        } catch (error) {
            console.error('Failed to fetch templates:', error)
            toast.error('Failed to load email templates')
        } finally {
            setLoading(false)
        }
    }

    const fetchEmailLogo = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/settings/email-logo', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setEmailLogo(response.data.logo)
        } catch (error) {
            console.error('Failed to fetch email logo:', error)
        }
    }

    const selectTemplate = async (template) => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`/api/settings/email-templates/${template.template_key}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            const data = response.data.template
            setSelectedTemplate(data)
            setTemplateData({
                subject: data.subject,
                html_content: data.html_content,
                is_active: data.is_active
            })
            setEditMode(false)
        } catch (error) {
            console.error('Failed to fetch template details:', error)
            toast.error('Could not load template details')
        }
    }

    const saveTemplate = async () => {
        try {
            setSaving(true)
            const token = localStorage.getItem('token')
            await axios.put(`/api/settings/email-templates/${selectedTemplate.template_key}`, templateData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Template updated successfully')
            fetchTemplates() // Refresh list
            setEditMode(false)
        } catch (error) {
            console.error('Failed to save template:', error)
            toast.error('Failed to update template')
        } finally {
            setSaving(false)
        }
    }

    const resetTemplate = async () => {
        if (!confirm('Are you sure you want to reset this template to its default state? Customizations will be lost.')) return

        try {
            const token = localStorage.getItem('token')
            await axios.post(`/api/settings/email-templates/${selectedTemplate.template_key}/reset`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Template reset to default')
            // Refresh detailed view
            selectTemplate(selectedTemplate)
            fetchTemplates()
        } catch (error) {
            console.error('Failed to reset template:', error)
            toast.error('Failed to reset template')
        }
    }

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 500000) {
            toast.error('Image is too large. Max size is 500KB.')
            return
        }

        const reader = new FileReader()
        reader.onload = async (event) => {
            const base64 = event.target.result
            try {
                const token = localStorage.getItem('token')
                await axios.post('/api/settings/email-logo', { logo: base64 }, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setEmailLogo(base64)
                toast.success('Email logo updated')
            } catch (error) {
                console.error('Failed to upload logo:', error)
                toast.error('Failed to update logo')
            }
        }
        reader.readAsDataURL(file)
    }

    const copyVariable = (variable) => {
        navigator.clipboard.writeText(`{{${variable}}}`)
        setCopiedVar(variable)
        toast.success('Copied to clipboard')
        setTimeout(() => setCopiedVar(null), 2000)
    }

    // Filtering logic
    const getFilteredTemplates = () => {
        let filtered = templates

        // Category Filter
        if (activeCategory !== 'all') {
            const categoryDef = templateCategories.find(c => c.id === activeCategory)
            if (categoryDef) {
                filtered = filtered.filter(t => categoryDef.templates.includes(t.template_key))
            }
        }

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query) ||
                t.subject.toLowerCase().includes(query)
            )
        }

        return filtered
    }

    const filteredTemplates = getFilteredTemplates()

    // Variable Preview Helper
    const getVariablePreview = (html) => {
        // Replace common variables with realistic dummy data for preview
        return html
            .replace(/\{\{site_name\}\}/g, 'Magnetic Clouds')
            .replace(/\{\{site_url\}\}/g, 'https://magnetic-clouds.com')
            .replace(/\{\{user_name\}\}/g, 'Alex Smith')
            .replace(/\{\{year\}\}/g, new Date().getFullYear())
            .replace(/\{\{order_id\}\}/g, '#ORD-92834')
            .replace(/\{\{order_total\}\}/g, '$149.00')
            .replace(/\{\{order_date\}\}/g, new Date().toLocaleDateString())
            .replace(/\{\{ticket_id\}\}/g, '#TKT-5521')
            .replace(/\{\{ticket_subject\}\}/g, 'Unable to access control panel')
            .replace(/\{\{email\}\}/g, 'user@example.com')
            .replace(/\{\{reset_link\}\}/g, '#')
            .replace(/\{\{proposal_link\}\}/g, '#')
            .replace(/\{\{invoice_id\}\}/g, '#INV-2025-001')
            .replace(/\{\{email_logo\}\}/g, emailLogo || '')
            .replace(/\{\{ip_address\}\}/g, '192.168.1.1')
            .replace(/\{\{operating_system\}\}/g, 'Windows 11')
            .replace(/\{\{browser_name\}\}/g, 'Chrome')
            // Catch-all for other variables to display them as placeholders
            .replace(/\{\{([^}]+)\}\}/g, '<span style="background: rgba(99,102,241,0.1); color: #6366f1; padding: 2px 4px; border-radius: 4px; font-size: 0.9em;">$1</span>')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    <p className="text-dark-500 font-medium">Loading templates...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Helmet><title>Email Templates | Admin Portal</title></Helmet>

            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-dark-800/50 p-6 rounded-2xl border border-dark-700/50 backdrop-blur-xl">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Email Templates</h1>
                                <p className="text-dark-400 font-medium">Manage and customize automated system emails</p>
                            </div>
                        </div>
                    </div>

                    {/* Logo Management */}
                    <div className="flex items-center gap-4 bg-dark-900/50 p-3 rounded-xl border border-dark-700">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            accept="image/png,image/jpeg,image/gif"
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-12 h-12 rounded-lg bg-dark-800 border border-dark-600 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors overflow-hidden group"
                        >
                            {emailLogo ? (
                                <img src={emailLogo} alt="Logo" className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform" />
                            ) : (
                                <Upload className="w-5 h-5 text-dark-400 group-hover:text-primary-400" />
                            )}
                        </div>
                        <div className="pr-2">
                            <p className="text-sm font-semibold text-white">Brand Logo</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium"
                            >
                                {emailLogo ? 'Update Logo' : 'Upload Logo'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Left Sidebar - Navigation & Filters */}
                    <div className="xl:col-span-1 space-y-6">
                        {/* Search */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-dark-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="input group-hover:border-dark-600 w-full pl-11 py-3 text-base bg-dark-800/50 backdrop-blur-sm"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Category Navigation */}
                        <nav className="space-y-1">
                            {templateCategories.map((category) => {
                                const isActive = activeCategory === category.id
                                const count = category.id === 'all'
                                    ? templates.length
                                    : templates.filter(t => category.templates?.includes(t.template_key)).length

                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setActiveCategory(category.id)
                                            setSelectedTemplate(null)
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-gradient-to-r from-primary-600/20 to-primary-600/5 border border-primary-500/20 text-white'
                                            : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors ${isActive ? `bg-gradient-to-br ${category.color} shadow-lg` : 'bg-dark-700/50 group-hover:bg-dark-700'
                                            }`}>
                                            <category.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-dark-400 group-hover:text-white'}`} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className={`font-medium ${isActive ? 'text-white' : 'text-dark-300 group-hover:text-white'}`}>
                                                {category.name}
                                            </p>
                                            {isActive && (
                                                <p className="text-xs text-primary-200/70 truncate">{category.description}</p>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-primary-500/20 text-primary-200' : 'bg-dark-800 text-dark-500'
                                            }`}>
                                            {count}
                                        </span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="xl:col-span-3">
                        <AnimatePresence mode="wait">
                            {selectedTemplate ? (
                                /* --- EDITOR VIEW --- */
                                <motion.div
                                    key="editor"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-dark-800/50 border border-dark-700 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl"
                                >
                                    {/* Editor Header */}
                                    <div className="border-b border-dark-700 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900/30">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setSelectedTemplate(null)}
                                                className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-white"
                                            >
                                                <ChevronRight className="w-5 h-5 rotate-180" />
                                            </button>
                                            <div>
                                                <h2 className="text-xl font-bold flex items-center gap-3">
                                                    {selectedTemplate.name}
                                                    {selectedTemplate.is_customized && (
                                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/20 font-medium">
                                                            Customized
                                                        </span>
                                                    )}
                                                </h2>
                                                <p className="text-dark-500 text-sm">{selectedTemplate.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 bg-dark-800 p-1 rounded-lg border border-dark-700">
                                            <button
                                                onClick={() => setEditMode(false)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${!editMode ? 'bg-dark-700 text-white shadow-sm' : 'text-dark-400 hover:text-white'
                                                    }`}
                                            >
                                                <Eye className="w-4 h-4" /> Preview
                                            </button>
                                            <button
                                                onClick={() => setEditMode(true)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${editMode ? 'bg-primary-600 text-white shadow-sm' : 'text-dark-400 hover:text-white'
                                                    }`}
                                            >
                                                <Edit3 className="w-4 h-4" /> Edit
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 h-[calc(100vh-300px)] min-h-[600px]">
                                        {/* Left Side: Configuration or Details */}
                                        <div className="border-r border-dark-700 p-6 overflow-y-auto space-y-6 bg-dark-900/20">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium text-dark-300">Subject Line</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-dark-400">Active</span>
                                                        <Switch
                                                            checked={templateData.is_active}
                                                            onChange={(checked) => setTemplateData(prev => ({ ...prev, is_active: checked }))}
                                                        />
                                                    </div>
                                                </div>
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        value={templateData.subject}
                                                        onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                                                        className="input w-full font-medium"
                                                        placeholder="Enter email subject..."
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-dark-800/50 border border-dark-700 rounded-lg text-dark-200">
                                                        {templateData.subject}
                                                    </div>
                                                )}
                                            </div>

                                            {editMode ? (
                                                <div className="space-y-2 flex-1 flex flex-col h-full">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium text-dark-300">HTML Source Code</label>
                                                        <span className="text-xs text-dark-500 uppercase tracking-wider font-semibold">Editor</span>
                                                    </div>
                                                    <textarea
                                                        value={templateData.html_content}
                                                        onChange={(e) => setTemplateData(prev => ({ ...prev, html_content: e.target.value }))}
                                                        className="w-full h-full min-h-[400px] bg-dark-950 border border-dark-700 rounded-lg p-4 font-mono text-sm leading-relaxed text-blue-100 focus:ring-2 focus:ring-primary-500/50 outline-none resize-none"
                                                        spellCheck="false"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="bg-gradient-to-br from-primary-900/10 to-purple-900/10 border border-primary-500/20 rounded-xl p-5 space-y-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-primary-500/20 rounded-lg shrink-0">
                                                            <Sparkles className="w-5 h-5 text-primary-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-white">Variable Guide</h4>
                                                            <p className="text-sm text-dark-400 mt-1">
                                                                Click any variable below to copy it to your clipboard. Use these in the subject or body.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {['site_name', 'site_url', 'user_name', 'year', 'email_logo', ...(selectedTemplate.variables || [])].map(v => (
                                                            <button
                                                                key={v}
                                                                onClick={() => copyVariable(v)}
                                                                className="group flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 border border-dark-600 hover:border-primary-500 hover:bg-dark-700 rounded-md transition-all"
                                                            >
                                                                <code className="text-xs font-mono text-primary-300">{`{{${v}}}`}</code>
                                                                {copiedVar === v ? (
                                                                    <Check className="w-3 h-3 text-green-400" />
                                                                ) : (
                                                                    <Copy className="w-3 h-3 text-dark-500 group-hover:text-primary-400" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Side: Live Preview */}
                                        <div className="bg-dark-950/50 p-6 flex flex-col h-full overflow-hidden">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                                </div>
                                                <span className="text-xs font-mono text-dark-500">PREVIEW_MODE</span>
                                            </div>

                                            <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-2xl relative">
                                                <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                                                    <div
                                                        className="min-h-full"
                                                        dangerouslySetInnerHTML={{
                                                            __html: getVariablePreview(templateData.html_content || '<div style="padding:40px; text-align:center; color:#999;">No content</div>')
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="border-t border-dark-700 p-6 bg-dark-900/50 flex items-center justify-between">
                                        <div>
                                            {selectedTemplate.is_customized && editMode && (
                                                <button
                                                    onClick={resetTemplate}
                                                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                                                >
                                                    <RotateCcw className="w-4 h-4" /> Reset to Default
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {editMode && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setTemplateData({
                                                                subject: selectedTemplate.subject,
                                                                html_content: selectedTemplate.html_content,
                                                                is_active: selectedTemplate.is_active
                                                            })
                                                            setEditMode(false)
                                                        }}
                                                        className="btn-secondary"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={saveTemplate}
                                                        className="btn-primary min-w-[140px]"
                                                        disabled={saving}
                                                    >
                                                        {saving ? (
                                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Save className="w-4 h-4 mr-2" />
                                                        )}
                                                        Save Changes
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                /* --- GRID VIEW --- */
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            {templateCategories.find(c => c.id === activeCategory)?.name}
                                            <span className="px-2 py-0.5 bg-dark-700 rounded-full text-xs font-medium text-dark-300">
                                                {filteredTemplates.length}
                                            </span>
                                        </h2>
                                        <div className="flex items-center gap-2 p-1 bg-dark-800 rounded-lg border border-dark-700">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-dark-600 text-white' : 'text-dark-400 hover:text-dark-200'}`}
                                            >
                                                <Layout className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-dark-600 text-white' : 'text-dark-400 hover:text-dark-200'}`}
                                            >
                                                <Monitor className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {filteredTemplates.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-20 bg-dark-800/30 rounded-2xl border border-dark-700/50 border-dashed">
                                            <Search className="w-12 h-12 text-dark-600 mb-4" />
                                            <p className="text-dark-400 font-medium">No templates found matching your criteria</p>
                                        </div>
                                    ) : (
                                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                            {filteredTemplates.map((template) => (
                                                <motion.div
                                                    key={template.template_key}
                                                    layoutId={template.template_key}
                                                    onClick={() => selectTemplate(template)}
                                                    whileHover={{ y: -4 }}
                                                    className="group cursor-pointer bg-dark-800/50 hover:bg-dark-800 border border-dark-700 hover:border-primary-500/50 rounded-2xl p-5 transition-all shadow-lg hover:shadow-primary-500/10 backdrop-blur-sm"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="p-3 bg-dark-700/50 rounded-xl group-hover:bg-primary-500/20 transition-colors">
                                                            <Mail className="w-6 h-6 text-dark-300 group-hover:text-primary-400" />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {template.is_customized && (
                                                                <span className="w-2 h-2 rounded-full bg-green-500" title="Customized"></span>
                                                            )}
                                                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${template.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                                }`}>
                                                                {template.is_active ? 'Active' : 'Disabled'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary-400 transition-colors">{template.name}</h3>
                                                    <p className="text-dark-400 text-sm line-clamp-2 mb-4 h-10">{template.description}</p>

                                                    <div className="flex items-center justify-between text-xs font-medium text-dark-500 pt-4 border-t border-dark-700/50">
                                                        <span className="font-mono opacity-70">ID: {template.template_key}</span>
                                                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-primary-400/0 group-hover:text-primary-400">
                                                            Edit Template <ChevronRight className="w-3 h-3" />
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </>
    )
}
