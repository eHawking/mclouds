import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail, Search, Edit3, Eye, RotateCcw, Upload, Save, X, Check,
    AlertCircle, Image, Code, FileText, Send, ChevronRight, Sparkles
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminEmailTemplates() {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [editMode, setEditMode] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const [emailLogo, setEmailLogo] = useState(null)
    const [saving, setSaving] = useState(false)
    const [templateData, setTemplateData] = useState({
        subject: '',
        html_content: '',
        is_active: true
    })
    const fileInputRef = useRef(null)

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
            setPreviewMode(true)
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

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getVariablePreview = (html) => {
        // Replace variables with sample data for preview
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
            .replace(/\{\{[^}]+\}\}/g, '[Sample Value]')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Mail className="w-8 h-8 text-indigo-400" />
                        Email Templates
                    </h1>
                    <p className="text-gray-400 mt-1">Manage and customize email templates</p>
                </div>

                {/* Logo Upload */}
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        {emailLogo ? (
                            <img src={emailLogo} alt="Email Logo" className="w-6 h-6 object-contain" />
                        ) : (
                            <Image className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-sm text-white">{emailLogo ? 'Change Logo' : 'Upload Email Logo'}</span>
                    </motion.button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Templates List */}
                <div className="lg:col-span-1 space-y-3">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            All Templates ({filteredTemplates.length})
                        </h3>

                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                            {filteredTemplates.map((template) => (
                                <motion.button
                                    key={template.template_key}
                                    whileHover={{ x: 4 }}
                                    onClick={() => selectTemplate(template)}
                                    className={`w-full text-left p-3 rounded-xl transition-all ${selectedTemplate?.template_key === template.template_key
                                            ? 'bg-indigo-500/20 border border-indigo-500/50'
                                            : 'bg-white/5 border border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{template.name}</p>
                                            <p className="text-sm text-gray-400 truncate">{template.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                            {template.is_customized && (
                                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                                    Custom
                                                </span>
                                            )}
                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Template Editor / Preview */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedTemplate ? (
                            <motion.div
                                key={selectedTemplate.template_key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                            >
                                {/* Template Header */}
                                <div className="p-4 border-b border-white/10 bg-white/5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{selectedTemplate.name}</h3>
                                            <p className="text-sm text-gray-400">{selectedTemplate.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setPreviewMode(true)
                                                    setEditMode(false)
                                                }}
                                                className={`p-2 rounded-lg transition-colors ${previewMode && !editMode
                                                        ? 'bg-indigo-500 text-white'
                                                        : 'bg-white/10 text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                <Eye className="w-5 h-5" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setEditMode(true)
                                                    setPreviewMode(false)
                                                }}
                                                className={`p-2 rounded-lg transition-colors ${editMode
                                                        ? 'bg-indigo-500 text-white'
                                                        : 'bg-white/10 text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                <Edit3 className="w-5 h-5" />
                                            </motion.button>
                                            {selectedTemplate.is_customized && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={resetTemplate}
                                                    className="p-2 rounded-lg bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                    title="Reset to Default"
                                                >
                                                    <RotateCcw className="w-5 h-5" />
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-4">
                                    {editMode ? (
                                        <div className="space-y-4">
                                            {/* Subject */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Subject Line
                                                </label>
                                                <input
                                                    type="text"
                                                    value={templateData.subject}
                                                    onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </div>

                                            {/* Variables Reference */}
                                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                                                <p className="text-sm text-indigo-300 font-medium mb-2 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4" />
                                                    Available Variables
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedTemplate.variables?.map(v => (
                                                        <code key={v} className="px-2 py-1 bg-black/30 text-indigo-200 text-xs rounded-lg">
                                                            {`{{${v}}}`}
                                                        </code>
                                                    ))}
                                                    <code className="px-2 py-1 bg-black/30 text-indigo-200 text-xs rounded-lg">
                                                        {`{{site_name}}`}
                                                    </code>
                                                    <code className="px-2 py-1 bg-black/30 text-indigo-200 text-xs rounded-lg">
                                                        {`{{site_url}}`}
                                                    </code>
                                                    <code className="px-2 py-1 bg-black/30 text-indigo-200 text-xs rounded-lg">
                                                        {`{{year}}`}
                                                    </code>
                                                </div>
                                            </div>

                                            {/* HTML Content */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                                    <Code className="w-4 h-4" />
                                                    HTML Template
                                                </label>
                                                <textarea
                                                    value={templateData.html_content}
                                                    onChange={(e) => setTemplateData(prev => ({ ...prev, html_content: e.target.value }))}
                                                    rows={16}
                                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-mono text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </div>

                                            {/* Active Toggle */}
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div
                                                    className={`relative w-12 h-6 rounded-full transition-colors ${templateData.is_active ? 'bg-green-500' : 'bg-gray-600'
                                                        }`}
                                                    onClick={() => setTemplateData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                                >
                                                    <div
                                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${templateData.is_active ? 'translate-x-7' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-300">Template Active</span>
                                            </label>

                                            {/* Save Button */}
                                            <div className="flex gap-3 pt-4">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={saveTemplate}
                                                    disabled={saving}
                                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50"
                                                >
                                                    {saving ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <Save className="w-5 h-5" />
                                                    )}
                                                    Save Template
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        setEditMode(false)
                                                        setPreviewMode(true)
                                                    }}
                                                    className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20"
                                                >
                                                    Cancel
                                                </motion.button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Subject Preview */}
                                            <div className="p-3 bg-white/5 rounded-xl">
                                                <p className="text-xs text-gray-500 mb-1">Subject</p>
                                                <p className="text-white font-medium">
                                                    {getVariablePreview(templateData.subject)}
                                                </p>
                                            </div>

                                            {/* Email Preview */}
                                            <div className="bg-gray-100 rounded-xl overflow-hidden">
                                                <div className="bg-gray-200 p-2 flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                                    <span className="text-xs text-gray-500 ml-2">Email Preview</span>
                                                </div>
                                                <div
                                                    className="p-4 max-h-[500px] overflow-y-auto"
                                                    dangerouslySetInnerHTML={{
                                                        __html: getVariablePreview(templateData.html_content || '<p style="color:#666;">No template content</p>')
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
                            >
                                <Mail className="w-16 h-16 text-gray-600 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a Template</h3>
                                <p className="text-gray-500 text-center">
                                    Choose a template from the list to preview or edit
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
