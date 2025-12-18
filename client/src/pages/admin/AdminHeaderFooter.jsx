import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, Loader2, Image, Upload, X, Plus, Trash2, GripVertical,
  Menu, Link as LinkIcon, Phone, Mail, MapPin, Clock, Globe,
  Facebook, Twitter, Instagram, Linkedin, Youtube, Github,
  ChevronDown, ChevronUp, Eye, EyeOff, Layout, Footprints,
  Navigation, Settings, Palette, Type, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const SOCIAL_ICONS = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
}

export default function AdminHeaderFooter() {
  const [activeTab, setActiveTab] = useState('header')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const logoInputRef = useRef(null)
  const footerLogoInputRef = useRef(null)

  const [headerSettings, setHeaderSettings] = useState({
    logo: '',
    logoHeight: 40,
    showTopBar: true,
    topBarBgColor: '#1e1e2d',
    topBarTextColor: '#ffffff',
    topBarPhone: '+1 (555) 123-4567',
    topBarEmail: 'support@magneticclouds.com',
    topBarText: 'Welcome to Magnetic Clouds - Premium Hosting Solutions',
    showSocialInTopBar: true,
    headerBgColor: '#ffffff',
    headerTextColor: '#1e1e2d',
    headerStyle: 'transparent', // transparent, solid, gradient
    stickyHeader: true,
    showSearchInHeader: false,
    showCartInHeader: true,
    navLinks: [
      { label: 'Home', url: '/', enabled: true },
      { label: 'Hosting', url: '/hosting', enabled: true, children: [
        { label: 'Web Hosting', url: '/hosting', enabled: true },
        { label: 'VPS Hosting', url: '/vps', enabled: true },
        { label: 'Cloud Server', url: '/cloud', enabled: true },
        { label: 'Dedicated Server', url: '/dedicated', enabled: true },
      ]},
      { label: 'Domains', url: '/domains', enabled: true },
      { label: 'Pricing', url: '/pricing', enabled: true },
      { label: 'Support', url: '/support', enabled: true },
      { label: 'Contact', url: '/contact', enabled: true },
    ],
    ctaButton: { text: 'Get Started', url: '/pricing', enabled: true, style: 'primary' }
  })

  const [footerSettings, setFooterSettings] = useState({
    logo: '',
    description: 'Premium cloud hosting solutions with 24/7 expert support and industry-leading uptime guarantee.',
    bgColor: '#1e1e2d',
    textColor: '#a0a0a0',
    headingColor: '#ffffff',
    linkColor: '#60a5fa',
    linkHoverColor: '#93c5fd',
    columns: [
      {
        title: 'Products',
        links: [
          { label: 'Web Hosting', url: '/hosting', enabled: true },
          { label: 'VPS Hosting', url: '/vps', enabled: true },
          { label: 'Cloud Server', url: '/cloud', enabled: true },
          { label: 'Dedicated Server', url: '/dedicated', enabled: true },
          { label: 'Domain Names', url: '/domains', enabled: true },
        ]
      },
      {
        title: 'Company',
        links: [
          { label: 'About Us', url: '/about', enabled: true },
          { label: 'Contact', url: '/contact', enabled: true },
          { label: 'Blog', url: '/blog', enabled: true },
          { label: 'Careers', url: '/careers', enabled: true },
          { label: 'Partners', url: '/partners', enabled: true },
        ]
      },
      {
        title: 'Support',
        links: [
          { label: 'Help Center', url: '/support', enabled: true },
          { label: 'Knowledge Base', url: '/knowledge-base', enabled: true },
          { label: 'System Status', url: '/system-status', enabled: true },
          { label: 'Report Abuse', url: '/report-abuse', enabled: true },
        ]
      },
      {
        title: 'Legal',
        links: [
          { label: 'Terms of Service', url: '/terms', enabled: true },
          { label: 'Privacy Policy', url: '/privacy', enabled: true },
          { label: 'Refund Policy', url: '/refund', enabled: true },
          { label: 'SLA', url: '/sla', enabled: true },
        ]
      }
    ],
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com', enabled: true },
      { platform: 'twitter', url: 'https://twitter.com', enabled: true },
      { platform: 'instagram', url: 'https://instagram.com', enabled: true },
      { platform: 'linkedin', url: 'https://linkedin.com', enabled: true },
      { platform: 'youtube', url: 'https://youtube.com', enabled: false },
      { platform: 'github', url: 'https://github.com', enabled: false },
    ],
    showNewsletter: true,
    newsletterTitle: 'Subscribe to Newsletter',
    newsletterText: 'Get the latest updates and offers',
    copyrightText: '© 2024 Magnetic Clouds. All rights reserved.',
    showPaymentIcons: true,
    contactInfo: {
      address: '123 Cloud Street, Silicon Valley, CA 94000',
      phone: '+1 (555) 123-4567',
      email: 'support@magneticclouds.com',
      hours: 'Mon-Fri: 9AM-6PM EST'
    }
  })

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true)
      try {
        const res = await api.get('/settings/header-footer')
        if (res.data.headerSettings) {
          setHeaderSettings(prev => ({ ...prev, ...res.data.headerSettings }))
        }
        if (res.data.footerSettings) {
          setFooterSettings(prev => ({ ...prev, ...res.data.footerSettings }))
        }
      } catch (err) {
        console.error('Failed to load header/footer settings:', err)
      }
      setLoading(false)
    }
    loadSettings()
  }, [])

  const handleFileUpload = async (file, type) => {
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result
      if (type === 'headerLogo') {
        setHeaderSettings(prev => ({ ...prev, logo: base64 }))
      } else {
        setFooterSettings(prev => ({ ...prev, logo: base64 }))
      }
      toast.success('Logo uploaded!')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings/header-footer', {
        headerSettings,
        footerSettings
      })
      toast.success('Header & Footer settings saved!')
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save settings')
    }
    setSaving(false)
  }

  // Add nav link
  const addNavLink = () => {
    setHeaderSettings(prev => ({
      ...prev,
      navLinks: [...prev.navLinks, { label: 'New Link', url: '/', enabled: true }]
    }))
  }

  // Remove nav link
  const removeNavLink = (index) => {
    setHeaderSettings(prev => ({
      ...prev,
      navLinks: prev.navLinks.filter((_, i) => i !== index)
    }))
  }

  // Add footer column
  const addFooterColumn = () => {
    setFooterSettings(prev => ({
      ...prev,
      columns: [...prev.columns, { title: 'New Column', links: [] }]
    }))
  }

  // Remove footer column
  const removeFooterColumn = (index) => {
    setFooterSettings(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index)
    }))
  }

  // Add link to footer column
  const addFooterLink = (colIndex) => {
    setFooterSettings(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === colIndex 
          ? { ...col, links: [...col.links, { label: 'New Link', url: '/', enabled: true }] }
          : col
      )
    }))
  }

  // Remove link from footer column
  const removeFooterLink = (colIndex, linkIndex) => {
    setFooterSettings(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === colIndex 
          ? { ...col, links: col.links.filter((_, li) => li !== linkIndex) }
          : col
      )
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Header & Footer Settings - Admin</title>
      </Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Header & Footer Settings</h1>
          <p className="text-dark-500 mt-1">Customize your website header and footer</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('header')}
          className={clsx(
            "px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
            activeTab === 'header' 
              ? "bg-primary-500 text-white" 
              : "bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700"
          )}
        >
          <Navigation className="w-4 h-4" />
          Header
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          className={clsx(
            "px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
            activeTab === 'footer' 
              ? "bg-primary-500 text-white" 
              : "bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700"
          )}
        >
          <Footprints className="w-4 h-4" />
          Footer
        </button>
      </div>

      {/* Header Settings */}
      {activeTab === 'header' && (
        <div className="space-y-6">
          {/* Logo & Branding */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-primary-500" />
              Logo & Branding
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Header Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-xl flex items-center justify-center overflow-hidden bg-dark-50 dark:bg-dark-800">
                    {headerSettings.logo ? (
                      <img src={headerSettings.logo} alt="" className="max-w-full max-h-full object-contain p-2" />
                    ) : (
                      <Upload className="w-6 h-6 text-dark-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'headerLogo')}
                    />
                    <button onClick={() => logoInputRef.current?.click()} className="btn-outline text-sm">
                      <Upload className="w-4 h-4 mr-2" /> Upload
                    </button>
                    {headerSettings.logo && (
                      <button 
                        onClick={() => setHeaderSettings(prev => ({ ...prev, logo: '' }))}
                        className="btn text-sm text-red-500"
                      >
                        <X className="w-4 h-4 mr-1" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Logo Height (px)</label>
                <input
                  type="number"
                  value={headerSettings.logoHeight}
                  onChange={(e) => setHeaderSettings(prev => ({ ...prev, logoHeight: parseInt(e.target.value) || 40 }))}
                  className="input w-32"
                  min={20}
                  max={100}
                />
              </div>
            </div>
          </div>

          {/* Top Bar Settings */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Menu className="w-5 h-5 text-blue-500" />
                Top Bar
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={headerSettings.showTopBar}
                  onChange={(e) => setHeaderSettings(prev => ({ ...prev, showTopBar: e.target.checked }))}
                  className="sr-only"
                />
                <div className={clsx(
                  "w-11 h-6 rounded-full transition-colors",
                  headerSettings.showTopBar ? "bg-primary-500" : "bg-dark-300"
                )}>
                  <div className={clsx(
                    "w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5",
                    headerSettings.showTopBar ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </div>
                <span className="text-sm">{headerSettings.showTopBar ? 'Visible' : 'Hidden'}</span>
              </label>
            </div>
            
            {headerSettings.showTopBar && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={headerSettings.topBarPhone}
                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, topBarPhone: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={headerSettings.topBarEmail}
                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, topBarEmail: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Announcement Text</label>
                  <input
                    type="text"
                    value={headerSettings.topBarText}
                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, topBarText: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={headerSettings.topBarBgColor}
                      onChange={(e) => setHeaderSettings(prev => ({ ...prev, topBarBgColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={headerSettings.topBarBgColor}
                      onChange={(e) => setHeaderSettings(prev => ({ ...prev, topBarBgColor: e.target.value }))}
                      className="input flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={headerSettings.topBarTextColor}
                      onChange={(e) => setHeaderSettings(prev => ({ ...prev, topBarTextColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={headerSettings.topBarTextColor}
                      onChange={(e) => setHeaderSettings(prev => ({ ...prev, topBarTextColor: e.target.value }))}
                      className="input flex-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Header Style */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-500" />
              Header Style
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {['transparent', 'solid', 'gradient'].map(style => (
                <button
                  key={style}
                  onClick={() => setHeaderSettings(prev => ({ ...prev, headerStyle: style }))}
                  className={clsx(
                    "p-4 rounded-xl border-2 transition-all text-center",
                    headerSettings.headerStyle === style
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-dark-200 dark:border-dark-700"
                  )}
                >
                  <div className={clsx(
                    "h-8 rounded mb-2",
                    style === 'transparent' && "bg-white/50 border border-dark-200",
                    style === 'solid' && "bg-dark-800",
                    style === 'gradient' && "bg-gradient-to-r from-primary-500 to-purple-600"
                  )} />
                  <span className="capitalize font-medium">{style}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={headerSettings.stickyHeader}
                  onChange={(e) => setHeaderSettings(prev => ({ ...prev, stickyHeader: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary-500"
                />
                <span className="text-sm">Sticky Header</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={headerSettings.showSearchInHeader}
                  onChange={(e) => setHeaderSettings(prev => ({ ...prev, showSearchInHeader: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary-500"
                />
                <span className="text-sm">Show Search</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={headerSettings.showCartInHeader}
                  onChange={(e) => setHeaderSettings(prev => ({ ...prev, showCartInHeader: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary-500"
                />
                <span className="text-sm">Show Cart</span>
              </label>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-emerald-500" />
                Navigation Links
              </h3>
              <button onClick={addNavLink} className="btn-outline text-sm">
                <Plus className="w-4 h-4 mr-1" /> Add Link
              </button>
            </div>
            <div className="space-y-3">
              {headerSettings.navLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-800 rounded-lg">
                  <GripVertical className="w-4 h-4 text-dark-400 cursor-move" />
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const newLinks = [...headerSettings.navLinks]
                      newLinks[index].label = e.target.value
                      setHeaderSettings(prev => ({ ...prev, navLinks: newLinks }))
                    }}
                    className="input flex-1"
                    placeholder="Label"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...headerSettings.navLinks]
                      newLinks[index].url = e.target.value
                      setHeaderSettings(prev => ({ ...prev, navLinks: newLinks }))
                    }}
                    className="input flex-1"
                    placeholder="URL"
                  />
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.enabled}
                      onChange={(e) => {
                        const newLinks = [...headerSettings.navLinks]
                        newLinks[index].enabled = e.target.checked
                        setHeaderSettings(prev => ({ ...prev, navLinks: newLinks }))
                      }}
                      className="sr-only"
                    />
                    {link.enabled ? (
                      <Eye className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-dark-400" />
                    )}
                  </label>
                  <button
                    onClick={() => removeNavLink(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500" />
              Call to Action Button
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Button Text</label>
                <input
                  type="text"
                  value={headerSettings.ctaButton.text}
                  onChange={(e) => setHeaderSettings(prev => ({ 
                    ...prev, 
                    ctaButton: { ...prev.ctaButton, text: e.target.value }
                  }))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button URL</label>
                <input
                  type="text"
                  value={headerSettings.ctaButton.url}
                  onChange={(e) => setHeaderSettings(prev => ({ 
                    ...prev, 
                    ctaButton: { ...prev.ctaButton, url: e.target.value }
                  }))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button Style</label>
                <select
                  value={headerSettings.ctaButton.style}
                  onChange={(e) => setHeaderSettings(prev => ({ 
                    ...prev, 
                    ctaButton: { ...prev.ctaButton, style: e.target.value }
                  }))}
                  className="input w-full"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                  <option value="gradient">Gradient</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Settings */}
      {activeTab === 'footer' && (
        <div className="space-y-6">
          {/* Footer Branding */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-primary-500" />
              Footer Branding
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Footer Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-xl flex items-center justify-center overflow-hidden bg-dark-50 dark:bg-dark-800">
                    {footerSettings.logo ? (
                      <img src={footerSettings.logo} alt="" className="max-w-full max-h-full object-contain p-2" />
                    ) : (
                      <Upload className="w-6 h-6 text-dark-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={footerLogoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'footerLogo')}
                    />
                    <button onClick={() => footerLogoInputRef.current?.click()} className="btn-outline text-sm">
                      <Upload className="w-4 h-4 mr-2" /> Upload
                    </button>
                    {footerSettings.logo && (
                      <button 
                        onClick={() => setFooterSettings(prev => ({ ...prev, logo: '' }))}
                        className="btn text-sm text-red-500"
                      >
                        <X className="w-4 h-4 mr-1" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Footer Description</label>
                <textarea
                  value={footerSettings.description}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, description: e.target.value }))}
                  className="input w-full h-24 resize-none"
                  placeholder="Brief company description..."
                />
              </div>
            </div>
          </div>

          {/* Footer Colors */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-500" />
              Footer Colors
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={footerSettings.bgColor}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, bgColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={footerSettings.bgColor}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, bgColor: e.target.value }))}
                    className="input flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={footerSettings.textColor}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={footerSettings.textColor}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    className="input flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Heading Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={footerSettings.headingColor}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, headingColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={footerSettings.headingColor}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, headingColor: e.target.value }))}
                    className="input flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Link Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={footerSettings.linkColor}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, linkColor: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={footerSettings.linkColor}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, linkColor: e.target.value }))}
                    className="input flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Columns */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-500" />
                Footer Columns
              </h3>
              <button onClick={addFooterColumn} className="btn-outline text-sm">
                <Plus className="w-4 h-4 mr-1" /> Add Column
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {footerSettings.columns.map((column, colIndex) => (
                <div key={colIndex} className="p-4 bg-dark-50 dark:bg-dark-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={column.title}
                      onChange={(e) => {
                        const newColumns = [...footerSettings.columns]
                        newColumns[colIndex].title = e.target.value
                        setFooterSettings(prev => ({ ...prev, columns: newColumns }))
                      }}
                      className="input flex-1 font-medium"
                      placeholder="Column Title"
                    />
                    <button
                      onClick={() => removeFooterColumn(colIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {column.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const newColumns = [...footerSettings.columns]
                            newColumns[colIndex].links[linkIndex].label = e.target.value
                            setFooterSettings(prev => ({ ...prev, columns: newColumns }))
                          }}
                          className="input text-sm flex-1"
                          placeholder="Label"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => {
                            const newColumns = [...footerSettings.columns]
                            newColumns[colIndex].links[linkIndex].url = e.target.value
                            setFooterSettings(prev => ({ ...prev, columns: newColumns }))
                          }}
                          className="input text-sm flex-1"
                          placeholder="URL"
                        />
                        <button
                          onClick={() => removeFooterLink(colIndex, linkIndex)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addFooterLink(colIndex)}
                      className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-pink-500" />
              Social Links
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {footerSettings.socialLinks.map((social, index) => {
                const Icon = SOCIAL_ICONS[social.platform] || Globe
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-800 rounded-lg">
                    <Icon className="w-5 h-5 text-dark-500" />
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => {
                        const newSocials = [...footerSettings.socialLinks]
                        newSocials[index].url = e.target.value
                        setFooterSettings(prev => ({ ...prev, socialLinks: newSocials }))
                      }}
                      className="input flex-1 text-sm"
                      placeholder={`${social.platform} URL`}
                    />
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={social.enabled}
                        onChange={(e) => {
                          const newSocials = [...footerSettings.socialLinks]
                          newSocials[index].enabled = e.target.checked
                          setFooterSettings(prev => ({ ...prev, socialLinks: newSocials }))
                        }}
                        className="sr-only"
                      />
                      {social.enabled ? (
                        <Eye className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-dark-400" />
                      )}
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Contact Info */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-500" />
              Contact Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  value={footerSettings.contactInfo.address}
                  onChange={(e) => setFooterSettings(prev => ({ 
                    ...prev, 
                    contactInfo: { ...prev.contactInfo, address: e.target.value }
                  }))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="text"
                  value={footerSettings.contactInfo.phone}
                  onChange={(e) => setFooterSettings(prev => ({ 
                    ...prev, 
                    contactInfo: { ...prev.contactInfo, phone: e.target.value }
                  }))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={footerSettings.contactInfo.email}
                  onChange={(e) => setFooterSettings(prev => ({ 
                    ...prev, 
                    contactInfo: { ...prev.contactInfo, email: e.target.value }
                  }))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Business Hours</label>
                <input
                  type="text"
                  value={footerSettings.contactInfo.hours}
                  onChange={(e) => setFooterSettings(prev => ({ 
                    ...prev, 
                    contactInfo: { ...prev.contactInfo, hours: e.target.value }
                  }))}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Copyright & Newsletter */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-amber-500" />
              Copyright & Newsletter
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Copyright Text</label>
                <input
                  type="text"
                  value={footerSettings.copyrightText}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, copyrightText: e.target.value }))}
                  className="input w-full"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={footerSettings.showNewsletter}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, showNewsletter: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary-500"
                  />
                  <span className="text-sm">Show Newsletter Section</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={footerSettings.showPaymentIcons}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, showPaymentIcons: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary-500"
                  />
                  <span className="text-sm">Show Payment Icons</span>
                </label>
              </div>
              {footerSettings.showNewsletter && (
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-dark-200 dark:border-dark-700">
                  <div>
                    <label className="block text-sm font-medium mb-2">Newsletter Title</label>
                    <input
                      type="text"
                      value={footerSettings.newsletterTitle}
                      onChange={(e) => setFooterSettings(prev => ({ ...prev, newsletterTitle: e.target.value }))}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Newsletter Text</label>
                    <input
                      type="text"
                      value={footerSettings.newsletterText}
                      onChange={(e) => setFooterSettings(prev => ({ ...prev, newsletterText: e.target.value }))}
                      className="input w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
