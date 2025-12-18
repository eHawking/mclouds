import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Minimize2, Send, Check, CheckCheck, RotateCcw } from 'lucide-react'
import { useAIAgent } from '../contexts/AIAgentContext'
import clsx from 'clsx'

export default function AIChatWidget() {
  const {
    isEnabled,
    settingsLoaded,
    currentAgent,
    setCurrentAgent,
    isTyping,
    setIsTyping,
    chatHistory,
    setChatHistory,
    settings,
    sendMessage,
    rotateAgent,
    generateChatId,
    saveChat,
    resetChat,
    followUpTimerRef,
    endChatTimerRef
  } = useAIAgent()

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [chatId, setChatId] = useState(null)
  const [chatStatus, setChatStatus] = useState('idle') // idle, queued, connected, ended
  const [userName, setUserName] = useState('Guest')
  const [unreadCount, setUnreadCount] = useState(0)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory, isTyping])

  // Extract name from message
  const extractName = (message) => {
    const patterns = [
      /my name is (\w+)/i,
      /i'm (\w+)/i,
      /i am (\w+)/i,
      /call me (\w+)/i,
      /this is (\w+)/i
    ]
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  // Add message to chat
  const addMessage = useCallback((message) => {
    setChatHistory(prev => [...prev, {
      ...message,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    }])
  }, [setChatHistory])

  // Handle agent response with delays
  const handleAgentResponse = useCallback(async (userMessage) => {
    // Clear any existing timers
    if (followUpTimerRef.current) clearTimeout(followUpTimerRef.current)
    if (endChatTimerRef.current) clearTimeout(endChatTimerRef.current)

    // Typing delay
    await new Promise(resolve => setTimeout(resolve, settings.typingStartDelay))
    setIsTyping(true)

    // Get response
    const response = await sendMessage(userMessage)
    
    // Calculate typing duration based on word count
    const wordCount = response ? response.split(' ').length : 10
    const typingDuration = Math.min(wordCount * settings.replyTimePerWord, 15000)
    
    await new Promise(resolve => setTimeout(resolve, typingDuration))
    setIsTyping(false)

    if (response) {
      addMessage({
        type: 'agent',
        content: response,
        status: 'sent'
      })

      // Update message status to delivered then read
      setTimeout(() => {
        setChatHistory(prev => prev.map(m => 
          m.type === 'agent' && m.status === 'sent' 
            ? { ...m, status: 'delivered' } 
            : m
        ))
      }, 1000)

      setTimeout(() => {
        setChatHistory(prev => prev.map(m => 
          m.type === 'agent' && m.status === 'delivered' 
            ? { ...m, status: 'read' } 
            : m
        ))
      }, 2500)
    }

    // Set follow-up timer
    followUpTimerRef.current = setTimeout(() => {
      if (chatStatus === 'connected') {
        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          addMessage({
            type: 'agent',
            content: "Is there anything else I can help you with?",
            status: 'read'
          })

          // Set end chat timer
          endChatTimerRef.current = setTimeout(() => {
            if (chatStatus === 'connected') {
              addMessage({
                type: 'agent',
                content: "Thank you for contacting Magnetic Clouds support. Have a great day!",
                status: 'read'
              })
              addMessage({
                type: 'system',
                content: 'Chat ended'
              })
              setChatStatus('ended')
              
              // Save chat
              saveChat({
                chatId,
                agent: currentAgent,
                messages: chatHistory,
                userName,
                status: 'completed',
                startedAt: chatHistory[0]?.timestamp,
                endedAt: new Date().toISOString()
              })
            }
          }, settings.endChatTimeout)
        }, 3000)
      }
    }, settings.followUpTimeout)
  }, [settings, sendMessage, addMessage, chatStatus, chatId, currentAgent, chatHistory, userName, saveChat, setIsTyping, setChatHistory, followUpTimerRef, endChatTimerRef])

  // Send user message
  const handleSend = async () => {
    if (!inputValue.trim() || chatStatus === 'ended') return

    const message = inputValue.trim()
    setInputValue('')

    // Extract name if mentioned
    const name = extractName(message)
    if (name) setUserName(name)

    // Add user message
    addMessage({
      type: 'user',
      content: message,
      status: 'sent'
    })

    // Update user message status
    setTimeout(() => {
      setChatHistory(prev => prev.map(m => 
        m.type === 'user' && m.status === 'sent' 
          ? { ...m, status: 'delivered' } 
          : m
      ))
    }, 500)

    setTimeout(() => {
      setChatHistory(prev => prev.map(m => 
        m.type === 'user' && m.status === 'delivered' 
          ? { ...m, status: 'read' } 
          : m
      ))
    }, 1500)

    // First message - start queue flow
    if (chatStatus === 'idle') {
      setChatStatus('queued')
      const newChatId = generateChatId()
      setChatId(newChatId)
      
      addMessage({
        type: 'system',
        content: 'You have been added to the queue. Please wait...'
      })

      // Assign agent after delay
      setTimeout(() => {
        const agent = rotateAgent()
        setCurrentAgent(agent)
        setChatStatus('connected')
        
        addMessage({
          type: 'system',
          content: `Connected with ${agent.name}`
        })

        // Agent greeting
        setTimeout(async () => {
          setIsTyping(true)
          await new Promise(r => setTimeout(r, 2000))
          setIsTyping(false)
          
          addMessage({
            type: 'agent',
            content: `Hi! I'm ${agent.name} from Magnetic Clouds support. How can I help you today?`,
            status: 'read'
          })

          // Now handle the actual user question
          handleAgentResponse(message)
        }, 1000)
      }, settings.queueAssignTime)
    } else if (chatStatus === 'connected') {
      handleAgentResponse(message)
    }
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Start new chat
  const handleNewChat = () => {
    resetChat()
    setChatId(null)
    setChatStatus('idle')
    setUserName('Guest')
  }

  // Close widget
  const handleClose = () => {
    if (chatStatus === 'connected' && chatHistory.length > 0) {
      saveChat({
        chatId,
        agent: currentAgent,
        messages: chatHistory,
        userName,
        status: 'closed_by_user',
        startedAt: chatHistory[0]?.timestamp,
        endedAt: new Date().toISOString()
      })
    }
    setIsOpen(false)
    resetChat()
    setChatId(null)
    setChatStatus('idle')
  }

  // Update unread count when minimized
  useEffect(() => {
    if (isMinimized && chatHistory.length > 0) {
      setUnreadCount(prev => prev + 1)
    }
  }, [chatHistory.length, isMinimized])

  // Clear unread when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0)
    }
  }, [isOpen, isMinimized])

  // Don't render until settings are loaded from server, and only if enabled
  if (!settingsLoaded || !isEnabled) return null

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white"
          >
            <MessageCircle className="w-7 h-7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            <span className="absolute w-full h-full rounded-full bg-indigo-500 animate-ping opacity-25" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : 520 
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={clsx(
              "fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] bg-white dark:bg-dark-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col",
              "border border-dark-200 dark:border-dark-700"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentAgent ? (
                    <>
                      <div className="relative">
                        <img 
                          src={currentAgent.avatar} 
                          alt={currentAgent.name}
                          className="w-10 h-10 rounded-full border-2 border-white/30"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{currentAgent.name}</p>
                        <p className="text-xs text-white/70">
                          {isTyping ? (
                            <span className="flex items-center gap-1">
                              typing
                              <span className="flex gap-0.5">
                                <span className="w-1 h-1 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1 h-1 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1 h-1 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </span>
                            </span>
                          ) : 'Online'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Support</p>
                        <p className="text-xs text-white/70">We typically reply instantly</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {chatId && (
                <p className="text-xs text-white/50 mt-2">Chat ID: {chatId}</p>
              )}
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-50 dark:bg-dark-900">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-dark-500">
                      <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
                      <p className="font-medium">Welcome to Magnetic Clouds!</p>
                      <p className="text-sm">Send us a message and we'll get back to you shortly.</p>
                    </div>
                  ) : (
                    chatHistory.map((msg) => (
                      <div key={msg.id}>
                        {msg.type === 'system' ? (
                          <div className="flex justify-center">
                            <span className="px-4 py-1.5 bg-dark-200 dark:bg-dark-700 text-dark-500 text-xs rounded-full">
                              {msg.content}
                            </span>
                          </div>
                        ) : msg.type === 'user' ? (
                          <div className="flex justify-end">
                            <div className="max-w-[80%]">
                              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md">
                                <p className="text-sm">{msg.content}</p>
                              </div>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-xs text-dark-400">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {msg.status === 'sent' && <Check className="w-3 h-3 text-dark-400" />}
                                {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-dark-400" />}
                                {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-end gap-2">
                            {currentAgent && (
                              <img 
                                src={currentAgent.avatar} 
                                alt=""
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div className="max-w-[80%]">
                              <div className="bg-white dark:bg-dark-800 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm border border-dark-100 dark:border-dark-700">
                                <p className="text-sm text-dark-800 dark:text-dark-200">{msg.content}</p>
                              </div>
                              <span className="text-xs text-dark-400 mt-1 block">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {/* Typing indicator */}
                  {isTyping && currentAgent && (
                    <div className="flex items-end gap-2">
                      <img 
                        src={currentAgent.avatar} 
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="bg-white dark:bg-dark-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-dark-100 dark:border-dark-700">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white dark:bg-dark-800 border-t border-dark-100 dark:border-dark-700">
                  {chatStatus === 'ended' ? (
                    <button
                      onClick={handleNewChat}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Start New Chat
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={isTyping}
                        className="flex-1 px-4 py-3 bg-dark-100 dark:bg-dark-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
