import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { BarChart3, Search, TrendingUp, Globe, FileText, Link2, Target, Zap, CheckCircle, ArrowRight, LineChart, Eye, Award } from 'lucide-react'
import { useCurrencyStore, useThemeStore, useCartStore } from '../../store/useStore'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const plans = [
  { 
    name: 'Starter', 
    price: 29, 
    keywords: 50, 
    competitors: 3, 
    reports: 'Weekly',
    features: ['Keyword Tracking', 'Site Audit', 'Backlink Monitor', 'Rank Tracking']
  },
  { 
    name: 'Professional', 
    price: 79, 
    keywords: 500, 
    competitors: 10, 
    reports: 'Daily',
    features: ['All Starter Features', 'Content Optimizer', 'Technical SEO', 'White-label Reports', 'Priority Support'],
    popular: true
  },
  { 
    name: 'Enterprise', 
    price: 199, 
    keywords: 'Unlimited', 
    competitors: 'Unlimited', 
    reports: 'Real-time',
    features: ['All Pro Features', 'API Access', 'Custom Integrations', 'Dedicated Manager', 'Multi-site Support']
  },
]

const tools = [
  { icon: Search, title: 'Keyword Research', desc: 'Discover high-value keywords with search volume, difficulty, and CPC data', color: 'from-blue-500 to-cyan-500' },
  { icon: LineChart, title: 'Rank Tracking', desc: 'Monitor your rankings daily across Google, Bing, and Yahoo', color: 'from-green-500 to-emerald-500' },
  { icon: FileText, title: 'Site Audit', desc: 'Deep crawl analysis to find and fix technical SEO issues', color: 'from-purple-500 to-violet-500' },
  { icon: Link2, title: 'Backlink Analysis', desc: 'Track your backlinks, find opportunities, and monitor competitors', color: 'from-orange-500 to-red-500' },
  { icon: Eye, title: 'Content Optimizer', desc: 'AI-powered suggestions to optimize content for target keywords', color: 'from-pink-500 to-rose-500' },
  { icon: Target, title: 'Competitor Analysis', desc: 'Spy on competitors\' keywords, backlinks, and traffic sources', color: 'from-indigo-500 to-blue-500' },
]

const stats = [
  { value: '10B+', label: 'Keywords Database' },
  { value: '200+', label: 'Countries Tracked' },
  { value: '99.9%', label: 'Accuracy Rate' },
  { value: '24/7', label: 'Monitoring' },
]

export default function SEOTools() {
  const { format } = useCurrencyStore()
  const { theme } = useThemeStore()
  const { addItem } = useCartStore()
  const isDark = theme === 'dark'

  const handleAddToCart = (plan) => {
    addItem({
      id: `seo-tools-${plan.name.toLowerCase()}`,
      type: 'product',
      name: `SEO Tools ${plan.name}`,
      price: plan.price,
      billingCycle: 'monthly',
      product_type: 'seo-tools'
    })
    toast.success(`SEO Tools ${plan.name} added to cart!`)
  }

  return (
    <>
      <Helmet>
        <title>SEO Tools - Rank Higher on Search Engines | Magnetic Clouds</title>
        <meta name="description" content="Professional SEO tools to boost your rankings. Keyword research, rank tracking, site audits, backlink analysis, and more." />
      </Helmet>

      {/* Hero */}
      <section className={clsx("relative overflow-hidden py-24", isDark ? "bg-gradient-to-b from-dark-950 via-blue-950/20 to-dark-950" : "bg-gradient-to-b from-blue-50 via-white to-cyan-50")}>
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-cyan-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-8 shadow-2xl shadow-blue-500/30"
            >
              <BarChart3 className="w-10 h-10" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6",
                isDark ? "bg-blue-500/20 border border-blue-500/30 text-blue-400" : "bg-blue-100 border border-blue-200 text-blue-600"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Rank #1 on Google
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={clsx("text-4xl md:text-6xl font-bold font-display", isDark ? "text-white" : "text-dark-900")}
            >
              Professional{' '}
              <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                SEO Tools
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={clsx("mt-6 text-xl max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}
            >
              Everything you need to dominate search results. Keyword research, rank tracking, site audits, and competitor analysis in one powerful platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Link to="/contact" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center gap-2">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/contact" className={clsx("px-8 py-4 font-semibold rounded-xl border transition-all flex items-center gap-2", isDark ? "border-white/20 text-white hover:bg-white/10" : "border-dark-200 text-dark-700 hover:bg-dark-50")}>
                View Demo
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{stat.value}</p>
                  <p className={clsx("text-sm mt-1", isDark ? "text-dark-400" : "text-dark-500")}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className={clsx("py-24", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">
              Powerful SEO <span className="text-gradient">Tools</span>
            </h2>
            <p className={clsx("mt-4 max-w-2xl mx-auto", isDark ? "text-dark-400" : "text-dark-500")}>
              Everything you need to analyze, optimize, and dominate search rankings
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className={clsx("group p-8 rounded-3xl border transition-all hover:shadow-xl", isDark ? "bg-dark-800 border-dark-700 hover:border-blue-500/30" : "bg-white border-gray-100 hover:border-blue-500/30 shadow-lg")}
              >
                <div className={clsx("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform", tool.color)}>
                  <tool.icon className="w-7 h-7" />
                </div>
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{tool.title}</h3>
                <p className={clsx("mt-3", isDark ? "text-dark-400" : "text-dark-500")}>{tool.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={clsx("py-24", isDark ? "bg-dark-950" : "bg-gray-50")}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Simple <span className="text-gradient">Pricing</span></h2>
            <p className={clsx("mt-4", isDark ? "text-dark-400" : "text-dark-500")}>Choose the plan that fits your SEO needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className={clsx(
                  "relative rounded-3xl p-8 transition-all",
                  plan.popular
                    ? "bg-gradient-to-b from-blue-500/10 to-cyan-500/5 border-2 border-blue-500/50"
                    : isDark ? "bg-dark-800 border border-dark-700" : "bg-white border border-gray-200 shadow-lg"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{format(plan.price)}</span>
                  <span className={isDark ? "text-dark-400" : "text-dark-500"}>/month</span>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-dark-200 dark:border-dark-700">
                    <span className={isDark ? "text-dark-400" : "text-dark-500"}>Keywords</span>
                    <span className={clsx("font-semibold", isDark ? "text-white" : "text-dark-900")}>{plan.keywords}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-dark-200 dark:border-dark-700">
                    <span className={isDark ? "text-dark-400" : "text-dark-500"}>Competitors</span>
                    <span className={clsx("font-semibold", isDark ? "text-white" : "text-dark-900")}>{plan.competitors}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-dark-200 dark:border-dark-700">
                    <span className={isDark ? "text-dark-400" : "text-dark-500"}>Reports</span>
                    <span className={clsx("font-semibold", isDark ? "text-white" : "text-dark-900")}>{plan.reports}</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className={isDark ? "text-dark-300" : "text-dark-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleAddToCart(plan)}
                  className={clsx(
                    "w-full mt-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                    plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30"
                      : isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  )}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className={clsx("py-24", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Why Choose Our <span className="text-gradient">SEO Tools</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Real-time rank tracking across 200+ countries',
              '10 billion+ keyword database with search volume',
              'AI-powered content optimization suggestions',
              'Comprehensive backlink analysis and monitoring',
              'Technical SEO audits with actionable fixes',
              'Competitor traffic and keyword analysis',
              'White-label reports for agencies',
              'API access for custom integrations',
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className={clsx("font-medium", isDark ? "text-dark-300" : "text-dark-700")}>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="w-16 h-16 mx-auto text-white/80 mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Ready to Dominate Search Rankings?</h2>
          <p className="mt-4 text-lg text-white/80">Start your 14-day free trial and see the difference.</p>
          <div className="mt-8">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
