import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail, Search, Edit3, Eye, RotateCcw, Upload, Save, X, Check,
    AlertCircle, Image, Code, FileText, Send, ChevronRight, Sparkles,
    Palette, Copy, CheckCircle, RefreshCw, Layout, Zap
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Switch from '../../components/ui/Switch'

// Template categories for premium grouping
const templateCategories = [
    {
        id: 'auth',
        name: 'Authentication',
        icon: Mail,
        color: 'from-blue-500 to-cyan-500',
        templates: ['welcome_email', 'password_reset']
    },
    {
        id: 'orders',
        name: 'Orders & Billing',
        icon: FileText,
        color: 'from-green-500 to-emerald-500',
        templates: ['order_placed', 'order_confirmed', 'order_completed', 'order_cancelled', 'invoice_generated', 'payment_received']
    },
    {
        id: 'support',
        name: 'Support',
        icon: Mail,
        color: 'from-purple-500 to-pink-500',
        templates: ['ticket_created', 'ticket_replied', 'ticket_closed']
    },
    {
        id: 'services',
        name: 'Services',
        icon: Zap,
        color: 'from-orange-500 to-red-500',
        templates: ['service_expiring', 'service_suspended']
    },
    {
        id: 'marketing',
        name: 'Marketing',
        icon: Send,
        color: 'from-indigo-500 to-purple-500',
        templates: ['newsletter_subscribe', 'proposal_sent']
    },
    {
        id: 'admin',
        name: 'Admin Notifications',
        icon: AlertCircle,
        color: 'from-yellow-500 to-orange-500',
        templates: ['admin_new_order', 'admin_new_ticket', 'test_email']
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
            setSelectedTemplate(response.data.template)
            setTemplateData({
                subject: response.data.template.subject,
                html_content: response.data.template.html_content,
                is_active: response.data.template.is_active
            })
            setEditMode(false)
        } catch (error) {
            console.error('Failed to fetch template:', error)
            toast.error('Failed to load template')
        }
    }

    const saveTemplate = async () => {
        try {
            setSaving(true)
            const token = localStorage.getItem('token')
            await axios.put(`/api/settings/email-templates/${selectedTemplate.template_key}`, templateData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Template saved successfully!')
            fetchTemplates()
            setEditMode(false)
        } catch (error) {
            console.error('Failed to save template:', error)
            toast.error('Failed to save template')
        } finally {
            setSaving(false)
        }
    }

    const resetTemplate = async () => {
        if (!confirm('Reset this template to default? This cannot be undone.')) return

        try {
            const token = localStorage.getItem('token')
            await axios.post(`/api/settings/email-templates/${selectedTemplate.template_key}/reset`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Template reset to default')
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
            toast.error('Logo must be less than 500KB')
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
                toast.success('Email logo uploaded successfully!')
            } catch (error) {
                console.error('Failed to upload logo:', error)
                toast.error('Failed to upload logo')
            }
        }
        reader.readAsDataURL(file)
    }

    const copyVariable = (variable) => {
        navigator.clipboard.writeText(`{{${variable}}}`)
        setCopiedVar(variable)
        toast.success(`Copied {{${variable}}}`)
        setTimeout(() => setCopiedVar(null), 2000)
    }

    const getTemplatesForCategory = (categoryId) => {
        if (categoryId === 'all') return templates
        const category = templateCategories.find(c => c.id === categoryId)
        return templates.filter(t => category?.templates.includes(t.template_key))
    }

    const filteredTemplates = getTemplatesForCategory(activeCategory).filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getVariablePreview = (html) => {
        return html
            .replace(/\{\{site_name\}\}/g, 'Magnetic Clouds')
            .replace(/\{\{site_url\}\}/g, 'https://magnetic-clouds.com')
            .replace(/\{\{user_name\}\}/g, 'John Doe')
            .replace(/\{\{year\}\}/g, new Date().getFullYear())
            .replace(/\{\{order_id\}\}/g, 'ORD-123456')
            .replace(/\{\{order_total\}\}/g, '$99.99')
            .replace(/\{\{ticket_id\}\}/g, 'TKT-789')
            .replace(/\{\{email\}\}/g, 'user@example.com')
            .replace(/\{\{reset_link\}\}/g, '#')
            .replace(/\{\{proposal_link\}\}/g, '#')
            .replace(/\{\{invoice_id\}\}/g, 'INV-456')
            .replace(/\{\{email_logo\}\}/g, emailLogo || '')
            .replace(/\{\{[^}]+\}\}/g, '[Sample Value]')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <>
            <Helmet><title>Email Templates - Admin - Magnetic Clouds</title></Helmet>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        Email Templates
                    </h1>
                    <p className="text-dark-500 mt-1">Customize email notifications sent to users</p>
                </div>

                {/* Logo Upload Card */}
                <div className="card p-4 flex items-center gap-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/png,image/jpeg,image/gif"
                        className="hidden"
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 rounded-xl border-2 border-dashed border-dark-600 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors overflow-hidden bg-dark-800"
                    >
                        {emailLogo ? (
                            <img src={emailLogo} alt="Email Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                            <Image className="w-6 h-6 text-dark-500" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-sm">Email Logo</p>
                        <p className="text-xs text-dark-500">PNG, JPG (max 500KB)</p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-primary-400 hover:text-primary-300 mt-1"
                        >
                            {emailLogo ? 'Change Logo' : 'Upload Logo'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Categories Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === 'all'
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                        }`}
                >
                    All Templates ({templates.length})
                </button>
                {templateCategories.map(cat => {
                    const count = getTemplatesForCategory(cat.id).length
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeCategory === cat.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                }`}
                        >
                            <cat.icon className="w-4 h-4" />
                            {cat.name} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="input pl-12 w-full"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Templates List */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <div className="p-4 border-b border-dark-700">
                            <h3 className="font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-400" />
                                Templates ({filteredTemplates.length})
                            </h3>
                        </div>

                        <div className="divide-y divide-dark-700 max-h-[600px] overflow-y-auto">
                            {filteredTemplates.map((template) => (
                                <button
                                    key={template.template_key}
                                    onClick={() => selectTemplate(template)}
                                    className={`w-full text-left p-4 transition-all hover:bg-dark-700/50 ${selectedTemplate?.template_key === template.template_key
                                            ? 'bg-primary-500/10 border-l-4 border-l-primary-500'
                                            : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium truncate">{template.name}</p>
                                                {template.is_customized && (
                                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex-shrink-0">
                                                        Custom
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-dark-500 truncate mt-0.5">{template.description}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-dark-500 flex-shrink-0 ml-2" />
                                    </div>
                                </button>
                            ))}

                            {filteredTemplates.length === 0 && (
                                <div className="p-8 text-center text-dark-500">
                                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No templates found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Template Editor / Preview */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedTemplate ? (
                            <motion.div
                                key={selectedTemplate.template_key}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="card"
                            >
                                {/* Template Header */}
                                <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{selectedTemplate.name}</h3>
                                            <p className="text-sm text-dark-500">{selectedTemplate.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditMode(false)}
                                            className={`p-2 rounded-lg transition-colors ${!editMode
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-dark-700 text-dark-400 hover:text-white'
                                                }`}
                                            title="Preview"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className={`p-2 rounded-lg transition-colors ${editMode
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-dark-700 text-dark-400 hover:text-white'
                                                }`}
                                            title="Edit"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                        {selectedTemplate.is_customized && (
                                            <button
                                                onClick={resetTemplate}
                                                className="p-2 rounded-lg bg-dark-700 text-dark-400 hover:text-white transition-colors"
                                                title="Reset to Default"
                                            >
                                                <RotateCcw className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-4">
                                    {editMode ? (
                                        <div className="space-y-4">
                                            {/* Subject */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Subject Line</label>
                                                <input
                                                    type="text"
                                                    value={templateData.subject}
                                                    onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                                                    className="input w-full"
                                                />
                                            </div>

                                            {/* Variables Reference */}
                                            <div className="p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/30 rounded-xl">
                                                <p className="text-sm font-medium mb-3 flex items-center gap-2 text-primary-300">
                                                    <Sparkles className="w-4 h-4" />
                                                    Available Variables (click to copy)
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {['site_name', 'site_url', 'year', 'email_logo', ...(selectedTemplate.variables || [])].map(v => (
                                                        <button
                                                            key={v}
                                                            onClick={() => copyVariable(v)}
                                                            className="px-3 py-1.5 bg-dark-800 text-primary-200 text-xs rounded-lg hover:bg-dark-700 transition-colors flex items-center gap-1"
                                                        >
                                                            <code>{`{{${v}}}`}</code>
                                                            {copiedVar === v ? (
                                                                <Check className="w-3 h-3 text-green-400" />
                                                            ) : (
                                                                <Copy className="w-3 h-3 opacity-50" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* HTML Content */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                                    <Code className="w-4 h-4" />
                                                    HTML Template
                                                </label>
                                                <textarea
                                                    value={templateData.html_content}
                                                    onChange={(e) => setTemplateData(prev => ({ ...prev, html_content: e.target.value }))}
                                                    rows={16}
                                                    className="input w-full font-mono text-sm"
                                                    style={{ fontFamily: 'monospace' }}
                                                />
                                            </div>

                                            {/* Active Toggle */}
                                            <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                                                <div>
                                                    <p className="font-medium">Template Active</p>
                                                    <p className="text-sm text-dark-500">Enable or disable this email template</p>
                                                </div>
                                                <Switch
                                                    checked={templateData.is_active}
                                                    onChange={(checked) => setTemplateData(prev => ({ ...prev, is_active: checked }))}
                                                />
                                            </div>

                                            {/* Save Buttons */}
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    onClick={saveTemplate}
                                                    disabled={saving}
                                                    className="btn-primary flex-1"
                                                >
                                                    {saving ? (
                                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Save className="w-4 h-4 mr-2" />
                                                    )}
                                                    {saving ? 'Saving...' : 'Save Template'}
                                                </button>
                                                <button
                                                    onClick={() => setEditMode(false)}
                                                    className="btn-secondary"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Subject Preview */}
                                            <div className="p-4 bg-dark-700/50 rounded-xl">
                                                <p className="text-xs text-dark-500 mb-1">Subject Preview</p>
                                                <p className="font-medium">
                                                    {getVariablePreview(templateData.subject)}
                                                </p>
                                            </div>

                                            {/* Email Preview */}
                                            <div className="rounded-xl overflow-hidden border border-dark-700">
                                                <div className="bg-dark-600 p-2 flex items-center gap-2">
                                                    <div className="flex gap-1.5">
                                                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                                    </div>
                                                    <span className="text-xs text-dark-400 ml-2">Email Preview</span>
                                                </div>
                                                <div
                                                    className="bg-white p-4 max-h-[500px] overflow-y-auto"
                                                    dangerouslySetInnerHTML={{
                                                        __html: getVariablePreview(templateData.html_content || '<p style="color:#666;">No template content</p>')
                                                    }}
                                                />
                                            </div>

                                            {/* Edit CTA */}
                                            <button
                                                onClick={() => setEditMode(true)}
                                                className="w-full p-4 border-2 border-dashed border-dark-600 rounded-xl text-dark-400 hover:border-primary-500 hover:text-primary-400 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit3 className="w-5 h-5" />
                                                Click to edit this template
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="card h-full flex flex-col items-center justify-center p-12 min-h-[400px]"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                                    <Layout className="w-10 h-10 text-primary-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Select a Template</h3>
                                <p className="text-dark-500 text-center max-w-sm">
                                    Choose a template from the list to preview or customize the email design
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    )
}
