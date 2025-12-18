import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore, useAuthStore, useSettingsStore, useSiteSettingsStore } from './store/useStore'
import { settingsAPI } from './lib/api'

// Layouts
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'

// AI Agent
import { AIAgentProvider } from './contexts/AIAgentContext'
import AIChatWidget from './components/AIChatWidget'

// Public pages
import Home from './pages/Home'
import Hosting from './pages/services/Hosting'
import VPS from './pages/services/VPS'
import Cloud from './pages/services/Cloud'
import Dedicated from './pages/services/Dedicated'
import BDServer from './pages/services/BDServer'
import Domains from './pages/Domains'
import DomainTransfer from './pages/DomainTransfer'
import SSL from './pages/services/SSL'
import Email from './pages/services/Email'
import Backup from './pages/services/Backup'
import NoBot from './pages/services/NoBot'
import WebDevelopment from './pages/services/WebDevelopment'
import BugSmash from './pages/services/BugSmash'
import MagneticBuilder from './pages/services/MagneticBuilder'
import MagneticShieldX from './pages/services/MagneticShieldX'
import SEOTools from './pages/services/SEOTools'
import Datacenters from './pages/Datacenters'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Contact from './pages/Contact'
import Support from './pages/Support'
import Affiliate from './pages/Affiliate'
import Coupons from './pages/Coupons'
import Terms from './pages/legal/Terms'
import Privacy from './pages/legal/Privacy'
import Refund from './pages/legal/Refund'
import SLA from './pages/legal/SLA'
import AcceptableUse from './pages/legal/AcceptableUse'

// Company pages
import Careers from './pages/Careers'
import Blog from './pages/Blog'
import Partners from './pages/Partners'

// Support pages
import KnowledgeBase from './pages/KnowledgeBase'
import SystemStatus from './pages/SystemStatus'
import ReportAbuse from './pages/ReportAbuse'
import Reviews from './pages/Reviews'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import OAuthCallback from './pages/auth/OAuthCallback'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard'
import Services from './pages/dashboard/Services'
import ServiceDetail from './pages/dashboard/ServiceDetail'
import MyDomains from './pages/dashboard/MyDomains'
import Invoices from './pages/dashboard/Invoices'
import InvoiceDetail from './pages/dashboard/InvoiceDetail'
import Tickets from './pages/dashboard/Tickets'
import TicketDetail from './pages/dashboard/TicketDetail'
import NewTicket from './pages/dashboard/NewTicket'
import Profile from './pages/dashboard/Profile'
import Orders from './pages/dashboard/Orders'
import NoBotSetup from './pages/dashboard/NoBotSetup'
import ServiceManagement from './pages/dashboard/ServiceManagement'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminTickets from './pages/admin/AdminTickets'
import AdminDomains from './pages/admin/AdminDomains'
import AdminSettings from './pages/admin/AdminSettings'
import AdminPages from './pages/admin/AdminPages'
import AdminMedia from './pages/admin/AdminMedia'
import AdminAIAgent from './pages/admin/AdminAIAgent'
import AdminAgentChats from './pages/admin/AdminAgentChats'
import AdminPricing from './pages/admin/AdminPricing'
import AdminPaymentGateway from './pages/admin/AdminPaymentGateway'
import AdminCustomizePlans from './pages/admin/AdminCustomizePlans'
import AdminEmailSettings from './pages/admin/AdminEmailSettings'
import AdminProposals from './pages/admin/AdminProposals'
import AdminProposalEditor from './pages/admin/AdminProposalEditor'
import AdminInvoices from './pages/admin/AdminInvoices'
import AdminNoBotServices from './pages/admin/AdminNoBotServices'
import AdminEmailLogs from './pages/admin/AdminEmailLogs'
import AdminServerManagement from './pages/admin/AdminServerManagement'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminServiceManage from './pages/admin/AdminServiceManage'
import AdminUserManage from './pages/admin/AdminUserManage'
import AdminHeaderFooter from './pages/admin/AdminHeaderFooter'
import AdminPageEditor from './pages/admin/AdminPageEditor'
import AdminLogin from './pages/admin/AdminLogin'
import ProposalView from './pages/ProposalView'

// Protected Route wrapper
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    // Redirect to appropriate login page
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />
  }

  if (adminOnly && user?.role !== 'admin') {
    // Non-admin trying to access admin area
    return <Navigate to="/dashboard" replace />
  }

  // Regular users shouldn't access admin panel
  if (!adminOnly && user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return children
}

function App() {
  const { theme, themeStyle } = useThemeStore()
  const { setSettings } = useSettingsStore()
  const { setSiteSettings, favicon, siteName } = useSiteSettingsStore()

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Apply theme style
  useEffect(() => {
    document.documentElement.setAttribute('data-theme-style', themeStyle)
  }, [themeStyle])

  // Fetch public settings and site settings
  useEffect(() => {
    settingsAPI.getPublic()
      .then(res => {
        const s = res.data.settings
        setSettings(s)

        // Update site settings store
        if (s) {
          // Parse partner logos if stored as JSON string
          let partnerLogosParsed = []
          if (s.partner_logos) {
            try {
              partnerLogosParsed = typeof s.partner_logos === 'string'
                ? JSON.parse(s.partner_logos)
                : s.partner_logos
            } catch (e) {
              console.error('Failed to parse partner logos:', e)
            }
          }

          setSiteSettings({
            siteName: s.site_name || 'Magnetic Clouds',
            siteTagline: s.site_tagline || 'Premium Cloud Hosting',
            logo: s.site_logo || null,
            headerLogoDark: s.header_logo_dark || null,
            headerLogoHeight: parseInt(s.header_logo_height) || 40,
            footerLogo: s.footer_logo || null,
            footerLogoDark: s.footer_logo_dark || null,
            footerLogoHeight: parseInt(s.footer_logo_height) || 40,
            favicon: s.site_favicon || null,
            contactEmail: s.contact_email || '',
            partnerLogos: partnerLogosParsed
          })
        }
      })
      .catch(console.error)
  }, [setSettings, setSiteSettings])

  // Apply favicon when it changes
  useEffect(() => {
    if (favicon) {
      let link = document.querySelector("link[rel*='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'shortcut icon'
        document.head.appendChild(link)
      }
      link.href = favicon
    }
  }, [favicon])

  // Apply site title when it changes
  useEffect(() => {
    if (siteName && !document.title.includes(' - ')) {
      document.title = siteName
    }
  }, [siteName])

  return (
    <AIAgentProvider>
      <AIChatWidget />
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/hosting" element={<Hosting />} />
          <Route path="/vps" element={<VPS />} />
          <Route path="/cloud" element={<Cloud />} />
          <Route path="/dedicated" element={<Dedicated />} />
          <Route path="/bd-server" element={<BDServer />} />
          <Route path="/domains" element={<Domains />} />
          <Route path="/domain-transfer" element={<DomainTransfer />} />
          <Route path="/ssl" element={<SSL />} />
          <Route path="/email" element={<Email />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/nobot" element={<NoBot />} />
          <Route path="/web-development" element={<WebDevelopment />} />
          <Route path="/bug-smash" element={<BugSmash />} />
          <Route path="/magnetic-builder" element={<MagneticBuilder />} />
          <Route path="/magnetic-shieldx" element={<MagneticShieldX />} />
          <Route path="/seo-tools" element={<SEOTools />} />
          <Route path="/datacenters" element={<Datacenters />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/sla" element={<SLA />} />
          <Route path="/acceptable-use" element={<AcceptableUse />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/status" element={<SystemStatus />} />
          <Route path="/report-abuse" element={<ReportAbuse />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/proposal/:uuid" element={<ProposalView />} />
        </Route>

        {/* Admin Login - separate from main layout */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:uuid" element={<ServiceDetail />} />
          <Route path="services/:uuid/manage" element={<ServiceManagement />} />
          <Route path="domains" element={<MyDomains />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/:uuid" element={<InvoiceDetail />} />
          <Route path="orders" element={<Orders />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/new" element={<NewTicket />} />
          <Route path="tickets/:uuid" element={<TicketDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="nobot" element={<NoBotSetup />} />
          <Route path="nobot/:uuid" element={<NoBotSetup />} />
          <Route path="nobot/:uuid/inbox" element={<NoBotSetup />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:uuid" element={<AdminUserDetail />} />
          <Route path="users/:uuid/manage" element={<AdminUserManage />} />
          <Route path="services/:uuid/manage" element={<AdminServiceManage />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="domains" element={<AdminDomains />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="header-footer" element={<AdminHeaderFooter />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="pages/edit/:slug" element={<AdminPageEditor />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="ai-agent" element={<AdminAIAgent />} />
          <Route path="ai-chats" element={<AdminAgentChats />} />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="payment-gateway" element={<AdminPaymentGateway />} />
          <Route path="customize-plans" element={<AdminCustomizePlans />} />
          <Route path="email-settings" element={<AdminEmailSettings />} />
          <Route path="proposals" element={<AdminProposals />} />
          <Route path="proposals/new" element={<AdminProposalEditor />} />
          <Route path="proposals/:uuid/edit" element={<AdminProposalEditor />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="nobot-services" element={<AdminNoBotServices />} />
          <Route path="email-logs" element={<AdminEmailLogs />} />
          <Route path="server-management" element={<AdminServerManagement />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AIAgentProvider>
  )
}

export default App
