import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard, Users, Package, ShoppingCart, Ticket,
  Globe, Settings, FileText, Image, LogOut, Menu, X,
  Moon, Sun, Bell, ChevronDown, ChevronRight, Bot, MessageSquare, DollarSign, CreditCard, Sliders, Mail, Send, Receipt,
  Check, CheckCheck, ShoppingBag, CreditCard as PaymentIcon, AlertCircle, User, Server, Shield
} from 'lucide-react'
import { useAuthStore, useThemeStore } from '../store/useStore'
import { settingsAPI, adminAPI } from '../lib/api'
import clsx from 'clsx'

// Simple links (no submenu)
const simpleLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
]

// Collapsible menu groups with main page links
const menuGroups = [
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    to: '/admin/users',
    children: [
      { to: '/admin/proposals', icon: Send, label: 'Proposals' },
      { to: '/admin/invoices', icon: Receipt, label: 'Invoices' },
      { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
      { to: '/admin/ai-chats', icon: MessageSquare, label: 'Chat History' },
    ]
  },
  {
    id: 'pricing',
    label: 'Pricing',
    icon: DollarSign,
    to: '/admin/pricing',
    children: [
      { to: '/admin/payment-gateway', icon: CreditCard, label: 'Payment Gateways' },
      { to: '/admin/customize-plans', icon: Sliders, label: 'Customize Plans' },
      { to: '/admin/domains', icon: Globe, label: 'Domain TLDs' },
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    to: '/admin/settings',
    children: [
      { to: '/admin/header-footer', icon: FileText, label: 'Header & Footer' },
      { to: '/admin/pages', icon: FileText, label: 'Pages' },
      { to: '/admin/server-management', icon: Server, label: 'Server Management' },
      { to: '/admin/email-settings', icon: Mail, label: 'Email Settings' },
      { to: '/admin/email-logs', icon: Mail, label: 'Email Logs' },
      { to: '/admin/security', icon: Shield, label: 'Security' },
      { to: '/admin/roles', icon: Shield, label: 'Roles & Permissions' },
      { to: '/admin/nobot-services', icon: Bot, label: 'NoBot Services' },
      { to: '/admin/ai-agent', icon: Bot, label: 'AI Agents' },
    ]
  }
]

// Bottom links (after groups)
const bottomLinks = [
  { to: '/admin/tickets', icon: Ticket, label: 'Tickets' },
]

const NOTIFICATION_ICONS = {
  order: ShoppingCart,
  payment: PaymentIcon,
  ticket: Ticket,
  user: User,
  service: Server,
  proposal: Send,
  invoice: Receipt,
  system: AlertCircle
}

const NOTIFICATION_COLORS = {
  primary: 'from-primary-500 to-purple-600',
  success: 'from-emerald-500 to-green-600',
  warning: 'from-amber-500 to-orange-600',
  danger: 'from-red-500 to-rose-600'
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState([])
  const notificationRef = useRef(null)
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  // Toggle menu expansion
  const toggleMenu = (menuId) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  // Check if a menu group has an active child
  const isMenuActive = (group) => {
    return group.children.some(child => location.pathname === child.to || location.pathname.startsWith(child.to + '/'))
  }

  const { data: settingsData } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => settingsAPI.getPublic()
  })
  const logo = settingsData?.data?.settings?.logo

  // Fetch notifications
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => adminAPI.getNotifications({ limit: 20 }).then(res => res.data),
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const notifications = notificationsData?.notifications || []
  const unreadCount = notificationsData?.unreadCount || 0

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await adminAPI.markAllNotificationsRead()
      refetchNotifications()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await adminAPI.markNotificationRead(notification.uuid)
        refetchNotifications()
      } catch (err) {
        console.error('Failed to mark as read:', err)
      }
    }
    if (notification.link) {
      navigate(notification.link)
      setNotificationsOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-dark-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={clsx(
        "fixed top-0 left-0 z-50 h-full bg-dark-900 text-white transform transition-all duration-300",
        sidebarCollapsed ? "w-20" : "w-72",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-700">
          <NavLink to="/admin" className="flex items-center gap-3">
            {logo && logo.startsWith('data:image') ? (
              <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center font-bold flex-shrink-0">
                MC
              </div>
            )}
            {!sidebarCollapsed && (
              <div>
                <span className="font-display font-bold text-lg">Admin Panel</span>
              </div>
            )}
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-dark-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={clsx("p-2 space-y-1 overflow-y-auto h-[calc(100vh-140px)]", sidebarCollapsed && "px-2")}>
          {/* Simple Links */}
          {simpleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                sidebarCollapsed && "justify-center px-2",
                isActive
                  ? "bg-primary-500 text-white shadow-lg"
                  : "text-dark-300 hover:bg-dark-800 hover:text-white"
              )}
              title={sidebarCollapsed ? link.label : undefined}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{link.label}</span>}
            </NavLink>
          ))}

          {/* Collapsible Menu Groups */}
          {menuGroups.map((group) => {
            const isExpanded = expandedMenus.includes(group.id)
            const hasActiveChild = isMenuActive(group)
            const isMainActive = location.pathname === group.to

            return (
              <div key={group.id} className="mt-2">
                {/* Group Header - Split: Label navigates, Chevron toggles */}
                <div className={clsx(
                  "flex items-center rounded-xl font-medium transition-all duration-200",
                  (hasActiveChild || isMainActive)
                    ? "bg-primary-500/20 text-primary-400"
                    : "text-dark-300 hover:bg-dark-800 hover:text-white"
                )}>
                  <NavLink
                    to={group.to}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx("flex-1 flex items-center gap-3 px-4 py-3", sidebarCollapsed && "justify-center px-2")}
                    title={sidebarCollapsed ? group.label : undefined}
                  >
                    <group.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{group.label}</span>}
                  </NavLink>
                  {!sidebarCollapsed && (
                    <button
                      onClick={() => toggleMenu(group.id)}
                      className="p-3 hover:bg-dark-700 rounded-r-xl transition-colors"
                    >
                      <ChevronDown className={clsx(
                        "w-4 h-4 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )} />
                    </button>
                  )}
                </div>

                {/* Submenu */}
                {!sidebarCollapsed && (
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 mt-1 space-y-1">
                          {group.children.map((child) => (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              onClick={() => setSidebarOpen(false)}
                              className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                isActive
                                  ? "bg-primary-500 text-white shadow-lg"
                                  : "text-dark-400 hover:bg-dark-800 hover:text-white"
                              )}
                            >
                              <child.icon className="w-4 h-4" />
                              <span>{child.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            )
          })}

          {/* Divider */}
          <div className="my-4 border-t border-dark-700" />

          {/* Bottom Links */}
          {bottomLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                sidebarCollapsed && "justify-center px-2",
                isActive
                  ? "bg-primary-500 text-white shadow-lg"
                  : "text-dark-300 hover:bg-dark-800 hover:text-white"
              )}
              title={sidebarCollapsed ? link.label : undefined}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-dark-700">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={clsx(
              "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all",
              "bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300",
              "border border-red-500/20 hover:border-red-500/30"
            )}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={clsx("transition-all duration-300", sidebarCollapsed ? "lg:pl-20" : "lg:pl-72")}>
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-200 dark:border-dark-800">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-dark-200 dark:border-dark-700 overflow-hidden z-50"
                    >
                      {/* Header */}
                      <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-primary-500" />
                          <h3 className="font-bold">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
                          >
                            <CheckCheck className="w-4 h-4" /> Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => {
                            const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell
                            const colorClass = NOTIFICATION_COLORS[notification.color] || NOTIFICATION_COLORS.primary

                            return (
                              <div
                                key={notification.uuid}
                                onClick={() => handleNotificationClick(notification)}
                                className={clsx(
                                  "p-4 border-b border-dark-100 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-700/50 cursor-pointer transition-colors",
                                  !notification.is_read && "bg-primary-50/50 dark:bg-primary-900/10"
                                )}
                              >
                                <div className="flex gap-3">
                                  <div className={clsx(
                                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                                    colorClass
                                  )}>
                                    <IconComponent className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className={clsx(
                                        "font-medium text-sm",
                                        !notification.is_read && "text-dark-900 dark:text-white"
                                      )}>
                                        {notification.title}
                                      </p>
                                      {!notification.is_read && (
                                        <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                                      )}
                                    </div>
                                    <p className="text-xs text-dark-500 mt-0.5 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-dark-400 mt-1">
                                      {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-dark-300 mx-auto mb-3" />
                            <p className="text-dark-500 font-medium">No notifications</p>
                            <p className="text-sm text-dark-400">You're all caught up!</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink
                to="/"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors text-sm font-medium"
              >
                View Site
              </NavLink>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
