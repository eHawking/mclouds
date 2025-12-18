import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Moon, Sun, ShoppingCart, Globe, User, Server, Cloud, Database, HardDrive, Shield, Lock, Mail, Archive, Search, Bug, Zap, Wrench, Building2, Users, Gift, Globe2, Bot, Code, Hammer, ShieldCheck, BarChart3 } from 'lucide-react'
import { useThemeStore, useAuthStore, useCartStore, useCurrencyStore, useSiteSettingsStore } from '../../store/useStore'
import GoogleTranslate from '../GoogleTranslate'
import clsx from 'clsx'

const navItems = [
  {
    label: 'Hosting',
    children: [
      { to: '/hosting', label: 'VPS Hosting', desc: 'High-performance virtual private servers', icon: Server },
    ]
  },
  {
    label: 'Servers',
    children: [
      { to: '/vps', label: 'VPS Server', desc: 'Scalable virtual private servers', icon: Server },
      { to: '/bd-server', label: 'BD Server', desc: 'Premium Bangladesh datacenter servers', icon: Globe2 },
      { to: '/cloud', label: 'Cloud Server', desc: 'Auto-scaling cloud infrastructure', icon: Cloud },
      { to: '/dedicated', label: 'Dedicated Server', desc: 'Full bare-metal server control', icon: Database },
    ]
  },
  {
    label: 'Security & Tools',
    megaMenu: true,
    children: [
      { to: '/ssl', label: 'SSL Certificates', desc: 'Secure your site with SSL', icon: Lock },
      { to: '/backup', label: 'Website Backup', desc: 'Daily automated backups', icon: Archive },
      { to: '/magnetic-shieldx', label: 'Magnetic ShieldX', desc: 'Auto-fix security extension', icon: ShieldCheck, badge: 'Pro' },
      { to: '/web-development', label: 'Web Development', desc: 'Custom website development', icon: Code },
      { to: '/magnetic-builder', label: 'Magnetic Builder', desc: '24-hour site builder', icon: Hammer },
      { to: '/email', label: 'Professional Email', desc: 'Business email solutions', icon: Mail },
      { to: '/nobot', label: 'NoBot AI', desc: 'Human-like AI chatbot assistant', icon: Bot, badge: 'New' },
      { to: '/seo-tools', label: 'SEO Tools', desc: 'Rank higher on search engines', icon: BarChart3, badge: 'New' },
      { to: '/bug-smash', label: 'Bug Smash', desc: 'Instant bug fixing service', icon: Bug, badge: 'Hot' },
    ]
  },
  {
    label: 'Domains',
    children: [
      { to: '/domains', label: 'Domain Registration', desc: 'Register your perfect domain name', icon: Globe },
      { to: '/domain-transfer', label: 'Domain Transfer', desc: 'Transfer domains to us easily', icon: Globe },
    ]
  },
  {
    label: 'Company',
    children: [
      { to: '/about', label: 'About Us', desc: 'Learn about our mission', icon: Building2 },
      { to: '/affiliate', label: 'Affiliate Program', desc: 'Earn with our affiliate program', icon: Users },
      { to: '/coupons', label: 'Coupons & Deals', desc: 'Get exclusive discounts', icon: Gift },
    ]
  },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const { theme, toggleTheme } = useThemeStore()
  const { isAuthenticated, user } = useAuthStore()
  const { items: cartItems } = useCartStore()
  const { currency, setCurrency } = useCurrencyStore()
  const { siteName, logo, headerLogoDark, headerLogoHeight } = useSiteSettingsStore()
  const navigate = useNavigate()

  // Determine which logo to show based on theme
  const currentLogo = theme === 'dark' && headerLogoDark ? headerLogoDark : logo
  const logoHeightStyle = { height: `${headerLogoHeight || 40}px` }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={clsx(
      "sticky top-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl shadow-lg"
        : "bg-transparent"
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {currentLogo ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden flex items-center justify-center"
                style={logoHeightStyle}
              >
                <img src={currentLogo} alt={siteName || 'Logo'} className="h-full w-auto object-contain" />
              </motion.div>
            ) : (
              <>
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30"
                >
                  MC
                </motion.div>
                <div className="hidden sm:flex items-center">
                  <span className="font-display font-bold text-xl">{siteName?.split(' ')[0] || 'Magnetic'}</span>
                  <span className="font-display font-bold text-xl text-gradient ml-1">{siteName?.split(' ')[1] || 'Clouds'}</span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-4 py-2 text-dark-700 dark:text-dark-300 hover:text-primary-500 font-medium transition-colors">
                    {item.label}
                    <ChevronDown className={clsx(
                      "w-4 h-4 transition-transform",
                      activeDropdown === item.label && "rotate-180"
                    )} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={clsx(
                          "bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-dark-100 dark:border-dark-700 overflow-hidden z-50",
                          item.megaMenu
                            ? "fixed inset-x-0 top-20 mx-auto w-[1000px] max-w-[calc(100vw-2rem)]"
                            : "absolute top-full mt-2 left-0 w-72 py-4"
                        )}
                      >
                        <div className={clsx(
                          "relative",
                          item.megaMenu ? "grid grid-cols-3 gap-3 p-6" : ""
                        )}>
                          {item.children.map((child) => (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              onClick={() => setActiveDropdown(null)}
                              className={({ isActive }) => clsx(
                                "flex items-start gap-3 px-4 py-3 rounded-xl transition-all group",
                                isActive
                                  ? "bg-primary-50 dark:bg-primary-900/30"
                                  : "hover:bg-dark-50 dark:hover:bg-dark-700/50"
                              )}
                            >
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 dark:from-primary-500/20 dark:to-primary-600/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <child.icon className="w-5 h-5 text-primary-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-dark-900 dark:text-white text-sm">{child.label}</span>
                                  {child.badge && (
                                    <span className={clsx(
                                      "px-1.5 py-0.5 text-[10px] font-bold rounded",
                                      child.badge === 'New' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                                      child.badge === 'Hot' && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                                      child.badge === 'Pro' && "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                    )}>{child.badge}</span>
                                  )}
                                </div>
                                <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5 line-clamp-1">{child.desc}</p>
                              </div>
                            </NavLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => clsx(
                    "px-4 py-2 font-medium transition-colors",
                    isActive
                      ? "text-primary-500"
                      : "text-dark-700 dark:text-dark-300 hover:text-primary-500"
                  )}
                >
                  {item.label}
                </NavLink>
              )
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Google Translate */}
            <div className="hidden md:block">
              <GoogleTranslate variant="minimal" />
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 dark:from-primary-500/20 dark:to-secondary-500/20 border border-primary-500/30 text-primary-600 dark:text-primary-400 font-medium rounded-xl hover:from-primary-500 hover:to-secondary-500 hover:text-white hover:border-transparent transition-all"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-dark-600 dark:text-dark-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden bg-white dark:bg-dark-900"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  item.children ? (
                    <div key={item.label} className="space-y-1">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                        className="flex items-center justify-between w-full px-4 py-3 text-dark-700 dark:text-dark-300 font-medium"
                      >
                        {item.label}
                        <ChevronDown className={clsx(
                          "w-4 h-4 transition-transform",
                          activeDropdown === item.label && "rotate-180"
                        )} />
                      </button>
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-2 space-y-1 bg-dark-50 dark:bg-dark-800/50 mx-2 rounded-xl py-2"
                          >
                            {item.children.map((child) => (
                              <NavLink
                                key={child.to}
                                to={child.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-dark-600 dark:text-dark-400 hover:text-primary-500"
                              >
                                <child.icon className="w-5 h-5 text-primary-500" />
                                <span>{child.label}</span>
                              </NavLink>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-dark-700 dark:text-dark-300 font-medium hover:text-primary-500"
                    >
                      {item.label}
                    </NavLink>
                  )
                ))}
                <div className="pt-4 border-t border-dark-200 dark:border-dark-700 space-y-2">
                  {isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-center bg-primary-500 text-white font-medium rounded-xl"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-center text-dark-700 dark:text-dark-300 font-medium border border-dark-200 dark:border-dark-700 rounded-xl"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
