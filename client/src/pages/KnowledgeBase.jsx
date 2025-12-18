import { motion } from 'framer-motion'
import { Search, Book, Server, Shield, Globe, Mail, Database, ChevronRight, FileText, Video, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const categories = [
  {
    icon: Server,
    title: 'Web Hosting',
    description: 'cPanel, email setup, FTP, and website management',
    articles: 45,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Database,
    title: 'VPS & Cloud',
    description: 'Server management, scaling, and optimization',
    articles: 38,
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Globe,
    title: 'Domains & DNS',
    description: 'Domain registration, transfers, and DNS configuration',
    articles: 28,
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Shield,
    title: 'Security & SSL',
    description: 'SSL certificates, firewall, and security best practices',
    articles: 32,
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Mail,
    title: 'Email Services',
    description: 'Email hosting, configuration, and troubleshooting',
    articles: 24,
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: FileText,
    title: 'Billing & Account',
    description: 'Payments, invoices, and account management',
    articles: 18,
    color: 'from-yellow-500 to-orange-500'
  }
]

const popularArticles = [
  { title: 'How to Set Up Your First Website on cPanel', category: 'Web Hosting', views: '15.2K' },
  { title: 'Installing WordPress with One Click', category: 'Web Hosting', views: '12.8K' },
  { title: 'DNS Propagation: What You Need to Know', category: 'Domains & DNS', views: '10.5K' },
  { title: 'How to Install an SSL Certificate', category: 'Security & SSL', views: '9.8K' },
  { title: 'Setting Up Email Accounts in cPanel', category: 'Email Services', views: '8.9K' },
  { title: 'VPS vs Shared Hosting: Which is Right for You?', category: 'VPS & Cloud', views: '8.2K' }
]

const videoTutorials = [
  { title: 'Getting Started with Magnetic Clouds', duration: '5:32' },
  { title: 'cPanel Complete Walkthrough', duration: '12:45' },
  { title: 'DNS Management Made Easy', duration: '8:20' },
  { title: 'Setting Up Your First VPS', duration: '15:10' }
]

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-6">
              <Book className="w-4 h-4" />
              Knowledge Base
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How Can We Help You?
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Search our comprehensive knowledge base for guides, tutorials, and answers.
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search for articles, tutorials, guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-4 focus:ring-primary-500/30 shadow-xl text-lg"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="text-white/60 text-sm">Popular:</span>
                {['cPanel', 'SSL', 'WordPress', 'DNS', 'Email'].map((tag) => (
                  <button key={tag} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition-colors">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-dark-600 dark:text-dark-300">
              Find articles organized by topic
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, i) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 bg-white dark:bg-dark-700 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4`}>
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                  {category.title}
                </h3>
                <p className="text-dark-600 dark:text-dark-300 mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-500">{category.articles} articles</span>
                  <ChevronRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles & Video Tutorials */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Popular Articles */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary-600" />
                Popular Articles
              </h2>
              <div className="space-y-4">
                {popularArticles.map((article, i) => (
                  <div
                    key={article.title}
                    className="group p-4 bg-gray-50 dark:bg-dark-800 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-dark-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-dark-500 mt-1">{article.category}</p>
                      </div>
                      <span className="text-sm text-dark-400 whitespace-nowrap">{article.views} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Video Tutorials */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
                <Video className="w-6 h-6 text-primary-600" />
                Video Tutorials
              </h2>
              <div className="space-y-4">
                {videoTutorials.map((video, i) => (
                  <div
                    key={video.title}
                    className="group p-4 bg-gray-50 dark:bg-dark-800 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-dark-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-sm text-dark-500">{video.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 bg-white dark:bg-dark-700 rounded-2xl text-center"
            >
              <Download className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">Downloads</h3>
              <p className="text-dark-600 dark:text-dark-300">Software, tools, and resources</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-white dark:bg-dark-700 rounded-2xl text-center"
            >
              <FileText className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">API Documentation</h3>
              <p className="text-dark-600 dark:text-dark-300">Developer resources and guides</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-white dark:bg-dark-700 rounded-2xl text-center"
            >
              <Video className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">Video Library</h3>
              <p className="text-dark-600 dark:text-dark-300">Step-by-step video tutorials</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Our support team is here to help 24/7
          </p>
          <Link to="/dashboard/tickets/new" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
            Contact Support <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
