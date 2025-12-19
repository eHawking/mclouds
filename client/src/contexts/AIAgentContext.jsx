import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../lib/api'

const AIAgentContext = createContext(null)

// Agent profiles with diverse names
const agentProfiles = [
  { id: 1, name: 'Sarah Johnson', nameLocal: 'সারাহ জনসন', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', gender: 'female' },
  { id: 2, name: 'Michael Chen', nameLocal: 'মাইকেল চেন', avatar: 'https://randomuser.me/api/portraits/men/2.jpg', gender: 'male' },
  { id: 3, name: 'Emily Rodriguez', nameLocal: 'এমিলি রদ্রিগেজ', avatar: 'https://randomuser.me/api/portraits/women/3.jpg', gender: 'female' },
  { id: 4, name: 'David Kim', nameLocal: 'ডেভিড কিম', avatar: 'https://randomuser.me/api/portraits/men/4.jpg', gender: 'male' },
  { id: 5, name: 'Jessica Williams', nameLocal: 'জেসিকা উইলিয়ামস', avatar: 'https://randomuser.me/api/portraits/women/5.jpg', gender: 'female' },
  { id: 6, name: 'James Anderson', nameLocal: 'জেমস অ্যান্ডারসন', avatar: 'https://randomuser.me/api/portraits/men/6.jpg', gender: 'male' },
  { id: 7, name: 'Amanda Taylor', nameLocal: 'অ্যামান্ডা টেইলর', avatar: 'https://randomuser.me/api/portraits/women/7.jpg', gender: 'female' },
  { id: 8, name: 'Robert Martinez', nameLocal: 'রবার্ট মার্টিনেজ', avatar: 'https://randomuser.me/api/portraits/men/8.jpg', gender: 'male' },
  { id: 9, name: 'Sophia Lee', nameLocal: 'সোফিয়া লি', avatar: 'https://randomuser.me/api/portraits/women/9.jpg', gender: 'female' },
  { id: 10, name: 'Daniel Brown', nameLocal: 'ড্যানিয়েল ব্রাউন', avatar: 'https://randomuser.me/api/portraits/men/10.jpg', gender: 'male' },
  { id: 11, name: 'Olivia Garcia', nameLocal: 'অলিভিয়া গার্সিয়া', avatar: 'https://randomuser.me/api/portraits/women/11.jpg', gender: 'female' },
  { id: 12, name: 'William Davis', nameLocal: 'উইলিয়াম ডেভিস', avatar: 'https://randomuser.me/api/portraits/men/12.jpg', gender: 'male' },
  { id: 13, name: 'Emma Wilson', nameLocal: 'এমা উইলসন', avatar: 'https://randomuser.me/api/portraits/women/13.jpg', gender: 'female' },
  { id: 14, name: 'Alexander Moore', nameLocal: 'আলেকজান্ডার মুর', avatar: 'https://randomuser.me/api/portraits/men/14.jpg', gender: 'male' },
  { id: 15, name: 'Isabella Thompson', nameLocal: 'ইসাবেলা থম্পসন', avatar: 'https://randomuser.me/api/portraits/women/15.jpg', gender: 'female' },
]

// Fallback responses when API is offline
const fallbackResponses = {
  greeting: [
    "Hello! Welcome to Magnetic Clouds support. How can I help you today?",
    "Hi there! I'm here to help with any questions about our hosting services.",
    "Welcome! I'd be happy to assist you with our cloud solutions."
  ],
  pricing: [
    "Our hosting plans start from $2.99/month for shared hosting. VPS starts at $14.99/month, and dedicated servers from $99/month. Would you like details on any specific plan?",
    "We have various pricing tiers to fit your needs. Shared hosting from $2.99/mo, VPS from $14.99/mo, Cloud from $19.99/mo. What type of hosting are you looking for?"
  ],
  support: [
    "Our support team is available 24/7 via live chat, email at support@magneticclouds.com, or you can open a ticket from your dashboard.",
    "You can reach us anytime! We offer 24/7 support through chat, email, and our ticket system in the dashboard."
  ],
  domains: [
    "We offer domain registration starting from $9.99/year for .com domains. You can search for available domains on our Domains page.",
    "Domain prices vary by extension - .com is $9.99/yr, .net is $12.99/yr. Would you like to check availability for a specific domain?"
  ],
  general: [
    "I understand. Could you please provide more details so I can assist you better?",
    "Thanks for reaching out. Let me help you with that. What specific information do you need?",
    "I'm here to help! Could you tell me more about what you're looking for?"
  ],
  offline: [
    "I apologize, but I'm having some technical difficulties at the moment. Please try again shortly or contact us at support@magneticclouds.com",
    "Sorry, I'm experiencing connection issues. You can email us at support@magneticclouds.com for immediate assistance."
  ]
}

const defaultSettings = {
  queueAssignTime: 12000,      // 12 seconds
  typingStartDelay: 8000,      // 8 seconds
  replyTimePerWord: 2500,      // 2.5 seconds per word
  followUpTimeout: 60000,      // 60 seconds
  endChatTimeout: 30000,       // 30 seconds
}

export function AIAgentProvider({ children }) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [currentAgent, setCurrentAgent] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [savedChats, setSavedChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ai_agent_chats') || '[]')
    } catch { return [] }
  })
  const [trainingLogs, setTrainingLogs] = useState([])
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ai_agent_settings')) || defaultSettings
    } catch { return defaultSettings }
  })
  const [isApiValid, setIsApiValid] = useState(false)

  const followUpTimerRef = useRef(null)
  const endChatTimerRef = useRef(null)

  // Generate unique chat ID
  const generateChatId = useCallback(() => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `MC-${timestamp}-${random}`
  }, [])

  // Rotate to new random agent
  const rotateAgent = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * agentProfiles.length)
    setCurrentAgent(agentProfiles[randomIndex])
    return agentProfiles[randomIndex]
  }, [])

  // Add training log
  const addLog = useCallback((type, message) => {
    setTrainingLogs(prev => [{
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString()
    }, ...prev].slice(0, 50))
  }, [])

  // Train/validate API key and save to server
  const trainAgent = useCallback(async (newApiKey) => {
    try {
      addLog('info', 'Validating API key...')
      const response = await api.post('/ai-agent/validate', { apiKey: newApiKey })

      if (response.data.valid) {
        setApiKey(newApiKey)
        setIsApiValid(true)
        // Save to server database
        try {
          const saveResponse = await api.post('/ai-agent/settings', { apiKey: newApiKey, enabled: true })
          console.log('Save response:', saveResponse.data)
          setIsEnabled(true)
          addLog('success', 'API key validated and saved to database!')
          return { success: true, message: 'API key validated and saved!' }
        } catch (saveError) {
          console.error('Failed to save API key to server:', saveError)
          addLog('error', `API key valid but failed to save: ${saveError.response?.data?.error || saveError.message}`)
          return { success: false, message: `Valid but save failed: ${saveError.response?.data?.error || saveError.message}` }
        }
      } else {
        addLog('error', 'Invalid API key')
        return { success: false, message: 'Invalid API key' }
      }
    } catch (error) {
      addLog('error', `Validation failed: ${error.message}`)
      return { success: false, message: error.message }
    }
  }, [addLog])

  // Get fallback response based on message content
  const getFallbackResponse = useCallback((message) => {
    const lowerMsg = message.toLowerCase()

    if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('plan')) {
      return fallbackResponses.pricing[Math.floor(Math.random() * fallbackResponses.pricing.length)]
    }
    if (lowerMsg.includes('support') || lowerMsg.includes('help') || lowerMsg.includes('contact')) {
      return fallbackResponses.support[Math.floor(Math.random() * fallbackResponses.support.length)]
    }
    if (lowerMsg.includes('domain')) {
      return fallbackResponses.domains[Math.floor(Math.random() * fallbackResponses.domains.length)]
    }
    if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
      return fallbackResponses.greeting[Math.floor(Math.random() * fallbackResponses.greeting.length)]
    }

    return fallbackResponses.general[Math.floor(Math.random() * fallbackResponses.general.length)]
  }, [])

  // Send message to AI
  const sendMessage = useCallback(async (message, language = 'en') => {
    if (!currentAgent) return null

    try {
      if (!apiKey) {
        return getFallbackResponse(message)
      }

      const response = await api.post('/ai-agent/chat', {
        apiKey,
        message,
        agentName: currentAgent.name,
        agentNameLocal: currentAgent.nameLocal,
        language,
        chatHistory: chatHistory.slice(-10) // Last 10 messages for context
      })

      if (response.data.error) {
        addLog('error', `Chat error: ${response.data.error}`)
        // Return offline signal if API returned error
        return '__OFFLINE__'
      }

      return response.data.response
    } catch (error) {
      console.error('AI chat error:', error)
      addLog('error', `Chat error: ${error.message}`)
      // Network error or server down - signal offline
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout') ||
        error.message.includes('Network') || !error.response) {
        return '__OFFLINE__'
      }
      // Other errors - try fallback
      return getFallbackResponse(message)
    }
  }, [apiKey, currentAgent, chatHistory, getFallbackResponse, addLog])

  // Save chat session
  const saveChat = useCallback((chatData) => {
    setSavedChats(prev => {
      const updated = [chatData, ...prev].slice(0, 100) // Max 100 chats
      try {
        localStorage.setItem('ai_agent_chats', JSON.stringify(updated))
      } catch { }
      return updated
    })
    addLog('info', `Chat ${chatData.chatId} saved`)
  }, [addLog])

  // Delete chat
  const deleteChat = useCallback((chatId) => {
    setSavedChats(prev => {
      const updated = prev.filter(c => c.chatId !== chatId)
      try {
        localStorage.setItem('ai_agent_chats', JSON.stringify(updated))
      } catch { }
      return updated
    })
    addLog('info', `Chat ${chatId} deleted`)
  }, [addLog])

  // Clear all chats
  const clearAllChats = useCallback(() => {
    setSavedChats([])
    try {
      localStorage.removeItem('ai_agent_chats')
    } catch { }
    addLog('info', 'All chats cleared')
  }, [addLog])

  // Update settings and save to server
  const updateChatSettings = useCallback(async (newSettings) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    try {
      await api.post('/ai-agent/settings', { settings: updated })
    } catch (e) {
      console.error('Failed to save settings to server:', e)
    }
    addLog('success', 'Settings updated')
  }, [settings, addLog])

  // Toggle enabled state and save to server
  const toggleEnabled = useCallback(async (enabled) => {
    setIsEnabled(enabled)
    try {
      await api.post('/ai-agent/settings', { enabled })
      addLog('success', `AI Agent ${enabled ? 'enabled' : 'disabled'} and saved`)
    } catch (e) {
      console.error('Failed to save enabled state to server:', e)
      addLog('error', `Failed to save: ${e.response?.data?.error || e.message}`)
    }
  }, [addLog])

  // Clear timers
  const clearTimers = useCallback(() => {
    if (followUpTimerRef.current) clearTimeout(followUpTimerRef.current)
    if (endChatTimerRef.current) clearTimeout(endChatTimerRef.current)
  }, [])

  // Reset chat
  const resetChat = useCallback(() => {
    setChatHistory([])
    setCurrentAgent(null)
    setIsTyping(false)
    clearTimers()
  }, [clearTimers])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  // Fetch AI agent settings from server on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/ai-agent/settings')
        if (response.data) {
          setIsEnabled(response.data.enabled && response.data.hasApiKey)
          setSettingsLoaded(true)
        }
      } catch (error) {
        console.error('Failed to fetch AI agent settings:', error)
        setSettingsLoaded(true)
      }
    }
    fetchSettings()
  }, [])

  const value = {
    isEnabled,
    settingsLoaded,
    toggleEnabled,
    apiKey,
    setApiKey,
    currentAgent,
    setCurrentAgent,
    isTyping,
    setIsTyping,
    chatHistory,
    setChatHistory,
    savedChats,
    trainingLogs,
    setTrainingLogs,
    settings,
    isApiValid,
    setIsApiValid,
    agentProfiles,
    sendMessage,
    trainAgent,
    saveChat,
    deleteChat,
    clearAllChats,
    updateChatSettings,
    rotateAgent,
    generateChatId,
    resetChat,
    clearTimers,
    followUpTimerRef,
    endChatTimerRef,
    addLog
  }

  return (
    <AIAgentContext.Provider value={value}>
      {children}
    </AIAgentContext.Provider>
  )
}

export function useAIAgent() {
  const context = useContext(AIAgentContext)
  if (!context) {
    throw new Error('useAIAgent must be used within AIAgentProvider')
  }
  return context
}

export default AIAgentContext
