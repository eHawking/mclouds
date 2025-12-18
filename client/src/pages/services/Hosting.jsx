import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, ArrowRight, Server, Shield, Clock, Zap, Globe, Headphones, Star, MessageCircle, Lock, HardDrive, Database, Check, X } from 'lucide-react'
import { useCurrencyStore, useThemeStore, useCartStore } from '../../store/useStore'
import { settingsAPI } from '../../lib/api'
import { useAIAgent } from '../../contexts/AIAgentContext'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const defaultPlans = [
  { 
    name: 'Starter', 
    price: 2.99, 
    websites: '1 Website',
    storage: '10 GB SSD',
    bandwidth: '100 GB',
    email: '5 Accounts',
    ssl: true,
    backup: 'Weekly',
    support: 'Email',
    cpanel: true,
    features: ['1 Website', '10 GB SSD Storage', 'Free SSL Certificate', 'Weekly Backups', '24/7 Support', 'Plesk License Included'], 
    color: 'from-blue-500 to-cyan-500' 
  },
  { 
    name: 'Professional', 
    price: 5.99, 
    popular: true, 
    websites: '10 Websites',
    storage: '50 GB SSD',
    bandwidth: '500 GB',
    email: '50 Accounts',
    ssl: true,
    backup: 'Daily',
    support: 'Priority',
    cpanel: true,
    freeDomain: true,
    features: ['Unlimited Websites', '50 GB SSD Storage', 'Free SSL Certificate', 'Daily Backups', 'Priority Support', 'Plesk License Included', 'Free Domain'], 
    color: 'from-primary-500 to-purple-500' 
  },
  { 
    name: 'Business', 
    price: 9.99, 
    websites: 'Unlimited',
    storage: '100 GB NVMe',
    bandwidth: 'Unlimited',
    email: 'Unlimited',
    ssl: true,
    backup: 'Real-time',
    support: 'Dedicated',
    cpanel: true,
    freeDomain: true,
    staging: true,
    features: ['Unlimited Websites', '100 GB NVMe Storage', 'Free SSL Certificate', 'Real-time Backups', 'Dedicated Support', 'Plesk License Included', 'Free Domain', 'Staging Environment'], 
    color: 'from-purple-500 to-pink-500' 
  }
]

const features = [
  { icon: Zap, title: 'NVMe SSD Storage', desc: 'Up to 10x faster than traditional drives', color: 'from-yellow-500 to-orange-500' },
  { icon: Shield, title: 'Free SSL & Security', desc: 'Enterprise-grade DDoS protection', color: 'from-green-500 to-emerald-500' },
  { icon: Clock, title: '99.99% Uptime SLA', desc: 'Guaranteed with credit compensation', color: 'from-blue-500 to-cyan-500' },
  { icon: Server, title: 'Plesk Control Panel', desc: 'Professional server management', color: 'from-purple-500 to-pink-500' },
  { icon: Globe, title: 'Global CDN', desc: 'Content delivery in 200+ locations', color: 'from-indigo-500 to-violet-500' },
  { icon: Headphones, title: '24/7 Expert Support', desc: 'Average response time under 5 min', color: 'from-rose-500 to-red-500' },
]

// Spec rows for comparison table
const specRows = [
  { key: 'websites', label: 'Websites', icon: Globe },
  { key: 'storage', label: 'Storage', icon: HardDrive },
  { key: 'bandwidth', label: 'Bandwidth', icon: Database },
  { key: 'email', label: 'Email Accounts', icon: MessageCircle },
  { key: 'backup', label: 'Backups', icon: Clock },
  { key: 'support', label: 'Support', icon: Headphones },
]

export default function Hosting() {
  const { format } = useCurrencyStore()
  const { themeStyle, theme } = useThemeStore()
  const { addItem } = useCartStore()
  const { setIsOpen: openChat } = useAIAgent()
  const isGradient = themeStyle === 'gradient'
  const isDark = theme === 'dark'

  const { data: pricingData } = useQuery({
    queryKey: ['pricing'],
    queryFn: () => settingsAPI.getPricing().then(res => res.data.pricing)
  })

  const hostingPlans = pricingData?.hosting || defaultPlans

  const handleAddToCart = (plan) => {
    addItem({
      id: `hosting-${plan.name.toLowerCase().replace(/\s/g, '-')}`,
      type: 'product',
      name: plan.name,
      price: plan.price,
      billingCycle: 'monthly',
      product_type: 'hosting'
    })
    toast.success(`${plan.name} added to cart!`)
  }

  const handleLiveChat = () => {
    openChat(true)
  }

  return (
    <>
      <Helmet>
        <title>Web Hosting - Magnetic Clouds</title>
        <meta name="description" content="Fast, reliable web hosting with free SSL, daily backups, and 24/7 support. Starting at $2.99/month." />
      </Helmet>

      {/* Hero Section */}
      <section className={clsx(
        "relative overflow-hidden py-20",
        isDark ? "bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" : "bg-gradient-to-b from-primary-50 via-white to-purple-50"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm",
                isDark 
                  ? "bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/30 text-primary-400" 
                  : "bg-primary-100 border border-primary-200 text-primary-600"
              )}
            >
              <Star className={clsx("w-4 h-4", isDark ? "fill-primary-400" : "fill-primary-500")} />
              #1 Rated Web Hosting Provider
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={clsx(
                "text-4xl md:text-5xl lg:text-6xl font-bold font-display",
                isDark ? "text-white" : "text-dark-900"
              )}
            >
              Lightning-Fast{' '}
              <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Web Hosting
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={clsx("mt-6 text-lg", isDark ? "text-dark-300" : "text-dark-600")}
            >
              Power your website with blazing-fast NVMe SSD storage, free SSL certificates, 
              and 24/7 expert support. 45-day money-back guarantee.
            </motion.p>
            
            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-8"
            >
              {[
                { value: '99.99%', label: 'Uptime' },
                { value: '<50ms', label: 'Response' },
                { value: '50,000+', label: 'Websites' },
                { value: '4.9/5', label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={clsx("text-2xl font-bold", isDark ? "text-white" : "text-dark-900")}>{stat.value}</p>
                  <p className={clsx("text-sm", isDark ? "text-dark-400" : "text-dark-500")}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Row-by-Row Pricing Table */}
      <section className={clsx("py-16", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={clsx(
              "rounded-3xl overflow-hidden border",
              isDark ? "bg-dark-800/50 border-dark-700" : "bg-white border-gray-200 shadow-xl"
            )}
          >
            {/* Table Header - Plan Names & Prices */}
            <div className={clsx(
              "grid grid-cols-4 border-b",
              isDark ? "border-dark-700" : "border-gray-200"
            )}>
              <div className={clsx(
                "p-6 font-semibold",
                isDark ? "bg-dark-800 text-white" : "bg-gray-50 text-dark-900"
              )}>
                <Server className="w-6 h-6 mb-2 text-primary-500" />
                Compare Plans
              </div>
              {hostingPlans.map((plan, i) => (
                <div
                  key={plan.name}
                  className={clsx(
                    "p-6 text-center relative",
                    plan.popular 
                      ? "bg-gradient-to-b from-primary-500/10 to-purple-500/5" 
                      : isDark ? "bg-dark-800/50" : "bg-gray-50/50"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white text-xs font-bold rounded-b-lg">
                      POPULAR
                    </div>
                  )}
                  <h3 className={clsx(
                    "text-lg font-bold mb-2",
                    isDark ? "text-white" : "text-dark-900"
                  )}>{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={clsx(
                      "text-3xl font-bold",
                      plan.popular ? "text-primary-500" : isDark ? "text-white" : "text-dark-900"
                    )}>{format(plan.price)}</span>
                    <span className={isDark ? "text-dark-400" : "text-dark-500"}>/mo</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Spec Rows */}
            {specRows.map((spec, rowIndex) => (
              <div
                key={spec.key}
                className={clsx(
                  "grid grid-cols-4 border-b",
                  isDark ? "border-dark-700" : "border-gray-100",
                  rowIndex % 2 === 0 
                    ? isDark ? "bg-dark-800/30" : "bg-gray-50/50"
                    : ""
                )}
              >
                <div className={clsx(
                  "p-4 flex items-center gap-3",
                  isDark ? "text-dark-300" : "text-dark-600"
                )}>
                  <spec.icon className="w-5 h-5 text-primary-500" />
                  <span className="font-medium">{spec.label}</span>
                </div>
                {hostingPlans.map((plan) => (
                  <div
                    key={`${plan.name}-${spec.key}`}
                    className={clsx(
                      "p-4 text-center flex items-center justify-center",
                      plan.popular ? "bg-primary-500/5" : "",
                      isDark ? "text-white" : "text-dark-800"
                    )}
                  >
                    <span className="font-medium">{plan[spec.key] || '-'}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Boolean Features */}
            {[
              { key: 'ssl', label: 'Free SSL Certificate' },
              { key: 'cpanel', label: 'Plesk/cPanel' },
              { key: 'freeDomain', label: 'Free Domain' },
              { key: 'staging', label: 'Staging Environment' },
            ].map((feature, rowIndex) => (
              <div
                key={feature.key}
                className={clsx(
                  "grid grid-cols-4 border-b",
                  isDark ? "border-dark-700" : "border-gray-100",
                  (specRows.length + rowIndex) % 2 === 0 
                    ? isDark ? "bg-dark-800/30" : "bg-gray-50/50"
                    : ""
                )}
              >
                <div className={clsx(
                  "p-4 flex items-center gap-3",
                  isDark ? "text-dark-300" : "text-dark-600"
                )}>
                  <Shield className="w-5 h-5 text-primary-500" />
                  <span className="font-medium">{feature.label}</span>
                </div>
                {hostingPlans.map((plan) => (
                  <div
                    key={`${plan.name}-${feature.key}`}
                    className={clsx(
                      "p-4 text-center flex items-center justify-center",
                      plan.popular ? "bg-primary-500/5" : ""
                    )}
                  >
                    {plan[feature.key] ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-dark-400" />
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Action Row */}
            <div className={clsx(
              "grid grid-cols-4",
              isDark ? "bg-dark-800" : "bg-gray-50"
            )}>
              <div className="p-6"></div>
              {hostingPlans.map((plan) => (
                <div
                  key={`action-${plan.name}`}
                  className={clsx(
                    "p-6 text-center",
                    plan.popular ? "bg-primary-500/5" : ""
                  )}
                >
                  <button
                    onClick={() => handleAddToCart(plan)}
                    className={clsx(
                      "w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                      plan.popular
                        ? "bg-gradient-to-r from-primary-500 to-purple-500 text-white hover:shadow-lg hover:shadow-primary-500/30"
                        : isDark 
                          ? "bg-white/10 text-white hover:bg-white/20 border border-white/20" 
                          : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                    )}
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={clsx("mt-8 flex flex-wrap justify-center items-center gap-6 text-sm", isDark ? "text-dark-400" : "text-dark-600")}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              45-Day Money Back
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              Free SSL Included
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-500" />
              24/7 Expert Support
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold font-display"
            >
              Everything You Need to{' '}
              <span className="text-gradient">Succeed Online</span>
            </motion.h2>
            <p className="mt-4 text-dark-500 max-w-2xl mx-auto">
              Enterprise-grade features at affordable prices. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="group p-8 rounded-3xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 hover:shadow-xl hover:border-primary-500/30 transition-all"
              >
                <div className={clsx(
                  "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg",
                  feature.color
                )}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white">{feature.title}</h3>
                <p className="mt-3 text-dark-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-display text-white"
          >
            Need Help Choosing the Right Plan?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-white/80"
          >
            Our hosting experts are available 24/7 to help you find the perfect solution for your needs.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link to="/contact" className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2">
              Contact Sales <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLiveChat}
              className="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Live Chat
            </button>
          </motion.div>
        </div>
      </section>
    </>
  )
}
