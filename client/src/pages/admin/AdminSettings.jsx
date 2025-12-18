import { useState, useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Save, Palette, Globe, CreditCard, Image, Upload, X, Plus, Trash2, Users, Moon, Sun } from 'lucide-react'
import { useThemeStore, useSiteSettingsStore } from '../../store/useStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { themeStyle, setThemeStyle } = useThemeStore()
  const {
    siteName, siteTagline, logo, headerLogoDark, headerLogoHeight,
    footerLogo, footerLogoDark, footerLogoHeight,
    favicon, contactEmail, partnerLogos, setSiteSettings, setPartnerLogos
  } = useSiteSettingsStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    siteName: siteName || 'Magnetic Clouds',
    siteTagline: siteTagline || 'Premium Cloud Hosting',
    contactEmail: contactEmail || 'support@magneticclouds.com',
    logo: logo || null,
    headerLogoDark: headerLogoDark || null,
    headerLogoHeight: headerLogoHeight || 40,
    footerLogo: footerLogo || null,
    footerLogoDark: footerLogoDark || null,
    footerLogoHeight: footerLogoHeight || 40,
    favicon: favicon || null,
    partnerLogos: partnerLogos || []
  })

  // Refs for file inputs
  const logoInputRef = useRef(null)
  const headerLogoDarkInputRef = useRef(null)
  const footerLogoInputRef = useRef(null)
  const footerLogoDarkInputRef = useRef(null)
  const faviconInputRef = useRef(null)
  const partnerLogoInputRef = useRef(null)

  // Load settings from server on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/settings/public')
        if (res.data.settings) {
          const s = res.data.settings
          setFormData(prev => ({
            ...prev,
            siteName: s.site_name || prev.siteName,
            siteTagline: s.site_tagline || prev.siteTagline,
            contactEmail: s.contact_email || prev.contactEmail,
            logo: s.site_logo || prev.logo,
            headerLogoDark: s.header_logo_dark || prev.headerLogoDark,
            headerLogoHeight: parseInt(s.header_logo_height) || prev.headerLogoHeight,
            footerLogo: s.footer_logo || prev.footerLogo,
            footerLogoDark: s.footer_logo_dark || prev.footerLogoDark,
            footerLogoHeight: parseInt(s.footer_logo_height) || prev.footerLogoHeight,
            favicon: s.site_favicon || prev.favicon,
            partnerLogos: s.partner_logos ? JSON.parse(s.partner_logos) : prev.partnerLogos
          }))
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    loadSettings()
  }, [])

  const handleFileUpload = async (file, type) => {
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result

        const img = new window.Image()
        img.onload = () => {
          try {
            let width = img.width
            let height = img.height

            // Set max dimensions based on type
            const maxHeight = type === 'favicon' ? 32 : 120
            const maxWidth = type === 'favicon' ? 32 : 400

            // Calculate new dimensions
            if (type === 'favicon') {
              width = 32
              height = 32
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
              }
              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }
            }

            // Resize using canvas
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            const resized = canvas.toDataURL('image/png')
            setFormData(prev => ({ ...prev, [type]: resized }))

            // Get display name for toast
            const displayNames = {
              logo: 'Header Logo (Light)',
              headerLogoDark: 'Header Logo (Dark)',
              footerLogo: 'Footer Logo (Light)',
              footerLogoDark: 'Footer Logo (Dark)',
              favicon: 'Favicon'
            }
            toast.success(`${displayNames[type] || 'Image'} uploaded successfully!`)
          } catch (err) {
            console.error('Canvas error:', err)
            setFormData(prev => ({ ...prev, [type]: base64 }))
            toast.success('Image uploaded!')
          }
        }
        img.onerror = () => {
          setFormData(prev => ({ ...prev, [type]: base64 }))
          toast.success('Image uploaded!')
        }
        img.src = base64
      }
      reader.onerror = () => {
        toast.error('Failed to read file')
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Failed to upload file')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save to server
      await api.put('/settings', {
        settings: {
          site_name: formData.siteName,
          site_tagline: formData.siteTagline,
          contact_email: formData.contactEmail,
          site_logo: formData.logo,
          header_logo_dark: formData.headerLogoDark,
          header_logo_height: formData.headerLogoHeight.toString(),
          footer_logo: formData.footerLogo,
          footer_logo_dark: formData.footerLogoDark,
          footer_logo_height: formData.footerLogoHeight.toString(),
          site_favicon: formData.favicon,
          partner_logos: JSON.stringify(formData.partnerLogos)
        }
      })

      // Update local store
      setSiteSettings({
        siteName: formData.siteName,
        siteTagline: formData.siteTagline,
        contactEmail: formData.contactEmail,
        logo: formData.logo,
        headerLogoDark: formData.headerLogoDark,
        headerLogoHeight: formData.headerLogoHeight,
        footerLogo: formData.footerLogo,
        footerLogoDark: formData.footerLogoDark,
        footerLogoHeight: formData.footerLogoHeight,
        favicon: formData.favicon,
        partnerLogos: formData.partnerLogos
      })
      setPartnerLogos(formData.partnerLogos)

      // Update favicon in DOM
      if (formData.favicon) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
        link.type = 'image/x-icon'
        link.rel = 'shortcut icon'
        link.href = formData.favicon
        document.head.appendChild(link)
      }

      // Update document title
      document.title = formData.siteName

      toast.success('Settings saved successfully!')
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save settings')
    }
    setLoading(false)
  }

  // Logo upload component for reuse
  const LogoUploadBox = ({ type, label, value, inputRef, icon: Icon }) => (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-dark-500" />}
        <label className="text-sm font-medium">{label}</label>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-24 h-20 border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-xl flex items-center justify-center overflow-hidden bg-dark-50 dark:bg-dark-800">
          {value && value.startsWith('data:image') ? (
            <img src={value} alt="" className="w-full h-full object-contain p-2" />
          ) : (
            <Upload className="w-6 h-6 text-dark-400" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files[0], type)}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="btn-outline text-xs py-1.5 px-3"
          >
            <Upload className="w-3 h-3 mr-1" /> Upload
          </button>
          {value && value.startsWith('data:image') && (
            <button
              onClick={() => setFormData(prev => ({ ...prev, [type]: null }))}
              className="text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Helmet><title>Settings - Admin - {formData.siteName}</title></Helmet>
      <h1 className="text-2xl font-bold mb-8">Site Settings</h1>

      <div className="space-y-8 max-w-4xl">
        {/* Header Logo Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Image className="w-6 h-6 text-primary-500" />
            <h2 className="text-lg font-bold">Header Logo</h2>
          </div>
          <p className="text-sm text-dark-500 mb-4">
            Upload logos for the navigation bar. The site name text will be hidden when a logo is uploaded.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <LogoUploadBox
              type="logo"
              label="Light Mode Logo"
              value={formData.logo}
              inputRef={logoInputRef}
              icon={Sun}
            />
            <LogoUploadBox
              type="headerLogoDark"
              label="Dark Mode Logo"
              value={formData.headerLogoDark}
              inputRef={headerLogoDarkInputRef}
              icon={Moon}
            />
          </div>

          {/* Height Control */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Logo Height: {formData.headerLogoHeight}px
            </label>
            <input
              type="range"
              min="30"
              max="120"
              value={formData.headerLogoHeight}
              onChange={(e) => setFormData(prev => ({ ...prev, headerLogoHeight: parseInt(e.target.value) }))}
              className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-dark-500 mt-1">
              <span>30px</span>
              <span>120px</span>
            </div>
          </div>

          {/* Preview */}
          {formData.logo && (
            <div className="mt-4 p-4 bg-dark-100 dark:bg-dark-800 rounded-xl">
              <p className="text-xs text-dark-500 mb-2">Preview (Light Mode):</p>
              <img
                src={formData.logo}
                alt="Logo preview"
                style={{ height: `${formData.headerLogoHeight}px` }}
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* Footer Logo Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Image className="w-6 h-6 text-secondary-500" />
            <h2 className="text-lg font-bold">Footer Logo</h2>
          </div>
          <p className="text-sm text-dark-500 mb-4">
            Upload a separate logo for the footer. If not set, the header logo will be used.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <LogoUploadBox
              type="footerLogo"
              label="Light Mode Logo"
              value={formData.footerLogo}
              inputRef={footerLogoInputRef}
              icon={Sun}
            />
            <LogoUploadBox
              type="footerLogoDark"
              label="Dark Mode Logo"
              value={formData.footerLogoDark}
              inputRef={footerLogoDarkInputRef}
              icon={Moon}
            />
          </div>

          {/* Height Control */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Logo Height: {formData.footerLogoHeight}px
            </label>
            <input
              type="range"
              min="30"
              max="120"
              value={formData.footerLogoHeight}
              onChange={(e) => setFormData(prev => ({ ...prev, footerLogoHeight: parseInt(e.target.value) }))}
              className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-dark-500 mt-1">
              <span>30px</span>
              <span>120px</span>
            </div>
          </div>
        </div>

        {/* Favicon Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Image className="w-6 h-6 text-primary-500" />
            <h2 className="text-lg font-bold">Favicon</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-xl flex items-center justify-center overflow-hidden bg-dark-50 dark:bg-dark-800">
              {formData.favicon && formData.favicon.startsWith('data:image') ? (
                <img src={formData.favicon} alt="" className="w-full h-full object-contain p-1" />
              ) : (
                <Upload className="w-5 h-5 text-dark-400" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*,.ico"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files[0], 'favicon')}
              />
              <button
                onClick={() => faviconInputRef.current?.click()}
                className="btn-outline text-sm"
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Favicon
              </button>
              {formData.favicon && formData.favicon.startsWith('data:image') && (
                <button
                  onClick={() => setFormData(prev => ({ ...prev, favicon: null }))}
                  className="btn text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="w-4 h-4 mr-2" /> Remove
                </button>
              )}
              <p className="text-xs text-dark-500">Recommended: 32x32px, ICO/PNG</p>
            </div>
          </div>
        </div>

        {/* General Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-primary-500" />
            <h2 className="text-lg font-bold">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Site Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                className="input"
                placeholder="Your Site Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Site Tagline</label>
              <input
                type="text"
                value={formData.siteTagline}
                onChange={(e) => setFormData(prev => ({ ...prev, siteTagline: e.target.value }))}
                className="input"
                placeholder="Your site tagline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="input"
                placeholder="support@example.com"
              />
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-primary-500" />
            <h2 className="text-lg font-bold">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme Style</label>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setThemeStyle('gradient')}
                  className={`p-4 rounded-xl border-2 transition-all ${themeStyle === 'gradient' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-700'}`}>
                  <div className="h-8 rounded bg-gradient-to-r from-primary-500 to-secondary-500 mb-2" />
                  <p className="font-medium">Gradient</p>
                </button>
                <button onClick={() => setThemeStyle('flat')}
                  className={`p-4 rounded-xl border-2 transition-all ${themeStyle === 'flat' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-700'}`}>
                  <div className="h-8 rounded bg-primary-500 mb-2" />
                  <p className="font-medium">Flat</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Logos Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-primary-500" />
            <h2 className="text-lg font-bold">Partner Logos</h2>
          </div>
          <p className="text-sm text-dark-500 mb-4">Upload partner and payment method logos to display on the homepage.</p>

          {/* Current Partner Logos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {formData.partnerLogos.map((partner, index) => (
              <div key={index} className="relative group border border-dark-200 dark:border-dark-700 rounded-xl p-3 bg-dark-50 dark:bg-dark-800">
                <img src={partner.logo} alt={partner.name} className="h-10 w-full object-contain" />
                <p className="text-xs text-center mt-2 text-dark-600 dark:text-dark-400 truncate">{partner.name}</p>
                <button
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      partnerLogos: prev.partnerLogos.filter((_, i) => i !== index)
                    }))
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Partner Logo */}
          <div className="border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-xl p-6">
            <div className="flex flex-col items-center gap-4">
              <input
                ref={partnerLogoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  const name = prompt('Enter partner name:')
                  if (!name) return

                  const reader = new FileReader()
                  reader.onloadend = () => {
                    const img = new window.Image()
                    img.onload = () => {
                      const canvas = document.createElement('canvas')
                      let width = img.width
                      let height = img.height
                      const maxHeight = 60
                      const maxWidth = 200
                      if (height > maxHeight) {
                        width = (width * maxHeight) / height
                        height = maxHeight
                      }
                      if (width > maxWidth) {
                        height = (height * maxWidth) / width
                        width = maxWidth
                      }
                      canvas.width = width
                      canvas.height = height
                      const ctx = canvas.getContext('2d')
                      ctx.drawImage(img, 0, 0, width, height)
                      const resized = canvas.toDataURL('image/png')
                      setFormData(prev => ({
                        ...prev,
                        partnerLogos: [...prev.partnerLogos, { name, logo: resized }]
                      }))
                      toast.success(`${name} logo added!`)
                    }
                    img.src = reader.result
                  }
                  reader.readAsDataURL(file)
                  e.target.value = ''
                }}
              />
              <Upload className="w-8 h-8 text-dark-400" />
              <p className="text-sm text-dark-500">Add partner logos (Visa, Mastercard, PayPal, etc.)</p>
              <button
                onClick={() => partnerLogoInputRef.current?.click()}
                className="btn-outline text-sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Partner Logo
              </button>
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-primary-500" />
            <h2 className="text-lg font-bold">Billing</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Currency</label>
              <select className="input">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>BDT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Money Back Days</label>
              <input type="number" defaultValue="45" className="input" />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="btn-primary">
          <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </>
  )
}
