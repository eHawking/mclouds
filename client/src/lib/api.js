import axios from 'axios'
import { useAuthStore } from '../store/useStore'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  guestCheckout: (data) => api.post('/auth/guest-checkout', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
}

// Products API
export const productsAPI = {
  getCategories: () => api.get('/products/categories'),
  getByCategory: (slug) => api.get(`/products/category/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  getProduct: (slug) => api.get(`/products/${slug}`),
  getAll: (params) => api.get('/products', { params })
}

// Domains API
export const domainsAPI = {
  search: (domain) => api.get('/domains/search', { params: { domain } }),
  getTLDs: (popularOnly) => api.get('/domains/tlds', { params: { popular_only: popularOnly } }),
  check: (domain) => api.get(`/domains/check/${domain}`),
  whois: (domain) => api.get(`/domains/whois/${domain}`)
}

// Orders API
export const ordersAPI = {
  validateCart: (items) => api.post('/orders/validate-cart', { items }),
  applyCoupon: (code, subtotal) => api.post('/orders/apply-coupon', { code, subtotal }),
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getOne: (uuid) => api.get(`/orders/${uuid}`)
}

// User API
export const userAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  getServices: (params) => api.get('/users/services', { params }),
  getService: (uuid) => api.get(`/users/services/${uuid}`),
  getDomains: (params) => api.get('/users/domains', { params }),
  getInvoices: (params) => api.get('/users/invoices', { params }),
  getInvoice: (uuid) => api.get(`/users/invoices/${uuid}`),
  getTransactions: (params) => api.get('/users/transactions', { params }),
  // Plesk integration
  getPleskStatus: () => api.get('/users/plesk/status'),
  getPleskLoginUrl: (serviceUuid) => api.post(`/users/services/${serviceUuid}/plesk-login`),
  // Notifications
  getNotifications: (params) => api.get('/users/notifications', { params }),
  getNotificationCount: () => api.get('/users/notifications/count'),
  markNotificationRead: (uuid) => api.put(`/users/notifications/${uuid}/read`),
  markAllNotificationsRead: () => api.put('/users/notifications/read-all')
}

// Tickets API
export const ticketsAPI = {
  create: (data) => api.post('/tickets', data),
  getAll: (params) => api.get('/tickets', { params }),
  getOne: (uuid) => api.get(`/tickets/${uuid}`),
  reply: (uuid, message) => api.post(`/tickets/${uuid}/reply`, { message }),
  close: (uuid) => api.post(`/tickets/${uuid}/close`)
}

// Settings API
export const settingsAPI = {
  getPublic: () => api.get('/settings/public'),
  getDatacenters: () => api.get('/settings/datacenters'),
  getAnnouncements: (location) => api.get('/settings/announcements', { params: { location } }),
  getTranslations: (locale) => api.get(`/settings/translations/${locale}`),
  getCurrencies: () => api.get('/settings/currencies'),
  getPricing: () => api.get('/settings/pricing'),
  updatePricing: (category, plans) => api.put('/settings/pricing', { category, plans }),
  getPaymentGateway: () => api.get('/settings/payment-gateway'),
  updatePaymentGateway: (settings) => api.put('/settings/payment-gateway', settings),
  testPaymentGateway: (gateway) => api.post('/settings/payment-gateway/test', { gateway }),
  getStripeKey: () => api.get('/settings/stripe-key'),
  getPaymentMethods: () => api.get('/settings/payment-methods'),
  getCustomVPSPricing: () => api.get('/settings/custom-vps-pricing'),
  updateCustomVPSPricing: (pricing) => api.put('/settings/custom-vps-pricing', pricing),
  getEmailSettings: () => api.get('/settings/email'),
  updateEmailSettings: (settings) => api.put('/settings/email', settings),
  testEmail: (email) => api.post('/settings/email/test', { email }),
  // Page visibility
  updatePageVisibility: (key, visible) => api.put('/settings/page-visibility', { key, visible }),
  updateBulkSettings: (settings) => api.put('/settings/bulk', { settings }),
  // Server Management / Plesk
  getServerManagement: () => api.get('/settings/server-management'),
  updateServerManagement: (settings) => api.put('/settings/server-management', settings),
  testPleskConnection: (config) => api.post('/settings/server-management/test', config)
}

// Payments API
export const paymentsAPI = {
  createStripeIntent: (data) => api.post('/payments/stripe/create-intent', data),
  confirmStripePayment: (data) => api.post('/payments/stripe/confirm', data)
}

// Proposals API (public)
export const proposalsAPI = {
  getProposal: (uuid) => api.get(`/proposals/${uuid}`),
  acceptProposal: (uuid, data) => api.post(`/proposals/${uuid}/accept`, data),
  rejectProposal: (uuid, data) => api.post(`/proposals/${uuid}/reject`, data)
}

// Pages API
export const pagesAPI = {
  getPage: (slug) => api.get(`/pages/${slug}`),
  getAll: () => api.get('/pages'),
  getKBCategories: () => api.get('/pages/kb/categories'),
  getKBCategory: (slug) => api.get(`/pages/kb/category/${slug}`),
  getKBArticle: (slug) => api.get(`/pages/kb/article/${slug}`),
  searchKB: (q) => api.get('/pages/kb/search', { params: { q } }),
  rateArticle: (slug, helpful) => api.post(`/pages/kb/article/${slug}/rate`, { helpful })
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (uuid) => api.get(`/admin/users/${uuid}`),
  updateUser: (uuid, data) => api.put(`/admin/users/${uuid}`, data),
  loginAsUser: (uuid) => api.post(`/admin/users/${uuid}/login-as`),
  getUserResources: (uuid) => api.get(`/admin/users/${uuid}/resources`),
  
  // Invoices
  getInvoices: (params) => api.get('/admin/invoices', { params }),
  getInvoice: (uuid) => api.get(`/admin/invoices/${uuid}`),
  updateInvoiceStatus: (uuid, status) => api.put(`/admin/invoices/${uuid}/status`, { status }),
  
  // Products
  getProducts: () => api.get('/admin/products'),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (uuid, data) => api.put(`/admin/products/${uuid}`, data),
  deleteProduct: (uuid) => api.delete(`/admin/products/${uuid}`),
  
  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  
  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (uuid, data) => api.put(`/admin/orders/${uuid}/status`, data),
  
  // Services
  getServices: (params) => api.get('/admin/services', { params }),
  getService: (uuid) => api.get(`/admin/services/${uuid}`),
  updateService: (uuid, data) => api.put(`/admin/services/${uuid}`, data),
  getServicePleskStats: (uuid) => api.get(`/admin/services/${uuid}/plesk-stats`),
  
  // Tickets
  getTickets: (params) => api.get('/admin/tickets', { params }),
  replyTicket: (uuid, message) => api.post(`/admin/tickets/${uuid}/reply`, { message }),
  
  // TLDs
  getTLDs: () => api.get('/admin/tlds'),
  createTLD: (data) => api.post('/admin/tlds', data),
  updateTLD: (id, data) => api.put(`/admin/tlds/${id}`, data),
  
  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  
  // Datacenters
  getDatacenters: () => api.get('/admin/datacenters'),
  createDatacenter: (data) => api.post('/admin/datacenters', data),
  
  // Pages
  getPages: () => api.get('/admin/pages'),
  createPage: (data) => api.post('/admin/pages', data),
  updatePage: (id, data) => api.put(`/admin/pages/${id}`, data),
  
  // Settings
  getSettings: (category) => api.get('/admin/settings', { params: { category } }),
  updateSettings: (settings) => api.put('/admin/settings', { settings }),
  
  // Activity
  getActivity: (params) => api.get('/admin/activity', { params }),
  
  // Proposals
  getProposals: (params) => api.get('/admin/proposals', { params }),
  getProposal: (uuid) => api.get(`/admin/proposals/${uuid}`),
  createProposal: (data) => api.post('/admin/proposals', data),
  updateProposal: (uuid, data) => api.put(`/admin/proposals/${uuid}`, data),
  deleteProposal: (uuid) => api.delete(`/admin/proposals/${uuid}`),
  sendProposal: (uuid) => api.post(`/admin/proposals/${uuid}/send`),
  
  // Media
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getMedia: (params) => api.get('/upload', { params }),
  deleteMedia: (uuid) => api.delete(`/upload/${uuid}`),
  
  // NoBot Services
  getNoBotSettings: () => api.get('/admin/nobot/settings'),
  updateNoBotSettings: (settings) => api.put('/admin/nobot/settings', settings),
  testNoBotConnection: (type, data) => api.post('/admin/nobot/test-connection', { type, ...data }),
  getNoBotStats: () => api.get('/admin/nobot/stats'),
  getNoBotServices: (params) => api.get('/admin/nobot/services', { params }),
  getNoBotService: (uuid) => api.get(`/admin/nobot/services/${uuid}`),
  
  // Email Logs
  getEmailLogs: (params) => api.get('/admin/email-logs', { params }),
  getEmailLog: (uuid) => api.get(`/admin/email-logs/${uuid}`),
  
  // Notifications
  getNotifications: (params) => api.get('/admin/notifications', { params }),
  getNotificationCount: () => api.get('/admin/notifications/count'),
  markNotificationRead: (uuid) => api.put(`/admin/notifications/${uuid}/read`),
  markAllNotificationsRead: () => api.put('/admin/notifications/read-all'),
}

// User NoBot API
export const nobotAPI = {
  getBots: () => api.get('/nobot/my-bots'),
  getMyBots: () => api.get('/nobot/my-bots'),
  getBot: (uuid) => api.get(`/nobot/${uuid}`),
  createBot: (data) => api.post('/nobot/create', data),
  setupBot: (uuid, data) => api.post(`/nobot/${uuid}/setup`, data),
  trainBot: (uuid, data) => api.post(`/nobot/${uuid}/train`, data),
  trainBotFromFile: (uuid, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/nobot/${uuid}/train-file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  verifyWidget: (uuid, platform) => api.post(`/nobot/${uuid}/verify-widget`, { platform }),
  updateBotSettings: (uuid, settings) => api.put(`/nobot/${uuid}/settings`, settings),
  getConversations: (uuid, params) => api.get(`/nobot/${uuid}/conversations`, { params }),
  getConversation: (uuid, conversationId) => api.get(`/nobot/${uuid}/conversations/${conversationId}`),
  sendMessage: (uuid, conversationId, message) => api.post(`/nobot/${uuid}/conversations/${conversationId}/message`, { message }),
}

export default api
