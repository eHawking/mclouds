import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  FileText, Eye, EyeOff, Save, Search, CheckCircle, Settings, 
  Home, Server, Globe, Shield, Mail, Cloud, Database, Lock, Archive,
  Building2, Users, Gift, MessageSquare, HelpCircle, BookOpen, Briefcase,
  Scale, FileCheck, AlertTriangle, RotateCcw, Bot, Code, Bug, Hammer,
  ShieldCheck, TrendingUp, MapPin, Star, Loader2, ChevronDown, ChevronUp,
  ExternalLink, Edit3
} from 'lucide-react'
import { settingsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// All frontend pages organized by category
const FRONTEND_PAGES = [
  {
    category: 'Main Pages',
    icon: Home,
    pages: [
      { slug: '/', name: 'Home', description: 'Main landing page', icon: Home },
      { slug: '/about', name: 'About Us', description: 'Company information', icon: Building2 },
      { slug: '/contact', name: 'Contact', description: 'Contact form page', icon: Mail },
      { slug: '/pricing', name: 'Pricing', description: 'Pricing overview', icon: TrendingUp },
      { slug: '/support', name: 'Support', description: 'Customer support page', icon: MessageSquare },
      { slug: '/reviews', name: 'Reviews', description: 'Customer reviews and testimonials', icon: Star },
      { slug: '/blog', name: 'Blog', description: 'Blog and articles', icon: BookOpen },
      { slug: '/careers', name: 'Careers', description: 'Job opportunities', icon: Briefcase },
      { slug: '/partners', name: 'Partners', description: 'Partner program', icon: Users },
    ]
  },
  {
    category: 'Hosting & Servers',
    icon: Server,
    pages: [
      { slug: '/hosting', name: 'Web Hosting', description: 'Shared hosting plans', icon: Server },
      { slug: '/vps', name: 'VPS Server', description: 'Virtual private servers', icon: Server },
      { slug: '/cloud', name: 'Cloud Server', description: 'Cloud infrastructure', icon: Cloud },
      { slug: '/dedicated', name: 'Dedicated Server', description: 'Dedicated servers', icon: Database },
      { slug: '/bd-server', name: 'BD Server', description: 'Bangladesh datacenter servers', icon: MapPin },
    ]
  },
  {
    category: 'Domains',
    icon: Globe,
    pages: [
      { slug: '/domains', name: 'Domain Registration', description: 'Register domains', icon: Globe },
      { slug: '/domain-transfer', name: 'Domain Transfer', description: 'Transfer domains', icon: Globe },
    ]
  },
  {
    category: 'Security & Tools',
    icon: Shield,
    pages: [
      { slug: '/ssl', name: 'SSL Certificates', description: 'SSL/TLS certificates', icon: Lock },
      { slug: '/email', name: 'Professional Email', description: 'Business email hosting', icon: Mail },
      { slug: '/backup', name: 'Website Backup', description: 'Backup solutions', icon: Archive },
      { slug: '/nobot', name: 'NoBot AI', description: 'AI chatbot assistant', icon: Bot },
      { slug: '/web-development', name: 'Web Development', description: 'Custom development', icon: Code },
      { slug: '/bug-smash', name: 'Bug Smash', description: 'Bug fixing service', icon: Bug },
      { slug: '/magnetic-builder', name: 'Magnetic Builder', description: '24-hour site builder', icon: Hammer },
      { slug: '/magnetic-shieldx', name: 'Magnetic ShieldX', description: 'Security extension', icon: ShieldCheck },
      { slug: '/seo-tools', name: 'SEO Tools', description: 'SEO optimization tools', icon: TrendingUp },
    ]
  },
  {
    category: 'Company',
    icon: Building2,
    pages: [
      { slug: '/affiliate', name: 'Affiliate Program', description: 'Earn with referrals', icon: Users },
      { slug: '/coupons', name: 'Coupons & Deals', description: 'Discount codes', icon: Gift },
      { slug: '/datacenters', name: 'Datacenters', description: 'Global datacenter locations', icon: MapPin },
      { slug: '/system-status', name: 'System Status', description: 'Service status page', icon: CheckCircle },
      { slug: '/report-abuse', name: 'Report Abuse', description: 'Abuse reporting', icon: AlertTriangle },
      { slug: '/knowledge-base', name: 'Knowledge Base', description: 'Help articles', icon: HelpCircle },
    ]
  },
  {
    category: 'Legal Pages',
    icon: Scale,
    pages: [
      { slug: '/terms', name: 'Terms of Service', description: 'Terms and conditions', icon: FileCheck },
      { slug: '/privacy', name: 'Privacy Policy', description: 'Privacy information', icon: Lock },
      { slug: '/refund', name: 'Refund Policy', description: 'Refund terms', icon: RotateCcw },
      { slug: '/sla', name: 'Service Level Agreement', description: 'SLA details', icon: FileText },
      { slug: '/acceptable-use', name: 'Acceptable Use Policy', description: 'Usage guidelines', icon: AlertTriangle },
    ]
  },
]

// Premium Toggle Component
const PremiumToggle = ({ enabled, onChange, loading }) => (
  <button
    type="button"
    onClick={() => !loading && onChange(!enabled)}
    disabled={loading}
    className="flex items-center gap-2 group"
  >
    <div className={clsx(
      "relative w-12 h-6 rounded-full transition-all duration-300 shadow-inner",
      enabled 
        ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-500/30" 
        : "bg-dark-300 dark:bg-dark-600"
    )}>
      <div className={clsx(
        "absolute top-0.5 w-5 h-5 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center",
        enabled 
          ? "left-6 bg-white" 
          : "left-0.5 bg-white"
      )}>
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin text-dark-400" />
        ) : enabled ? (
          <Eye className="w-3 h-3 text-emerald-500" />
        ) : (
          <EyeOff className="w-3 h-3 text-dark-400" />
        )}
      </div>
    </div>
  </button>
)

export default function AdminPages() {
  const [pageSettings, setPageSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPage, setSavingPage] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState(
    FRONTEND_PAGES.reduce((acc, cat) => ({ ...acc, [cat.category]: true }), {})
  )
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPageSettings()
  }, [])

  const loadPageSettings = async () => {
    try {
      const res = await settingsAPI.getPublic()
      const settings = res.data.settings || {}
      // Initialize page visibility settings
      const pageVis = {}
      FRONTEND_PAGES.forEach(cat => {
        cat.pages.forEach(page => {
          const key = `page_visible_${page.slug.replace(/\//g, '_')}`
          // Default all pages to visible (true) if not set
          pageVis[page.slug] = settings[key] !== false
        })
      })
      setPageSettings(pageVis)
    } catch (err) {
      console.error('Failed to load page settings:', err)
      // Default all pages to visible
      const pageVis = {}
      FRONTEND_PAGES.forEach(cat => {
        cat.pages.forEach(page => {
          pageVis[page.slug] = true
        })
      })
      setPageSettings(pageVis)
    } finally {
      setLoading(false)
    }
  }

  const togglePage = async (slug, visible) => {
    setSavingPage(slug)
    try {
      const key = `page_visible_${slug.replace(/\//g, '_')}`
      await settingsAPI.updatePageVisibility(key, visible)
      setPageSettings(prev => ({ ...prev, [slug]: visible }))
      toast.success(`Page ${visible ? 'enabled' : 'disabled'}`)
    } catch (err) {
      toast.error('Failed to update page')
    } finally {
      setSavingPage(null)
    }
  }

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))
  }

  const enableAllPages = async () => {
    setSaving(true)
    try {
      const updates = {}
      FRONTEND_PAGES.forEach(cat => {
        cat.pages.forEach(page => {
          const key = `page_visible_${page.slug.replace(/\//g, '_')}`
          updates[key] = true
        })
      })
      await settingsAPI.updateBulkSettings(updates)
      const pageVis = {}
      FRONTEND_PAGES.forEach(cat => {
        cat.pages.forEach(page => {
          pageVis[page.slug] = true
        })
      })
      setPageSettings(pageVis)
      toast.success('All pages enabled')
    } catch (err) {
      toast.error('Failed to update pages')
    } finally {
      setSaving(false)
    }
  }

  const filteredPages = FRONTEND_PAGES.map(cat => ({
    ...cat,
    pages: cat.pages.filter(page => 
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.pages.length > 0)

  const totalPages = FRONTEND_PAGES.reduce((acc, cat) => acc + cat.pages.length, 0)
  const enabledPages = Object.values(pageSettings).filter(Boolean).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <>
      <Helmet><title>Pages - Admin - Magnetic Clouds</title></Helmet>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Page Management</h1>
          <p className="text-dark-500 mt-1">Enable or disable frontend pages • {enabledPages}/{totalPages} pages active</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={enableAllPages} 
            disabled={saving}
            className="btn-secondary"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Enable All
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pages..."
            className="input pl-11 w-full"
          />
        </div>
      </div>

      {/* Page Categories */}
      <div className="space-y-4">
        {filteredPages.map(category => (
          <div key={category.category} className="card overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.category)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-dark-50 to-dark-100 dark:from-dark-800 dark:to-dark-700 hover:from-dark-100 hover:to-dark-150 dark:hover:from-dark-700 dark:hover:to-dark-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="font-bold">{category.category}</h2>
                  <p className="text-sm text-dark-500">
                    {category.pages.filter(p => pageSettings[p.slug]).length}/{category.pages.length} enabled
                  </p>
                </div>
              </div>
              {expandedCategories[category.category] ? (
                <ChevronUp className="w-5 h-5 text-dark-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-dark-400" />
              )}
            </button>

            {/* Pages List */}
            {expandedCategories[category.category] && (
              <div className="divide-y divide-dark-100 dark:divide-dark-700">
                {category.pages.map(page => (
                  <div 
                    key={page.slug}
                    className={clsx(
                      "flex items-center justify-between p-4 transition-colors",
                      !pageSettings[page.slug] && "bg-dark-50/50 dark:bg-dark-800/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        pageSettings[page.slug] 
                          ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600" 
                          : "bg-dark-200 dark:bg-dark-700 text-dark-400"
                      )}>
                        <page.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={clsx(
                            "font-medium",
                            !pageSettings[page.slug] && "text-dark-400"
                          )}>{page.name}</h3>
                          <a 
                            href={page.slug} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-dark-400 hover:text-primary-500 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-sm text-dark-500">{page.description}</p>
                        <code className="text-xs text-dark-400 bg-dark-100 dark:bg-dark-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {page.slug}
                        </code>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/admin/pages/edit/${encodeURIComponent(page.slug)}`}
                        className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-500 rounded-lg transition-colors"
                        title="Edit Content"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <span className={clsx(
                        "text-sm font-medium",
                        pageSettings[page.slug] ? "text-emerald-500" : "text-dark-400"
                      )}>
                        {pageSettings[page.slug] ? 'Visible' : 'Hidden'}
                      </span>
                      <PremiumToggle
                        enabled={pageSettings[page.slug]}
                        onChange={(val) => togglePage(page.slug, val)}
                        loading={savingPage === page.slug}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="mt-8 card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-blue-800 dark:text-blue-200">How Page Visibility Works</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• <strong>Visible pages</strong> appear in navigation menus and are accessible to visitors</li>
              <li>• <strong>Hidden pages</strong> are removed from navigation and return 404 for visitors</li>
              <li>• Changes take effect immediately after toggling</li>
              <li>• Admin users can always access all pages regardless of visibility settings</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
