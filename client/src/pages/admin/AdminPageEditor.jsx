import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Save, Loader2, Image, Upload, X, Plus, Trash2, GripVertical,
  Type, AlignLeft, Layers, Eye, EyeOff, Settings, Palette, Layout,
  Square, Circle, Triangle, Star, Zap, Target, Award, Shield,
  ChevronUp, ChevronDown, Copy, ExternalLink, Code, Link as LinkIcon,
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Heading3
} from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const SECTION_TYPES = [
  { id: 'hero', name: 'Hero Banner', icon: Layout, description: 'Full-width hero section with title, subtitle, and CTA' },
  { id: 'features', name: 'Features Grid', icon: Layers, description: 'Grid of feature cards with icons' },
  { id: 'text', name: 'Text Block', icon: Type, description: 'Rich text content section' },
  { id: 'cta', name: 'Call to Action', icon: Zap, description: 'Call to action banner' },
  { id: 'pricing', name: 'Pricing Table', icon: Target, description: 'Pricing comparison table' },
  { id: 'testimonials', name: 'Testimonials', icon: Quote, description: 'Customer testimonials carousel' },
  { id: 'faq', name: 'FAQ Section', icon: AlignLeft, description: 'Frequently asked questions accordion' },
  { id: 'stats', name: 'Statistics', icon: Award, description: 'Numbers and statistics showcase' },
  { id: 'gallery', name: 'Image Gallery', icon: Image, description: 'Image gallery or grid' },
  { id: 'contact', name: 'Contact Form', icon: Square, description: 'Contact form section' },
]

const DEFAULT_SECTIONS = {
  hero: {
    type: 'hero',
    title: 'Welcome to Our Platform',
    subtitle: 'The best solution for your needs',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    backgroundImage: '',
    backgroundColor: '#1e1e2d',
    textColor: '#ffffff',
    ctaText: 'Get Started',
    ctaUrl: '/pricing',
    ctaStyle: 'primary',
    secondaryCtaText: 'Learn More',
    secondaryCtaUrl: '/about',
    alignment: 'center',
    overlay: true,
    overlayOpacity: 50,
  },
  features: {
    type: 'features',
    title: 'Our Features',
    subtitle: 'Everything you need',
    columns: 3,
    items: [
      { icon: 'Zap', title: 'Fast Performance', description: 'Lightning fast loading times' },
      { icon: 'Shield', title: 'Secure', description: 'Enterprise-grade security' },
      { icon: 'Award', title: 'Reliable', description: '99.9% uptime guarantee' },
    ]
  },
  text: {
    type: 'text',
    title: 'About Us',
    content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
    backgroundColor: '#ffffff',
    textColor: '#1e1e2d',
  },
  cta: {
    type: 'cta',
    title: 'Ready to Get Started?',
    subtitle: 'Join thousands of satisfied customers today',
    ctaText: 'Start Free Trial',
    ctaUrl: '/signup',
    backgroundColor: '#6366f1',
    textColor: '#ffffff',
  },
  stats: {
    type: 'stats',
    title: 'Our Numbers',
    items: [
      { value: '10K+', label: 'Happy Customers' },
      { value: '99.9%', label: 'Uptime' },
      { value: '24/7', label: 'Support' },
      { value: '50+', label: 'Countries' },
    ]
  },
  faq: {
    type: 'faq',
    title: 'Frequently Asked Questions',
    items: [
      { question: 'What is your refund policy?', answer: 'We offer a 45-day money-back guarantee on all plans.' },
      { question: 'Do you offer 24/7 support?', answer: 'Yes, our support team is available around the clock.' },
    ]
  },
  testimonials: {
    type: 'testimonials',
    title: 'What Our Customers Say',
    items: [
      { name: 'John Doe', role: 'CEO, Company', text: 'Amazing service!', image: '' },
    ]
  },
  gallery: {
    type: 'gallery',
    title: 'Gallery',
    columns: 3,
    images: []
  },
  contact: {
    type: 'contact',
    title: 'Contact Us',
    subtitle: 'Get in touch with our team',
    showMap: false,
  },
  pricing: {
    type: 'pricing',
    title: 'Choose Your Plan',
    subtitle: 'Simple, transparent pricing',
  }
}

export default function AdminPageEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageData, setPageData] = useState({
    slug: '',
    title: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    sections: [],
    isVisible: true,
  })
  const [showAddSection, setShowAddSection] = useState(false)
  const [activeSection, setActiveSection] = useState(null)
  const imageInputRef = useRef(null)

  const decodedSlug = slug ? decodeURIComponent(slug) : '/'

  useEffect(() => {
    loadPageContent()
  }, [decodedSlug])

  const loadPageContent = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/settings/page-content/${encodeURIComponent(decodedSlug)}`)
      if (res.data.pageData) {
        setPageData(res.data.pageData)
      } else {
        // Set defaults for new page
        setPageData(prev => ({
          ...prev,
          slug: decodedSlug,
          title: getPageTitle(decodedSlug),
          sections: getDefaultSections(decodedSlug),
        }))
      }
    } catch (err) {
      console.error('Failed to load page content:', err)
      // Set defaults
      setPageData(prev => ({
        ...prev,
        slug: decodedSlug,
        title: getPageTitle(decodedSlug),
        sections: getDefaultSections(decodedSlug),
      }))
    }
    setLoading(false)
  }

  const getPageTitle = (slug) => {
    const titles = {
      '/': 'Home',
      '/about': 'About Us',
      '/contact': 'Contact',
      '/pricing': 'Pricing',
      '/hosting': 'Web Hosting',
      '/vps': 'VPS Hosting',
      '/cloud': 'Cloud Server',
      '/dedicated': 'Dedicated Server',
      '/domains': 'Domain Registration',
      '/support': 'Support',
    }
    return titles[slug] || slug.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getDefaultSections = (slug) => {
    // Return default sections based on page type
    if (slug === '/') {
      return [
        { ...DEFAULT_SECTIONS.hero, id: 'section-1' },
        { ...DEFAULT_SECTIONS.features, id: 'section-2' },
        { ...DEFAULT_SECTIONS.stats, id: 'section-3' },
        { ...DEFAULT_SECTIONS.testimonials, id: 'section-4' },
        { ...DEFAULT_SECTIONS.cta, id: 'section-5' },
      ]
    }
    return [
      { ...DEFAULT_SECTIONS.hero, id: 'section-1', title: getPageTitle(slug) },
    ]
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/settings/page-content/${encodeURIComponent(decodedSlug)}`, { pageData })
      toast.success('Page content saved!')
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save page content')
    }
    setSaving(false)
  }

  const addSection = (type) => {
    const newSection = {
      ...DEFAULT_SECTIONS[type],
      id: `section-${Date.now()}`,
    }
    setPageData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
    setShowAddSection(false)
    setActiveSection(newSection.id)
  }

  const removeSection = (sectionId) => {
    setPageData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }))
    if (activeSection === sectionId) {
      setActiveSection(null)
    }
  }

  const duplicateSection = (sectionId) => {
    const section = pageData.sections.find(s => s.id === sectionId)
    if (section) {
      const newSection = { ...section, id: `section-${Date.now()}` }
      const index = pageData.sections.findIndex(s => s.id === sectionId)
      const newSections = [...pageData.sections]
      newSections.splice(index + 1, 0, newSection)
      setPageData(prev => ({ ...prev, sections: newSections }))
    }
  }

  const moveSection = (sectionId, direction) => {
    const index = pageData.sections.findIndex(s => s.id === sectionId)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === pageData.sections.length - 1)) {
      return
    }
    const newSections = [...pageData.sections]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]]
    setPageData(prev => ({ ...prev, sections: newSections }))
  }

  const updateSection = (sectionId, updates) => {
    setPageData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
    }))
  }

  const handleImageUpload = (file, sectionId, field) => {
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      updateSection(sectionId, { [field]: reader.result })
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  const currentSection = pageData.sections.find(s => s.id === activeSection)

  return (
    <>
      <Helmet>
        <title>Edit Page: {pageData.title} - Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/pages"
            className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Page: {pageData.title}</h1>
            <p className="text-dark-500 text-sm">{decodedSlug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={decodedSlug}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sections List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Page Meta */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-500" />
              Page Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Page Title</label>
                <input
                  type="text"
                  value={pageData.title}
                  onChange={(e) => setPageData(prev => ({ ...prev, title: e.target.value }))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meta Title (SEO)</label>
                <input
                  type="text"
                  value={pageData.metaTitle}
                  onChange={(e) => setPageData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  className="input w-full"
                  placeholder={pageData.title}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Meta Description (SEO)</label>
                <textarea
                  value={pageData.metaDescription}
                  onChange={(e) => setPageData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  className="input w-full h-20 resize-none"
                  placeholder="Brief description for search engines..."
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {pageData.sections.map((section, index) => (
              <motion.div
                key={section.id}
                layout
                className={clsx(
                  "card p-4 cursor-pointer transition-all",
                  activeSection === section.id 
                    ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/10" 
                    : "hover:bg-dark-50 dark:hover:bg-dark-800"
                )}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                      disabled={index === 0}
                      className="p-1 hover:bg-dark-200 dark:hover:bg-dark-700 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                      disabled={index === pageData.sections.length - 1}
                      className="p-1 hover:bg-dark-200 dark:hover:bg-dark-700 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    {(() => {
                      const SectionIcon = SECTION_TYPES.find(t => t.id === section.type)?.icon || Layers
                      return <SectionIcon className="w-5 h-5 text-primary-600" />
                    })()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{section.title || SECTION_TYPES.find(t => t.id === section.type)?.name}</h4>
                    <p className="text-sm text-dark-500 capitalize">{section.type} Section</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}
                      className="p-2 hover:bg-dark-200 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4 text-dark-500" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add Section Button */}
            <button
              onClick={() => setShowAddSection(true)}
              className="w-full p-4 border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors flex items-center justify-center gap-2 text-dark-500 hover:text-primary-500"
            >
              <Plus className="w-5 h-5" />
              Add Section
            </button>
          </div>
        </div>

        {/* Section Editor */}
        <div className="space-y-4">
          {currentSection ? (
            <div className="card p-6 sticky top-6">
              <h3 className="font-bold text-lg mb-4">Edit Section</h3>
              
              {/* Common Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Section Title</label>
                  <input
                    type="text"
                    value={currentSection.title || ''}
                    onChange={(e) => updateSection(currentSection.id, { title: e.target.value })}
                    className="input w-full"
                  />
                </div>

                {currentSection.subtitle !== undefined && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={currentSection.subtitle || ''}
                      onChange={(e) => updateSection(currentSection.id, { subtitle: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                )}

                {currentSection.description !== undefined && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={currentSection.description || ''}
                      onChange={(e) => updateSection(currentSection.id, { description: e.target.value })}
                      className="input w-full h-24 resize-none"
                    />
                  </div>
                )}

                {currentSection.content !== undefined && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <textarea
                      value={currentSection.content || ''}
                      onChange={(e) => updateSection(currentSection.id, { content: e.target.value })}
                      className="input w-full h-32 resize-none font-mono text-sm"
                    />
                  </div>
                )}

                {/* Hero Section Fields */}
                {currentSection.type === 'hero' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Background Image</label>
                      <div className="flex items-center gap-3">
                        {currentSection.backgroundImage && (
                          <img src={currentSection.backgroundImage} alt="" className="w-20 h-12 object-cover rounded" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={imageInputRef}
                          onChange={(e) => handleImageUpload(e.target.files[0], currentSection.id, 'backgroundImage')}
                        />
                        <button
                          onClick={() => imageInputRef.current?.click()}
                          className="btn-outline text-sm"
                        >
                          <Upload className="w-4 h-4 mr-1" /> Upload
                        </button>
                        {currentSection.backgroundImage && (
                          <button
                            onClick={() => updateSection(currentSection.id, { backgroundImage: '' })}
                            className="text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Background Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentSection.backgroundColor || '#1e1e2d'}
                            onChange={(e) => updateSection(currentSection.id, { backgroundColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={currentSection.backgroundColor || '#1e1e2d'}
                            onChange={(e) => updateSection(currentSection.id, { backgroundColor: e.target.value })}
                            className="input flex-1 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentSection.textColor || '#ffffff'}
                            onChange={(e) => updateSection(currentSection.id, { textColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={currentSection.textColor || '#ffffff'}
                            onChange={(e) => updateSection(currentSection.id, { textColor: e.target.value })}
                            className="input flex-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">CTA Button Text</label>
                        <input
                          type="text"
                          value={currentSection.ctaText || ''}
                          onChange={(e) => updateSection(currentSection.id, { ctaText: e.target.value })}
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CTA Button URL</label>
                        <input
                          type="text"
                          value={currentSection.ctaUrl || ''}
                          onChange={(e) => updateSection(currentSection.id, { ctaUrl: e.target.value })}
                          className="input w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Alignment</label>
                      <div className="flex gap-2">
                        {['left', 'center', 'right'].map(align => (
                          <button
                            key={align}
                            onClick={() => updateSection(currentSection.id, { alignment: align })}
                            className={clsx(
                              "px-4 py-2 rounded-lg capitalize transition-colors",
                              currentSection.alignment === align
                                ? "bg-primary-500 text-white"
                                : "bg-dark-100 dark:bg-dark-800"
                            )}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentSection.overlay || false}
                        onChange={(e) => updateSection(currentSection.id, { overlay: e.target.checked })}
                        className="w-4 h-4 rounded text-primary-500"
                      />
                      <span className="text-sm">Show Overlay</span>
                    </label>
                  </>
                )}

                {/* Features Section Fields */}
                {currentSection.type === 'features' && currentSection.items && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Feature Items</label>
                    <div className="space-y-3">
                      {currentSection.items.map((item, idx) => (
                        <div key={idx} className="p-3 bg-dark-50 dark:bg-dark-800 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => {
                                const newItems = [...currentSection.items]
                                newItems[idx] = { ...newItems[idx], title: e.target.value }
                                updateSection(currentSection.id, { items: newItems })
                              }}
                              className="input flex-1 text-sm"
                              placeholder="Title"
                            />
                            <button
                              onClick={() => {
                                const newItems = currentSection.items.filter((_, i) => i !== idx)
                                updateSection(currentSection.id, { items: newItems })
                              }}
                              className="p-1.5 text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            value={item.description || ''}
                            onChange={(e) => {
                              const newItems = [...currentSection.items]
                              newItems[idx] = { ...newItems[idx], description: e.target.value }
                              updateSection(currentSection.id, { items: newItems })
                            }}
                            className="input w-full text-sm h-16 resize-none"
                            placeholder="Description"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newItems = [...(currentSection.items || []), { icon: 'Star', title: 'New Feature', description: 'Description' }]
                          updateSection(currentSection.id, { items: newItems })
                        }}
                        className="text-sm text-primary-500 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add Feature
                      </button>
                    </div>
                  </div>
                )}

                {/* FAQ Section Fields */}
                {currentSection.type === 'faq' && currentSection.items && (
                  <div>
                    <label className="block text-sm font-medium mb-2">FAQ Items</label>
                    <div className="space-y-3">
                      {currentSection.items.map((item, idx) => (
                        <div key={idx} className="p-3 bg-dark-50 dark:bg-dark-800 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.question || ''}
                              onChange={(e) => {
                                const newItems = [...currentSection.items]
                                newItems[idx] = { ...newItems[idx], question: e.target.value }
                                updateSection(currentSection.id, { items: newItems })
                              }}
                              className="input flex-1 text-sm"
                              placeholder="Question"
                            />
                            <button
                              onClick={() => {
                                const newItems = currentSection.items.filter((_, i) => i !== idx)
                                updateSection(currentSection.id, { items: newItems })
                              }}
                              className="p-1.5 text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            value={item.answer || ''}
                            onChange={(e) => {
                              const newItems = [...currentSection.items]
                              newItems[idx] = { ...newItems[idx], answer: e.target.value }
                              updateSection(currentSection.id, { items: newItems })
                            }}
                            className="input w-full text-sm h-16 resize-none"
                            placeholder="Answer"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newItems = [...(currentSection.items || []), { question: 'New Question?', answer: 'Answer here.' }]
                          updateSection(currentSection.id, { items: newItems })
                        }}
                        className="text-sm text-primary-500 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add FAQ
                      </button>
                    </div>
                  </div>
                )}

                {/* Stats Section Fields */}
                {currentSection.type === 'stats' && currentSection.items && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Statistics</label>
                    <div className="space-y-2">
                      {currentSection.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.value || ''}
                            onChange={(e) => {
                              const newItems = [...currentSection.items]
                              newItems[idx] = { ...newItems[idx], value: e.target.value }
                              updateSection(currentSection.id, { items: newItems })
                            }}
                            className="input w-24 text-sm"
                            placeholder="Value"
                          />
                          <input
                            type="text"
                            value={item.label || ''}
                            onChange={(e) => {
                              const newItems = [...currentSection.items]
                              newItems[idx] = { ...newItems[idx], label: e.target.value }
                              updateSection(currentSection.id, { items: newItems })
                            }}
                            className="input flex-1 text-sm"
                            placeholder="Label"
                          />
                          <button
                            onClick={() => {
                              const newItems = currentSection.items.filter((_, i) => i !== idx)
                              updateSection(currentSection.id, { items: newItems })
                            }}
                            className="p-1.5 text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newItems = [...(currentSection.items || []), { value: '100+', label: 'New Stat' }]
                          updateSection(currentSection.id, { items: newItems })
                        }}
                        className="text-sm text-primary-500 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add Stat
                      </button>
                    </div>
                  </div>
                )}

                {/* CTA Section Fields */}
                {currentSection.type === 'cta' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Button Text</label>
                        <input
                          type="text"
                          value={currentSection.ctaText || ''}
                          onChange={(e) => updateSection(currentSection.id, { ctaText: e.target.value })}
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Button URL</label>
                        <input
                          type="text"
                          value={currentSection.ctaUrl || ''}
                          onChange={(e) => updateSection(currentSection.id, { ctaUrl: e.target.value })}
                          className="input w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Background Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentSection.backgroundColor || '#6366f1'}
                            onChange={(e) => updateSection(currentSection.id, { backgroundColor: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={currentSection.backgroundColor || '#6366f1'}
                            onChange={(e) => updateSection(currentSection.id, { backgroundColor: e.target.value })}
                            className="input flex-1 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentSection.textColor || '#ffffff'}
                            onChange={(e) => updateSection(currentSection.id, { textColor: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={currentSection.textColor || '#ffffff'}
                            onChange={(e) => updateSection(currentSection.id, { textColor: e.target.value })}
                            className="input flex-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <Layers className="w-12 h-12 mx-auto mb-4 text-dark-400" />
              <p className="text-dark-500">Select a section to edit its content</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Section Modal */}
      <AnimatePresence>
        {showAddSection && (
          <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
                <h2 className="text-xl font-bold">Add Section</h2>
                <button onClick={() => setShowAddSection(false)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 grid md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {SECTION_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => addSection(type.id)}
                    className="p-4 rounded-xl border border-dark-200 dark:border-dark-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <type.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <h3 className="font-medium">{type.name}</h3>
                    </div>
                    <p className="text-sm text-dark-500">{type.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
