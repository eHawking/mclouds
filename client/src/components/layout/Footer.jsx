import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Facebook, Twitter, Linkedin, Instagram, Youtube, Github,
  Mail, Phone, MapPin, ArrowRight, Send
} from 'lucide-react'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useSiteSettingsStore, useThemeStore, useHeaderFooterStore } from '../../store/useStore'

// Custom Link component that scrolls to top
const FooterLink = ({ to, children, className }) => {
  const navigate = useNavigate()

  const handleClick = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => navigate(to), 100)
  }

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}

// Default footer links used as fallback
const defaultFooterLinks = {
  services: [
    { label: 'VPS Hosting', to: '/hosting' },
    { label: 'VPS Servers', to: '/vps' },
    { label: 'BD Server', to: '/bd-server' },
    { label: 'Cloud Servers', to: '/cloud' },
    { label: 'Dedicated Servers', to: '/dedicated' },
    { label: 'Domain Registration', to: '/domains' },
  ],
  tools: [
    { label: 'SSL Certificates', to: '/ssl' },
    { label: 'NoBot AI', to: '/nobot' },
    { label: 'SEO Tools', to: '/seo-tools' },
    { label: 'Web Development', to: '/web-development' },
    { label: 'Bug Smash', to: '/bug-smash' },
    { label: 'Magnetic ShieldX', to: '/magnetic-shieldx' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Datacenters', to: '/datacenters' },
    { label: 'Affiliate Program', to: '/affiliate' },
    { label: 'Coupons & Deals', to: '/coupons' },
    { label: 'Careers', to: '/careers' },
  ],
  support: [
    { label: 'Help Center', to: '/support' },
    { label: 'Knowledge Base', to: '/knowledge-base' },
    { label: 'Submit Ticket', to: '/dashboard/tickets/new' },
    { label: 'System Status', to: '/status' },
    { label: 'Report Abuse', to: '/report-abuse' },
  ],
  legal: [
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Refund Policy', to: '/refund' },
    { label: 'SLA', to: '/sla' },
    { label: 'Acceptable Use', to: '/acceptable-use' },
  ]
}

// Default social links
const defaultSocialLinks = [
  { icon: Facebook, href: 'https://facebook.com/magneticclouds', label: 'Facebook', platform: 'facebook' },
  { icon: Twitter, href: 'https://twitter.com/magneticclouds', label: 'Twitter', platform: 'twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/magneticclouds', label: 'LinkedIn', platform: 'linkedin' },
  { icon: Instagram, href: 'https://instagram.com/magneticclouds', label: 'Instagram', platform: 'instagram' },
  { icon: Youtube, href: 'https://youtube.com/magneticclouds', label: 'YouTube', platform: 'youtube' },
]

// Social icon mapping
const SOCIAL_ICONS = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const { theme } = useThemeStore()
  const {
    siteName, logo, contactEmail,
    footerLogo, footerLogoDark, footerLogoHeight,
    headerLogoDark
  } = useSiteSettingsStore()
  const { footerSettings } = useHeaderFooterStore()

  // Determine which logo to show in footer
  // Priority: footerLogo/footerLogoDark > header logo as fallback
  const getLightLogo = () => footerLogo || footerSettings?.logo || logo
  const getDarkLogo = () => footerLogoDark || footerLogo || footerSettings?.logo || headerLogoDark || logo
  const currentFooterLogo = theme === 'dark' ? getDarkLogo() : getLightLogo()
  const footerHeight = footerLogoHeight || 40

  // Get footer columns - use dynamic settings or defaults
  const footerColumns = useMemo(() => {
    if (!footerSettings?.columns || footerSettings.columns.length === 0) {
      // Return default columns formatted as array
      return [
        { title: 'Services', links: defaultFooterLinks.services },
        { title: 'Tools', links: defaultFooterLinks.tools },
        { title: 'Company', links: defaultFooterLinks.company },
        { title: 'Support', links: defaultFooterLinks.support },
        { title: 'Legal', links: defaultFooterLinks.legal },
      ]
    }
    // Transform admin columns format
    return footerSettings.columns.map(col => ({
      title: col.title,
      links: (col.links || [])
        .filter(link => link.enabled !== false)
        .map(link => ({
          label: link.label,
          to: link.url
        }))
    }))
  }, [footerSettings])

  // Get social links - use dynamic settings or defaults
  const socialLinks = useMemo(() => {
    if (!footerSettings?.socialLinks || footerSettings.socialLinks.length === 0) {
      return defaultSocialLinks
    }
    return footerSettings.socialLinks
      .filter(s => s.enabled !== false)
      .map(s => ({
        icon: SOCIAL_ICONS[s.platform] || Facebook,
        href: s.url,
        label: s.platform.charAt(0).toUpperCase() + s.platform.slice(1),
        platform: s.platform
      }))
  }, [footerSettings])

  // Get contact info
  const contactInfo = footerSettings?.contactInfo || {
    phone: '+880 1XXX-XXXXXX',
    email: contactEmail || 'support@magneticclouds.com',
    address: '3rd Floor, 45 Albemarle Street,\nMayfair, London W1S 4JL'
  }

  // Get footer text settings
  const description = footerSettings?.description || 'Premium web hosting and cloud solutions from Bangladesh. Empowering businesses worldwide with reliable infrastructure.'
  const copyrightText = footerSettings?.copyrightText || '© 2024 Magnetic Clouds. All rights reserved.'
  const showNewsletter = footerSettings?.showNewsletter !== false
  const newsletterTitle = footerSettings?.newsletterTitle || 'Subscribe to Newsletter'
  const newsletterText = footerSettings?.newsletterText || 'Get the latest updates and offers'
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email || subscribing) return

    setSubscribing(true)
    try {
      const res = await fetch('/api/settings/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' })
      })
      const data = await res.json()

      if (res.ok) {
        if (data.alreadySubscribed) {
          toast.success('You are already subscribed!')
        } else {
          toast.success('Thank you for subscribing!')
        }
        setEmail('')
      } else {
        toast.error(data.error || 'Failed to subscribe')
      }
    } catch (err) {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="bg-dark-900 text-white">
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="border-b border-dark-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold font-display">
                  {newsletterTitle}
                </h3>
                <p className="mt-2 text-dark-400">
                  {newsletterText}
                </p>
              </div>
              <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              {currentFooterLogo ? (
                <div
                  className="flex items-center justify-center overflow-hidden"
                  style={{ height: `${footerHeight}px` }}
                >
                  <img src={currentFooterLogo} alt={siteName || 'Logo'} className="h-full w-auto object-contain" />
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center font-bold text-lg">
                    MC
                  </div>
                  <div>
                    <span className="font-display font-bold text-xl">{siteName?.split(' ')[0] || 'Magnetic'}</span>
                    <span className="font-display font-bold text-xl text-primary-400 ml-1">{siteName?.split(' ')[1] || 'Clouds'}</span>
                  </div>
                </>
              )}
            </Link>
            <p className="mt-4 text-dark-400 max-w-sm">
              {description}
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-3">
              <a href={`tel:${contactInfo.phone?.replace(/\s/g, '')}`} className="flex items-center gap-3 text-dark-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
                <span>{contactInfo.phone}</span>
              </a>
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 text-dark-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
                <span>{contactInfo.email}</span>
              </a>
              <div className="flex items-start gap-3 text-dark-400">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span dangerouslySetInnerHTML={{ __html: contactInfo.address?.replace(/\n/g, '<br />') }} />
              </div>
            </div>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-800 hover:bg-primary-500 text-dark-400 hover:text-white transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Footer Columns */}
          {footerColumns.map((column, index) => (
            <div key={column.title || index}>
              <h4 className="font-semibold text-lg mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <FooterLink
                      to={link.to}
                      className="text-dark-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges - Premium Design */}
        <div className="mt-12 pt-8 border-t border-dark-700">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 hover:border-green-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">SSL</span>
              </div>
              <div>
                <span className="text-white font-semibold block">256-bit</span>
                <span className="text-dark-400 text-sm">Encryption</span>
              </div>
            </div>
            <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/5 border border-primary-500/20 hover:border-primary-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">99.9%</span>
              </div>
              <div>
                <span className="text-white font-semibold block">Uptime</span>
                <span className="text-dark-400 text-sm">Guarantee</span>
              </div>
            </div>
            <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">24/7</span>
              </div>
              <div>
                <span className="text-white font-semibold block">Expert</span>
                <span className="text-dark-400 text-sm">Support</span>
              </div>
            </div>
            <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">45</span>
              </div>
              <div>
                <span className="text-white font-semibold block">Day</span>
                <span className="text-dark-400 text-sm">Money Back</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-400 text-sm">
              {copyrightText}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://magnetic-infratech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 hover:border-primary-500/50 transition-all"
              >
                <span className="text-dark-400 text-sm">Powered By</span>
                <span className="font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent group-hover:from-primary-300 group-hover:to-purple-300 transition-all">Magnetic Infratech</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
