import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  LayoutDashboard, Server, Globe, FileText, Ticket, 
  User, LogOut, Menu, X, ChevronLeft, ChevronRight,
  ShoppingCart, Moon, Sun, Bell, CheckCheck, AlertCircle,
  DollarSign, Package, Receipt
} from 'lucide-react'
import { useAuthStore, useThemeStore } from '../store/useStore'
import { userAPI, settingsAPI } from '../lib/api'
import GoogleTranslate from '../components/GoogleTranslate'
import clsx from 'clsx'

const NOTIFICATION_ICONS = {
  order: ShoppingCart,
  payment: DollarSign,
  ticket: Ticket,
  service: Server,
  invoice: Receipt,
  system: AlertCircle
}

const NOTIFICATION_COLORS = {
  primary: 'from-primary-500 to-purple-600',
  success: 'from-emerald-500 to-green-600',
  warning: 'from-amber-500 to-orange-600',
  danger: 'from-red-500 to-rose-600'
}

const sidebarLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/dashboard/services', icon: Server, label: 'My Services' },
  { to: '/dashboard/domains', icon: Globe, label: 'My Domains' },
  { to: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/dashboard/invoices', icon: FileText, label: 'Invoices' },
  { to: '/dashboard/tickets', icon: Ticket, label: 'Support Tickets' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationRef = useRef(null)
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch settings for logo
  const { data: settingsData } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => settingsAPI.getPublic()
  })
  const logo = settingsData?.data?.settings?.logo

  // Fetch notifications
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['user-notifications'],
    queryFn: () => userAPI.getNotifications({ limit: 20 }).then(res => res.data),
    refetchInterval: 30000
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
      await userAPI.markAllNotificationsRead()
      refetchNotifications()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await userAPI.markNotificationRead(notification.uuid)
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
        "fixed top-0 left-0 z-50 h-full bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-800 transform transition-all duration-300",
        sidebarCollapsed ? "w-20" : "w-72",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-200 dark:border-dark-800">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
              MC
            </div>
            {!sidebarCollapsed && <span className="font-display font-bold text-xl">Magnetic</span>}
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={clsx("p-2 space-y-1", sidebarCollapsed && "px-2")}>
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                sidebarCollapsed && "justify-center px-2",
                isActive 
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30" 
                  : "text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800"
              )}
              title={sidebarCollapsed ? link.label : undefined}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-dark-200 dark:border-dark-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-50 dark:bg-dark-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-sm text-dark-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={clsx(
              "mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors",
              sidebarCollapsed && "px-2"
            )}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
          {/* Collapse Toggle Button - Arrow only, centered */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex w-full mt-2 items-center justify-center p-2 bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 rounded-xl transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-dark-500" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-dark-500" />
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={clsx("transition-all duration-300", sidebarCollapsed ? "lg:pl-20" : "lg:pl-72")}>
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-200 dark:border-dark-800">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
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
              <div className="hidden sm:flex items-center text-sm text-dark-500">
                <NavLink to="/dashboard" className="hover:text-primary-500">Dashboard</NavLink>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Google Translate */}
              <GoogleTranslate variant="minimal" />
              
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
                          <div className="p-8 text-center text-dark-500">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No notifications yet</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
