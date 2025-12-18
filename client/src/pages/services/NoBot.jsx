import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Bot, MessageSquare, Brain, Zap, Shield, Users, Clock, CheckCircle, ArrowRight, Sparkles, Heart, Globe, Phone, Instagram, Facebook } from 'lucide-react'
import { useCurrencyStore, useThemeStore, useCartStore } from '../../store/useStore'
import { settingsAPI } from '../../lib/api'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const defaultPlans = [
  { name: 'Starter', price: 29, channel_limit: 1, messages: '5,000', languages: '3', features: ['1 Channel (Any One)', '5,000 messages/mo', '3 languages', 'Basic training'] },
  { name: 'Professional', price: 79, channel_limit: 2, messages: '25,000', languages: '10', features: ['2 Channels (Any Two)', '25,000 messages/mo', '10 languages', 'Advanced training', 'Advanced analytics', 'Priority support'], popular: true },
  { name: 'Enterprise', price: 199, channel_limit: 5, messages: 'Unlimited', languages: 'All', features: ['All Channels', 'Unlimited messages/mo', 'All languages', 'Custom training', 'Advanced analytics', 'Priority support', 'Dedicated manager'] },
]

const features = [
  { icon: Brain, title: 'Human-Like Conversations', desc: 'Advanced AI that converses naturally - no one can tell it\'s a bot', color: 'from-purple-500 to-pink-500' },
  { icon: Heart, title: 'Emotional Intelligence', desc: 'Understands context, emotions, and responds with empathy', color: 'from-red-500 to-rose-500' },
  { icon: Globe, title: 'Multilingual Support', desc: 'Speaks 50+ languages fluently including Bengali', color: 'from-blue-500 to-cyan-500' },
  { icon: Zap, title: 'Instant Responses', desc: 'Sub-second response times for seamless conversations', color: 'from-yellow-500 to-orange-500' },
  { icon: Shield, title: 'Privacy First', desc: 'Your data is encrypted and never used for training', color: 'from-green-500 to-emerald-500' },
  { icon: Clock, title: '24/7 Availability', desc: 'Never misses a customer query, day or night', color: 'from-indigo-500 to-violet-500' },
]

export default function NoBot() {
  const { format } = useCurrencyStore()
  const { theme } = useThemeStore()
  const { addItem } = useCartStore()
  const isDark = theme === 'dark'
  const [plans, setPlans] = useState(defaultPlans)

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const res = await settingsAPI.getPricing()
        if (res.data?.pricing?.nobot?.length > 0) {
          setPlans(res.data.pricing.nobot)
        }
      } catch (err) {
        console.error('Failed to load NoBot pricing:', err)
      }
    }
    loadPricing()
  }, [])

  const getChannelText = (limit) => {
    if (limit >= 5) return 'All Channels'
    if (limit === 2) return '2 Channels (Any Two)'
    return '1 Channel (Any One)'
  }

  const handleAddToCart = (plan) => {
    addItem({
      id: `nobot-${plan.name.toLowerCase()}`,
      type: 'product',
      name: `NoBot AI ${plan.name}`,
      price: plan.price,
      billingCycle: 'monthly',
      product_type: 'nobot'
    })
    toast.success(`NoBot AI ${plan.name} added to cart!`)
  }

  return (
    <>
      <Helmet>
        <title>NoBot AI - Human-Like Chatbot | Magnetic Clouds</title>
        <meta name="description" content="AI chatbot so human-like, no one can tell it's AI. Natural conversations that convert visitors into customers." />
      </Helmet>

      {/* Hero */}
      <section className={clsx(
        "relative overflow-hidden py-24",
        isDark ? "bg-gradient-to-b from-dark-950 via-purple-950/20 to-dark-950" : "bg-gradient-to-b from-purple-50 via-white to-pink-50"
      )}>
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-200/50 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-pink-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-8 shadow-2xl shadow-purple-500/30"
            >
              <Bot className="w-10 h-10" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6",
                isDark ? "bg-purple-500/20 border border-purple-500/30 text-purple-400" : "bg-purple-100 border border-purple-200 text-purple-600"
              )}
            >
              <Sparkles className="w-4 h-4" />
              AI That Feels Human
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={clsx("text-4xl md:text-6xl font-bold font-display", isDark ? "text-white" : "text-dark-900")}
            >
              Meet{' '}
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                NoBot AI
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={clsx("mt-6 text-xl max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}
            >
              The AI chatbot so human-like, your visitors won't believe it's artificial. Natural conversations that understand emotions and convert.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Link to="/contact" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all flex items-center gap-2">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/contact" className={clsx("px-8 py-4 font-semibold rounded-xl border transition-all flex items-center gap-2", isDark ? "border-white/20 text-white hover:bg-white/10" : "border-dark-200 text-dark-700 hover:bg-dark-50")}>
                Watch Demo
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { value: '99.7%', label: 'Human-like Score' },
                { value: '50+', label: 'Languages' },
                { value: '<0.5s', label: 'Response Time' },
                { value: '24/7', label: 'Availability' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{stat.value}</p>
                  <p className={clsx("text-sm mt-1", isDark ? "text-dark-400" : "text-dark-500")}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={clsx("py-24", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">
              Why NoBot is <span className="text-gradient">Different</span>
            </h2>
            <p className={clsx("mt-4 max-w-2xl mx-auto", isDark ? "text-dark-400" : "text-dark-500")}>
              Advanced AI that understands context, emotions, and responds like a real human
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
                className={clsx("group p-8 rounded-3xl border transition-all hover:shadow-xl", isDark ? "bg-dark-800 border-dark-700 hover:border-purple-500/30" : "bg-white border-gray-100 hover:border-purple-500/30 shadow-lg")}
              >
                <div className={clsx("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform", feature.color)}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{feature.title}</h3>
                <p className={clsx("mt-3", isDark ? "text-dark-400" : "text-dark-500")}>{feature.desc}</p>
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
            <p className={clsx("mt-4", isDark ? "text-dark-400" : "text-dark-500")}>Choose the plan that fits your business</p>
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
                    ? "bg-gradient-to-b from-purple-500/10 to-pink-500/5 border-2 border-purple-500/50"
                    : isDark ? "bg-dark-800 border border-dark-700" : "bg-white border border-gray-200 shadow-lg"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{format(plan.price)}</span>
                  <span className={isDark ? "text-dark-400" : "text-dark-500"}>/month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  {(plan.features || []).map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className={isDark ? "text-dark-300" : "text-dark-600"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleAddToCart(plan)}
                  className={clsx(
                    "w-full mt-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                    plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30"
                      : isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  )}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Ready to Transform Customer Support?</h2>
          <p className="mt-4 text-lg text-white/80">Start your free trial and see why businesses love NoBot AI.</p>
          <div className="mt-8">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
