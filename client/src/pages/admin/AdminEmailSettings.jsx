import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  Save, Mail, Key, Eye, EyeOff, TestTube, CheckCircle, AlertCircle,
  Send, Globe, Settings, Bell, ShoppingCart, Ticket, User, Lock, Newspaper
} from 'lucide-react'
import { settingsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import Switch from '../../components/ui/Switch'

const emailEvents = [
  { key: 'welcome_email', label: 'Welcome Email', description: 'Sent when user registers', icon: User },
  { key: 'password_reset', label: 'Password Reset', description: 'Sent when user requests password reset', icon: Lock },
  { key: 'newsletter_subscribe', label: 'Newsletter Subscription', description: 'Sent when user subscribes to newsletter', icon: Newspaper },
  { key: 'order_placed', label: 'Order Placed', description: 'Sent when a new order is placed', icon: ShoppingCart },
  { key: 'order_confirmed', label: 'Order Confirmed', description: 'Sent when order payment is confirmed', icon: CheckCircle },
  { key: 'order_processing', label: 'Order Processing', description: 'Sent when order is being processed', icon: Settings },
  { key: 'order_completed', label: 'Order Completed', description: 'Sent when order/service is active', icon: CheckCircle },
  { key: 'order_cancelled', label: 'Order Cancelled', description: 'Sent when order is cancelled', icon: AlertCircle },
  { key: 'ticket_created', label: 'Ticket Created', description: 'Sent when support ticket is created', icon: Ticket },
  { key: 'ticket_replied', label: 'Ticket Reply', description: 'Sent when ticket receives a reply', icon: Mail },
  { key: 'ticket_closed', label: 'Ticket Closed', description: 'Sent when ticket is closed', icon: CheckCircle },
  { key: 'invoice_generated', label: 'Invoice Generated', description: 'Sent when new invoice is created', icon: ShoppingCart },
  { key: 'payment_received', label: 'Payment Received', description: 'Sent when payment is received', icon: CheckCircle },
  { key: 'service_expiring', label: 'Service Expiring', description: 'Sent before service expires', icon: Bell },
  { key: 'service_suspended', label: 'Service Suspended', description: 'Sent when service is suspended', icon: AlertCircle },
]

export default function AdminEmailSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [settings, setSettings] = useState({
    mailgun_enabled: false,
    mailgun_api_key: '',
    mailgun_domain: '',
    mailgun_from_email: '',
    mailgun_from_name: 'Magnetic Clouds',
    mailgun_region: 'us',
    // Email event toggles
    welcome_email: true,
    password_reset: true,
    newsletter_subscribe: true,
    order_placed: true,
    order_confirmed: true,
    order_processing: true,
    order_completed: true,
    order_cancelled: true,
    ticket_created: true,
    ticket_replied: true,
    ticket_closed: true,
    invoice_generated: true,
    payment_received: true,
    service_expiring: true,
    service_suspended: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.getEmailSettings()
      if (res.data.settings) {
        setSettings(prev => ({ ...prev, ...res.data.settings }))
      }
    } catch (err) {
      console.error('Failed to load email settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log('Saving email settings:', settings)
      const response = await settingsAPI.updateEmailSettings(settings)
      console.log('Save response:', response.data)
      toast.success('Email settings saved!')
    } catch (err) {
      console.error('Failed to save email settings:', err)
      console.error('Error response:', err.response?.data)
      toast.error(err.response?.data?.error || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address')
      return
    }
    setTesting(true)
    try {
      const res = await settingsAPI.testEmail(testEmail)
      if (res.data.success) {
        toast.success('Test email sent successfully!')
      } else {
        toast.error(res.data.error || 'Failed to send test email')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send test email')
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <>
      <Helmet><title>Email Settings - Admin - Magnetic Clouds</title></Helmet>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Email Settings</h1>
          <p className="text-dark-500 mt-1">Configure Mailgun for transactional emails</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Mailgun Configuration */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Mailgun</h2>
                <p className="text-sm text-dark-500">Transactional email service</p>
              </div>
            </div>
            <Switch
              checked={settings.mailgun_enabled}
              onChange={(checked) => setSettings(prev => ({ ...prev, mailgun_enabled: checked }))}
              label="Enabled"
            />
          </div>

          {settings.mailgun_enabled && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">API Key *</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.mailgun_api_key}
                      onChange={(e) => setSettings(prev => ({ ...prev, mailgun_api_key: e.target.value }))}
                      placeholder="key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4 text-dark-400" /> : <Eye className="w-4 h-4 text-dark-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Domain *</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type="text"
                      value={settings.mailgun_domain}
                      onChange={(e) => setSettings(prev => ({ ...prev, mailgun_domain: e.target.value }))}
                      placeholder="mg.yourdomain.com"
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">From Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type="email"
                      value={settings.mailgun_from_email}
                      onChange={(e) => setSettings(prev => ({ ...prev, mailgun_from_email: e.target.value }))}
                      placeholder="noreply@yourdomain.com"
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">From Name</label>
                  <input
                    type="text"
                    value={settings.mailgun_from_name}
                    onChange={(e) => setSettings(prev => ({ ...prev, mailgun_from_name: e.target.value }))}
                    placeholder="Your Company Name"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Region</label>
                <div className="flex gap-4">
                  <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-colors ${settings.mailgun_region === 'us' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-700'}`}>
                    <input
                      type="radio"
                      name="region"
                      value="us"
                      checked={settings.mailgun_region === 'us'}
                      onChange={(e) => setSettings(prev => ({ ...prev, mailgun_region: e.target.value }))}
                      className="hidden"
                    />
                    <div className="font-medium">🇺🇸 US Region</div>
                    <p className="text-xs text-dark-500 mt-1">api.mailgun.net</p>
                  </label>
                  <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-colors ${settings.mailgun_region === 'eu' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-700'}`}>
                    <input
                      type="radio"
                      name="region"
                      value="eu"
                      checked={settings.mailgun_region === 'eu'}
                      onChange={(e) => setSettings(prev => ({ ...prev, mailgun_region: e.target.value }))}
                      className="hidden"
                    />
                    <div className="font-medium">🇪🇺 EU Region</div>
                    <p className="text-xs text-dark-500 mt-1">api.eu.mailgun.net</p>
                  </label>
                </div>
              </div>

              {/* Test Email */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <TestTube className="w-4 h-4" /> Test Email Configuration
                </h3>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter test email address"
                    className="input flex-1"
                  />
                  <button
                    onClick={handleTestEmail}
                    disabled={testing}
                    className="btn-secondary"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {testing ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Email Notifications */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-500" />
            Email Notifications
          </h2>
          <p className="text-dark-500 mb-6">Choose which emails to send automatically</p>

          <div className="grid md:grid-cols-2 gap-4">
            {emailEvents.map((event) => (
              <div
                key={event.key}
                className={`p-4 rounded-xl border-2 transition-all ${settings[event.key]
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-dark-200 dark:border-dark-700'
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <event.icon className="w-4 h-4 text-dark-500" />
                      <span className="font-medium">{event.label}</span>
                    </div>
                    <p className="text-xs text-dark-500 mt-1">{event.description}</p>
                  </div>
                  <Switch
                    checked={settings[event.key]}
                    onChange={(checked) => setSettings(prev => ({ ...prev, [event.key]: checked }))}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="card p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Mailgun Setup Instructions
          </h3>
          <div className="space-y-3 text-sm text-amber-700 dark:text-amber-300">
            <ol className="list-decimal list-inside space-y-2">
              <li>Sign up at <a href="https://www.mailgun.com" target="_blank" rel="noopener" className="underline">mailgun.com</a></li>
              <li>Add and verify your sending domain</li>
              <li>Go to <strong>API Security</strong> and create an API key</li>
              <li>Copy the API key and your verified domain here</li>
              <li>Set up DNS records (SPF, DKIM, MX) as instructed by Mailgun</li>
              <li>Send a test email to verify everything works</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  )
}
