import { useState, useMemo, useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, Search, Trash2, Download, X, Copy,
  CheckCheck, Clock, Bot, Inbox, Archive, Star, MoreVertical,
  ChevronLeft, Send, Paperclip, Smile, Phone, Video, Info,
  Check, Circle, Filter, RefreshCw
} from 'lucide-react'
import { useAIAgent } from '../../contexts/AIAgentContext'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export default function AdminAgentChats() {
  const { savedChats, deleteChat, clearAllChats } = useAIAgent()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedChat, setSelectedChat] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedChat])

  // Filter chats
  const filteredChats = useMemo(() => {
    return savedChats.filter(chat => {
      if (statusFilter !== 'all' && chat.status !== statusFilter) return false
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesChatId = chat.chatId?.toLowerCase().includes(query)
        const matchesAgent = chat.agent?.name?.toLowerCase().includes(query)
        const matchesMessage = chat.messages?.some(m => 
          m.content?.toLowerCase().includes(query)
        )
        return matchesChatId || matchesAgent || matchesMessage
      }
      
      return true
    }).sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
  }, [savedChats, searchQuery, statusFilter])

  // Export chats to JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(savedChats, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Chat history exported!')
  }

  // Copy chat ID
  const handleCopyId = (chatId) => {
    navigator.clipboard.writeText(chatId)
    toast.success('Chat ID copied!')
  }

  // Delete single chat
  const handleDelete = (chatId, e) => {
    e?.stopPropagation()
    deleteChat(chatId)
    if (selectedChat?.chatId === chatId) {
      setSelectedChat(null)
    }
    toast.success('Chat deleted')
  }

  // Delete all chats
  const handleDeleteAll = () => {
    clearAllChats()
    setShowDeleteConfirm(false)
    setSelectedChat(null)
    toast.success('All chats deleted')
  }

  // Select chat
  const handleSelectChat = (chat) => {
    setSelectedChat(chat)
    setMobileShowChat(true)
  }

  // Format time relative
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  // Format full date
  const formatFullDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get last message preview
  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return 'No messages'
    const lastMsg = chat.messages[chat.messages.length - 1]
    return lastMsg.content?.substring(0, 50) + (lastMsg.content?.length > 50 ? '...' : '')
  }

  return (
    <>
      <Helmet><title>Chat History - Admin - Magnetic Clouds</title></Helmet>
      
      {/* Main Inbox Container */}
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Inbox</h1>
              <p className="text-sm text-dark-500">{savedChats.length} conversations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={savedChats.length === 0}
              className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              title="Export"
            >
              <Download className="w-5 h-5 text-dark-500" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={savedChats.length === 0}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete All"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Inbox Layout */}
        <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl shadow-xl overflow-hidden border border-dark-100 dark:border-dark-700">
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={clsx(
              "w-full md:w-96 border-r border-dark-100 dark:border-dark-700 flex flex-col",
              mobileShowChat && "hidden md:flex"
            )}>
              {/* Search */}
              <div className="p-4 border-b border-dark-100 dark:border-dark-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-50 dark:bg-dark-900 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {/* Quick Filters */}
                <div className="flex items-center gap-2 mt-3">
                  {['all', 'completed', 'closed_by_user'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        statusFilter === status
                          ? "bg-primary-500 text-white"
                          : "bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-600"
                      )}
                    >
                      {status === 'all' ? 'All' : status === 'completed' ? 'Completed' : 'Closed'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-dark-400" />
                    </div>
                    <p className="font-medium text-dark-600 dark:text-dark-400">No conversations</p>
                    <p className="text-sm text-dark-400 mt-1">
                      {savedChats.length === 0 
                        ? "Chats will appear here"
                        : "Try a different search"
                      }
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.chatId}
                        onClick={() => handleSelectChat(chat)}
                        className={clsx(
                          "flex items-start gap-3 p-4 cursor-pointer border-b border-dark-50 dark:border-dark-700/50 transition-all hover:bg-dark-50 dark:hover:bg-dark-700/50",
                          selectedChat?.chatId === chat.chatId && "bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500"
                        )}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {chat.agent?.avatar ? (
                            <img
                              src={chat.agent.avatar}
                              alt={chat.agent.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                              <Bot className="w-6 h-6 text-white" />
                            </div>
                          )}
                          {/* Status indicator */}
                          <div className={clsx(
                            "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-dark-800",
                            chat.status === 'completed' ? "bg-emerald-500" : "bg-amber-500"
                          )} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-dark-800 dark:text-dark-200 truncate">
                              {chat.agent?.name || chat.userName || 'Guest User'}
                            </p>
                            <span className="text-xs text-dark-400 whitespace-nowrap">
                              {formatRelativeTime(chat.startedAt)}
                            </span>
                          </div>
                          <p className="text-sm text-dark-500 truncate mt-0.5">
                            {getLastMessage(chat)}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              chat.status === 'completed'
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            )}>
                              {chat.status === 'completed' ? 'Completed' : 'Closed'}
                            </span>
                            <span className="text-xs text-dark-400">
                              {chat.messages?.length || 0} msgs
                            </span>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDelete(chat.chatId, e)}
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat View */}
            <div className={clsx(
              "flex-1 flex flex-col",
              !mobileShowChat && "hidden md:flex"
            )}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-4 border-b border-dark-100 dark:border-dark-700 bg-white dark:bg-dark-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setMobileShowChat(false)}
                        className="md:hidden p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      {selectedChat.agent?.avatar ? (
                        <img
                          src={selectedChat.agent.avatar}
                          alt={selectedChat.agent.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{selectedChat.agent?.name || 'AI Agent'}</p>
                        <p className="text-xs text-dark-500">
                          {selectedChat.userName || 'Guest'} • {formatRelativeTime(selectedChat.startedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyId(selectedChat.chatId)}
                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                        title="Copy Chat ID"
                      >
                        <Copy className="w-5 h-5 text-dark-500" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(selectedChat.chatId, e)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-dark-50 to-white dark:from-dark-900 dark:to-dark-800">
                    {/* Date separator */}
                    <div className="flex items-center justify-center">
                      <span className="px-4 py-1.5 bg-white dark:bg-dark-700 rounded-full text-xs text-dark-500 shadow-sm">
                        {formatFullDate(selectedChat.startedAt)}
                      </span>
                    </div>

                    {selectedChat.messages?.map((msg, idx) => (
                      <div key={idx}>
                        {msg.type === 'system' ? (
                          <div className="flex justify-center my-4">
                            <span className="px-4 py-1.5 bg-dark-100 dark:bg-dark-700 text-dark-500 text-xs rounded-full">
                              {msg.content}
                            </span>
                          </div>
                        ) : msg.type === 'user' ? (
                          <div className="flex justify-end">
                            <div className="max-w-[70%]">
                              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-lg shadow-indigo-500/20">
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                              </div>
                              <div className="flex items-center justify-end gap-1.5 mt-1.5 px-1">
                                <span className="text-xs text-dark-400">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <CheckCheck className="w-4 h-4 text-blue-500" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-end gap-2">
                            {selectedChat.agent?.avatar ? (
                              <img 
                                src={selectedChat.agent.avatar} 
                                alt=""
                                className="w-8 h-8 rounded-full flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div className="max-w-[70%]">
                              <div className="bg-white dark:bg-dark-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-dark-100 dark:border-dark-600">
                                <p className="text-sm text-dark-800 dark:text-dark-200 leading-relaxed">{msg.content}</p>
                              </div>
                              <span className="text-xs text-dark-400 mt-1.5 block px-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Info Footer */}
                  <div className="p-4 border-t border-dark-100 dark:border-dark-700 bg-dark-50 dark:bg-dark-900">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-dark-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          Started: {formatRelativeTime(selectedChat.startedAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4" />
                          {selectedChat.messages?.length || 0} messages
                        </span>
                      </div>
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        selectedChat.status === 'completed'
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {selectedChat.status === 'completed' ? 'Completed' : 'Closed by User'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-dark-50 to-white dark:from-dark-900 dark:to-dark-800">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-6">
                    <MessageSquare className="w-12 h-12 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-800 dark:text-dark-200 mb-2">Select a conversation</h3>
                  <p className="text-dark-500 max-w-sm">
                    Choose a conversation from the list to view the full chat history and details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Delete All Conversations?</h3>
                <p className="text-dark-500 mb-6">
                  This will permanently delete {savedChats.length} conversation{savedChats.length !== 1 ? 's' : ''}. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2.5 border border-dark-200 dark:border-dark-600 rounded-xl font-medium hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
