import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Bot, Settings, Key, Save, RefreshCw, CheckCircle, XCircle,
  MessageCircle, Users, Activity, Loader2, Eye, EyeOff,
  Sparkles, Globe, Database, Zap, AlertTriangle
} from 'lucide-react'
import { adminAPI, settingsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminNoBotServices() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('settings')
  const [showApiKey, setShowApiKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  
  const [settings, setSettings] = useState({
    gemini_api_key: '',
    gemini_model: 'gemini-pro',
    default_system_prompt: 'You are a helpful customer support assistant. Be friendly, professional, and concise. Help users with their questions about the website and services.',
    max_tokens: 1024,
    temperature: 0.7,
    whatsapp_enabled: false,
    whatsapp_api_key: '',
    whatsapp_phone_number_id: '',
    messenger_enabled: false,
    messenger_page_access_token: '',
    messenger_app_secret: '',
    instagram_enabled: false,
    instagram_access_token: '',
  })

  // Load NoBot settings
  const { data: nobotData, isLoading } = useQuery({
    queryKey: ['admin-nobot-settings'],
    queryFn: () => adminAPI.getNoBotSettings().then(res => res.data)
  })

  // Load NoBot services stats
  const { data: statsData } = useQuery({
    queryKey: ['admin-nobot-stats'],
    queryFn: () => adminAPI.getNoBotStats().then(res => res.data)
  })

  useEffect(() => {
    if (nobotData?.settings) {
      setSettings(prev => ({ ...prev, ...nobotData.settings }))
    }
  }, [nobotData])

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminAPI.updateNoBotSettings(settings)
      toast.success('NoBot settings saved successfully!')
      queryClient.invalidateQueries(['admin-nobot-settings'])
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const testGeminiConnection = async () => {
    if (!settings.gemini_api_key) {
      toast.error('Please enter a Gemini API key first')
      return
    }
    setTesting(true)
    try {
      const res = await adminAPI.testNoBotConnection('gemini', { api_key: settings.gemini_api_key })
      if (res.data.success) {
        toast.success('Gemini API connection successful!')
      } else {
        toast.error(res.data.error || 'Connection failed')
      }
    } catch (err) {
      toast.error('Failed to test connection')
    } finally {
      setTesting(false)
    }
  }

  const stats = statsData?.stats || {
    total_bots: 0,
    active_bots: 0,
    total_conversations: 0,
    total_messages: 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <>
      <Helmet><title>NoBot Services - Admin - Magnetic Clouds</title></Helmet>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            NoBot AI Services
          </h1>
          <p className="text-dark-500 mt-1">Configure AI chatbot services and integrations</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total_bots}</p>
            <p className="text-xs text-dark-500">Total Bots</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.active_bots}</p>
            <p className="text-xs text-dark-500">Active Bots</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total_conversations}</p>
            <p className="text-xs text-dark-500">Conversations</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total_messages}</p>
            <p className="text-xs text-dark-500">Total Messages</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-200 dark:border-dark-700 mb-6">
        <div className="flex gap-6">
          {[
            { id: 'settings', label: 'Gemini AI Settings', icon: Sparkles },
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
            { id: 'messenger', label: 'Messenger', icon: MessageCircle },
            { id: 'instagram', label: 'Instagram', icon: MessageCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 py-4 border-b-2 transition-colors",
                activeTab === tab.id 
                  ? "border-primary-500 text-primary-600" 
                  : "border-transparent text-dark-500 hover:text-dark-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gemini AI Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary-500" /> Gemini AI Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gemini API Key</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.gemini_api_key}
                      onChange={(e) => setSettings(prev => ({ ...prev, gemini_api_key: e.target.value }))}
                      className="input pl-11 pr-11 w-full"
                      placeholder="Enter your Gemini API key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button 
                    onClick={testGeminiConnection}
                    disabled={testing}
                    className="btn-secondary"
                  >
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Test
                  </button>
                </div>
                <p className="text-xs text-dark-500 mt-1">
                  Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">Google AI Studio</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <select
                  value={settings.gemini_model}
                  onChange={(e) => setSettings(prev => ({ ...prev, gemini_model: e.target.value }))}
                  className="input"
                >
                  <option value="gemini-pro">Gemini Pro</option>
                  <option value="gemini-pro-vision">Gemini Pro Vision</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Default System Prompt</label>
                <textarea
                  value={settings.default_system_prompt}
                  onChange={(e) => setSettings(prev => ({ ...prev, default_system_prompt: e.target.value }))}
                  className="input min-h-[120px]"
                  placeholder="Enter default system prompt for all bots..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Max Tokens</label>
                  <input
                    type="number"
                    value={settings.max_tokens}
                    onChange={(e) => setSettings(prev => ({ ...prev, max_tokens: parseInt(e.target.value) || 1024 }))}
                    className="input"
                    min="100"
                    max="8192"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0.7 }))}
                    className="input"
                    min="0"
                    max="1"
                  />
                  <p className="text-xs text-dark-500 mt-1">0 = More focused, 1 = More creative</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Settings */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                WhatsApp Business API
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium">Enable</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.whatsapp_enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>

            {settings.whatsapp_enabled && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-medium mb-1">WhatsApp Business API Setup Required</p>
                      <p>You need a Meta Business Account and WhatsApp Business API access. <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer" className="underline">Learn more</a></p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp Access Token</label>
                  <input
                    type="password"
                    value={settings.whatsapp_api_key}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_api_key: e.target.value }))}
                    className="input"
                    placeholder="Enter WhatsApp Cloud API access token"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    value={settings.whatsapp_phone_number_id}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_phone_number_id: e.target.value }))}
                    className="input"
                    placeholder="Enter WhatsApp phone number ID"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messenger Settings */}
      {activeTab === 'messenger' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                Facebook Messenger
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium">Enable</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.messenger_enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, messenger_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-300 rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>

            {settings.messenger_enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Page Access Token</label>
                  <input
                    type="password"
                    value={settings.messenger_page_access_token}
                    onChange={(e) => setSettings(prev => ({ ...prev, messenger_page_access_token: e.target.value }))}
                    className="input"
                    placeholder="Enter Facebook Page access token"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">App Secret</label>
                  <input
                    type="password"
                    value={settings.messenger_app_secret}
                    onChange={(e) => setSettings(prev => ({ ...prev, messenger_app_secret: e.target.value }))}
                    className="input"
                    placeholder="Enter Facebook App secret"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instagram Settings */}
      {activeTab === 'instagram' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                Instagram Messaging
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium">Enable</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.instagram_enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, instagram_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-300 rounded-full peer peer-checked:bg-pink-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>

            {settings.instagram_enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram Access Token</label>
                  <input
                    type="password"
                    value={settings.instagram_access_token}
                    onChange={(e) => setSettings(prev => ({ ...prev, instagram_access_token: e.target.value }))}
                    className="input"
                    placeholder="Enter Instagram access token"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
