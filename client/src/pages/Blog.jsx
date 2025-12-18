import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight, User, Tag, Search, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const featuredPost = {
  id: 1,
  title: 'The Future of Cloud Computing: Trends to Watch in 2025',
  excerpt: 'Explore the cutting-edge technologies and strategies that are reshaping the cloud landscape, from edge computing to AI-powered infrastructure management.',
  image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop',
  author: 'Hassan Ahmed',
  date: 'Dec 5, 2025',
  readTime: '8 min read',
  category: 'Industry Insights'
}

const posts = [
  {
    id: 2,
    title: 'How to Optimize Your Cloud Costs Without Sacrificing Performance',
    excerpt: 'Learn practical strategies to reduce your cloud spending while maintaining optimal performance.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    author: 'Sarah Chen',
    date: 'Dec 3, 2025',
    readTime: '6 min read',
    category: 'Best Practices'
  },
  {
    id: 3,
    title: 'Kubernetes vs Docker Swarm: Which is Right for Your Business?',
    excerpt: 'A comprehensive comparison of container orchestration platforms to help you make the right choice.',
    image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&h=400&fit=crop',
    author: 'Alex Kumar',
    date: 'Nov 28, 2025',
    readTime: '10 min read',
    category: 'Technology'
  },
  {
    id: 4,
    title: 'Securing Your Cloud Infrastructure: A Complete Guide',
    excerpt: 'Essential security practices and tools to protect your cloud resources from modern threats.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop',
    author: 'Mike Johnson',
    date: 'Nov 25, 2025',
    readTime: '12 min read',
    category: 'Security'
  },
  {
    id: 5,
    title: 'Building Scalable Applications with Microservices Architecture',
    excerpt: 'Design patterns and best practices for creating resilient, scalable microservices.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
    author: 'Emily Davis',
    date: 'Nov 20, 2025',
    readTime: '9 min read',
    category: 'Development'
  },
  {
    id: 6,
    title: 'The Rise of Edge Computing: What You Need to Know',
    excerpt: 'Understanding edge computing and how it complements traditional cloud infrastructure.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
    author: 'Hassan Ahmed',
    date: 'Nov 15, 2025',
    readTime: '7 min read',
    category: 'Technology'
  }
]

const categories = ['All', 'Technology', 'Security', 'Best Practices', 'Industry Insights', 'Development']

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Magnetic Clouds Blog
            </h1>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Insights, tutorials, and updates from our team of cloud experts
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative group cursor-pointer"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-dark-700 rounded-3xl overflow-hidden shadow-xl">
              <div className="relative h-64 md:h-full overflow-hidden">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                  Featured
                </div>
              </div>
              <div className="p-8">
                <span className="inline-flex items-center gap-1 text-primary-600 text-sm font-medium mb-4">
                  <Tag className="w-4 h-4" /> {featuredPost.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mb-4 group-hover:text-primary-600 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-dark-600 dark:text-dark-300 mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-dark-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" /> {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {featuredPost.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {featuredPost.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="bg-gray-50 dark:bg-dark-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-dark-800/90 backdrop-blur text-dark-900 dark:text-white text-xs font-medium rounded-full">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-dark-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              Load More Articles <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Get the latest cloud insights delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
