import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { MessageSquare, FileText, Phone, Mail, HelpCircle, Book, Ticket, Search, ArrowRight, Clock, Users, Headphones, CheckCircle, Zap } from 'lucide-react'
import { useThemeStore, useAuthStore } from '../store/useStore'
import { useAIAgent } from '../contexts/AIAgentContext'
import clsx from 'clsx'

const supportOptions = [
  { icon: Ticket, title: 'Submit a Ticket', desc: 'Get personalized help from our expert team', to: '/dashboard/tickets/new', color: 'from-violet-500 to-purple-500' },
  { icon: Book, title: 'Knowledge Base', desc: 'Browse 500+ help articles and tutorials', to: '/knowledge-base', color: 'from-green-500 to-emerald-500' },
  { icon: MessageSquare, title: 'Live Chat', desc: 'Chat with us in real-time, 24/7', action: 'chat', color: 'from-blue-500 to-cyan-500' },
  { icon: Phone, title: 'Phone Support', desc: 'Speak directly with our experts', to: 'tel:+8801XXXXXXXXX', color: 'from-yellow-500 to-orange-500' },
]

const popularArticles = [
  { title: 'How to set up your first website', category: 'Getting Started' },
  { title: 'Connecting a domain to your hosting', category: 'Domains' },
  { title: 'Email configuration guide', category: 'Email' },
  { title: 'SSL certificate installation', category: 'Security' },
  { title: 'Plesk control panel basics', category: 'Hosting' },
  { title: 'DNS management guide', category: 'Domains' },
]

const stats = [
  { value: '<5min', label: 'Avg Response', icon: Clock },
  { value: '24/7', label: 'Availability', icon: Headphones },
  { value: '98%', label: 'Satisfaction', icon: CheckCircle },
  { value: '50k+', label: 'Tickets Resolved', icon: Ticket },
]

export default function Support() {
  const { themeStyle, theme } = useThemeStore()
  const { isAuthenticated } = useAuthStore()
  const { setIsOpen: openChat } = useAIAgent()
  const isGradient = themeStyle === 'gradient'
  const isDark = theme === 'dark'

  const handleOptionClick = (option, e) => {
    if (option.action === 'chat') {
      e.preventDefault()
      openChat(true)
    }
  }

  return (
    <>
      <Helmet>
        <title>Support - Magnetic Clouds</title>
        <meta name="description" content="Get 24/7 expert support for all your hosting needs. Submit tickets, chat live, or browse our knowledge base." />
      </Helmet>

      {/* Ultra Premium Hero */}
      <section className={clsx(
        "relative min-h-[60vh] overflow-hidden flex items-center",
        isDark ? "bg-dark-950" : "bg-gradient-to-b from-violet-50 via-white to-purple-50"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-dark-950 to-purple-950/50" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-violet-500/10 via-transparent to-purple-500/10 rounded-full blur-2xl" />
            </>
          ) : (
            <>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6",
                isDark ? "bg-violet-500/10 border border-violet-500/20 text-violet-400" : "bg-violet-100 border border-violet-200 text-violet-600"
              )}
            >
              <Headphones className="w-4 h-4" />
              24/7 Expert Support
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={clsx(
                "text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6",
                isDark ? "text-white" : "text-dark-900"
              )}
            >
              How Can We{' '}
              <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Help
              </span>?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={clsx("text-lg max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}
            >
              Our expert support team is available around the clock to assist you with any questions or issues.
            </motion.p>
          </div>

          {/* Premium Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur opacity-20" />
              <div className={clsx(
                "relative backdrop-blur-sm rounded-2xl p-2 flex gap-2",
                isDark ? "bg-dark-800/80 border border-dark-700" : "bg-white/80 border border-violet-100 shadow-lg"
              )}>
                <div className="flex-1 relative">
                  <Search className={clsx("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5", isDark ? "text-dark-400" : "text-dark-400")} />
                  <input
                    type="text"
                    placeholder="Search for help articles..."
                    className={clsx(
                      "w-full bg-transparent pl-12 pr-4 py-4 focus:outline-none text-lg",
                      isDark ? "text-white placeholder-dark-400" : "text-dark-900 placeholder-dark-400"
                    )}
                  />
                </div>
                <button className="px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all">
                  Search
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center flex items-center gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isDark ? "bg-violet-500/20" : "bg-violet-100"
                )}>
                  <stat.icon className={clsx("w-5 h-5", isDark ? "text-violet-400" : "text-violet-600")} />
                </div>
                <div className="text-left">
                  <div className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{stat.value}</div>
                  <div className={clsx("text-sm", isDark ? "text-dark-400" : "text-dark-500")}>{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display">Get Support Your Way</h2>
            <p className="mt-4 text-dark-500">Choose the support channel that works best for you</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option, i) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {option.action ? (
                  <button
                    onClick={(e) => handleOptionClick(option, e)}
                    className="block w-full text-left group p-8 rounded-3xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 hover:shadow-xl hover:border-violet-500/30 transition-all"
                  >
                    <div className={clsx(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg",
                      option.color
                    )}>
                      <option.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white">{option.title}</h3>
                    <p className="mt-2 text-dark-500">{option.desc}</p>
                    <div className="mt-4 flex items-center gap-2 text-violet-500 font-medium">
                      Start Chat <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ) : (
                  <Link
                    to={option.to}
                    className="block group p-8 rounded-3xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 hover:shadow-xl hover:border-violet-500/30 transition-all"
                  >
                    <div className={clsx(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg",
                      option.color
                    )}>
                      <option.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white">{option.title}</h3>
                    <p className="mt-2 text-dark-500">{option.desc}</p>
                    <div className="mt-4 flex items-center gap-2 text-violet-500 font-medium">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-dark-50 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold font-display"
            >
              Popular{' '}
              <span className="text-gradient">Help Articles</span>
            </motion.h2>
            <p className="mt-4 text-dark-500">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {popularArticles.map((article, i) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to="/knowledge-base"
                  className="group flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 hover:shadow-lg hover:border-violet-500/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-violet-500 uppercase tracking-wider">{article.category}</span>
                    <h3 className="font-semibold text-dark-900 dark:text-white mt-1 group-hover:text-violet-500 transition-colors">{article.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/knowledge-base"
              className="inline-flex items-center gap-2 px-6 py-3 bg-dark-100 dark:bg-dark-800 rounded-xl font-semibold hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
            >
              Browse All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-display text-white"
          >
            Still Need Help?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-white/80"
          >
            Our expert support team is available around the clock to assist you.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            {isAuthenticated ? (
              <Link to="/dashboard/tickets/new" className="bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2">
                Open Support Ticket <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link to="/login" className="bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2">
                Login to Get Support <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            <Link to="/contact" className="bg-white/10 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all">
              Contact Sales
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
