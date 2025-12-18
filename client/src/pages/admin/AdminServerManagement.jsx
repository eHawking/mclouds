import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { 
  Server, Plus, Settings, Trash2, CheckCircle, XCircle, RefreshCw,
  Eye, EyeOff, TestTube, Globe, Lock, Key, Database, HardDrive,
  Cpu, MemoryStick, Activity, Users, Loader2, Shield, Zap, Cloud,
  Link2, Unlink, AlertTriangle, Info
} from 'lucide-react'
import { settingsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminServerManagement() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [serverStats, setServerStats] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  
  const [pleskConfig, setPleskConfig] = useState({
    enabled: false,
    hostname: '',
    port: '8443',
    username: '',
    password: '',
    api_key: '',
    auth_method: 'credentials', // 'credentials' or 'api_key'
    verify_ssl: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.getServerManagement()
      if (res.data?.settings) {
        setPleskConfig(prev => ({ ...prev, ...res.data.settings }))
        if (res.data.settings.enabled && res.data.settings.hostname) {
          setConnectionStatus('configured')
        }
      }
    } catch (err) {
      console.error('Failed to load server settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsAPI.updateServerManagement(pleskConfig)
      toast.success('Server settings saved!')
      if (pleskConfig.enabled && pleskConfig.hostname) {
        setConnectionStatus('configured')
      }
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!pleskConfig.hostname) {
      toast.error('Please enter server hostname')
      return
    }
    
    setTesting(true)
    setServerStats(null)
    try {
      const res = await settingsAPI.testPleskConnection(pleskConfig)
      if (res.data.success) {
        toast.success('Connected to Plesk successfully!')
        setConnectionStatus('connected')
        setServerStats(res.data.serverInfo)
      } else {
        toast.error(res.data.error || 'Connection failed')
        setConnectionStatus('error')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Connection test failed')
      setConnectionStatus('error')
    } finally {
      setTesting(false)
    }
  }

  const handleDisconnect = () => {
    setPleskConfig(prev => ({ ...prev, enabled: false }))
    setConnectionStatus('disconnected')
    setServerStats(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Server Management - Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
            Server Management
          </h1>
          <p className="text-dark-500 mt-1">Connect and manage your Plesk servers</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-primary"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
          Save Settings
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plesk Connection Card */}
          <div className="card overflow-hidden">
            {/* Premium Header */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Cloud className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Plesk Panel</h2>
                    <p className="text-white/70 text-sm">Server control panel integration</p>
                  </div>
                </div>
                <div className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                  connectionStatus === 'connected' && "bg-green-500/20 text-green-200",
                  connectionStatus === 'configured' && "bg-amber-500/20 text-amber-200",
                  connectionStatus === 'disconnected' && "bg-white/20 text-white/70",
                  connectionStatus === 'error' && "bg-red-500/20 text-red-200"
                )}>
                  {connectionStatus === 'connected' && <><CheckCircle className="w-4 h-4" /> Connected</>}
                  {connectionStatus === 'configured' && <><Activity className="w-4 h-4" /> Configured</>}
                  {connectionStatus === 'disconnected' && <><Unlink className="w-4 h-4" /> Not Connected</>}
                  {connectionStatus === 'error' && <><XCircle className="w-4 h-4" /> Error</>}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Enable Plesk Integration</p>
                    <p className="text-sm text-dark-500">Connect your Plesk server for automated provisioning</p>
                  </div>
                </div>
                <button
                  onClick={() => setPleskConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={clsx(
                    "relative w-14 h-8 rounded-full transition-colors",
                    pleskConfig.enabled ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-dark-300 dark:bg-dark-600"
                  )}
                >
                  <div className={clsx(
                    "absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all",
                    pleskConfig.enabled ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              {pleskConfig.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-5"
                >
                  {/* Server Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Server Hostname *
                      </label>
                      <input
                        type="text"
                        value={pleskConfig.hostname}
                        onChange={e => setPleskConfig(prev => ({ ...prev, hostname: e.target.value }))}
                        placeholder="e.g., server1.yourdomain.com"
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Server className="w-4 h-4 inline mr-2" />
                        Port
                      </label>
                      <input
                        type="text"
                        value={pleskConfig.port}
                        onChange={e => setPleskConfig(prev => ({ ...prev, port: e.target.value }))}
                        placeholder="8443"
                        className="input w-full"
                      />
                    </div>
                  </div>

                  {/* Auth Method Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Authentication Method</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPleskConfig(prev => ({ ...prev, auth_method: 'credentials' }))}
                        className={clsx(
                          "p-4 border rounded-xl text-left transition-all",
                          pleskConfig.auth_method === 'credentials'
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                            : "border-dark-200 dark:border-dark-700 hover:border-dark-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-primary-500" />
                          <div>
                            <p className="font-medium">Username & Password</p>
                            <p className="text-xs text-dark-500 mt-1">Use admin credentials</p>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPleskConfig(prev => ({ ...prev, auth_method: 'api_key' }))}
                        className={clsx(
                          "p-4 border rounded-xl text-left transition-all",
                          pleskConfig.auth_method === 'api_key'
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                            : "border-dark-200 dark:border-dark-700 hover:border-dark-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Key className="w-5 h-5 text-amber-500" />
                          <div>
                            <p className="font-medium">API Key</p>
                            <p className="text-xs text-dark-500 mt-1">More secure option</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Credentials */}
                  {pleskConfig.auth_method === 'credentials' ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Username *</label>
                        <input
                          type="text"
                          value={pleskConfig.username}
                          onChange={e => setPleskConfig(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="admin"
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Password *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={pleskConfig.password}
                            onChange={e => setPleskConfig(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="••••••••"
                            className="input w-full pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2">API Key *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={pleskConfig.api_key}
                          onChange={e => setPleskConfig(prev => ({ ...prev, api_key: e.target.value }))}
                          placeholder="Enter your Plesk API key"
                          className="input w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-dark-500 mt-2">
                        Generate API key in Plesk: Tools & Settings → API Access
                      </p>
                    </div>
                  )}

                  {/* SSL Verification */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="verify_ssl"
                      checked={pleskConfig.verify_ssl}
                      onChange={e => setPleskConfig(prev => ({ ...prev, verify_ssl: e.target.checked }))}
                      className="w-4 h-4 rounded border-dark-300"
                    />
                    <label htmlFor="verify_ssl" className="text-sm">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Verify SSL Certificate
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-dark-100 dark:border-dark-700">
                    <button
                      onClick={handleTestConnection}
                      disabled={testing || !pleskConfig.hostname}
                      className="btn-primary flex-1"
                    >
                      {testing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4 mr-2" />
                      )}
                      Test Connection
                    </button>
                    {connectionStatus !== 'disconnected' && (
                      <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" /> Plesk Integration Features
            </h3>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Automatic hosting account provisioning when orders are activated</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Suspend/unsuspend accounts based on payment status</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Sync server resource usage and statistics</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Manage domains, databases, and email accounts</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar - Server Stats */}
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" />
              Connection Status
            </h3>
            <div className={clsx(
              "p-4 rounded-xl border-2",
              connectionStatus === 'connected' && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
              connectionStatus === 'configured' && "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
              connectionStatus === 'disconnected' && "bg-dark-50 dark:bg-dark-800 border-dark-200 dark:border-dark-700",
              connectionStatus === 'error' && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            )}>
              <div className="flex items-center gap-3">
                {connectionStatus === 'connected' && <CheckCircle className="w-8 h-8 text-green-500" />}
                {connectionStatus === 'configured' && <Activity className="w-8 h-8 text-amber-500" />}
                {connectionStatus === 'disconnected' && <Unlink className="w-8 h-8 text-dark-400" />}
                {connectionStatus === 'error' && <AlertTriangle className="w-8 h-8 text-red-500" />}
                <div>
                  <p className="font-bold capitalize">{connectionStatus}</p>
                  <p className="text-sm text-dark-500">
                    {connectionStatus === 'connected' && 'Server is online and responding'}
                    {connectionStatus === 'configured' && 'Settings saved, test connection'}
                    {connectionStatus === 'disconnected' && 'No server configured'}
                    {connectionStatus === 'error' && 'Unable to connect to server'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Server Stats */}
          {serverStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-primary-500" />
                Server Information
              </h3>
              <div className="space-y-4">
                {serverStats.hostname && (
                  <div className="flex justify-between items-center">
                    <span className="text-dark-500 text-sm">Hostname</span>
                    <span className="font-medium text-sm">{serverStats.hostname}</span>
                  </div>
                )}
                {serverStats.version && (
                  <div className="flex justify-between items-center">
                    <span className="text-dark-500 text-sm">Plesk Version</span>
                    <span className="font-medium text-sm">{serverStats.version}</span>
                  </div>
                )}
                {serverStats.os && (
                  <div className="flex justify-between items-center">
                    <span className="text-dark-500 text-sm">Operating System</span>
                    <span className="font-medium text-sm">{serverStats.os}</span>
                  </div>
                )}
                {serverStats.domains !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-dark-500 text-sm flex items-center gap-1">
                      <Globe className="w-4 h-4" /> Domains
                    </span>
                    <span className="font-bold text-lg">{serverStats.domains}</span>
                  </div>
                )}
                {serverStats.clients !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-dark-500 text-sm flex items-center gap-1">
                      <Users className="w-4 h-4" /> Clients
                    </span>
                    <span className="font-bold text-lg">{serverStats.clients}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          {connectionStatus === 'connected' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full p-3 text-left bg-dark-50 dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-xl transition-colors flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">Sync Accounts</span>
                </button>
                <button className="w-full p-3 text-left bg-dark-50 dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-xl transition-colors flex items-center gap-3">
                  <Database className="w-4 h-4 text-green-500" />
                  <span className="text-sm">View Databases</span>
                </button>
                <button className="w-full p-3 text-left bg-dark-50 dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-xl transition-colors flex items-center gap-3">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Manage Domains</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
