import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Globe, Upload, FileText, Check, ChevronRight, ArrowLeft,
  Loader2, Sparkles, Code, Copy, CheckCircle, AlertCircle,
  Settings, MessageCircle, Inbox, ExternalLink, RefreshCw,
  Zap, Database, Brain, Wand2, Phone, Instagram, Facebook,
  Send, Search, User, Clock, MoreVertical, Paperclip, Smile,
  X, Filter, Star, Archive, Trash2, BarChart3, Users, TrendingUp
} from 'lucide-react'
import { nobotAPI, userAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Setup wizard steps
const SETUP_STEPS = [
  { id: 1, title: 'Website', description: 'Add your domain', icon: Globe },
  { id: 2, title: 'Channels', description: 'Connect platforms', icon: MessageCircle },
  { id: 3, title: 'Train AI', description: 'Train your bot', icon: Brain },
  { id: 4, title: 'Deploy', description: 'Go live', icon: Zap }
]

// Integration channels
const CHANNELS = [
  { id: 'website', name: 'Website Widget', icon: Globe, color: 'from-blue-500 to-cyan-500', description: 'Embed chatbot on your website' },
  { id: 'whatsapp', name: 'WhatsApp Business', icon: Phone, color: 'from-green-500 to-emerald-500', description: 'Connect WhatsApp Business API' },
  { id: 'instagram', name: 'Instagram DM', icon: Instagram, color: 'from-pink-500 to-purple-500', description: 'Auto-reply to Instagram messages' },
  { id: 'messenger', name: 'Facebook Messenger', icon: Facebook, color: 'from-blue-600 to-blue-700', description: 'Connect Facebook Page' },
  { id: 'telegram', name: 'Telegram', icon: Send, color: 'from-sky-500 to-blue-500', description: 'Create Telegram bot' }
]

// Main navigation tabs
const MAIN_TABS = [
  { id: 'setup', name: 'Setup', icon: Settings },
  { id: 'inbox', name: 'Inbox', icon: Inbox },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 }
]

export default function NoBotSetup() {
  const { uuid: paramUuid } = useParams()
  const [searchParams] = useSearchParams()
  const serviceUuid = searchParams.get('service')
  const tab = searchParams.get('tab') || 'setup'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [botUuid, setBotUuid] = useState(paramUuid || null)
  const [activeTab, setActiveTab] = useState(tab)
  const [currentStep, setCurrentStep] = useState(1)
  const [domain, setDomain] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [selectedChannels, setSelectedChannels] = useState(['website'])
  const [channelConfigs, setChannelConfigs] = useState({})
  const [trainingMethod, setTrainingMethod] = useState('website')
  const [manualData, setManualData] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [isCreatingBot, setIsCreatingBot] = useState(false)
  const [serviceName, setServiceName] = useState('NoBot AI')
  const [copiedCode, setCopiedCode] = useState(false)
  
  // Inbox state
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Load service data if coming from services page
  const { data: serviceData } = useQuery({
    queryKey: ['service', serviceUuid],
    queryFn: () => userAPI.getService(serviceUuid).then(res => res.data),
    enabled: !!serviceUuid && !botUuid
  })

  // Load user's existing bots
  const { data: userBots } = useQuery({
    queryKey: ['nobots'],
    queryFn: () => nobotAPI.getBots().then(res => res.data),
    enabled: !!serviceUuid && !botUuid
  })

  // Auto-create or find bot for this service
  useEffect(() => {
    if (serviceUuid && userBots?.bots && !botUuid && !isCreatingBot) {
      const existingBot = userBots.bots.find(b => b.service_uuid === serviceUuid)
      if (existingBot) {
        setBotUuid(existingBot.uuid)
      } else if (serviceData?.service) {
        setIsCreatingBot(true)
        setServiceName(serviceData.service.name || 'NoBot AI')
        nobotAPI.createBot({ 
          name: serviceData.service.name || 'NoBot AI',
          bot_type: 'website',
          service_id: serviceUuid
        })
          .then(res => {
            setBotUuid(res.data.uuid)
            setIsCreatingBot(false)
            toast.success('NoBot service initialized!')
          })
          .catch(() => {
            setIsCreatingBot(false)
            toast.error('Failed to initialize NoBot service')
          })
      }
    }
  }, [serviceUuid, userBots, serviceData, botUuid, isCreatingBot])

  // Load bot data
  const { data: botData, isLoading } = useQuery({
    queryKey: ['nobot', botUuid],
    queryFn: () => nobotAPI.getBot(botUuid).then(res => res.data),
    enabled: !!botUuid
  })

  useEffect(() => {
    if (botData?.bot) {
      setCurrentStep(botData.bot.setup_step || 1)
      setDomain(botData.bot.domain || '')
      setWebsiteUrl(botData.bot.website_url || '')
      setServiceName(botData.bot.name || 'NoBot AI')
      if (botData.bot.status === 'active') {
        setActiveTab('inbox')
      }
    }
  }, [botData])

  // Mock conversations for demo
  const mockConversations = [
    { id: 1, name: 'John Smith', avatar: null, lastMessage: 'Thanks for the help!', time: '2 min ago', unread: 2, channel: 'website', status: 'active' },
    { id: 2, name: 'Sarah Wilson', avatar: null, lastMessage: 'Can you tell me more about pricing?', time: '15 min ago', unread: 0, channel: 'whatsapp', status: 'active' },
    { id: 3, name: 'Mike Johnson', avatar: null, lastMessage: 'I need support with my order', time: '1 hour ago', unread: 1, channel: 'instagram', status: 'active' },
    { id: 4, name: 'Emily Davis', avatar: null, lastMessage: 'Great service!', time: '3 hours ago', unread: 0, channel: 'messenger', status: 'resolved' },
    { id: 5, name: 'Alex Brown', avatar: null, lastMessage: 'How do I get started?', time: 'Yesterday', unread: 0, channel: 'website', status: 'resolved' },
  ]

  const mockMessages = [
    { id: 1, sender: 'user', text: 'Hi, I need help with your product', time: '10:30 AM' },
    { id: 2, sender: 'bot', text: 'Hello! I\'d be happy to help you. What would you like to know about our products?', time: '10:30 AM' },
    { id: 3, sender: 'user', text: 'Can you tell me more about pricing?', time: '10:31 AM' },
    { id: 4, sender: 'bot', text: 'Of course! We offer flexible pricing plans starting from $29/month. Would you like me to explain the different tiers?', time: '10:31 AM' },
    { id: 5, sender: 'user', text: 'Yes please, that would be helpful', time: '10:32 AM' },
    { id: 6, sender: 'bot', text: 'We have three main plans:\n\n• Starter ($29/mo) - Perfect for small businesses\n• Professional ($79/mo) - Best for growing teams\n• Enterprise (Custom) - For large organizations\n\nEach plan includes our core features with varying limits on usage.', time: '10:32 AM' },
  ]

  // Setup mutation
  const setupMutation = useMutation({
    mutationFn: (data) => nobotAPI.setupBot(botUuid, data),
    onSuccess: () => {
      setCurrentStep(2)
      queryClient.invalidateQueries(['nobot', botUuid])
      toast.success('Configuration saved!')
    },
    onError: () => toast.error('Failed to save configuration')
  })

  // Train mutation
  const trainMutation = useMutation({
    mutationFn: (data) => nobotAPI.trainBot(botUuid, data),
    onSuccess: () => {
      setIsTraining(false)
      setTrainingProgress(100)
      setTimeout(() => {
        setCurrentStep(4)
        queryClient.invalidateQueries(['nobot', botUuid])
        toast.success('Training completed! Your bot is ready.')
      }, 1000)
    },
    onError: () => {
      setIsTraining(false)
      toast.error('Training failed')
    }
  })

  const handleSetup = () => {
    if (!domain) {
      toast.error('Please enter your domain')
      return
    }
    setupMutation.mutate({ domain, website_url: websiteUrl || `https://${domain}` })
  }

  const handleChannelToggle = (channelId) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(c => c !== channelId)
        : [...prev, channelId]
    )
  }

  const handleTrain = async () => {
    setIsTraining(true)
    setTrainingProgress(0)
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 15
      })
    }, 500)

    trainMutation.mutate({
      method: trainingMethod,
      website_url: websiteUrl || `https://${domain}`,
      training_data: manualData,
      channels: selectedChannels
    })
  }

  const copyWidgetCode = () => {
    const code = `<!-- NoBot AI Widget -->\n<script src="https://clouds.hassanscode.com/nobot/widget.js" data-bot-id="${botUuid}"></script>`
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    toast.success('Widget code copied!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const getChannelIcon = (channel) => {
    const ch = CHANNELS.find(c => c.id === channel)
    return ch ? ch.icon : Globe
  }

  const getChannelColor = (channel) => {
    const colors = { website: 'text-blue-500', whatsapp: 'text-green-500', instagram: 'text-pink-500', messenger: 'text-blue-600', telegram: 'text-sky-500' }
    return colors[channel] || 'text-gray-500'
  }

  const bot = botData?.bot

  if (isLoading || isCreatingBot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
          <Bot className="w-8 h-8 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-4 text-dark-500">Initializing NoBot AI...</p>
      </div>
    )
  }

  if (!bot && !serviceUuid) {
    return (
      <div className="text-center py-20">
        <Bot className="w-16 h-16 text-dark-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Bot not found</h2>
        <button onClick={() => navigate('/dashboard/services')} className="btn-primary mt-4">
          Back to Services
        </button>
      </div>
    )
  }

  // Render Setup Wizard Step
  const renderSetupStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card p-8 border-2 border-dashed border-primary-500/30 bg-gradient-to-br from-primary-500/5 to-transparent">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Configure Your Website</h2>
                  <p className="text-dark-500">Enter the domain where your chatbot will be deployed</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Domain Name *</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="input pl-10"
                      placeholder="example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website URL (optional)</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="input pl-10"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-400">Pro Tip</p>
                    <p className="text-sm text-dark-500">Adding your website URL helps us auto-fetch content for better AI training.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSetup} disabled={setupMutation.isPending} className="btn-primary px-8">
                {setupMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Connect Your Channels</h2>
                  <p className="text-dark-500">Select where you want your AI chatbot to respond</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHANNELS.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelToggle(channel.id)}
                    className={clsx(
                      "relative p-5 rounded-2xl border-2 text-left transition-all duration-300 group",
                      selectedChannels.includes(channel.id)
                        ? "border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10"
                        : "border-dark-200 dark:border-dark-700 hover:border-primary-500/50 hover:bg-dark-50 dark:hover:bg-dark-800"
                    )}
                  >
                    {selectedChannels.includes(channel.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={clsx(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                      channel.color
                    )}>
                      <channel.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold mb-1">{channel.name}</h3>
                    <p className="text-sm text-dark-500">{channel.description}</p>
                  </button>
                ))}
              </div>

              {/* Channel Configuration */}
              {selectedChannels.includes('whatsapp') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-5 rounded-xl bg-green-500/10 border border-green-500/20"
                >
                  <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5" /> WhatsApp Business API Setup
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Enter Phone Number ID"
                        value={channelConfigs.whatsapp?.phoneId || ''}
                        onChange={(e) => setChannelConfigs(prev => ({ ...prev, whatsapp: { ...prev.whatsapp, phoneId: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Access Token</label>
                      <input
                        type="password"
                        className="input"
                        placeholder="Enter Access Token"
                        value={channelConfigs.whatsapp?.token || ''}
                        onChange={(e) => setChannelConfigs(prev => ({ ...prev, whatsapp: { ...prev.whatsapp, token: e.target.value } }))}
                      />
                    </div>
                  </div>
                  <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noreferrer" className="text-sm text-green-400 hover:underline mt-2 inline-flex items-center gap-1">
                    How to get WhatsApp API credentials <ExternalLink className="w-3 h-3" />
                  </a>
                </motion.div>
              )}

              {selectedChannels.includes('instagram') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-5 rounded-xl bg-pink-500/10 border border-pink-500/20"
                >
                  <h4 className="font-bold text-pink-400 mb-3 flex items-center gap-2">
                    <Instagram className="w-5 h-5" /> Instagram Business Setup
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Instagram Business Account ID</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Enter Account ID"
                        value={channelConfigs.instagram?.accountId || ''}
                        onChange={(e) => setChannelConfigs(prev => ({ ...prev, instagram: { ...prev.instagram, accountId: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Access Token</label>
                      <input
                        type="password"
                        className="input"
                        placeholder="Enter Access Token"
                        value={channelConfigs.instagram?.token || ''}
                        onChange={(e) => setChannelConfigs(prev => ({ ...prev, instagram: { ...prev.instagram, token: e.target.value } }))}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedChannels.includes('messenger') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20"
                >
                  <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <Facebook className="w-5 h-5" /> Facebook Messenger Setup
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Page ID</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Enter Facebook Page ID"
                        value={channelConfigs.messenger?.pageId || ''}
                        onChange={(e) => setChannelConfigs(prev => ({ ...prev, messenger: { ...prev.messenger, pageId: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Page Access Token</label>
                      <input
                        type="password"
                        className="input"
                        placeholder="Enter Page Access Token"
                        value={channelConfigs.messenger?.token || ''}
                        onChange={(e) => setChannelConfigs(prev => ({ ...prev, messenger: { ...prev.messenger, token: e.target.value } }))}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep(1)} className="btn-secondary">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
              <button onClick={() => setCurrentStep(3)} className="btn-primary px-8">
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {isTraining ? (
              <div className="card p-12 text-center">
                <div className="relative w-40 h-40 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 opacity-20 animate-ping" />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 opacity-40 animate-pulse" />
                  <div className="absolute inset-8 rounded-full bg-dark-900 flex items-center justify-center">
                    <Brain className="w-16 h-16 text-primary-500 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">Training Your AI</h3>
                <p className="text-dark-500 mb-6">Our AI is learning about your business...</p>
                <div className="max-w-md mx-auto">
                  <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${trainingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-sm text-dark-500 mt-2">{Math.round(trainingProgress)}% complete</p>
                </div>
              </div>
            ) : (
              <>
                <div className="card p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                      <Brain className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Train Your AI</h2>
                      <p className="text-dark-500">Choose how to train your chatbot</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {[
                      { id: 'website', icon: Globe, title: 'Auto-fetch Website', desc: 'Crawl your website content' },
                      { id: 'file', icon: Upload, title: 'Upload File', desc: 'Upload training documents' },
                      { id: 'manual', icon: FileText, title: 'Manual Input', desc: 'Type your own content' }
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setTrainingMethod(method.id)}
                        className={clsx(
                          "p-5 rounded-xl border-2 text-left transition-all",
                          trainingMethod === method.id
                            ? "border-primary-500 bg-primary-500/10"
                            : "border-dark-200 dark:border-dark-700 hover:border-primary-500/50"
                        )}
                      >
                        <method.icon className={clsx("w-8 h-8 mb-3", trainingMethod === method.id ? "text-primary-500" : "text-dark-400")} />
                        <p className="font-bold">{method.title}</p>
                        <p className="text-sm text-dark-500">{method.desc}</p>
                      </button>
                    ))}
                  </div>

                  {trainingMethod === 'website' && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-blue-400">Auto-fetch enabled</p>
                          <p className="text-sm text-dark-500">We'll crawl <strong>{websiteUrl || `https://${domain}`}</strong> for training data.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {trainingMethod === 'file' && (
                    <div className="border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-xl p-8 text-center">
                      <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={(e) => setSelectedFile(e.target.files?.[0])} className="hidden" id="training-file" />
                      <label htmlFor="training-file" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                        {selectedFile ? (
                          <p className="font-medium text-primary-500">{selectedFile.name}</p>
                        ) : (
                          <p className="text-dark-500">Click to upload or drag and drop</p>
                        )}
                      </label>
                    </div>
                  )}

                  {trainingMethod === 'manual' && (
                    <textarea
                      value={manualData}
                      onChange={(e) => setManualData(e.target.value)}
                      className="input min-h-[200px]"
                      placeholder="Enter information about your business, products, FAQs, etc..."
                    />
                  )}
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setCurrentStep(2)} className="btn-secondary">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </button>
                  <button onClick={handleTrain} className="btn-primary px-8">
                    <Wand2 className="w-4 h-4 mr-2" /> Start Training
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="card p-8 text-center bg-gradient-to-br from-emerald-500/10 to-transparent border-2 border-emerald-500/30">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Your Bot is Ready! 🎉</h2>
              <p className="text-dark-500 mb-8 max-w-md mx-auto">
                Your AI chatbot has been trained and is ready to engage with your customers.
              </p>

              <div className="max-w-2xl mx-auto mb-8">
                <h3 className="font-bold mb-3 text-left">Widget Installation Code</h3>
                <div className="relative">
                  <pre className="p-4 bg-dark-900 text-green-400 rounded-xl text-sm text-left overflow-x-auto">
{`<!-- NoBot AI Widget -->
<script 
  src="https://clouds.hassanscode.com/nobot/widget.js" 
  data-bot-id="${botUuid}">
</script>`}
                  </pre>
                  <button onClick={copyWidgetCode} className="absolute top-3 right-3 p-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-white transition-colors">
                    {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={() => setActiveTab('inbox')} className="btn-primary px-8">
                  <Inbox className="w-4 h-4 mr-2" /> Open Inbox
                </button>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary px-8">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  // Render Inbox - Full page
  const renderInbox = () => (
    <div className="h-[calc(100vh-140px)] flex rounded-2xl overflow-hidden border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-2xl">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-dark-200 dark:border-dark-700 flex flex-col">
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 border-0 text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mockConversations.map(conv => {
            const ChannelIcon = getChannelIcon(conv.channel)
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={clsx(
                  "w-full p-4 flex items-start gap-3 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors border-b border-dark-100 dark:border-dark-800",
                  selectedConversation?.id === conv.id && "bg-primary-50 dark:bg-primary-900/20"
                )}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                    {conv.name.charAt(0)}
                  </div>
                  <div className={clsx("absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-dark-900 flex items-center justify-center", getChannelColor(conv.channel))}>
                    <ChannelIcon className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium truncate">{conv.name}</p>
                    <span className="text-xs text-dark-500">{conv.time}</span>
                  </div>
                  <p className="text-sm text-dark-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                    {conv.unread}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                  {selectedConversation.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{selectedConversation.name}</p>
                  <p className="text-xs text-dark-500 capitalize">{selectedConversation.channel} • {selectedConversation.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg">
                  <Star className="w-5 h-5 text-dark-400" />
                </button>
                <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg">
                  <Archive className="w-5 h-5 text-dark-400" />
                </button>
                <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map(msg => (
                <div key={msg.id} className={clsx("flex", msg.sender === 'user' ? "justify-start" : "justify-end")}>
                  <div className={clsx(
                    "max-w-[70%] p-4 rounded-2xl",
                    msg.sender === 'user'
                      ? "bg-dark-100 dark:bg-dark-800 rounded-bl-none"
                      : "bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-br-none"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <p className={clsx("text-xs mt-1", msg.sender === 'user' ? "text-dark-400" : "text-white/70")}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-dark-200 dark:border-dark-700">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg">
                  <Paperclip className="w-5 h-5 text-dark-400" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 border-0 focus:ring-2 focus:ring-primary-500"
                />
                <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg">
                  <Smile className="w-5 h-5 text-dark-400" />
                </button>
                <button className="btn-primary p-2">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <Inbox className="w-16 h-16 text-dark-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Select a Conversation</h3>
              <p className="text-dark-500">Choose a conversation from the sidebar to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Render Analytics
  const renderAnalytics = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'Total Conversations', value: '1,247', change: '+12%', icon: MessageCircle, color: 'from-blue-500 to-cyan-500' },
        { label: 'Messages Sent', value: '8,934', change: '+8%', icon: Send, color: 'from-purple-500 to-pink-500' },
        { label: 'Active Users', value: '342', change: '+24%', icon: Users, color: 'from-green-500 to-emerald-500' },
        { label: 'Response Rate', value: '98.2%', change: '+2%', icon: TrendingUp, color: 'from-orange-500 to-red-500' }
      ].map((stat, idx) => (
        <div key={idx} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={clsx("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", stat.color)}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm text-green-500 font-medium">{stat.change}</span>
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm text-dark-500">{stat.label}</p>
        </div>
      ))}
    </div>
  )

  return (
    <>
      <Helmet><title>{serviceName} - NoBot AI</title></Helmet>
      
      <div className={clsx("space-y-4", activeTab === 'inbox' && "space-y-2")}>
        {/* Header - Compact for inbox */}
        <div className={clsx("flex items-center justify-between", activeTab === 'inbox' && "pb-2")}>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard/services')} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{serviceName}</h1>
                <p className="text-dark-500">{domain || 'Configure your AI chatbot'}</p>
              </div>
            </div>
          </div>

          {/* Main Tabs - Only show Inbox/Analytics after setup is complete */}
          {currentStep >= 4 && (
            <div className="flex items-center gap-1 p-1 bg-dark-100 dark:bg-dark-800 rounded-xl">
              {MAIN_TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                    activeTab === t.id
                      ? "bg-white dark:bg-dark-700 shadow-sm text-primary-500"
                      : "text-dark-500 hover:text-dark-900 dark:hover:text-white"
                  )}
                >
                  <t.icon className="w-4 h-4" />
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Setup Progress (only show during setup) */}
        {activeTab === 'setup' && currentStep < 4 && (
          <div className="flex items-center justify-between bg-dark-50 dark:bg-dark-800/50 rounded-2xl p-4">
            {SETUP_STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    currentStep > step.id
                      ? "bg-emerald-500 text-white"
                      : currentStep === step.id
                        ? "bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25"
                        : "bg-dark-200 dark:bg-dark-700 text-dark-400"
                  )}>
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <div className="hidden md:block">
                    <p className={clsx("font-medium", currentStep >= step.id ? "text-dark-900 dark:text-white" : "text-dark-400")}>{step.title}</p>
                    <p className="text-xs text-dark-500">{step.description}</p>
                  </div>
                </div>
                {idx < SETUP_STEPS.length - 1 && (
                  <div className={clsx("flex-1 h-0.5 mx-4 rounded-full", currentStep > step.id ? "bg-emerald-500" : "bg-dark-200 dark:bg-dark-700")} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'setup' && renderSetupStep()}
          {activeTab === 'inbox' && renderInbox()}
          {activeTab === 'analytics' && renderAnalytics()}
        </AnimatePresence>
      </div>
    </>
  )
}
