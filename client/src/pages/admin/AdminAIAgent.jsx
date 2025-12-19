import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  Bot, Key, Eye, EyeOff, Save, RefreshCw, Check, X,
  Settings, Clock, MessageSquare, Trash2, ExternalLink,
  Power, Zap, Loader2, GraduationCap, Globe
} from 'lucide-react'
import { useAIAgent } from '../../contexts/AIAgentContext'
import api, { aiAgentAPI } from '../../lib/api'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export default function AdminAIAgent() {
  const {
    isEnabled,
    toggleEnabled,
    apiKey,
    setApiKey,
    trainAgent,
    settings,
    updateChatSettings,
    trainingLogs,
    setTrainingLogs,
    savedChats,
    currentAgent,
    agentProfiles,
    isApiValid,
    setIsApiValid
  } = useAIAgent()

  const [showApiKey, setShowApiKey] = useState(false)
  const [newApiKey, setNewApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [localSettings, setLocalSettings] = useState(settings)
  const [isLoading, setIsLoading] = useState(true)
  const [websiteUrl, setWebsiteUrl] = useState('https://magnetic-clouds.com')
  const [isTraining, setIsTraining] = useState(false)
  const [trainingStatus, setTrainingStatus] = useState({ isTrained: false, trainedAt: null })

  // Fetch saved settings from server on mount
  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const response = await api.get('/ai-agent/settings/admin')
        if (response.data) {
          setNewApiKey(response.data.apiKey || '')
          if (response.data.apiKey) {
            setApiKey(response.data.apiKey)
            setIsApiValid(true)
          }
          if (response.data.settings) {
            setLocalSettings(response.data.settings)
          }
        }
        // Fetch training status
        const statusRes = await aiAgentAPI.getTrainingStatus()
        if (statusRes.data) {
          setTrainingStatus(statusRes.data)
        }
      } catch (error) {
        console.error('Failed to fetch AI agent settings:', error)
      }
      setIsLoading(false)
    }
    fetchAdminSettings()
  }, [])

  const handleValidate = async () => {
    if (!newApiKey.trim()) {
      toast.error('Please enter an API key')
      return
    }
    setIsValidating(true)
    const result = await trainAgent(newApiKey)
    setIsValidating(false)
    if (result.success) {
      toast.success(result.message || 'API key validated and saved!')
    } else {
      toast.error(result.message || 'Validation failed')
    }
  }

  const handleTestConnection = async () => {
    if (!newApiKey.trim()) {
      toast.error('Please enter an API key')
      return
    }
    setIsTesting(true)
    setTestResult(null)
    try {
      const response = await fetch('/api/ai-agent/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: newApiKey })
      })
      const data = await response.json()
      setTestResult(data)
      if (data.success) {
        toast.success(`Connected! Model: ${data.model}`)
      } else {
        toast.error(data.message || 'Connection failed')
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message })
      toast.error('Failed to test connection')
    }
    setIsTesting(false)
  }

  const handleSaveSettings = () => {
    updateChatSettings(localSettings)
    toast.success('Settings saved!')
  }

  const handleClearLogs = () => {
    setTrainingLogs([])
    toast.success('Logs cleared')
  }

  const handleTrainAgent = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL')
      return
    }
    setIsTraining(true)
    try {
      const response = await aiAgentAPI.train(websiteUrl)
      if (response.data.success) {
        toast.success('Training completed successfully!')
        setTrainingStatus({
          isTrained: true,
          trainedAt: response.data.trainedAt,
          contentLength: response.data.contentLength
        })
      } else {
        toast.error(response.data.error || 'Training failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Training failed')
    }
    setIsTraining(false)
  }

  return (
    <>
      <Helmet><title>AI Agent - Admin - Magnetic Clouds</title></Helmet>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-500" />
            AI Customer Support Agent
          </h1>
          <p className="text-dark-500 mt-1">Configure and manage your AI-powered chatbot</p>
        </div>
        <button
          onClick={() => toggleEnabled(!isEnabled)}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
            isEnabled
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-dark-200 dark:bg-dark-700 text-dark-600 dark:text-dark-400 hover:bg-dark-300 dark:hover:bg-dark-600"
          )}
        >
          <Power className="w-5 h-5" />
          {isEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-500 text-sm">Total Chats</p>
              <p className="text-3xl font-bold mt-1">{savedChats.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-500 text-sm">Status</p>
              <p className="text-xl font-bold mt-1 flex items-center gap-2">
                {isEnabled ? (
                  <><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Active</>
                ) : (
                  <><span className="w-2 h-2 bg-dark-400 rounded-full" /> Inactive</>
                )}
              </p>
            </div>
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center",
              isEnabled ? "bg-green-100 dark:bg-green-900/30" : "bg-dark-100 dark:bg-dark-700")}>
              <Zap className={clsx("w-6 h-6", isEnabled ? "text-green-500" : "text-dark-400")} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-500 text-sm">API Status</p>
              <p className="text-xl font-bold mt-1 flex items-center gap-2">
                {isApiValid ? (
                  <><Check className="w-4 h-4 text-green-500" /> Connected</>
                ) : (
                  <><X className="w-4 h-4 text-red-500" /> Not Connected</>
                )}
              </p>
            </div>
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center",
              isApiValid ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30")}>
              <Key className={clsx("w-6 h-6", isApiValid ? "text-green-500" : "text-red-500")} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-500 text-sm">Available Agents</p>
              <p className="text-3xl font-bold mt-1">{agentProfiles.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* API Configuration */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            API Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Google Gemini API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="input pr-12 w-full"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-600"
            >
              <ExternalLink className="w-4 h-4" />
              Get API key from Google AI Studio
            </a>

            <div className="flex gap-3">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="btn-outline flex items-center gap-2"
              >
                {isTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Test Connection
              </button>
              <button
                onClick={handleValidate}
                disabled={isValidating}
                className="btn-primary flex items-center gap-2"
              >
                {isValidating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Validate & Save
              </button>
            </div>

            {testResult && (
              <div className={`mt-4 p-4 rounded-lg text-sm ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                <p className="font-medium mb-1">{testResult.success ? 'Connection Successful!' : 'Connection Failed'}</p>
                {testResult.model && <p>Model: {testResult.model}</p>}
                {testResult.message && <p>{testResult.message}</p>}
                {testResult.response && <p className="text-xs mt-2 opacity-75">Response: {testResult.response}</p>}
              </div>
            )}
          </div>
        </div>

        {/* AI Training */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            AI Training
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Website URL for Training</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://your-website.com"
                  className="input pl-10 w-full"
                />
              </div>
              <p className="text-xs text-dark-400 mt-2">The AI will learn about your services from this website</p>
            </div>

            {trainingStatus.isTrained && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
                <p className="font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Training Complete
                </p>
                <p className="text-xs mt-1 opacity-75">
                  Last trained: {new Date(trainingStatus.trainedAt).toLocaleString()}
                </p>
              </div>
            )}

            <button
              onClick={handleTrainAgent}
              disabled={isTraining}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isTraining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  {trainingStatus.isTrained ? 'Re-train Agent' : 'Train Agent'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chat Timing Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Chat Timing Settings
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Queue Wait Time</label>
                <span className="text-sm text-dark-500">{localSettings.queueAssignTime / 1000}s</span>
              </div>
              <input
                type="range"
                min="5000"
                max="30000"
                step="1000"
                value={localSettings.queueAssignTime}
                onChange={(e) => setLocalSettings(s => ({ ...s, queueAssignTime: Number(e.target.value) }))}
                className="w-full accent-indigo-500"
              />
              <p className="text-xs text-dark-400 mt-1">Time before assigning an agent</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Typing Delay</label>
                <span className="text-sm text-dark-500">{localSettings.typingStartDelay / 1000}s</span>
              </div>
              <input
                type="range"
                min="3000"
                max="15000"
                step="1000"
                value={localSettings.typingStartDelay}
                onChange={(e) => setLocalSettings(s => ({ ...s, typingStartDelay: Number(e.target.value) }))}
                className="w-full accent-indigo-500"
              />
              <p className="text-xs text-dark-400 mt-1">Delay before typing indicator appears</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Reply Speed</label>
                <span className="text-sm text-dark-500">{localSettings.replyTimePerWord / 1000}s/word</span>
              </div>
              <input
                type="range"
                min="1000"
                max="5000"
                step="500"
                value={localSettings.replyTimePerWord}
                onChange={(e) => setLocalSettings(s => ({ ...s, replyTimePerWord: Number(e.target.value) }))}
                className="w-full accent-indigo-500"
              />
              <p className="text-xs text-dark-400 mt-1">Typing duration per word</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Follow-up Timeout</label>
                <span className="text-sm text-dark-500">{localSettings.followUpTimeout / 1000}s</span>
              </div>
              <input
                type="range"
                min="30000"
                max="120000"
                step="10000"
                value={localSettings.followUpTimeout}
                onChange={(e) => setLocalSettings(s => ({ ...s, followUpTimeout: Number(e.target.value) }))}
                className="w-full accent-indigo-500"
              />
              <p className="text-xs text-dark-400 mt-1">Time before asking "anything else?"</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">End Chat Timeout</label>
                <span className="text-sm text-dark-500">{localSettings.endChatTimeout / 1000}s</span>
              </div>
              <input
                type="range"
                min="15000"
                max="60000"
                step="5000"
                value={localSettings.endChatTimeout}
                onChange={(e) => setLocalSettings(s => ({ ...s, endChatTimeout: Number(e.target.value) }))}
                className="w-full accent-indigo-500"
              />
              <p className="text-xs text-dark-400 mt-1">Time after follow-up to auto-end chat</p>
            </div>

            <button onClick={handleSaveSettings} className="btn-primary w-full flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>

        {/* Training Logs */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" />
              Training Logs
            </h2>
            <button onClick={handleClearLogs} className="btn-outline text-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Clear Logs
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {trainingLogs.length === 0 ? (
              <p className="text-center text-dark-400 py-8">No logs yet</p>
            ) : (
              trainingLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-lg text-sm",
                    log.type === 'success' && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                    log.type === 'error' && "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
                    log.type === 'info' && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  )}
                >
                  {log.type === 'success' && <Check className="w-4 h-4" />}
                  {log.type === 'error' && <X className="w-4 h-4" />}
                  {log.type === 'info' && <Settings className="w-4 h-4" />}
                  <span className="flex-1">{log.message}</span>
                  <span className="text-xs opacity-60">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Agent Preview */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            Agent Profiles Preview
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {agentProfiles.slice(0, 10).map((agent) => (
              <div key={agent.id} className="text-center p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-indigo-200 dark:border-indigo-800"
                />
                <p className="font-medium text-sm">{agent.name}</p>
                <p className="text-xs text-dark-400">{agent.nameLocal}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
