import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { CreditCard, Key, Eye, EyeOff, Save, TestTube, CheckCircle, AlertCircle, Building2, Banknote, Smartphone, Wallet, Loader2 } from 'lucide-react'
import { settingsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Ultra Premium Toggle Switch Component
const PremiumToggle = ({ enabled, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className="flex items-center gap-3 group"
  >
    <div className={clsx(
      "relative w-14 h-8 rounded-full transition-all duration-300 shadow-inner",
      enabled 
        ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-500/30" 
        : "bg-dark-300 dark:bg-dark-600"
    )}>
      <div className={clsx(
        "absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center",
        enabled 
          ? "left-7 bg-white" 
          : "left-1 bg-white"
      )}>
        {enabled && <CheckCircle className="w-4 h-4 text-emerald-500" />}
      </div>
    </div>
    <span className={clsx(
      "font-semibold transition-colors",
      enabled ? "text-emerald-500" : "text-dark-500"
    )}>
      {enabled ? 'Enabled' : 'Disabled'}
    </span>
  </button>
)

export default function AdminPaymentGateway() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [settings, setSettings] = useState({
    stripe_enabled: false,
    stripe_mode: 'test',
    stripe_publishable_key_test: '',
    stripe_secret_key_test: '',
    stripe_publishable_key_live: '',
    stripe_secret_key_live: '',
    stripe_webhook_secret: '',
    // PayPal
    paypal_enabled: false,
    paypal_mode: 'sandbox',
    paypal_client_id_sandbox: '',
    paypal_secret_sandbox: '',
    paypal_client_id_live: '',
    paypal_secret_live: '',
    // bKash
    bkash_enabled: false,
    bkash_number: '',
    bkash_account_type: 'personal',
    bkash_instructions: '',
    // Rocket
    rocket_enabled: false,
    rocket_number: '',
    rocket_account_type: 'personal',
    rocket_instructions: '',
    // Bank & Cash
    bank_transfer_enabled: false,
    bank_name: '',
    bank_account_number: '',
    bank_account_holder: '',
    bank_additional_info: '',
    cash_payment_enabled: false,
    cash_payment_instructions: '',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.getPaymentGateway()
      if (res.data.settings) {
        // Ensure boolean values are properly parsed
        const loadedSettings = { ...res.data.settings }
        const booleanKeys = [
          'stripe_enabled', 'paypal_enabled', 'bkash_enabled', 
          'rocket_enabled', 'bank_transfer_enabled', 'cash_payment_enabled'
        ]
        booleanKeys.forEach(key => {
          if (key in loadedSettings) {
            loadedSettings[key] = loadedSettings[key] === true || loadedSettings[key] === 'true'
          }
        })
        setSettings(prev => ({ ...prev, ...loadedSettings }))
      }
    } catch (err) {
      console.error('Failed to load payment settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Ensure boolean values are explicitly boolean type
      const settingsToSave = { ...settings }
      const booleanKeys = [
        'stripe_enabled', 'paypal_enabled', 'bkash_enabled', 
        'rocket_enabled', 'bank_transfer_enabled', 'cash_payment_enabled'
      ]
      booleanKeys.forEach(key => {
        settingsToSave[key] = Boolean(settingsToSave[key])
      })
      
      await settingsAPI.updatePaymentGateway(settingsToSave)
      toast.success('Payment gateway settings saved!')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async (gateway) => {
    setTesting(true)
    try {
      const res = await settingsAPI.testPaymentGateway(gateway)
      if (res.data.success) {
        toast.success(`${gateway} connection successful!`)
      } else {
        toast.error(res.data.error || 'Connection failed')
      }
    } catch (err) {
      toast.error('Connection test failed')
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <>
      <Helmet><title>Payment Gateway - Admin - Magnetic Clouds</title></Helmet>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Payment Gateway Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Stripe Settings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#635BFF] rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Stripe</h2>
                <p className="text-sm text-dark-500">Accept credit/debit card payments</p>
              </div>
            </div>
            <PremiumToggle
              enabled={settings.stripe_enabled}
              onChange={(val) => setSettings(prev => ({ ...prev, stripe_enabled: val }))}
            />
          </div>

          {settings.stripe_enabled && (
            <div className="space-y-6">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Mode</label>
                <div className="flex gap-4">
                  <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-colors ${settings.stripe_mode === 'test' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-700'}`}>
                    <input
                      type="radio"
                      name="stripe_mode"
                      value="test"
                      checked={settings.stripe_mode === 'test'}
                      onChange={(e) => setSettings(prev => ({ ...prev, stripe_mode: e.target.value }))}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <TestTube className="w-5 h-5 text-amber-500" />
                      <span className="font-medium">Test Mode</span>
                    </div>
                    <p className="text-xs text-dark-500 mt-1">Use for development & testing</p>
                  </label>
                  <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-colors ${settings.stripe_mode === 'live' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-700'}`}>
                    <input
                      type="radio"
                      name="stripe_mode"
                      value="live"
                      checked={settings.stripe_mode === 'live'}
                      onChange={(e) => setSettings(prev => ({ ...prev, stripe_mode: e.target.value }))}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Live Mode</span>
                    </div>
                    <p className="text-xs text-dark-500 mt-1">Accept real payments</p>
                  </label>
                </div>
              </div>

              {/* Test Keys */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                  <TestTube className="w-4 h-4" /> Test API Keys
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Publishable Key (Test)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="text"
                        value={settings.stripe_publishable_key_test}
                        onChange={(e) => setSettings(prev => ({ ...prev, stripe_publishable_key_test: e.target.value }))}
                        placeholder="pk_test_..."
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secret Key (Test)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type={showSecretKey ? 'text' : 'password'}
                        value={settings.stripe_secret_key_test}
                        onChange={(e) => setSettings(prev => ({ ...prev, stripe_secret_key_test: e.target.value }))}
                        placeholder="sk_test_..."
                        className="input pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showSecretKey ? <EyeOff className="w-4 h-4 text-dark-400" /> : <Eye className="w-4 h-4 text-dark-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Keys */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Live API Keys
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Publishable Key (Live)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="text"
                        value={settings.stripe_publishable_key_live}
                        onChange={(e) => setSettings(prev => ({ ...prev, stripe_publishable_key_live: e.target.value }))}
                        placeholder="pk_live_..."
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secret Key (Live)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type={showSecretKey ? 'text' : 'password'}
                        value={settings.stripe_secret_key_live}
                        onChange={(e) => setSettings(prev => ({ ...prev, stripe_secret_key_live: e.target.value }))}
                        placeholder="sk_live_..."
                        className="input pl-10 pr-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Webhook Secret */}
              <div>
                <label className="block text-sm font-medium mb-2">Webhook Secret (Optional)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    value={settings.stripe_webhook_secret}
                    onChange={(e) => setSettings(prev => ({ ...prev, stripe_webhook_secret: e.target.value }))}
                    placeholder="whsec_..."
                    className="input pl-10"
                  />
                </div>
                <p className="text-xs text-dark-500 mt-1">Required for automatic payment confirmations</p>
              </div>

              <button
                onClick={() => handleTestConnection('stripe')}
                disabled={testing}
                className="btn-secondary"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          )}
        </div>

        {/* PayPal Settings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#003087] rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">PayPal</h2>
                <p className="text-sm text-dark-500">Accept PayPal payments worldwide</p>
              </div>
            </div>
            <PremiumToggle
              enabled={settings.paypal_enabled}
              onChange={(val) => setSettings(prev => ({ ...prev, paypal_enabled: val }))}
            />
          </div>

          {settings.paypal_enabled && (
            <div className="space-y-6">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Mode</label>
                <div className="flex gap-4">
                  <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-colors ${settings.paypal_mode === 'sandbox' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-700'}`}>
                    <input
                      type="radio"
                      name="paypal_mode"
                      value="sandbox"
                      checked={settings.paypal_mode === 'sandbox'}
                      onChange={(e) => setSettings(prev => ({ ...prev, paypal_mode: e.target.value }))}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <TestTube className="w-5 h-5 text-amber-500" />
                      <span className="font-medium">Sandbox</span>
                    </div>
                    <p className="text-xs text-dark-500 mt-1">Use for testing</p>
                  </label>
                  <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-colors ${settings.paypal_mode === 'live' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-700'}`}>
                    <input
                      type="radio"
                      name="paypal_mode"
                      value="live"
                      checked={settings.paypal_mode === 'live'}
                      onChange={(e) => setSettings(prev => ({ ...prev, paypal_mode: e.target.value }))}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Live</span>
                    </div>
                    <p className="text-xs text-dark-500 mt-1">Accept real payments</p>
                  </label>
                </div>
              </div>

              {/* Sandbox Keys */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                  <TestTube className="w-4 h-4" /> Sandbox Credentials
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Client ID (Sandbox)</label>
                    <input
                      type="text"
                      value={settings.paypal_client_id_sandbox}
                      onChange={(e) => setSettings(prev => ({ ...prev, paypal_client_id_sandbox: e.target.value }))}
                      placeholder="AX..."
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secret (Sandbox)</label>
                    <input
                      type={showSecretKey ? 'text' : 'password'}
                      value={settings.paypal_secret_sandbox}
                      onChange={(e) => setSettings(prev => ({ ...prev, paypal_secret_sandbox: e.target.value }))}
                      placeholder="EK..."
                      className="input"
                    />
                  </div>
                </div>
              </div>

              {/* Live Keys */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Live Credentials
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Client ID (Live)</label>
                    <input
                      type="text"
                      value={settings.paypal_client_id_live}
                      onChange={(e) => setSettings(prev => ({ ...prev, paypal_client_id_live: e.target.value }))}
                      placeholder="AX..."
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secret (Live)</label>
                    <input
                      type={showSecretKey ? 'text' : 'password'}
                      value={settings.paypal_secret_live}
                      onChange={(e) => setSettings(prev => ({ ...prev, paypal_secret_live: e.target.value }))}
                      placeholder="EK..."
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* bKash Settings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E2136E] rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">bKash</h2>
                <p className="text-sm text-dark-500">Accept bKash mobile payments (Bangladesh)</p>
              </div>
            </div>
            <PremiumToggle
              enabled={settings.bkash_enabled}
              onChange={(val) => setSettings(prev => ({ ...prev, bkash_enabled: val }))}
            />
          </div>

          {settings.bkash_enabled && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">bKash Number *</label>
                  <input
                    type="text"
                    value={settings.bkash_number}
                    onChange={(e) => setSettings(prev => ({ ...prev, bkash_number: e.target.value }))}
                    placeholder="e.g. 01XXXXXXXXX"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Account Type</label>
                  <select
                    value={settings.bkash_account_type}
                    onChange={(e) => setSettings(prev => ({ ...prev, bkash_account_type: e.target.value }))}
                    className="input"
                  >
                    <option value="personal">Personal</option>
                    <option value="merchant">Merchant</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Instructions</label>
                <textarea
                  value={settings.bkash_instructions}
                  onChange={(e) => setSettings(prev => ({ ...prev, bkash_instructions: e.target.value }))}
                  placeholder="e.g. Send Money to 01XXXXXXXXX and use Order ID as reference..."
                  rows={3}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rocket Settings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#8C3494] rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Rocket</h2>
                <p className="text-sm text-dark-500">Accept Rocket mobile payments (Bangladesh)</p>
              </div>
            </div>
            <PremiumToggle
              enabled={settings.rocket_enabled}
              onChange={(val) => setSettings(prev => ({ ...prev, rocket_enabled: val }))}
            />
          </div>

          {settings.rocket_enabled && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rocket Number *</label>
                  <input
                    type="text"
                    value={settings.rocket_number}
                    onChange={(e) => setSettings(prev => ({ ...prev, rocket_number: e.target.value }))}
                    placeholder="e.g. 01XXXXXXXXX"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Account Type</label>
                  <select
                    value={settings.rocket_account_type}
                    onChange={(e) => setSettings(prev => ({ ...prev, rocket_account_type: e.target.value }))}
                    className="input"
                  >
                    <option value="personal">Personal</option>
                    <option value="merchant">Merchant</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Instructions</label>
                <textarea
                  value={settings.rocket_instructions}
                  onChange={(e) => setSettings(prev => ({ ...prev, rocket_instructions: e.target.value }))}
                  placeholder="e.g. Send Money to 01XXXXXXXXX and use Order ID as reference..."
                  rows={3}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bank Transfer Settings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Bank Transfer</h2>
                <p className="text-sm text-dark-500">Accept bank transfer payments</p>
              </div>
            </div>
            <PremiumToggle
              enabled={settings.bank_transfer_enabled}
              onChange={(val) => setSettings(prev => ({ ...prev, bank_transfer_enabled: val }))}
            />
          </div>

          {settings.bank_transfer_enabled && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bank Name *</label>
                  <input
                    type="text"
                    value={settings.bank_name}
                    onChange={(e) => setSettings(prev => ({ ...prev, bank_name: e.target.value }))}
                    placeholder="e.g. Chase Bank, HSBC"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Account Number *</label>
                  <input
                    type="text"
                    value={settings.bank_account_number}
                    onChange={(e) => setSettings(prev => ({ ...prev, bank_account_number: e.target.value }))}
                    placeholder="e.g. 1234567890"
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Account Holder Name *</label>
                <input
                  type="text"
                  value={settings.bank_account_holder}
                  onChange={(e) => setSettings(prev => ({ ...prev, bank_account_holder: e.target.value }))}
                  placeholder="e.g. Magnetic Clouds Ltd"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Additional Info (Optional)</label>
                <textarea
                  value={settings.bank_additional_info}
                  onChange={(e) => setSettings(prev => ({ ...prev, bank_additional_info: e.target.value }))}
                  placeholder="e.g. SWIFT Code, Branch Name, Routing Number"
                  rows={2}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Cash Payment Settings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Cash Payment</h2>
                <p className="text-sm text-dark-500">Accept cash/in-person payments</p>
              </div>
            </div>
            <PremiumToggle
              enabled={settings.cash_payment_enabled}
              onChange={(val) => setSettings(prev => ({ ...prev, cash_payment_enabled: val }))}
            />
          </div>

          {settings.cash_payment_enabled && (
            <div>
              <label className="block text-sm font-medium mb-2">Payment Instructions</label>
              <textarea
                value={settings.cash_payment_instructions}
                onChange={(e) => setSettings(prev => ({ ...prev, cash_payment_instructions: e.target.value }))}
                placeholder="Instructions for customers on how to make cash payments..."
                rows={3}
                className="input"
              />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Setup Instructions
          </h3>
          <div className="space-y-4 text-sm text-blue-700 dark:text-blue-300">
            <div>
              <h4 className="font-medium">Stripe Setup:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <a href="https://dashboard.stripe.com" target="_blank" rel="noopener" className="underline">Stripe Dashboard</a></li>
                <li>Navigate to Developers → API Keys</li>
                <li>Copy your Publishable and Secret keys</li>
                <li>For webhooks, go to Developers → Webhooks and add endpoint</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium">Bank Transfer:</h4>
              <p className="ml-2">Customers will see your bank details and upload payment proof after transfer.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
